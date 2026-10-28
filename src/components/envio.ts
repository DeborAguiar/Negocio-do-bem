"use client";

import { startTransition, type FormEvent } from "react";

/**
 * O React 19 limpa o formulário depois que uma action termina. Num erro de
 * validação isso apaga o que a pessoa escolheu (selects, checkboxes, a história
 * sendo escrita). Este onSubmit envia a mesma action sem esse reset.
 * O `action` do <form> continua lá para funcionar antes do JavaScript carregar.
 */
export function enviarSemLimpar(acao: (dados: FormData) => void) {
  return (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget, (evento.nativeEvent as SubmitEvent).submitter);
    startTransition(() => acao(dados));
  };
}
