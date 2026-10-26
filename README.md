# Bruna OS

Sistema operacional pessoal da Bruna Beltrão: graduação na FDR/UFPE (Perfil 0807), Liga de Direito Societário (LDS), agenda integrada, finanças, estante de livros e rotina de hábitos.

Começou como protótipo no Google AI Studio e agora segue como projeto próprio.

## Stack

- React 19 + Vite 6 + Tailwind CSS 4
- Express: rotas `/api/*` em `server/app.ts`, servidas localmente por `server.ts` e na Vercel por `api/index.ts`
- Gemini (`@google/genai`) para apostilas, glossário e tira-dúvidas da LDS — há respostas de fallback quando não há chave
- Dados salvos no `localStorage` do navegador (exportação/importação em FDR → Ajustes)

## Rodar localmente

Pré-requisito: Node.js 20+

```bash
npm install
cp .env.example .env.local   # preencha GEMINI_API_KEY (opcional)
npm run dev                  # http://localhost:3000
```

## Publicar na Vercel

O repositório já vem configurado (`vercel.json`): o Vite gera o site estático e `api/index.ts` roda as rotas `/api/*` como função serverless.

1. Em [vercel.com/new](https://vercel.com/new), importe este repositório do GitHub (sem mudar as configurações de build).
2. Em *Settings → Environment Variables*, crie `GEMINI_API_KEY` com a chave do [Google AI Studio](https://aistudio.google.com/apikey). Sem ela o app funciona, mas a IA da LDS usa respostas prontas.
3. Cada push na `main` publica uma nova versão.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (Express + Vite) |
| `npm run build` | build de produção em `dist/` |
| `npm start` | roda o build de produção |
| `npm run lint` | checagem de tipos (`tsc --noEmit`) |

## Estrutura

```
server.ts               servidor local (Express + Vite)
server/app.ts           rotas da API + Gemini
api/index.ts            mesma API como função da Vercel
src/App.tsx             layout e navegação
src/components/views/   Cockpit, Calendário, Financeiro, Livros, Rotina, LDS, FDR
src/fdr/                módulo da graduação (domínio, store zustand, páginas)
src/lds/                módulo da Liga (aulas, glossário, repositório, agente)
src/context/            estado global do app
src/utils/dateUtils.ts  datas (sempre relativas a hoje)
```
