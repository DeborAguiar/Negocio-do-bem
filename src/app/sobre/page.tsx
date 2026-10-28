import type { Metadata } from "next";
import Link from "next/link";
import { CausaBadge } from "@/components/CausaBadge";
import { CAUSAS, GRUPOS, type GrupoCausa } from "@/lib/causas";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "O que é o Negócio do Bem, como os donos assumem seus perfis e como cuidamos da privacidade.",
};

export default function Sobre() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-coral-700 uppercase">Manifesto</p>
      <h1 className="mt-2 font-serif text-5xl leading-tight font-semibold tracking-tight text-balance">
        Escolher onde gastar também é escolher o mundo que a gente quer.
      </h1>

      <div className="historia mt-8">
        <p>
          O Negócio do Bem nasceu para dar visibilidade a quem cuida das pessoas, da comunidade e do planeta. Quando
          negócios são atacados por defenderem o respeito e a dignidade, a melhor resposta é coletiva: encontrar,
          indicar e fortalecer quem faz o bem.
        </p>
        <p>
          Aqui não existe ranking nem anúncio pago. Existe a comunidade dizendo &ldquo;esse lugar faz diferença&rdquo; e os
          próprios donos contando suas histórias.
        </p>

        <h2>Como funciona</h2>
        <ol>
          <li>
            <strong>Alguém indica</strong> um negócio pelo @ do Instagram e conta por que ele faz o bem. Uma moderação
            rápida evita spam e perfis falsos.
          </li>
          <li>
            <strong>O dono assume o perfil</strong> provando que controla aquele Instagram. A partir daí, só ele edita as
            informações.
          </li>
          <li>
            <strong>A comunidade fortalece</strong> deixando depoimentos e buscando pelas causas que importam.
          </li>
        </ol>

        <h2 id="dono" className="scroll-mt-24">
          Para donos de negócio
        </h2>
        <p>
          Procure seu negócio no{" "}
          <Link href="/#diretorio">diretório</Link> e clique em <strong>&ldquo;Sou o dono&rdquo;</strong>. Se ele ainda não
          estiver lá, <Link href="/indicar">cadastre</Link> marcando &ldquo;Este negócio é meu&rdquo;. Para provar que o
          negócio é seu, existem três caminhos:
        </p>
        <ul>
          <li>
            <strong>Entrar com Instagram</strong>, a forma mais rápida: você faz login na conta do negócio e o Instagram
            confirma pra gente qual é o @. Funciona com contas comerciais ou de criador de conteúdo. Só lemos o nome de
            usuário e o identificador da conta: não guardamos acesso nenhum.
          </li>
          <li>
            <strong>Código por DM:</strong> geramos um código e você manda por mensagem direta, a partir do Instagram do
            negócio, para o nosso perfil oficial. Funciona com qualquer tipo de conta.
          </li>
          <li>
            <strong>Documento:</strong> se você não tem acesso ao Instagram, envie CNPJ ou MEI e um contato. A moderação
            analisa com cuidado.
          </li>
        </ul>
        <p>
          Se outra pessoa já assumiu o seu perfil, use a mesma página para pedir a revisão. Qualquer disputa vai para a
          moderação, e todas as decisões ficam registradas.
        </p>

        <h2 id="privacidade" className="scroll-mt-24">
          Privacidade e remoção
        </h2>
        <p>
          <strong>Meu negócio foi indicado e eu não quero aparecer.</strong> Sem problema: assuma o perfil por um dos
          caminhos acima e, no painel, clique em &ldquo;Ocultar meu negócio&rdquo;. Ele sai do diretório na hora.
        </p>
        <p>
          <strong>Que dados vocês guardam?</strong> Da sua conta, nome e e-mail. Dos negócios, só o que aparece no perfil.
          Não fazemos raspagem do Instagram e não guardamos tokens de acesso.
        </p>
        <p>
          <strong>E os depoimentos?</strong> Ficam no ar com o nome de quem escreveu. Donos podem responder, mas não
          apagar. Conteúdo ofensivo pode ser denunciado e é avaliado pela moderação.
        </p>

        <h2>As causas</h2>
        <p>
          Cada negócio marca as causas que vive no dia a dia. Elas aparecem como selos no perfil e servem de filtro na
          busca.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {(Object.keys(GRUPOS) as GrupoCausa[]).map((grupo) => (
          <section key={grupo}>
            <h3 className="font-serif text-xl font-semibold">{GRUPOS[grupo]}</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {CAUSAS.filter((c) => c.grupo === grupo).map((causa) => (
                <li key={causa.slug} className="cartao p-4">
                  <CausaBadge slug={causa.slug} />
                  <p className="mt-2 text-sm text-suave">{causa.descricao}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
