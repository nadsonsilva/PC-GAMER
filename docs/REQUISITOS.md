Requisitos Funcionais (RF)

RF01 - Oferta: Exibir o PC Gamer com imagens em alta definição, especificações técnicas, testes de desempenho (FPS em jogos) e o botão "Comprar Agora". 
RF02 - Atendimento via WhatsApp: Link flutuante e direto para o cliente tirar dúvidas com a equipe técnica antes da compra. 
RF03 - Captura de Lead: Coletar Nome, E-mail, WhatsApp e CEP/Endereço para entrega do produto físico. 
RF04 - Verificação de E-mail (OTP): Disparar código numérico temporário de 6 dígitos via SMTP e validar a entrada antes de redirecionar para o pagamento. 
RF05 - Checkout Mercado Pago: Criar a preferência de pagamento via API do Mercado Pago no valor fixo do setup. 
RF06 - Processamento de Webhook: Receber a notificação do Mercado Pago no backend e atualizar o status do pedido para "PAGO". 
RF07 - E-mail de Confirmação: Enviar e-mail automático pós-pagamento contendo o número do pedido, resumo das peças do PC Gamer e previsão de montagem/envio. 
RF08 - Auto-preenchimento de Endereço por CEP: Integração com API externa (ex: ViaCEP) para buscar e preencher automaticamente rua, bairro e cidade assim que o usuário digitar o CEP no formulário de lead.
RF09 - Reenvio e Expiração de OTP: Mecanismo com temporizador (cooldown) de 60 segundos para permitir a solicitação de um novo código OTP, invalidando códigos anteriores e definindo expiração do código atual em 10 minutos. 
RF10 - Atualização em Tempo Real do Pagamento: Mecanismo no frontend (polling ou WebSocket) para detectar a mudança de status confirmada pelo webhook e redirecionar automaticamente o usuário da tela do Pix/Cartão para a tela de Pedido Confirmado sem exigir recarga manual. 
RF11 - Máscaras e Validações de Entrada: Validação rigorosa em tempo real nos campos de entrada do formulário (formatação de WhatsApp (XX) XXXXX-XXXX, CEP XXXXX-XXX e formato válido de e-mail).
RF12 - Seção de Prova Social e Avaliações: Exibição de avaliações de compradores anteriores, notas de satisfação e fotos do PC Gamer montado na casa de clientes.
RF13 - Seção de FAQ (Perguntas Frequentes): Componente sanfonado (accordion) para esclarecimento rápido de dúvidas sobre envio, prazos de montagem, métodos de pagamento e garantia de 1 ano.
RF14 - Consulta Visual do Status do Pedido: Tela dedicada onde o cliente pode digitar o número do pedido (#1258) e e-mail para visualizar o status atual da compra ("Aguardando Pagamento", "PAGO", "Em Separação", "Enviado").


Requisitos Não-Funcionais (RNF)

RNF01: Aplicação desenvolvida em Next.js (App Router) com TypeScript e Tailwind CSS. 
RNF02: Execução e padronização do ambiente via Docker e Docker Compose. 
RNF03: Gestão de tarefas no GitHub Projects e controle de versão via Git/GitHub.
RNF04 - Segurança de Variáveis de Ambiente e Credenciais: Armazenamento estrito de chaves de API (Mercado Pago, SMTP de e-mail, conexões de banco de dados) em variáveis de ambiente (.env), garantindo que nenhuma informação sensível seja exposta no repositório do GitHub. 
RNF05 - Persistência em Banco de Dados Relacional: Utilização de um banco de dados relacional (PostgreSQL ou SQLite) gerenciado por ORM (Prisma ou Drizzle) com entidades separadas para Leads, OTPs e Pedidos. 
RNF06 - Responsividade e Design Mobile-First: Interface totalmente adaptada para uso fluido em smartphones, tablets e computadores, garantindo boa experiência do usuário em qualquer tamanho de tela.
RNF07 - Otimização de Imagens e Desempenho: Utilização do componente next/image do Next.js para renderização de imagens compactadas em formato WebP, garantindo carregamento da página principal abaixo de 2 segundos.
RNF08 - Gestão e Registro de Logs: Sistema de registro de logs no backend para monitorar requisições recebidas via webhook do Mercado Pago, falhas de disparo de e-mail e erros de validação do OTP. 
RNF09 - Automação CI/CD: Configuração de workflow no GitHub Actions para executar testes, validação de lint e verificação do build automaticamente a cada envio (push) para a branch principal. 

