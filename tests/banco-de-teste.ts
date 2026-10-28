// Os testes usam um banco separado, para nunca apagar os dados de desenvolvimento.
export const URL_BANCO_TESTE =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/negocio_do_bem_teste?schema=public";

export function nomeDoBanco(url: string): string {
  return decodeURIComponent(new URL(url).pathname.slice(1));
}

// Os testes apagam as tabelas entre um caso e outro: só rodam num banco com "test" no nome.
if (!/test/i.test(nomeDoBanco(URL_BANCO_TESTE))) {
  throw new Error(`TEST_DATABASE_URL precisa apontar para um banco de teste (nome atual: ${nomeDoBanco(URL_BANCO_TESTE)}).`);
}
