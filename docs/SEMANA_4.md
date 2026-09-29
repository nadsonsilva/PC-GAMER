# Entrega — Semana 4: Pedidos e Pagamento

Esta etapa complementa as Semanas 2 e 3 com a criação do pedido, estados, Checkout Pro do Mercado Pago, preparação do ambiente de testes e início funcional do webhook.

## Itens solicitados

| Item solicitado | Implementação | Arquivos principais |
| --- | --- | --- |
| Criação do pedido | Após o OTP ser validado, `POST /api/orders` cria um `Order` vinculado ao `Lead` verificado | `src/app/api/orders/route.ts`, `prisma/schema.prisma` |
| Estados do pedido | Estados centralizados: aguardando pagamento, pago, recusado, cancelado, reembolsado, em análise e erro de checkout | `src/lib/order.ts` |
| Integração Mercado Pago | Criação de preferência no Checkout Pro com produto, valor, pagador, referência externa e URLs de retorno | `src/lib/mercado-pago.ts`, `src/app/api/orders/route.ts` |
| Ambiente de testes | Suporte a credenciais TEST, `MP_USE_SANDBOX=true` e uso de `sandbox_init_point` | `.env.example`, `src/lib/mercado-pago.ts` |
| Início do webhook | Endpoint recebe evento, valida `x-signature`, consulta o pagamento e atualiza o pedido | `src/app/api/webhooks/mercado-pago/route.ts` |
| Retorno do checkout | Página para sucesso, pendência ou falha sem confiar no retorno do navegador para confirmar o pagamento | `src/app/pedido/retorno/page.tsx` |
| Testes | Testes dos estados e da assinatura HMAC do webhook | `__tests__/order.test.js`, `__tests__/mercado-pago.test.js` |

## Fluxo da Semana 4

1. O cliente conclui o cadastro e valida o OTP.
2. O frontend chama `POST /api/orders` usando o e-mail já validado.
3. O backend verifica `Lead.verifiedAt` antes de criar qualquer pedido.
4. Um pedido é criado com valor fixado no servidor e status `PENDING_PAYMENT`.
5. O backend cria uma preferência do Mercado Pago usando o ID interno como `external_reference`.
6. O `preferenceId` e a URL de checkout são salvos no pedido.
7. O navegador é redirecionado para o Checkout Pro.
8. O Mercado Pago envia uma notificação para `/api/webhooks/mercado-pago`.
9. O webhook valida a assinatura HMAC antes de processar o evento.
10. O backend consulta o pagamento diretamente na API do Mercado Pago.
11. O status do pagamento é convertido para um estado interno do pedido.
12. Se o pagamento estiver aprovado, o valor recebido também é comparado com `amountCents` antes de marcar como `PAID`.

## Estados internos

- `PENDING_PAYMENT` — aguardando pagamento;
- `PAID` — pagamento aprovado e valor conferido;
- `PAYMENT_REJECTED` — pagamento recusado;
- `CANCELLED` — pagamento cancelado;
- `REFUNDED` — pagamento reembolsado/chargeback;
- `PAYMENT_REVIEW` — em processamento/análise ou divergência que exige conferência;
- `CHECKOUT_ERROR` — o pedido foi criado, mas não foi possível iniciar o checkout.

## Variáveis da Semana 4

```env
APP_URL="http://localhost:3000"
MP_ACCESS_TOKEN="TEST-xxxxxxxxxxxxxxxxxxxxxxxx"
MP_USE_SANDBOX="true"
MP_WEBHOOK_URL="https://SEU-ENDERECO-PUBLICO/api/webhooks/mercado-pago"
MP_WEBHOOK_SECRET="SUA-CHAVE-SECRETA-DO-WEBHOOK"
```

### Observação sobre webhook local

O Mercado Pago precisa alcançar o endpoint pela internet e a URL de notificação deve ser HTTPS. Para testar no computador local, exponha `http://localhost:3000` com um túnel HTTPS (por exemplo, ngrok ou Cloudflare Tunnel) e configure `MP_WEBHOOK_URL` com a URL pública gerada.

## Como testar a Semana 4

1. Use credenciais de teste do Mercado Pago e deixe `MP_USE_SANDBOX="true"`.
2. Execute as migrations e inicie a aplicação.
3. Cadastre um lead e valide o OTP.
4. Clique em **Ir para o Mercado Pago**.
5. Confira no banco que o pedido foi criado com `PENDING_PAYMENT` e `preferenceId`.
6. Realize um pagamento com usuário/cartão de teste do Mercado Pago.
7. Confira o terminal: o webhook registra o recebimento e a atualização do pedido.
8. Abra o Prisma Studio e verifique `paymentId`, `lastPaymentStatus`, `paymentUpdatedAt`, `status` e `paidAt`.

Comandos:

```bash
npx prisma generate
npx prisma migrate dev
npm test
npm run build
npm run dev
```
