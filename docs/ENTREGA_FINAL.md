# Checklist de entrega final / defesa

1. Configure `.env` baseado em `.env.example`. NUNCA publique credenciais.
2. `npm ci && npx prisma migrate deploy && npx prisma generate && npm test && npm run lint && npm run build`.
3. Rode `npm run dev` e demonstre landing page desktop e celular, lead, OTP e checkout.
4. Teste pagamento com credenciais TEST do Mercado Pago e endpoint webhook HTTPS público. Verifique status PAID no banco e recebimento do e-mail com o link PDF.
5. Configure Google Analytics (GA4) e Microsoft Clarity; confirme eventos no painel de cada provedor. Sem IDs configurados, apenas a contagem local funciona.
6. Configure Discord webhook e provoque um erro controlado em homologação; confirme alertas. Configure opcionalmente Google Drive com uma conta de serviço com permissão na pasta, e confirme que um log sanitizado foi salvo.
7. Entre em `/admin` com ANALYTICS_ADMIN_TOKEN, confira gráficos e tabelas.
8. Execute Docker e confirme persistência do banco; em servidor use volumes persistentes e HTTPS.
9. Anexe evidências do workflow CI verde em push e pull_request, README, GitHub Projects atualizado, URL pública e apresentação.
10. **Não confundir:** link WhatsApp de confirmação é iniciado manualmente pelo cliente; não é envio automático pela API do WhatsApp.

Limitações: PDF emitido é comprovante comercial, não nota fiscal. O painel mostra os últimos 100 registros por tabela. SQLite precisa de volume persistente e hospedagem compatível. A aplicação não está publicada automaticamente.
