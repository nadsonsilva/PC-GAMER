# PC GAMER — Titan Elite

Landing page acadêmica em **Next.js 14 + TypeScript + Tailwind**, atualizada com as entregas das **Semanas 2 e 3**.

## O que foi implementado

### Semana 2 — Landing Page e Leads
- interface responsiva para celular, tablet e desktop;
- landing page com CTA, ficha técnica, FAQ e blocos de benefícios;
- formulário completo de lead: nome, e-mail, WhatsApp, CEP e endereço;
- máscaras de WhatsApp e CEP;
- consulta automática de endereço pelo ViaCEP;
- persistência de leads em banco relacional SQLite via Prisma;
- integração com WhatsApp no cabeçalho e em botão flutuante;
- validação de dados no frontend e novamente no backend com Zod.

### Semana 3 — Segurança e OTP
- geração segura de código OTP numérico de 6 dígitos;
- envio do código por SMTP;
- armazenamento somente do hash HMAC-SHA256 do OTP;
- expiração do código em 10 minutos;
- limite de 5 tentativas por código;
- reenvio somente após 60 segundos;
- invalidação automática de códigos anteriores quando um novo é emitido;
- validação do e-mail e registro de `verifiedAt` no lead;
- testes automatizados de geração/hash/expiração/cooldown e validação dos dados.

## Estrutura principal

```text
src/
  app/
    api/
      leads/route.ts
      otp/resend/route.ts
      otp/verify/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    LeadModal.tsx
  lib/
    email.ts
    otp.ts
    otp-service.ts
    prisma.ts
    product.ts
    validation.ts
prisma/
  migrations/
  schema.prisma
__tests__/
```

## Como executar

1. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell, você também pode usar:

```powershell
Copy-Item .env.example .env
```

2. Edite `.env` e configure pelo menos `OTP_HASH_SECRET` e as credenciais SMTP. O Next.js também lê esse arquivo automaticamente.

3. Instale e prepare o banco:

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

4. Inicie o projeto:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

> Em ambiente de desenvolvimento, se o SMTP não estiver configurado, o código OTP é exibido **somente no terminal do servidor** para permitir testes locais. Em produção, a ausência da configuração SMTP gera erro e nenhum código é exposto na resposta da API.

## Configuração SMTP

O projeto usa SMTP diretamente pela biblioteca padrão do Node.js, sem dependência externa. Ele suporta:
- porta **587** com `STARTTLS`;
- porta **465** com TLS direto;
- autenticação `AUTH LOGIN`.

Exemplo de variáveis:

```env
SMTP_HOST="smtp.seuprovedor.com"
SMTP_PORT="587"
SMTP_USER="seu-usuario"
SMTP_PASSWORD="sua-senha-ou-senha-de-app"
SMTP_FROM="PC Gamer <seu-email@dominio.com>"
```

## Banco de dados

O Prisma possui três entidades separadas:
- `Lead` — dados do cliente e data de verificação do e-mail;
- `Otp` — hash, validade, tentativas, uso e invalidação;
- `Order` — estrutura preparada para a etapa de pagamento.

Para visualizar os dados durante o desenvolvimento:

```bash
npx prisma studio
```

## Testes

```bash
npm test
```

Os testes verificam os pontos principais da Semana 3 e as validações usadas no formulário.

## Docker

```bash
docker compose up --build
```

## Observações de segurança

- nunca envie `.env` ou `.env.local` ao GitHub;
- use um `OTP_HASH_SECRET` longo e diferente das senhas do SMTP;
- o OTP nunca é salvo em texto puro no banco;
- um código usado, expirado, bloqueado ou substituído não pode ser reutilizado;
- o endpoint limita a quantidade de tentativas por código.

## Próximas etapas

Mercado Pago, webhook, confirmação pós-pagamento e consulta de pedido permanecem preparados para as semanas seguintes do Projeto Integrador.
