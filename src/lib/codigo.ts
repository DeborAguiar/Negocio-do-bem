import { randomInt } from "node:crypto";

// Sem 0/O, 1/I/L: o dono vai digitar o código no Instagram.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const TAMANHO = 6;

/** Gera um código como "BEM-7K3F9Q". */
export function gerarCodigo(): string {
  let codigo = "";
  for (let i = 0; i < TAMANHO; i++) codigo += ALFABETO[randomInt(ALFABETO.length)];
  return `BEM-${codigo}`;
}

/** Acha um código numa mensagem, mesmo escrito "bem 7k3f9q" ou "BEM7K3F9Q". */
export function extrairCodigo(texto: string): string | null {
  const achado = texto.match(/\bBEM[\s-]?([A-Z0-9]{6})\b/i);
  return achado ? `BEM-${achado[1]!.toUpperCase()}` : null;
}
