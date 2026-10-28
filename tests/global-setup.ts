import { execSync } from "node:child_process";
import { Client } from "pg";
import { nomeDoBanco, URL_BANCO_TESTE } from "./banco-de-teste";

/** Cria o banco de teste se ainda não existir e aplica as migrações pendentes. */
export default async function setup() {
  const nome = nomeDoBanco(URL_BANCO_TESTE);
  const urlAdmin = new URL(URL_BANCO_TESTE);
  urlAdmin.pathname = "/postgres";
  urlAdmin.search = "";

  const cliente = new Client({ connectionString: urlAdmin.toString() });
  await cliente.connect();
  try {
    const existe = await cliente.query("SELECT 1 FROM pg_database WHERE datname = $1", [nome]);
    if (existe.rowCount === 0) await cliente.query(`CREATE DATABASE "${nome.replaceAll('"', '""')}"`);
  } finally {
    await cliente.end();
  }

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: URL_BANCO_TESTE },
    stdio: "pipe",
  });
}
