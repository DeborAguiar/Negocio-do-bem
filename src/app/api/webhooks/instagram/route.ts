import type { NextRequest } from "next/server";
import { assinaturaValida, buscarUsernamePorIgsid, configWebhook, extrairMensagens } from "@/lib/instagram";
import { processarDm } from "@/lib/reivindicacao";

// Webhook de mensagens do Instagram: confirma sozinho o código que o dono manda
// por DM para o perfil oficial. Opcional; sem as variáveis INSTAGRAM_* a rota responde 404.

/** Verificação que a Meta faz ao cadastrar o webhook. */
export async function GET(request: NextRequest) {
  const config = configWebhook();
  if (!config) return new Response("Webhook desativado", { status: 404 });
  const params = request.nextUrl.searchParams;
  if (params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === config.verifyToken) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Token de verificação inválido", { status: 403 });
}

export async function POST(request: NextRequest) {
  const config = configWebhook();
  if (!config) return new Response("Webhook desativado", { status: 404 });

  const corpo = await request.text();
  if (!assinaturaValida(corpo, request.headers.get("x-hub-signature-256"), config.appSecret)) {
    return new Response("Assinatura inválida", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(corpo);
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  for (const mensagem of extrairMensagens(payload)) {
    await processarDm({
      remetenteId: mensagem.remetenteId,
      texto: mensagem.texto,
      buscarUsername: (igsid) => buscarUsernamePorIgsid(igsid, config.accessToken),
    });
  }
  // Se algo acima lançar erro, a resposta vira 500 e a Meta tenta entregar de novo.
  return new Response("ok", { status: 200 });
}
