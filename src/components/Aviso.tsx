import type { ReactNode } from "react";

const ESTILOS = {
  sucesso: "border-folha/20 bg-folha-50 text-folha",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  erro: "border-coral/25 bg-coral-50 text-coral-700",
} as const;

export type TipoAviso = keyof typeof ESTILOS;

export function Aviso({ tipo = "info", children }: { tipo?: TipoAviso; children: ReactNode }) {
  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${ESTILOS[tipo]}`}>
      {children}
    </div>
  );
}
