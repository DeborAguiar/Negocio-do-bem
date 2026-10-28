import type { ReactNode } from "react";

/** Rótulo + campo + ajuda ou erro, no padrão dos formulários do site. */
export function Campo({
  id,
  rotulo,
  erro,
  ajuda,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  ajuda?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      {children}
      {ajuda && !erro && <p className="ajuda">{ajuda}</p>}
      {erro && <p className="erro-campo">{erro}</p>}
    </div>
  );
}
