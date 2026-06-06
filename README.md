# Mundo 3D Gestão — V3.3 FULL Banco

Versão preparada para operação online compartilhada entre múltiplos computadores usando **Supabase** como banco principal.

## O que mudou
- Todos os módulos passam a ler e gravar no banco:
  - Materiais
  - Produtos
  - Modelos de máquina
  - Máquinas
  - Estoque
  - Movimentações de estoque
  - Clientes
  - Projetos
  - Ordens de produção
  - Precificação
  - Leads / Prospecções
  - Cartilha de clientes
  - Pedidos
  - Financeiro
- Estrutura mantida em:
  - `app/comercial/...`
  - `app/operacional/...`
  - `app/dashboard-geral`
  - `app/inicio`
- Interface pronta para Vercel.

## Como usar
1. Instale dependências:
   ```bash
   npm install
   ```
2. Crie `.env.local` com base em `.env.example`.
3. No Supabase, execute o SQL em `supabase/schema_v3_3_full.sql`.
4. Faça o deploy na Vercel com as variáveis de ambiente.

## Observação importante
Nesta V3.3 o banco está sem autenticação por usuário para simplificar a operação compartilhada imediata entre você e seu sócio. Os dados ficam centralizados online. Em uma próxima etapa, o recomendado é ativar autenticação e políticas RLS por usuário/empresa.
