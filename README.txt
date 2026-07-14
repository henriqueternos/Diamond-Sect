DIAMOND SECT — SITE COMPLETO (versão migrada para Firestore + Cloudinary)

O que está pronto:
- catálogo premium
- leitura de produtos no Firebase Firestore
- login com Google e email/senha (Firebase Authentication)
- admin em /admin
- CRUD de produtos
- carrinho com localStorage
- geração de pedidos no Firestore
- upload de imagens via Cloudinary (sem precisar de cartão de crédito)
- importação em massa de dados (produtos, heroes, pedidos, pagamentos, usuários) direto pelo admin

Firebase já preenchido com (js/firebase-config.js):
- apiKey
- authDomain
- projectId
- storageBucket (não é mais usado para upload, mas não atrapalha deixar preenchido)
- messagingSenderId
- appId

Cloudinary já preenchido com (js/cloudinary-config.js):
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_UPLOAD_PRESET (modo "Unsigned")

Email admin:
rickgoncallvess@gmail.com

Estrutura de dados no Firestore:
- coleção "products"      -> um documento por produto (id = chave do produto)
- coleção "siteContent"   -> documento "heroes" com as imagens de destaque do site
- coleção "orders"        -> um documento por pedido
- coleção "payments"      -> um documento por pagamento
- coleção "users"         -> um documento por usuário (id = uid do Firebase Auth)

Observação:
As imagens deste pacote são fotos/SVGs placeholder para manter o site completo e funcional.
Você pode substituir pelas suas fotos reais direto pelo admin (usa Cloudinary automaticamente).

Upload de imagens no admin:
- o painel aceita selecionar arquivos diretamente
- as imagens são enviadas ao Cloudinary automaticamente
- depois os links são salvos no produto

Heros no admin:
- o painel permite trocar as heros da Home, Joias, Ternos e Perfumaria por upload direto
- as imagens são enviadas ao Cloudinary
- os links ficam salvos na coleção siteContent, documento heroes
- o site lê essas heros automaticamente

Importar dados existentes:
- aba "Importar JSON" dentro do /admin
- cole o JSON no formato antigo (products.products.items, siteContent.heroes, orders, payments, users)
- o sistema grava cada item no Firestore, mantendo os mesmos IDs

Pagamentos detalhados no admin:
- o checkout grava os dados informados em "payments" imediatamente ao finalizar o pedido
- há uma aba própria 'Pagamentos' no admin
- cada registro mostra nome, WhatsApp, forma de pagamento, dados preenchidos e total

Correções aplicadas nesta revisão:
- catalog.js agora renderiza TODAS as grades de produtos de uma página (antes só a primeira
  carregava — quebrava a seção "Pulseiras" em joias.html)
- product.js agora importa corretamente a função showToast (antes dava erro ao clicar em
  "Adicionar ao carrinho" na página de produto)
- textos do admin atualizados para citar Cloudinary em vez de Firebase Storage
