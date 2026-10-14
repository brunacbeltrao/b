# Bruna OS

Sistema operacional pessoal da Bruna Beltrão: graduação na FDR/UFPE (Perfil 0807), Liga de Direito Societário (LDS), agenda integrada, finanças, estante de livros e rotina de hábitos.

Começou como protótipo no Google AI Studio e agora segue como projeto próprio.

## Stack

- React 19 + Vite 6 + Tailwind CSS 4
- Express (`server.ts`) servindo a SPA e as rotas `/api/*`
- Gemini (`@google/genai`) para apostilas, glossário e tira-dúvidas da LDS — há respostas de fallback quando não há chave
- Dados salvos no `localStorage` do navegador (exportação/importação em FDR → Ajustes)

## Rodar localmente

Pré-requisito: Node.js 20+

```bash
npm install
cp .env.example .env.local   # preencha GEMINI_API_KEY (opcional)
npm run dev                  # http://localhost:3000
```

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (Express + Vite) |
| `npm run build` | build de produção em `dist/` |
| `npm start` | roda o build de produção |
| `npm run lint` | checagem de tipos (`tsc --noEmit`) |

## Estrutura

```
server.ts               API + Gemini
src/App.tsx             layout e navegação
src/components/views/   Cockpit, Calendário, Financeiro, Livros, Rotina, LDS, FDR
src/fdr/                módulo da graduação (domínio, store zustand, páginas)
src/lds/                módulo da Liga (aulas, glossário, repositório, agente)
src/context/            estado global do app
src/utils/dateUtils.ts  datas (sempre relativas a hoje)
```
