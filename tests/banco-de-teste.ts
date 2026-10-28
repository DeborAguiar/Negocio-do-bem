import "dotenv/config";

// Os testes usam um banco separado, para nunca apagar os dados de desenvolvimento:
// o mesmo servidor do DATABASE_URL, mas o banco "negocio_do_bem_teste".
function urlDoBancoDeTeste(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = new URL(
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/negocio_do_bem?schema=public",
  );
  url.pathname = "/negocio_do_bem_teste";
  return url.toString();
}

export const URL_BANCO_TESTE = urlDoBancoDeTeste();

export function nomeDoBanco(url: string): string {
  return decodeURIComponent(new URL(url).pathname.slice(1));
}

// Os testes apagam as tabelas entre um caso e outro: só rodam num banco com "test" no nome.
if (!/test/i.test(nomeDoBanco(URL_BANCO_TESTE))) {
  throw new Error(`TEST_DATABASE_URL precisa apontar para um banco de teste (nome atual: ${nomeDoBanco(URL_BANCO_TESTE)}).`);
}
