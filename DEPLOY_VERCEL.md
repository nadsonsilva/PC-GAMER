# PC GAMER — Publicar gratuitamente na Vercel + PostgreSQL

## O que foi adaptado
- `prisma/schema.prisma`: banco alterado de SQLite para PostgreSQL.
- `prisma/migrations/20261028_initial_postgres/migration.sql`: criação inicial das tabelas PostgreSQL em banco NOVO.
- `package.json`: `postinstall` executa `prisma generate` no build.
- O checkout continua usando `init_point`; a notificação do Mercado Pago é confirmada no backend, não pelo redirecionamento do usuário.
- Esta cópia NÃO contém `.env`, `.git` nem o banco local antigo. Não transfere dados existentes do SQLite.

## 1. Crie repositório privado no GitHub
Extraia o ZIP, abra um terminal **dentro de `PC-GAMER`** e execute:

```bash
git init
git add .
git commit -m "Preparar PC GAMER para Vercel e PostgreSQL"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/pc-gamer.git
git push -u origin main
```

Crie antes o repositório privado vazio no site do GitHub. Nunca envie `.env`, arquivos `.db` ou tokens. Se o `git commit` pedir identidade, configure `git config user.name` e `git config user.email`.

## 2. Importe para Vercel
- Entre em https://vercel.com, conecte o GitHub, clique **Add New > Project**.
- Selecione seu repositório `pc-gamer` e **Import**.
- Framework Preset: **Next.js**. Root Directory: `./` se você subiu os arquivos de dentro da pasta `PC-GAMER`. Se subiu a pasta inteira, use `PC-GAMER`.
- Build Command: padrão (`npm run build`). Install Command: padrão (`npm install` / `npm ci`). O `postinstall` executa `prisma generate`.
- Não tente usar Docker na Vercel nem subir `dev.db`.

## 3. Crie banco PostgreSQL gratuito
- No projeto Vercel, abra **Storage** (ou **Marketplace**), escolha **Prisma Postgres**, plano **Free** (confirme os limites atuais antes de aceitar).
- Conecte à **Production**; a integração costuma fornecer `DATABASE_URL` automaticamente.
- **Nunca** copie essa URL em código, commit ou prints públicos. Banco com hostname `db.prisma.io` usa conexão direta; para maior volume, configure a versão pooled conforme a documentação do provedor.
- Atenção: escolha um banco separado para ambientes Preview/Development se quiser evitar que testes alterem pedidos de Production.

## 4. Crie as outras Environment Variables
Vercel: **Project > Settings > Environment Variables**, inclua para **Production**:

```
APP_URL=https://SEU-PROJETO.vercel.app
OTP_HASH_SECRET=[gere um segredo único de 32 bytes ou mais]
SMTP_HOST=[host real]
SMTP_PORT=587
SMTP_USER=[usuário real]
SMTP_PASSWORD=[senha real]
SMTP_FROM=PC Gamer <email@seu-dominio>
NEXT_PUBLIC_WHATSAPP_NUMBER=55DDDNUMERO
MP_ACCESS_TOKEN=[token TESTE do Mercado Pago]
MP_USE_SANDBOX=true
MP_WEBHOOK_URL=https://SEU-PROJETO.vercel.app/api/webhooks/mercado-pago
MP_WEBHOOK_SECRET=[segredo recebido no painel de Webhooks do Mercado Pago]
ANALYTICS_ADMIN_TOKEN=[segredo de 32+ caracteres]
RECEIPT_SIGNING_SECRET=[outro segredo de 32+ caracteres]
```

Variáveis opcionais: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`, `DISCORD_ERROR_WEBHOOK_URL`, `GOOGLE_DRIVE_LOG_FOLDER_ID` e `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON`.

Gere segredos em seu computador, com `openssl rand -hex 32`. Em Windows sem OpenSSL, use Node: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

`DATABASE_URL` é configurada pelo banco e não deve ser sobrescrita por valor de exemplo. Não prefixe segredos com `NEXT_PUBLIC_`.

## 5. Crie as tabelas antes de testar
Na máquina local, dentro de `PC-GAMER`, com Node.js instalado:

```bash
npm ci
```

Coloque **temporariamente** a conexão PostgreSQL direta em `.env` local (`DATABASE_URL="postgresql://..."`) e depois execute:

```bash
npx prisma migrate deploy
npx prisma migrate status
```

Use o endpoint **direto** da conexão para migrações. O `.env` já está ignorado pelo Git. Ao terminar, apague esse `.env` se não precisar dele localmente.

Se a aplicação já tiver dados SQLite que deseja preservar, pare: estas migrações criam um banco **vazio**; a migração dos dados exige operação separada.

## 6. Deploy
Na Vercel, clique **Deploy** (ou **Redeploy** depois de definir as variáveis). Quando terminar, copie sua URL `https://SEU-PROJETO.vercel.app`.

Se alterou o domínio, atualize `APP_URL` e `MP_WEBHOOK_URL`, depois redeploy. Nunca use uma URL temporária `...-git-...vercel.app` nos links definitivos.

Verifique `https://SEU-PROJETO.vercel.app/api/health`. Caso indique erro no banco, verifique `DATABASE_URL`, tabelas criadas e logs de Functions.

## 7. Mercado Pago (teste)
No painel Mercado Pago Developers > aplicação PC-GAMER > Webhooks, cadastre:

`https://SEU-PROJETO.vercel.app/api/webhooks/mercado-pago`

Evento: **Pagamentos (`payment`)**. Copie o segredo de assinatura para `MP_WEBHOOK_SECRET`, salve e redeploy. Use conta compradora de teste distinta da vendedora e cartão de teste. Não use cartões nem tokens de produção enquanto estiver homologando.

O navegador mostrar `success` NÃO comprova pagamento. A API deve receber o webhook, consultar o Mercado Pago e atualizar o pedido `Order.status = PAID`. Confira no banco pela interface do provedor ou `npx prisma studio` apontado à conexão correta.

## 8. Checklist de validação
1. Home abre em HTTPS.
2. `/api/health` informa `database: ok`.
3. OTP chega pelo SMTP, e validação funciona.
4. `/api/orders` cria pedido no PostgreSQL.
5. Mercado Pago abre checkout e aceita pagamento de teste.
6. Webhook retorna sucesso em logs, pagamento validado.
7. `Order.paymentId`, `Order.lastPaymentStatus`, `Order.paidAt` e `Order.status` foram atualizados.
8. E-mail de confirmação chega uma única vez.

## Solução de problemas
- **P1001 / não conecta**: URL do Postgres, firewall, TLS e endpoint pool/direct.
- **P2021 / tabela não existe**: faltou `npx prisma migrate deploy`.
- **Prisma Client did not initialize**: verifique `postinstall` e `prisma generate`.
- **Checkout erro teste**: confirme credenciais, conta compradora separada e retorno `init_point`; não troque por credenciais reais para forçar pagamento.
- **Webhook 401**: confira assinatura e o segredo do webhook na Vercel.
- **OTP não chega**: confira SMTP e logs das funções; SMTP externo pode exigir domínio remetente verificado.

## Observações
- Vercel Hobby e PostgreSQL Free têm limites; confira limites e regras de uso e mantenha o projeto em ambiente de desenvolvimento/demonstração.
- A migração PostgreSQL foi preparada mas não foi executada no seu banco (não temos suas credenciais), e o deploy e os pagamentos ainda não foram testados ao vivo.
