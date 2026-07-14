# URBTRAIN

Sistema web da URBTRAIN construído com Next.js, React, TypeScript e Supabase.

## Tecnologias

- Next.js (App Router) e React
- TypeScript e Tailwind CSS
- Supabase: autenticação, banco de dados e armazenamento
- Vercel: deploy e variáveis de ambiente

## Estrutura

```text
public/                 Imagens públicas utilizadas pela aplicação
src/app/                Páginas e rotas do Next.js
src/components/         Componentes reutilizáveis
src/lib/                Clientes e tipos do Supabase
supabase/migrations/    Estrutura e políticas de segurança do banco
```

## Rotas

- `/`: apresentação institucional
- `/agenda`: calendário e próximos treinos
- `/loja`: catálogo oficial
- `/galeria`: registros da comunidade
- `/login` e `/cadastro`: autenticação
- `/conta`: perfil e pedidos do cliente
- `/admin`: painel administrativo

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Preencha as variáveis públicas do Supabase e do WhatsApp.
3. Instale as dependências e inicie o projeto:

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Qualidade

```powershell
npm run lint
npm run typecheck
npm run build
```

## Deploy

O deploy é feito pela Vercel a partir do repositório GitHub. Configure as variáveis de `.env.example` no painel da Vercel para Preview e Production. Segredos nunca devem ser enviados ao repositório.

## Banco de dados

As migrations em `supabase/migrations/` criam as tabelas, gatilhos, índices e políticas RLS. A chave `service_role` não é utilizada no navegador.
