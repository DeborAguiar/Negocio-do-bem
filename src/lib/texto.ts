/** Minúsculo e sem acentos, para comparar e buscar ("São Paulo" → "sao paulo"). */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function textoDeBusca(empresa: {
  nome: string;
  resumo: string;
  categoria: string;
  cidade: string;
  uf: string;
  instagramUsername: string;
}): string {
  return normalizarTexto(
    [
      empresa.nome,
      empresa.resumo,
      empresa.categoria,
      empresa.cidade,
      empresa.uf,
      empresa.instagramUsername,
    ].join(" "),
  );
}

export function iniciais(nome: string): string {
  const palavras = nome
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const letras = palavras.length > 1 ? [palavras[0], palavras[palavras.length - 1]] : palavras;
  return letras.map((p) => p[0]!.toUpperCase()).join("").slice(0, 2) || "?";
}

export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(data);
}

export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}
