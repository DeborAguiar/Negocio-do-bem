import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// scrypt com custo N=2^15 (~32 MB de memória por cálculo): lento o bastante
// para dificultar ataques de força bruta, leve o bastante para um servidor pequeno.
const N = 2 ** 15;
const R = 8;
const P = 1;
const TAMANHO_CHAVE = 64;

function derivar(senha: string, sal: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(senha.normalize("NFKC"), sal, TAMANHO_CHAVE, { N: n, r, p, maxmem: 256 * n * r }, (erro, chave) =>
      erro ? reject(erro) : resolve(chave),
    );
  });
}

/** Formato guardado: scrypt$N$r$p$sal$hash (sal e hash em base64). */
export async function gerarHashSenha(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const chave = await derivar(senha, sal, N, R, P);
  return ["scrypt", N, R, P, sal.toString("base64"), chave.toString("base64")].join("$");
}

export async function verificarSenha(senha: string, armazenado: string): Promise<boolean> {
  const [algoritmo, n, r, p, sal, hash] = armazenado.split("$");
  if (algoritmo !== "scrypt" || !n || !r || !p || !sal || !hash) return false;
  const esperado = Buffer.from(hash, "base64");
  const chave = await derivar(senha, Buffer.from(sal, "base64"), Number(n), Number(r), Number(p));
  return chave.length === esperado.length && timingSafeEqual(chave, esperado);
}
