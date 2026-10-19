# Semana 5 — Confirmação e Integrações

## Alterações implementadas

1. **Webhook** em `POST /api/webhooks/mercado-pago`: valida HMAC SHA-256 (`x-signature`, `x-request-id` e `data.id`), rejeita IDs conflitantes, ignora eventos sem pagamento e consulta o pagamento pela API autenticada do Mercado Pago.
2. **Validação**: verifica correspondência com `external_reference` do pedido, ID do pagamento, moeda `BRL` e valor integral em centavos. Pagamentos aprovados com valor/moeda divergentes ficam em `PAYMENT_REVIEW`.
3. **Atualização do pedido**: grava `status`, `paymentId`, `lastPaymentStatus`, `paymentUpdatedAt` e `paidAt`. Ignora notificações pendentes/recusadas recebidas depois da aprovação e trata reembolso/chargeback.
4. **E-mail de confirmação**: reutiliza SMTP da Semana 3 e envia ao responsável pelo lead verificado, apenas após status `PAID`. Controle de envio por `confirmationEmailSentAt` e claim atômico para reduzir duplicidades. Em desenvolvimento sem SMTP configurado, simula a mensagem no terminal.
5. **Testes**: adicionados cenários de aprovação, divergência de valor/moeda, notificação tardia, duplicidade, falha do e-mail e reembolso (`__tests__/payment-confirmation.test.js`).
6. **Erros**: assinatura inválida = HTTP 401; ID inconsistente = HTTP 400; erros internos = HTTP 500. Falha no SMTP não desfaz o pagamento; uma próxima notificação válida tenta novamente.

## Instalação / migração (na pasta do projeto)

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm test
npm run dev
```

## Configuração do `.env`

Configure `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_WEBHOOK_URL` (HTTPS pública) e as variáveis SMTP já utilizadas pelo OTP. Não exponha o token ou a chave do webhook no GitHub.

**Atenção**: `localhost:3000` não é acessível ao Mercado Pago. Para receber notificações, publique a aplicação ou use um túnel HTTPS apontando para `http://localhost:3000`; configure o mesmo endereço no painel do Mercado Pago. Usar URLs de retorno do navegador não constitui confirmação de pagamento.

## Roteiro de demonstração

1. Cadastre e valide um e-mail real usando OTP.
2. Crie o pedido e conclua uma transação usando as credenciais e os usuários de teste do Mercado Pago.
3. Confira no terminal o log de processamento do webhook.
4. Abra `npx prisma studio`, tabela `Order`: registre `status=PAID`, `paymentId`, `paymentUpdatedAt`, `paidAt` e `confirmationEmailSentAt`.
5. Verifique o e-mail de confirmação na caixa de entrada ou, sem SMTP, a simulação no log.
6. Execute `npm test` e capture os resultados para comprovar a integração.

## Limitações para ambiente real

- Não foi possível validar uma transação real sem suas credenciais e endpoint público. Os testes automatizados usam mocks.
- SMTP e entrega de e-mails dependem de rede/servidor configurado. O protocolo SMTP não fornece garantia absoluta contra duplicação em caso de falha do processo após o servidor aceitar a mensagem, antes de gravar o registro de envio.
- Para produção com volumes elevados, recomenda-se fila persistente para envio de e-mail, retentativas programadas e histórico de eventos de pagamento.
