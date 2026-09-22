import { z } from "zod";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const leadSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo.").max(120, "Nome muito longo."),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(254, "E-mail muito longo."),
  whatsapp: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length === 10 || value.length === 11, "Informe um WhatsApp válido."),
  cep: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length === 8, "Informe um CEP válido."),
  address: z.string().trim().min(5, "Informe o endereço de entrega.").max(300, "Endereço muito longo."),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  code: z.string().trim().regex(/^\d{6}$/, "O código deve ter 6 dígitos."),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
});

export type LeadInput = z.infer<typeof leadSchema>;
