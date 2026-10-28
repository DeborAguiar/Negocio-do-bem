"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirUsuario } from "@/lib/auth/sessao";
import { cnpjValido, limparCnpj } from "@/lib/cnpj";
import { db } from "@/lib/db";
import { errosPorCampo, texto, valoresDoFormulario, type EstadoFormulario } from "@/lib/formulario";
import { cancelar, ErroReivindicacao, iniciarPorCodigoDm, solicitarPorDocumento } from "@/lib/reivindicacao";

async function carregar(dados: FormData) {
  const empresa = await db.empresa.findUnique({ where: { id: texto(dados, "empresaId") } });
  if (!empresa) redirect("/");
  const caminho = `/empresas/${empresa.instagramUsername}/reivindicar`;
  const usuario = await exigirUsuario(caminho);
  return { empresa, usuario, caminho };
}

export async function gerarCodigoDm(_estado: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const { empresa, usuario, caminho } = await carregar(dados);
  try {
    await iniciarPorCodigoDm(empresa.id, usuario.id);
  } catch (erro) {
    if (erro instanceof ErroReivindicacao) return { erro: erro.message };
    throw erro;
  }
  redirect(`${caminho}?aviso=codigo_gerado#codigo`);
}

const esquemaDocumento = z.object({
  cnpj: z
    .string()
    .trim()
    .transform((valor, ctx) => {
      if (!valor) return null;
      if (!cnpjValido(valor)) {
        ctx.addIssue({ code: "custom", message: "Este CNPJ não parece válido. Confira os números." });
        return z.NEVER;
      }
      return limparCnpj(valor);
    }),
  relacao: z.string().trim().min(2, "Conte qual é a sua relação com o negócio.").max(120),
  contato: z.string().trim().min(5, "Deixe um WhatsApp ou e-mail para a moderação falar com você.").max(160),
  mensagem: z.string().trim().max(1000, "Use até 1.000 caracteres."),
});

export async function enviarDocumento(_estado: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const { empresa, usuario, caminho } = await carregar(dados);
  const resultado = esquemaDocumento.safeParse({
    cnpj: texto(dados, "cnpj"),
    relacao: texto(dados, "relacao"),
    contato: texto(dados, "contato"),
    mensagem: texto(dados, "mensagem"),
  });
  if (!resultado.success) return { erros: errosPorCampo(resultado.error), valores: valoresDoFormulario(dados) };

  try {
    await solicitarPorDocumento({
      empresaId: empresa.id,
      usuarioId: usuario.id,
      ...resultado.data,
      mensagem: resultado.data.mensagem || null,
    });
  } catch (erro) {
    if (erro instanceof ErroReivindicacao) return { erro: erro.message, valores: valoresDoFormulario(dados) };
    throw erro;
  }
  redirect(`${caminho}?aviso=documento_enviado`);
}

export async function cancelarReivindicacao(dados: FormData): Promise<void> {
  const { usuario, caminho } = await carregar(dados);
  await cancelar(texto(dados, "reivindicacaoId"), usuario.id);
  redirect(`${caminho}?aviso=cancelada`);
}
