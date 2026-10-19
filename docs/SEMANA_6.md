# Semana 6 — Produção e entrega

## Requisitos implementados
- **Analytics:** `GET /api/admin/analytics` com token `Authorization: Bearer <ANALYTICS_ADMIN_TOKEN>` (32+ caracteres). Exibe apenas contagens agregadas, sem nomes ou e-mails.
- **Observabilidade:** `GET /api/health` valida acesso ao banco; logs JSON tipados para eventos do webhook; em produção, recolher logs no runtime/container e criar alertas externos para HTTP 503/500.
- **GitHub Actions:** `.github/workflows/ci.yml` executa instalação, geração Prisma, Jest, TypeScript, lint e build a cada push/PR.
- **Revisão de segurança:** validação criptográfica do webhook, confirmação via API do Mercado Pago, atualização condicional para evitar corrida, token de analytics com comparação constante, cabeçalhos de segurança, limites SMTP e HTTPS obrigatório no checkout em produção. Necessário testar e auditar antes de exposição pública.
- **Deploy:** Dockerfile de produção + `docker-compose.prod.yml` com volume persistente SQLite, `prisma migrate deploy` e serviço ligado ao localhost do servidor. Requer proxy reverso HTTPS e armazenamento persistente; NÃO usar hospedagem serverless com SQLite local. Configurar domínio e webhook no Mercado Pago.
- **Documentação:** README, `docs/SEMANA_5.md`, este guia e `.env.example`.
- **Testes finais:** rodar os comandos e checklist manual abaixo.
- **Apresentação e defesa:** roteiro ao final.

## Preparação
1. Copie seu `.env` privado da máquina anterior e compare com `.env.example`; NUNCA envie segredos ao GitHub.
2. Configure `APP_URL=https://dominio`, `MP_WEBHOOK_URL=https://dominio/api/webhooks/mercado-pago`, `MP_WEBHOOK_SECRET`, `MP_ACCESS_TOKEN`, SMTP e `ANALYTICS_ADMIN_TOKEN` (32+ chars).
3. Para validação local: `npm ci && npx prisma migrate deploy && npx prisma generate && npm test && npx tsc --noEmit && npm run lint && npm run build && npm run dev`.
4. Para VPS com domínio, HTTPS e Docker: `docker compose -f docker-compose.prod.yml up -d --build` e configurar Nginx/Caddy com TLS na porta 443; manter porta 3000 restrita ao próprio servidor.
5. Fazer backup frequente do volume SQLite e um ensaio de restauração. Não aumentar para várias réplicas sem migrar para banco servidor (ex.: PostgreSQL).

## Checklist de homologação (evidências/prints)
- [ ] Página principal responsiva e formulário preenchido com dados de TESTE
- [ ] OTP recebido e validado por SMTP real (ocultar código e e-mail nos prints)
- [ ] Checkout do Mercado Pago criado com credenciais de TESTE
- [ ] Webhook HTTPS assinado recebido; notificações falsas rejeitadas
- [ ] Pagamento aprovado muda pedido para PAID com valor e BRL corretos
- [ ] Repetição e notificação fora de ordem não revertem pagamento
- [ ] Email de confirmação real recebido (sem dados pessoais no print)
- [ ] `npm test`, `tsc`, `lint` e `build` com sucesso
- [ ] GitHub Actions CI verde
- [ ] `/api/health` retorna 200 e simulação de falha retorna 503
- [ ] Analytics protegido: sem token 401, com token 200
- [ ] HTTPS / deploy público testado e webhook real processado
- [ ] Secretos não aparecem no GitHub; backups configurados

## Roteiro para defesa (3–5 minutos)
1. Contexto: landing page, captura de leads e OTP (semanas 2–3).
2. Demonstração: pedido e checkout Mercado Pago (semana 4).
3. Segurança: webhook autenticado, validação na API, comparação de valores e idempotência (semana 5).
4. Confirmação: mudança no banco e envio do e-mail; mostrar log ou print sanitizado.
5. Qualidade: Jest, CI do GitHub, endpoint de saúde e analytics agregados (semana 6).
6. Produção: Docker, HTTPS, persistência e recuperação; mencionar limites da hospedagem.
7. Concluir explicando que o deploy e pagamentos reais precisam de homologação com suas credenciais.

## Observações
- Analytics não usa cookies de terceiros e mede registros/pedidos confirmados; não é métrica de visitas. Para audiência/visitas, integrar serviço analítico consentido separadamente.
- A rota `/api/health` não autentica e divulga apenas saúde do serviço e timestamp.
- O SMTP por sockets não fornece prova de entrega à caixa de entrada: confirmação indica aceite pelo servidor SMTP.
- A lógica de reivindicação do e-mail evita duplicatas comuns, mas não garante entrega exatamente uma vez em queda entre SMTP e registro no banco.
