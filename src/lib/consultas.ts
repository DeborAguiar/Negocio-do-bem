import "server-only";
import type { UsuarioSessao } from "@/lib/auth/sessao";
import { filtrarCausas } from "@/lib/causas";
import { db, type Prisma } from "@/lib/db";
import { UFS } from "@/lib/dominio";
import { normalizarTexto } from "@/lib/texto";

export const POR_PAGINA = 18;

export type FiltrosDiretorio = { q: string; causas: string[]; uf: string | null; pagina: number };

function lista(valor: string | string[] | undefined): string[] {
  if (valor === undefined) return [];
  return Array.isArray(valor) ? valor : [valor];
}

/** Lê e limpa os filtros da URL do diretório. */
export function lerFiltros(params: Record<string, string | string[] | undefined>): FiltrosDiretorio {
  const q = lista(params.q)[0]?.slice(0, 100) ?? "";
  const uf = lista(params.uf)[0]?.toUpperCase() ?? "";
  const pagina = Number.parseInt(lista(params.pagina)[0] ?? "1", 10);
  return {
    q,
    causas: filtrarCausas(lista(params.causa)),
    uf: (UFS as readonly string[]).includes(uf) ? uf : null,
    pagina: Number.isFinite(pagina) && pagina > 0 ? Math.min(pagina, 500) : 1,
  };
}

export async function listarEmpresas(filtros: FiltrosDiretorio) {
  const termos = normalizarTexto(filtros.q).split(" ").filter(Boolean).slice(0, 6);
  const where: Prisma.EmpresaWhereInput = {
    moderacao: "aprovada",
    oculta: false,
    ...(filtros.uf ? { uf: filtros.uf } : {}),
    AND: [
      ...termos.map((termo) => ({ busca: { contains: termo } })),
      ...filtros.causas.map((causa) => ({ causas: { some: { causa } } })),
    ],
  };
  const itens = await db.empresa.findMany({
    where,
    // Verificados primeiro, depois os atualizados mais recentemente.
    orderBy: [{ status: "desc" }, { atualizadoEm: "desc" }],
    skip: (filtros.pagina - 1) * POR_PAGINA,
    take: POR_PAGINA + 1,
    include: {
      causas: { select: { causa: true } },
      _count: { select: { depoimentos: { where: { status: "publicado" } } } },
    },
  });
  return { itens: itens.slice(0, POR_PAGINA), temMais: itens.length > POR_PAGINA };
}

export async function buscarPerfil(username: string) {
  return db.empresa.findUnique({
    where: { instagramUsername: username },
    include: {
      causas: { select: { causa: true } },
      membros: { select: { usuarioId: true } },
      indicadaPor: { select: { nome: true } },
      depoimentos: {
        where: { status: "publicado" },
        orderBy: { criadoEm: "desc" },
        include: { autor: { select: { nome: true } } },
      },
    },
  });
}

type EmpresaVisivel = {
  moderacao: string;
  oculta: boolean;
  indicadaPorId: string | null;
  membros: { usuarioId: string }[];
};

export function ehDono(empresa: { membros: { usuarioId: string }[] }, usuario: UsuarioSessao | null): boolean {
  return !!usuario && empresa.membros.some((m) => m.usuarioId === usuario.id);
}

/** Perfis fora do diretório só aparecem para donos, moderação e quem indicou. */
export function podeVerPerfil(empresa: EmpresaVisivel, usuario: UsuarioSessao | null): boolean {
  if (empresa.moderacao === "aprovada" && !empresa.oculta) return true;
  if (!usuario) return false;
  return usuario.moderador || ehDono(empresa, usuario) || empresa.indicadaPorId === usuario.id;
}
