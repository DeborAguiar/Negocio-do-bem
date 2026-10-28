import type { Prisma } from "@/lib/db";

type Cliente = Pick<Prisma.TransactionClient, "registroAuditoria">;

/** Registra quem fez o quê. `usuarioId` null significa ação automática do sistema. */
export async function registrarAuditoria(
  cliente: Cliente,
  registro: { usuarioId: string | null; acao: string; alvoTipo: string; alvoId: string; detalhes?: string },
): Promise<void> {
  await cliente.registroAuditoria.create({ data: registro });
}
