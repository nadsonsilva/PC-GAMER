# API — PC GAMER

A aplicação usa JSON; erros seguem `{message: string}` ou `{ok:false,message:string}`. Em produção, usar HTTPS.

| Método | Endpoint | Objetivo | Acesso |
|---|---|---|---|
| POST | `/api/leads` | Cadastrar lead e enviar OTP (nome, email, whatsapp, cep, address) | Público, validação backend |
| POST | `/api/otp/verify` | Validar OTP de 6 dígitos | Público, limites de tentativas |
| POST | `/api/otp/resend` | Reenviar OTP, invalidando anterior | Público, cooldown |
| POST | `/api/orders` | Criar pedido e checkout após OTP confirmado | Público, lead verificado |
| POST | `/api/webhooks/mercado-pago` | Notificação assinada e verificação na API MP | Assinatura Mercado Pago |
| GET | `/api/health` | Saúde do banco e serviço | Público, sem dados pessoais |
| POST | `/api/events` | Evento `{name}` de lista permitida | Público, dados agregados |
| POST | `/api/admin/login` | Autentica `{token}` e cria cookie httpOnly | Token administrativo |
| GET | `/api/admin/records` | Últimos 100 leads/pedidos e eventos | Cookie administrativo |
| GET | `/api/admin/analytics` | Métricas agregadas | Bearer ANALYTICS_ADMIN_TOKEN |
| GET | `/api/receipts/:id?signature=...` | PDF de pedido pago | Link HMAC enviado por e-mail |

Os segredos não devem aparecer em URLs, exceção do token HMAC de acesso específico ao recibo: mantenha o link privado.

Exemplos:
`curl -X POST http://localhost:3000/api/events -H 'Content-Type: application/json' -d '{"name":"visualizou_produto"}'`
`curl -H 'Authorization: Bearer TOKEN_ADMINISTRATIVO' http://localhost:3000/api/admin/analytics`

Os contratos detalhados de leads, OTP e pedidos são definidos em `src/lib/validation.ts`.
