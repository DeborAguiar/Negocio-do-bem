import type { Metadata } from "next";
import { FormCadastro } from "@/components/FormulariosConta";
import { PaginaConta } from "@/components/PaginaConta";

export const metadata: Metadata = { title: "Criar conta" };

export default function Cadastrar(props: PageProps<"/cadastrar">) {
  return (
    <PaginaConta
      titulo="Faça parte do movimento"
      subtitulo="Com uma conta você indica negócios, deixa depoimentos e, se tiver um negócio, assume o seu perfil."
      searchParams={props.searchParams}
      formulario={(voltar) => <FormCadastro voltar={voltar} />}
    />
  );
}
