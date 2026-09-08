# PC GAMER — Titan Elite

Projeto Integrador de Landing Page de vendas para um PC Gamer.

## Stack
- Next.js + App Router + TypeScript + Tailwind CSS
- Docker / Docker Compose
- Prisma + SQLite (estrutura pronta para leads, OTP e pedidos)
- Mercado Pago e SMTP preparados por variáveis de ambiente
- GitHub Actions para lint/build

## Produto
**PC Gamer Titan Elite — R$ 4.999,00**
- Ryzen 7 5700X
- RTX 4060 8GB
- 32GB DDR4 3200MHz
- SSD NVMe 1TB
- Fonte 650W 80 Plus Bronze
- Gabinete Mid Tower ARGB + vidro temperado
- 1 ano de garantia

## RF contemplados no planejamento
RF01 Oferta; RF02 WhatsApp; RF03 lead; RF04 OTP; RF05 Mercado Pago; RF06 webhook; RF07 confirmação por e-mail; RF08 CEP; RF09 reenvio/expiração OTP; RF10 atualização de pagamento; RF11 máscaras/validações; RF12 prova social; RF13 FAQ; RF14 consulta de status.

## RNF
Next.js/TypeScript/Tailwind, Docker, GitHub Projects, banco relacional via ORM, variáveis de ambiente, responsividade mobile-first, otimização de imagens, logs, CI/CD.

## Rodar localmente
```bash
cp .env.example .env.local
npm install
npx prisma generate
npx prisma db push
npm run dev
```
Acesse `http://localhost:3000`.

## Docker
```bash
docker compose up --build
```

## GitHub
```bash
git init
git add .
git commit -m "feat: landing page PC Gamer Titan Elite"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/PC-GAMER.git
git push -u origin main
```

> As integrações Mercado Pago/SMTP/webhook estão estruturadas para a próxima etapa. Não coloque tokens reais no GitHub; use `.env.local`.
