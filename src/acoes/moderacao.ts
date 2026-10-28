"use server";

import { redirect } from "next/navigation";
import { registrarAuditoria } from "@/lib/auditoria";
import { exigirModerador } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { texto } from "@/lib/formulario";
import { aprovar, ErroReivindicacao, recusar, type ModoAprovacao } from "@/lib/reivindicacao";

function voltar(aba: string, aviso: string): never {
  redirect(`/moderacao?aba=${aba}&aviso=${aviso}`);
}

export async function aprovarReivindicacao(dados: FormData): Promise<void> {
  const moderador = await exigirModerador();
  const modo: ModoAprovacao = dados.get("modo") === "transferir" ? "transferir" : "adicionar";
  try {
    await aprovar({ reivindicacaoId: texto(dados, "reivindicacaoId"), revisorId: moderador.id, modo });
  } catch (erro) {
    if (erro instanceof ErroReivindicacao) voltar("reivindicacoes", "ja_processada");
    throw erro;
  }
  voltar("reivindicacoes", "feito");
}

export async function recusarReivindicacao(dados: FormData): Promise<void> {
  const moderador = await exigirModerador();
  const motivo = texto(dados, "motivo").trim().slice(0, 500) || "Não foi possível confirmar que você controla este negócio.";
  try {
    await recusar({ reivindicacaoId: texto(dados, "reivindicacaoId"), revisorId: moderador.id, motivo });
  } catch (erro) {
    if (erro instanceof ErroReivindicacao) voltar("reivindicacoes", "ja_processada");
    throw erro;
  }
  voltar("reivindicacoes", "feito");
}

export async function moderarEmpresa(dados: FormData): Promise<void> {
  const moderador = await exigirModerador();
  const decisao = dados.get("decisao") === "aprovar" ? "aprovada" : "rejeitada";
  const empresa = await db.empresa.update({
    where: { id: texto(dados, "empresaId") },
    data: { moderacao: decisao },
  });
  await registrarAuditoria(db, {
    usuarioId: moderador.id,
    acao: decisao === "aprovada" ? "empresa.aprovada" : "empresa.rejeitada",
    alvoTipo: "empresa",
    alvoId: empresa.id,
  });
  voltar("indicacoes", "feito");
}

export async function decidirDenuncia(dados: FormData): Promise<void> {
  const moderador = await exigirModerador();
  const remover = dados.get("decisao") === "remover";
  const depoimento = await db.depoimento.update({
    where: { id: texto(dados, "depoimentoId") },
    data: remover ? { status: "removido", denunciado: false } : { denunciado: false, motivoDenuncia: null, denunciadoPorId: null },
  });
  await registrarAuditoria(db, {
    usuarioId: moderador.id,
    acao: remover ? "depoimento.removido" : "depoimento.mantido",
    alvoTipo: "depoimento",
    alvoId: depoimento.id,
  });
  voltar("denuncias", "feito");
}
