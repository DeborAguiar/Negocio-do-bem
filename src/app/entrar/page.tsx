import type { Metadata } from "next";
import { FormEntrar } from "@/components/FormulariosConta";
import { PaginaConta } from "@/components/PaginaConta";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar(props: PageProps<"/entrar">) {
  return (
    <PaginaConta
      titulo="Que bom te ver"
      subtitulo="Entre para indicar negócios, deixar depoimentos e cuidar do seu perfil."
      searchParams={props.searchParams}
      formulario={(voltar) => <FormEntrar voltar={voltar} />}
    />
  );
}
