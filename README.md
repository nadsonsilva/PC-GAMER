# PC GAMER — Titan Elite

Landing page acadêmica em **Next.js 14 + TypeScript + Tailwind + Prisma**, atualizada até a **Semana 5 — Confirmação e Integrações**.

## Implementado

### Semana 2 — Landing Page e Leads
- interface responsiva;
- formulário de lead com nome, e-mail, WhatsApp, CEP e endereço;
- máscaras e preenchimento de endereço pelo ViaCEP;
- persistência SQLite + Prisma;
- integração com WhatsApp.

### Semana 3 — Segurança e OTP
- OTP numérico de 6 dígitos;
- envio por SMTP;
- hash HMAC-SHA256;
- expiração de 10 minutos;
- limite de 5 tentativas;
- reenvio após 60 segundos;
- validação do e-mail.

### Semana 4 — Pedidos e Pagamento
- criação de pedido somente para lead com e-mail validado;
- estados do pedido centralizados;
- criação de preferência Checkout Pro do Mercado Pago;
- ambiente sandbox/teste configurável;
- redirecionamento para o checkout;
- página de retorno de sucesso/pendência/falha;
- webhook com validação de assinatura HMAC;
- consulta do pagamento na API antes de atualizar o pedido;
- conferência do valor antes de marcar o pedido como pago;
- logs do processamento do webhook;
- testes dos estados e da validação da assinatura.

Veja detalhes em `docs/SEMANA_4.md` e `docs/SEMANA_5.md`.

### Semana 5 — Confirmação e Integrações
- confirmação do pagamento na API do Mercado Pago;
- validação de moeda, valor e assinatura;
- proteção contra atualizações atrasadas e notificações duplicadas;
- e-mail de pagamento confirmado com controle de envio;
- novos testes automatizados.

## Estrutura principal

```text
src/
  app/
    api/
      leads/route.ts
      otp/resend/route.ts
      otp/verify/route.ts
      orders/route.ts
      webhooks/mercado-pago/route.ts
    pedido/retorno/page.tsx
    page.tsx
  components/
    LeadModal.tsx
  lib/
    email.ts
    mercado-pago.ts
    order.ts
    otp.ts
    otp-service.ts
    prisma.ts
    product.ts
    validation.ts
prisma/
  migrations/
  schema.prisma
__tests__/
docs/
```

## Como executar

1. Crie o arquivo `.env` a partir do modelo:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Configure o SMTP, `OTP_HASH_SECRET` e as credenciais de teste do Mercado Pago.

3. Prepare o projeto:

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

4. Rode os testes:

```bash
npm test
```

5. Inicie:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Mercado Pago — teste

No `.env`:

```env
APP_URL="http://localhost:3000"
MP_ACCESS_TOKEN="TEST-xxxxxxxxxxxxxxxxxxxxxxxx"
MP_USE_SANDBOX="true"
MP_WEBHOOK_URL="https://SEU-TUNEL/api/webhooks/mercado-pago"
MP_WEBHOOK_SECRET="SUA-CHAVE-SECRETA"
```

O access token, usuários/cartões de teste e a chave do webhook devem vir da aplicação criada no painel de desenvolvedores do Mercado Pago. Não coloque credenciais reais no GitHub.

Para webhook local, use uma URL HTTPS pública apontando para a sua aplicação local.

## Banco

Abra o Prisma Studio:

```bash
npx prisma studio
```

Na tabela `Order`, a Semana 4 usa principalmente:
- `number` e `id`;
- `amountCents`;
- `status`;
- `preferenceId`;
- `checkoutUrl`;
- `paymentId`;
- `lastPaymentStatus`;
- `paymentUpdatedAt`;
- `paidAt`.

## Segurança

- preço e valor do pedido são definidos no servidor;
- somente lead verificado pode criar pedido;
- o webhook exige assinatura válida;
- o pagamento é consultado diretamente no Mercado Pago antes da atualização;
- o valor aprovado é conferido antes de marcar `PAID`;
- `.env` não deve ser enviado ao repositório.


## Semana 6 — Produção e entrega
Veja [`docs/SEMANA_6.md`](docs/SEMANA_6.md) para deploy, analytics, observabilidade, CI, segurança, checklist de homologação e roteiro de defesa.


## Complementos da Semana 6 (versão final)
- `/admin`: painel protegido com tabelas de leads/pedidos e gráfico de eventos. Senha: token `ANALYTICS_ADMIN_TOKEN` (32+ caracteres).
- `/api/events`: eventos locais do funil, sem dados pessoais; GA4 e Clarity ativados pelos IDs públicos no `.env`.
- Alertas sanitizados no Discord através de `DISCORD_ERROR_WEBHOOK_URL`.
- Comprovante PDF de pagamento aprovado: link assinado no e-mail de confirmação (`RECEIPT_SIGNING_SECRET`). Não é nota fiscal.
- Confirmação via WhatsApp por link de mensagem preparada para envio manual (não dispara mensagens automaticamente).
- Documentação adicional: `docs/API.md` e `docs/ENTREGA_FINAL.md`.
- Execute migração nova `npx prisma migrate deploy` antes de iniciar a aplicação.

**Atenção:** credenciais do Mercado Pago, SMTP, tokens administrativos e URLs privadas de webhook nunca devem ser commitados. Os serviços externos e o deploy requerem configuração e testes reais.

- Logs de erro no Google Drive (opcional) com `GOOGLE_DRIVE_LOG_FOLDER_ID` e `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` da conta de serviço, compartilhando a pasta com a conta de serviço. O serviço de hospedagem deve permitir acesso à API Google Drive. Apenas o tipo de erro/evento é armazenado.
