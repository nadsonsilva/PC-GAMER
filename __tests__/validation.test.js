const { leadSchema, verifyOtpSchema } = require("../src/lib/validation");

describe("validação de lead", () => {
  test("aceita e normaliza um cadastro válido", () => {
    const result = leadSchema.parse({
      name: "  Maria Silva  ",
      email: "MARIA@EXAMPLE.COM",
      whatsapp: "(92) 99999-9999",
      cep: "69000-000",
      address: "Rua Exemplo, 123",
    });

    expect(result.name).toBe("Maria Silva");
    expect(result.email).toBe("maria@example.com");
    expect(result.whatsapp).toBe("92999999999");
    expect(result.cep).toBe("69000000");
  });

  test("rejeita e-mail, WhatsApp e CEP inválidos", () => {
    const result = leadSchema.safeParse({
      name: "Maria Silva",
      email: "email-invalido",
      whatsapp: "123",
      cep: "999",
      address: "Rua Exemplo, 123",
    });
    expect(result.success).toBe(false);
  });

  test("aceita apenas OTP numérico de seis dígitos", () => {
    expect(verifyOtpSchema.safeParse({ email: "a@b.com", code: "123456" }).success).toBe(true);
    expect(verifyOtpSchema.safeParse({ email: "a@b.com", code: "12345a" }).success).toBe(false);
  });
});
