"use client";

import { useState } from "react";

export function CopiarCodigo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem permissão de área de transferência: a pessoa ainda pode selecionar o texto.
    }
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <code className="rounded-2xl border-2 border-dashed border-coral/40 bg-coral-50 px-5 py-3 font-mono text-2xl font-bold tracking-[0.15em] text-coral-700 select-all">
        {codigo}
      </code>
      <button type="button" onClick={copiar} className="botao-claro botao-pequeno">
        {copiado ? "Copiado ✓" : "Copiar"}
      </button>
    </div>
  );
}
