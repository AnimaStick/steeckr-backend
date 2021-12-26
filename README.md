# steeckr-backend
Projeto desenvolvido como backend do site steeckr, trabalho de Banco de Dados 1 - ALTEREI

Passos para rodar:
1) Instale Node.js
2) Instale Yarn (rode o comando: npm install --global yarn)
3) Crie o banco com o script no repositório
4) Crie um arquivo .env, com base no .env.example, preenchendo as informações necessárias (não é necessário colocar DATABASE_URL para rodar localmente, e o SECRET pode colocar qualquer string aleatória)
5) Instale os módulos dando o comando: "yarn install", (apenas se não funcionar, use "npm install")
6) na pasta raíz do projeto, rode dando o comando "yarn dev"
7) Se não funcionar, ou você pode substituir o conteúdo de server.js pelo conteúdo de server(http).js, ou tentar gerar os certificados para HTTPS novamente: https://www.section.io/engineering-education/how-to-get-ssl-https-for-localhost/ com a estrutura de pastas igual
