"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { gerarHashSenha, verificarSenha } from "@/lib/auth/senha";
import { caminhoSeguro, criarSessao, encerrarSessao } from "@/lib/auth/sessao";
import { emailLiberado, registrarFalhaDoEmail, tentativaDoIpLiberada, zerarTentativasDoEmail } from "@/lib/auth/tentativas";
import { db } from "@/lib/db";
import { errosPorCampo, texto, valoresDoFormulario, type EstadoFormulario } from "@/lib/formulario";

const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, "Conte como podemos te chamar.").max(80, "Nome muito longo."),
  email: z.email("Digite um e-mail válido.").max(200, "E-mail muito longo."),
  senha: z.string().min(8, "Use pelo menos 8 caracteres.").max(200, "Senha muito longa."),
});

/** IP de quem fez a requisição. No Vercel, os dois cabeçalhos são preenchidos pelo próprio Vercel. */
async function ipDaRequisicao(): Promise<string | null> {
  const cabecalhos = await headers();
  const ip = cabecalhos.get("x-real-ip") ?? cabecalhos.get("x-forwarded-for")?.split(",")[0];
  return ip?.trim() || null;
}

export async function cadastrar(_estado: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const resultado = esquemaCadastro.safeParse({
    nome: texto(dados, "nome"),
    email: texto(dados, "email").trim().toLowerCase(),
    senha: texto(dados, "senha"),
  });
  if (!resultado.success) {
    return { erros: errosPorCampo(resultado.error), valores: valoresDoFormulario(dados) };
  }
  const { nome, email, senha } = resultado.data;

  if (!(await tentativaDoIpLiberada(await ipDaRequisicao()))) {
    return { erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", valores: valoresDoFormulario(dados) };
  }

  const existente = await db.usuario.findUnique({ where: { email } });
  if (existente) {
    return { erros: { email: "Já existe uma conta com este e-mail. Que tal entrar?" }, valores: valoresDoFormulario(dados) };
  }

  const usuario = await db.usuario.create({ data: { nome, email, senhaHash: await gerarHashSenha(senha) } });
  await criarSessao(usuario.id);
  redirect(caminhoSeguro(texto(dados, "voltar")));
}

// Hash de uma senha qualquer: quando o e-mail não existe, conferimos contra ele
// para a resposta demorar o mesmo tempo e não revelar quais e-mails têm conta.
let hashFalso: Promise<string> | undefined;

export async function entrar(_estado: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const email = texto(dados, "email").trim().toLowerCase();
  const senha = texto(dados, "senha");
  const recusado = { erro: "E-mail ou senha incorretos.", valores: valoresDoFormulario(dados) };

  if (!(await tentativaDoIpLiberada(await ipDaRequisicao())) || (email && !(await emailLiberado(email)))) {
    return recusado;
  }

  const usuario = email ? await db.usuario.findUnique({ where: { email } }) : null;
  const senhaConfere = await verificarSenha(senha, usuario?.senhaHash ?? (await (hashFalso ??= gerarHashSenha("senha-que-nao-existe"))));

  if (!usuario || !senhaConfere) {
    if (email) await registrarFalhaDoEmail(email);
    return recusado;
  }
  await zerarTentativasDoEmail(email);
  await criarSessao(usuario.id);
  redirect(caminhoSeguro(texto(dados, "voltar")));
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/");
}
