import { z, type ZodError } from "zod";

/** Site opcional: aceita "meunegocio.com.br" e devolve a URL completa, ou null se vazio. */
export const campoSite = z
  .string()
  .trim()
  .max(200)
  .transform((valor, ctx) => {
    if (!valor) return null;
    const comProtocolo = /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
    try {
      const url = new URL(comProtocolo);
      if (!url.hostname.includes(".")) throw new Error();
      return url.toString();
    } catch {
      ctx.addIssue({ code: "custom", message: "Digite um endereço válido (ex.: www.meunegocio.com.br)." });
      return z.NEVER;
    }
  });

/** Estado devolvido pelas Server Actions para os formulários (useActionState). */
export type EstadoFormulario =
  | {
      erro?: string;
      erros?: Record<string, string>;
      // @ de um negócio que já está no diretório (formulário de indicação).
      existente?: string;
      // Valores enviados, para o formulário não perder o que a pessoa digitou.
      valores?: Record<string, string | string[]>;
    }
  | undefined;

/** Primeiro erro de cada campo, no formato que os formulários mostram. */
export function errosPorCampo(erro: ZodError): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? "_");
    erros[campo] ??= problema.message;
  }
  return erros;
}

/** Copia os campos de texto do FormData (sem senhas) para devolver ao formulário. */
export function valoresDoFormulario(dados: FormData, multiplos: string[] = []): Record<string, string | string[]> {
  const valores: Record<string, string | string[]> = {};
  for (const [chave, valor] of dados.entries()) {
    if (typeof valor !== "string" || chave.startsWith("$") || chave.includes("senha")) continue;
    valores[chave] = multiplos.includes(chave) ? dados.getAll(chave).map(String) : valor;
  }
  return valores;
}

export function texto(dados: FormData, campo: string): string {
  const valor = dados.get(campo);
  return typeof valor === "string" ? valor : "";
}
