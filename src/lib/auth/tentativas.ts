import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { db } from "@/lib/db";

// Cada login e cadastro calcula o scrypt (~32 MB de memória), então o limite é
// conferido antes dele. A contagem fica no banco porque o site roda em várias
// instâncias. A chave é o sha256 do IP ou do e-mail, para o banco não guardá-los.
export const LIMITE_POR_IP = 10;
export const LIMITE_POR_EMAIL = 5;
export const JANELA_MS = 15 * 60 * 1000;

function chave(tipo: "ip" | "ip-desconhecido" | "email", valor: string): string {
  return createHash("sha256").update(`${tipo}:${valor}`).digest("hex");
}

function inicioDaJanela(): Date {
  return new Date(Date.now() - JANELA_MS);
}

/**
 * Soma uma tentativa à janela atual, ou abre uma janela nova se a anterior venceu.
 * É um comando só no banco, para tentativas simultâneas não se perderem.
 */
async function contar(chaveTentativa: string): Promise<number> {
  const agora = new Date();
  const inicio = new Date(agora.getTime() - JANELA_MS);
  const [tentativa] = await db.$queryRaw<{ contagem: number }[]>`
    INSERT INTO "TentativaAcesso" ("chave", "contagem", "janelaIniciadaEm")
    VALUES (${chaveTentativa}, 1, ${agora})
    ON CONFLICT ("chave") DO UPDATE SET
      "contagem" = CASE WHEN "TentativaAcesso"."janelaIniciadaEm" >= ${inicio}
        THEN "TentativaAcesso"."contagem" + 1 ELSE 1 END,
      "janelaIniciadaEm" = CASE WHEN "TentativaAcesso"."janelaIniciadaEm" >= ${inicio}
        THEN "TentativaAcesso"."janelaIniciadaEm" ELSE EXCLUDED."janelaIniciadaEm" END
    RETURNING "contagem"`;
  return tentativa!.contagem;
}

/**
 * IP de quem fez a requisição, ou null quando não há como saber com segurança.
 * Cabeçalho que o visitante pode escrever não vale: se valesse, cada tentativa
 * traria um IP novo e o limite nunca agiria.
 * - No Vercel (VERCEL=1), só o x-vercel-forwarded-for, que o próprio Vercel escreve.
 * - Em outra hospedagem, nenhum cabeçalho, a menos que quem cuida do site declare
 *   com AUTENTICACAO_PROXY_CONFIAVEL=1 que há um proxy na frente que escreve o
 *   x-forwarded-for. Vale o último valor da lista, que é o que o proxy acrescentou.
 */
export function ipDoCabecalho(cabecalhos: Headers): string | null {
  const nome =
    process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : process.env.AUTENTICACAO_PROXY_CONFIAVEL === "1" ? "x-forwarded-for" : null;
  const ip = nome ? cabecalhos.get(nome)?.split(",").at(-1)?.trim() : undefined;
  return ip && !ip.includes("%") && isIP(ip) ? ip : null;
}

/**
 * Conta uma tentativa de login ou de cadastro vinda deste IP e diz se ela pode seguir.
 * Sem IP conhecido, todas as tentativas dividem um contador só: o cadastro não tem
 * limite por e-mail, e sem este contador o scrypt ficaria sem freio.
 */
export async function tentativaDoIpLiberada(ip: string | null): Promise<boolean> {
  await db.tentativaAcesso.deleteMany({ where: { janelaIniciadaEm: { lt: inicioDaJanela() } } });
  return (await contar(ip ? chave("ip", ip) : chave("ip-desconhecido", ""))) <= LIMITE_POR_IP;
}

/** Se este e-mail ainda pode tentar entrar: menos de 5 senhas erradas na janela. */
export async function emailLiberado(email: string): Promise<boolean> {
  const tentativa = await db.tentativaAcesso.findUnique({ where: { chave: chave("email", email) } });
  return !tentativa || tentativa.janelaIniciadaEm < inicioDaJanela() || tentativa.contagem < LIMITE_POR_EMAIL;
}

export async function registrarFalhaDoEmail(email: string): Promise<void> {
  await contar(chave("email", email));
}

/** O login deu certo: a contagem daquele e-mail volta a zero. */
export async function zerarTentativasDoEmail(email: string): Promise<void> {
  await db.tentativaAcesso.deleteMany({ where: { chave: chave("email", email) } });
}
