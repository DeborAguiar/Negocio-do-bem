"use client";

import { useFormStatus } from "react-dom";

export function BotaoEnviar({
  children,
  enviando = "Enviando…",
  pendente,
  className = "botao",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  enviando?: string;
  /** Para formulários enviados com enviarSemLimpar, que o useFormStatus não enxerga. */
  pendente?: boolean;
}) {
  const status = useFormStatus();
  const ocupado = pendente || status.pending;
  return (
    <button type="submit" className={className} disabled={ocupado || props.disabled} {...props}>
      {ocupado ? enviando : children}
    </button>
  );
}
