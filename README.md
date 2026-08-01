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

## Observação sobre a senha

O DTO enviado informa que existem constantes de comprimento mínimo e máximo, mas os valores dessas constantes não foram fornecidos. Nesta etapa, o frontend valida obrigatoriedade da senha e delega os limites exatos ao backend. Assim que o OpenAPI completo ou `password-policy.ts` for enviado, o schema Zod pode espelhar os valores exatos.
