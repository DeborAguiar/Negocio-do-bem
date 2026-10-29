import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

// Cada login e cadastro calcula o scrypt (~32 MB de memória), então o limite é
// conferido antes dele. A contagem fica no banco porque o site roda em várias
// instâncias. A chave é o sha256 do IP ou do e-mail, para o banco não guardá-los.
export const LIMITE_POR_IP = 10;
export const LIMITE_POR_EMAIL = 5;
export const JANELA_MS = 15 * 60 * 1000;

function chave(tipo: "ip" | "email", valor: string): string {
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
 * Conta uma tentativa de login ou de cadastro vinda deste IP e diz se ela pode seguir.
 * Sem IP conhecido (fora do Vercel), não há limite por IP.
 */
export async function tentativaDoIpLiberada(ip: string | null): Promise<boolean> {
  await db.tentativaAcesso.deleteMany({ where: { janelaIniciadaEm: { lt: inicioDaJanela() } } });
  if (!ip) return true;
  return (await contar(chave("ip", ip))) <= LIMITE_POR_IP;
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
