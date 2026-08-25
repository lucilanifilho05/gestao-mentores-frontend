# Gestão de Mentores — Frontend

Etapa 1 do frontend em React, TypeScript, Vite e Twind.

## Entregue nesta etapa

- projeto Vite com React e TypeScript;
- variável `VITE_API_URL`;
- tema institucional por tokens CSS;
- Twind com presets Tailwind e Autoprefix;
- cliente HTTP centralizado com `credentials: 'include'`;
- access token mantido somente em memória;
- refresh automático em `401`, com repetição única da requisição;
- trava para impedir múltiplos refreshes concorrentes;
- login, refresh, usuário atual, logout e logout de todas as sessões;
- rotas protegidas por autenticação e papel;
- tela de login responsiva;
- shell autenticado inicial;
- tratamento centralizado de erros HTTP.

## Requisitos

- Node.js 20.19 ou superior;
- backend em `http://localhost:3000`;
- CORS do backend permitindo `http://localhost:5173` com credenciais.

Exemplo de configuração esperada no NestJS:

```ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

## Instalação

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Validação

```bash
npm run typecheck
npm run build
```

## Variável de ambiente

```dotenv
VITE_API_URL=http://localhost:3000
```

Em produção, considerando o frontend em `https://jusana.space` e a API em
`https://api.jusana.space`, gere o build com:

```dotenv
VITE_API_URL=https://api.jusana.space
```

## Atualização na VPS

O frontend está instalado em `/opt/gestao-mentores/frontend`. O arquivo `.env`
de produção deve conter:

```dotenv
VITE_API_URL=https://api.jusana.space
FRONTEND_PORT=8080
```

### 1. Acessar o projeto e baixar a nova versão

```bash
cd /opt/gestao-mentores/frontend
git status
git pull --ff-only origin main
```

Se `git status` apresentar alterações locais, revise-as antes de executar o
`git pull`. Não apague nem substitua o arquivo `.env`.

### 2. Reconstruir e atualizar o container

```bash
  docker compose up -d --build
```

O rebuild é obrigatório porque `VITE_API_URL` é incorporada aos arquivos do
frontend durante a construção da imagem.

### 3. Validar a atualização

```bash
docker compose ps
docker compose logs --tail=100 frontend
curl --fail http://127.0.0.1:8080/health
```

Também valide o endereço público:

```text
https://jusana.space
```

### 4. Diagnóstico

Para acompanhar os logs do frontend em tempo real:

```bash
docker compose logs -f frontend
```

## Observação sobre a senha

O DTO enviado informa que existem constantes de comprimento mínimo e máximo, mas os valores dessas constantes não foram fornecidos. Nesta etapa, o frontend valida obrigatoriedade da senha e delega os limites exatos ao backend. Assim que o OpenAPI completo ou `password-policy.ts` for enviado, o schema Zod pode espelhar os valores exatos.
