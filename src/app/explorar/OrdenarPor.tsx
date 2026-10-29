import Link from "next/link";
import { ORDENS, type Ordem } from "@/lib/diretorio";

/** Seletor de ordenação: cada opção é um link do diretório reordenado, e funciona sem JavaScript. */
export function OrdenarPor({ atual, links }: { atual: Ordem; links: Record<Ordem, string> }) {
  return (
    <div role="group" aria-labelledby="rotulo-ordenar" className="flex flex-wrap items-center gap-1.5 text-sm text-suave">
      <span id="rotulo-ordenar" className="mr-0.5">
        Ordenar
      </span>
      {(Object.keys(ORDENS) as Ordem[]).map((ordem) => (
        <Link
          key={ordem}
          href={links[ordem]}
          scroll={false}
          aria-current={atual === ordem ? "true" : undefined}
          className={`rounded-full border px-3 py-1.5 font-medium whitespace-nowrap transition ${
            atual === ordem ? "border-tinta bg-tinta text-papel" : "border-linha bg-superficie text-suave hover:text-tinta"
          }`}
        >
          {ORDENS[ordem]}
        </Link>
      ))}
    </div>
  );
}
