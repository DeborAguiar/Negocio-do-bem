import { describe, expect, it } from "vitest";
import { gerarHashSenha, verificarSenha } from "@/lib/auth/senha";
import { filtrarCausas } from "@/lib/causas";
import { cnpjValido, formatarCnpj } from "@/lib/cnpj";
import { iniciais, normalizarTexto } from "@/lib/texto";

describe("cnpjValido", () => {
  it("aceita CNPJ numérico válido, com ou sem pontuação", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
    expect(cnpjValido("11222333000181")).toBe(true);
  });

  it("aceita o novo CNPJ alfanumérico", () => {
    // Exemplo publicado pela Receita Federal.
    expect(cnpjValido("12.ABC.345/01DE-35")).toBe(true);
    expect(cnpjValido("12abc34501de35")).toBe(true);
  });

  it("rejeita dígito verificador errado, tamanho errado e repetições", () => {
    expect(cnpjValido("11.222.333/0001-82")).toBe(false);
    expect(cnpjValido("12.ABC.345/01DE-36")).toBe(false);
    expect(cnpjValido("1122233300018")).toBe(false);
    expect(cnpjValido("00000000000000")).toBe(false);
  });

  it("formata", () => {
    expect(formatarCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });
});

describe("senha", () => {
  it("confere a senha certa e rejeita a errada", async () => {
    const hash = await gerarHashSenha("uma senha bem grande");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verificarSenha("uma senha bem grande", hash)).toBe(true);
    expect(await verificarSenha("outra senha", hash)).toBe(false);
    expect(await verificarSenha("uma senha bem grande", "lixo")).toBe(false);
  });

  it("usa sal diferente a cada vez", async () => {
    expect(await gerarHashSenha("abc12345")).not.toBe(await gerarHashSenha("abc12345"));
  });
});

describe("texto", () => {
  it("normaliza acentos e caixa", () => {
    expect(normalizarTexto("  São   PAULO ")).toBe("sao paulo");
  });

  it("gera iniciais", () => {
    expect(iniciais("Padaria Flor do Bairro")).toBe("PB");
    expect(iniciais("Ateliê")).toBe("A");
    expect(iniciais("@@@")).toBe("?");
  });
});

describe("filtrarCausas", () => {
  it("remove desconhecidas e repetidas, mantendo a ordem oficial", () => {
    expect(filtrarCausas(["pet-friendly", "inventada", "escala-4x3", "pet-friendly"])).toEqual([
      "escala-4x3",
      "pet-friendly",
    ]);
  });
});
