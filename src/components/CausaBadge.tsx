import { buscarCausa, type GrupoCausa } from "@/lib/causas";

const CORES: Record<GrupoCausa, string> = {
  trabalho: "bg-sky-50 text-sky-800 ring-sky-100",
  diversidade: "bg-violet-50 text-violet-800 ring-violet-100",
  planeta: "bg-emerald-50 text-emerald-800 ring-emerald-100",
};

export function CausaBadge({ slug, grande = false }: { slug: string; grande?: boolean }) {
  const causa = buscarCausa(slug);
  if (!causa) return null;
  return (
    <span
      title={causa.descricao}
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset ${CORES[causa.grupo]} ${
        grande ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      } font-medium whitespace-nowrap`}
    >
      <span aria-hidden="true">{causa.emoji}</span>
      {causa.nome}
    </span>
  );
}
