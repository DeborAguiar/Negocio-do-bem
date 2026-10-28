-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'membro',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "instagramUsername" TEXT NOT NULL,
    "instagramUserId" TEXT,
    "instagramIgsid" TEXT,
    "nome" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "historia" TEXT NOT NULL DEFAULT '',
    "categoria" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "site" TEXT,
    "status" TEXT NOT NULL DEFAULT 'indicada',
    "moderacao" TEXT NOT NULL DEFAULT 'pendente',
    "oculta" BOOLEAN NOT NULL DEFAULT false,
    "motivoIndicacao" TEXT,
    "indicadaPorId" TEXT,
    "busca" TEXT NOT NULL DEFAULT '',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpresaCausa" (
    "empresaId" TEXT NOT NULL,
    "causa" TEXT NOT NULL,

    CONSTRAINT "EmpresaCausa_pkey" PRIMARY KEY ("empresaId","causa")
);

-- CreateTable
CREATE TABLE "EmpresaMembro" (
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'dono',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaMembro_pkey" PRIMARY KEY ("empresaId","usuarioId")
);

-- CreateTable
CREATE TABLE "Reivindicacao" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "codigo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "cnpj" TEXT,
    "relacao" TEXT,
    "contato" TEXT,
    "mensagem" TEXT,
    "notas" TEXT NOT NULL DEFAULT '',
    "motivoRecusa" TEXT,
    "instagramUserId" TEXT,
    "instagramIgsid" TEXT,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "revisadoPorId" TEXT,
    "revisadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reivindicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depoimento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "resposta" TEXT,
    "respondidoEm" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'publicado',
    "denunciado" BOOLEAN NOT NULL DEFAULT false,
    "motivoDenuncia" TEXT,
    "denunciadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Depoimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "alvoTipo" TEXT NOT NULL,
    "alvoId" TEXT NOT NULL,
    "detalhes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Sessao_usuarioId_idx" ON "Sessao"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_instagramUsername_key" ON "Empresa"("instagramUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_instagramUserId_key" ON "Empresa"("instagramUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_instagramIgsid_key" ON "Empresa"("instagramIgsid");

-- CreateIndex
CREATE INDEX "Empresa_moderacao_oculta_status_idx" ON "Empresa"("moderacao", "oculta", "status");

-- CreateIndex
CREATE INDEX "Empresa_uf_idx" ON "Empresa"("uf");

-- CreateIndex
CREATE INDEX "EmpresaCausa_causa_idx" ON "EmpresaCausa"("causa");

-- CreateIndex
CREATE INDEX "EmpresaMembro_usuarioId_idx" ON "EmpresaMembro"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Reivindicacao_codigo_key" ON "Reivindicacao"("codigo");

-- CreateIndex
CREATE INDEX "Reivindicacao_empresaId_status_idx" ON "Reivindicacao"("empresaId", "status");

-- CreateIndex
CREATE INDEX "Reivindicacao_usuarioId_criadoEm_idx" ON "Reivindicacao"("usuarioId", "criadoEm");

-- CreateIndex
CREATE INDEX "Reivindicacao_status_criadoEm_idx" ON "Reivindicacao"("status", "criadoEm");

-- CreateIndex
CREATE INDEX "Depoimento_empresaId_status_criadoEm_idx" ON "Depoimento"("empresaId", "status", "criadoEm");

-- CreateIndex
CREATE INDEX "Depoimento_denunciado_idx" ON "Depoimento"("denunciado");

-- CreateIndex
CREATE UNIQUE INDEX "Depoimento_empresaId_autorId_key" ON "Depoimento"("empresaId", "autorId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_criadoEm_idx" ON "RegistroAuditoria"("criadoEm");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_alvoTipo_alvoId_idx" ON "RegistroAuditoria"("alvoTipo", "alvoId");

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_indicadaPorId_fkey" FOREIGN KEY ("indicadaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaCausa" ADD CONSTRAINT "EmpresaCausa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaMembro" ADD CONSTRAINT "EmpresaMembro_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaMembro" ADD CONSTRAINT "EmpresaMembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reivindicacao" ADD CONSTRAINT "Reivindicacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reivindicacao" ADD CONSTRAINT "Reivindicacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reivindicacao" ADD CONSTRAINT "Reivindicacao_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depoimento" ADD CONSTRAINT "Depoimento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depoimento" ADD CONSTRAINT "Depoimento_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depoimento" ADD CONSTRAINT "Depoimento_denunciadoPorId_fkey" FOREIGN KEY ("denunciadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
