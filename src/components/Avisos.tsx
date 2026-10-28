import { Aviso } from "@/components/Aviso";
import { avisoDe } from "@/lib/avisos";

/** Mostra a mensagem do ?aviso= da URL, se for um código conhecido. */
export function AvisoDaUrl({ codigo }: { codigo: string | string[] | undefined }) {
  const aviso = avisoDe(Array.isArray(codigo) ? codigo[0] : codigo);
  if (!aviso) return null;
  return <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>;
}
