# Entregas — Semana 2 e Semana 3

Este documento relaciona cada item solicitado com a implementação entregue no projeto.

## Semana 2 — Landing Page e Leads

| Item solicitado | Implementação | Arquivos principais |
| --- | --- | --- |
| Desenvolvimento da interface | Landing page completa com hero, CTAs, hardware, segurança, FAQ e modal | `src/app/page.tsx`, `src/app/globals.css` |
| Responsividade | Layout mobile-first com breakpoints Tailwind e modal adaptável | `src/app/page.tsx`, `src/components/LeadModal.tsx` |
| Banco de dados | SQLite + Prisma com entidades `Lead`, `Otp` e `Order` | `prisma/schema.prisma`, `prisma/migrations/` |
| Formulário | Nome, e-mail, WhatsApp, CEP e endereço; máscaras e ViaCEP | `src/components/LeadModal.tsx` |
| Cadastro de leads | API valida com Zod e faz `upsert` por e-mail | `src/app/api/leads/route.ts`, `src/lib/validation.ts` |
| Integração com WhatsApp | Link com mensagem pronta no cabeçalho e botão flutuante | `src/app/page.tsx` |

## Semana 3 — Segurança e OTP

| Item solicitado | Implementação | Arquivos principais |
| --- | --- | --- |
| Geração de código | `crypto.randomInt` gera OTP numérico de 6 dígitos | `src/lib/otp.ts` |
| Envio de e-mail | Cliente SMTP com TLS/STARTTLS e AUTH LOGIN | `src/lib/email.ts` |
| Hash | HMAC-SHA256 com segredo em variável de ambiente | `src/lib/otp.ts` |
| Expiração | Código válido por 10 minutos | `src/lib/otp.ts`, `src/app/api/otp/verify/route.ts` |
| Limite de tentativas | Máximo de 5 tentativas; ao atingir o limite o código é invalidado | `src/app/api/otp/verify/route.ts` |
| Reenvio | Cooldown de 60 segundos e invalidação de OTPs anteriores | `src/lib/otp-service.ts`, `src/app/api/otp/resend/route.ts` |
| Validação do e-mail | OTP válido marca `Lead.verifiedAt` | `src/app/api/otp/verify/route.ts` |
| Testes | Testes de OTP e validação de entrada | `__tests__/otp.test.js`, `__tests__/validation.test.js` |

## Fluxo completo

1. Usuário clica em **Comprar agora**.
2. Preenche o formulário de lead.
3. O frontend aplica máscaras e pode preencher o endereço pelo CEP.
4. `POST /api/leads` valida novamente os dados no servidor.
5. O lead é criado/atualizado no banco.
6. Um OTP de 6 dígitos é gerado.
7. Somente o hash do OTP é salvo no banco.
8. O código é enviado ao e-mail informado.
9. O usuário informa o OTP no modal.
10. `POST /api/otp/verify` verifica validade, hash e quantidade de tentativas.
11. Se estiver correto, o OTP é marcado como usado e o lead recebe `verifiedAt`.
12. Se precisar de outro código, `POST /api/otp/resend` só permite o reenvio após 60 segundos e invalida o anterior.

## Parâmetros de segurança

- OTP: 6 dígitos.
- Validade: 10 minutos.
- Tentativas: 5 por código.
- Cooldown de reenvio: 60 segundos.
- Hash: HMAC-SHA256.
- Comparação do hash: `timingSafeEqual`.
- Segredo do hash: `OTP_HASH_SECRET` no ambiente.
- Credenciais SMTP: somente por variáveis de ambiente.
