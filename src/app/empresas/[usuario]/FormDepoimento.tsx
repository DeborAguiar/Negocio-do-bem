"use client";

import { useActionState } from "react";
import { publicarDepoimento } from "@/acoes/depoimentos";
import { Aviso } from "@/components/Aviso";
import { BotaoEnviar } from "@/components/BotaoEnviar";
import { enviarSemLimpar } from "@/components/envio";

export function FormDepoimento({ empresaId, nomeEmpresa }: { empresaId: string; nomeEmpresa: string }) {
  const [estado, acao, pendente] = useActionState(publicarDepoimento, undefined);
  const valor = estado?.valores?.texto;
  return (
    <form action={acao} onSubmit={enviarSemLimpar(acao)} className="cartao space-y-3 p-5">
      <input type="hidden" name="empresaId" value={empresaId} />
      <label htmlFor="texto" className="rotulo">
        Como foi a sua experiência com {nomeEmpresa}?
      </label>
      <textarea
        id="texto"
        name="texto"
        rows={4}
        required
        minLength={20}
        maxLength={1500}
        defaultValue={typeof valor === "string" ? valor : ""}
        placeholder="Conte o que torna este lugar especial: o atendimento, as pessoas, as causas que ele abraça…"
        className="campo resize-y font-serif text-lg"
        aria-invalid={!!estado?.erros?.texto}
      />
      {estado?.erros?.texto && <p className="erro-campo">{estado.erros.texto}</p>}
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-suave">Seu nome aparece junto do depoimento.</p>
        <BotaoEnviar pendente={pendente} enviando="Publicando…">Publicar depoimento</BotaoEnviar>
      </div>
    </form>
  );
}
