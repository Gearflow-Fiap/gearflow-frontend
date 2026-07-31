# GearFlow — Frontend

Frontend **simples** para o time testar o backend `gearflow-app` com telas e fluxos reais (em vez de
Scalar/Postman). Cobre 100% dos endpoints: auth, clientes/veículos, catálogo, estoque e o ciclo de
vida completo da Ordem de Serviço.

## Stack

- **Vite + React + TypeScript** · **Tailwind CSS**
- **Orval** (gera tipos + hooks TanStack Query a partir do OpenAPI do backend)
- **@tanstack/react-query** + **axios** (mutator com Bearer token e leitura de ProblemDetails)
- **react-router-dom** · **react-hot-toast**

## Rodando

Pré-requisito: **backend no ar** (`gearflow-app`), API em `http://localhost:8080`.

```bash
docker compose up -d --build   # (no repositório do backend) sobe API + SQL Server + Mailpit

cd gearflow-frontend
npm install
npm run generate   # baixa o OpenAPI (/openapi/v1.json) e gera os contratos em src/api/generated
npm run dev        # http://localhost:3000
```

Login (seed de desenvolvimento): **admin@gearflow.local** / **Admin@123**.

> **Sem CORS em dev:** o Vite faz proxy de `/api/**` para `http://localhost:8080` (a API). O
> `npm run generate` lê o spec direto do backend (roda no Node, sem CORS).
> Regenere os contratos (`npm run generate`) sempre que o backend mudar a API.

## Telas

| Tela | Rota | O que testa |
|---|---|---|
| Login | `/login` | login de staff (JWT) |
| Dashboard | `/` | tempo médio por fase + OS ativas |
| Clientes | `/clients`, `/clients/:id` | CRUD de cliente + veículos |
| Catálogo | `/catalog` | CRUD de serviços |
| Estoque | `/inventory` | CRUD de peças/insumos + reposição de estoque |
| Ordens de Serviço | `/service-orders`, `/new`, `/:id` | abrir OS e **todo o ciclo**: diagnóstico → orçamento → aprovar → executar → finalizar → entregar |
| Consulta pública | `/public-status` | status da OS por cliente (Externals) |

## Fluxo de teste sugerido (ponta a ponta)

1. **Catálogo** → cadastre um serviço.
2. **Estoque** → cadastre uma peça com quantidade alta.
3. **Clientes** → crie um cliente (CPF **ou** CNPJ) e adicione um veículo.
4. **Ordens de Serviço → Nova OS** → escolha o cliente/veículo, marque o serviço, informe a peça.
5. Na **OS**: Iniciar diagnóstico → Finalizar diagnóstico (gera orçamento) → Aprovar (reserva estoque)
   → Finalizar (consome) → Entregar. Acompanhe o status/timeline e veja o estoque baixar.
6. Teste o caminho de **estoque insuficiente**: peça mais do que há em estoque → a OS vai para
   "Aguardando peças"; reponha o estoque → retome a execução.

## Estrutura

```
src/
  api/        mutator.ts (axios + auth + ProblemDetails), hooks.ts (aliases), generated/ (Orval)
  lib/        auth.ts (token), money.ts (centavos↔R$), status.ts (labels/cores)
  components/ ui.tsx, Modal.tsx
  layout/     AppLayout.tsx, ProtectedRoute.tsx
  pages/      login, dashboard, clients, catalog, inventory, service-orders, public-status
```

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | servidor de desenvolvimento (porta 3000) |
| `npm run generate` | baixa o OpenAPI + regenera os contratos (Orval) |
| `npm run build` | type-check + build de produção |
| `npm run preview` | serve o build |
