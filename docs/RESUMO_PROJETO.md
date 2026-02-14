# Conciliação iFood/ERP — Resumo do Projeto

## O que é

O **Conciliação iFood/ERP** é uma plataforma corporativa desenvolvida para redes varejistas supermercadistas que operam com vendas pelo iFood. O sistema resolve um problema crítico do dia a dia dessas operações: **garantir que todos os pedidos realizados pelo iFood estejam corretamente registrados no sistema ERP da empresa**, identificando automaticamente divergências de valores, pedidos faltantes, cancelamentos indevidos e outras inconsistências financeiras.

Em termos simples, o sistema "cruza" as informações vindas do iFood com as informações do ERP interno da empresa, apontando exatamente onde existem diferenças — seja em quantidade de pedidos, valores cobrados, ou status de pagamento — e gera tarefas para que a equipe responsável tome as ações corretivas necessárias.

---

## Por que existe

Redes supermercadistas que vendem pelo iFood lidam com centenas ou milhares de pedidos diários distribuídos entre diversas lojas. Conciliar manualmente esses pedidos com o sistema interno (ERP) é um processo demorado, sujeito a erros e que frequentemente resulta em perdas financeiras não detectadas. O sistema automatiza esse processo, trazendo:

- **Visibilidade** sobre o status de cada pedido
- **Agilidade** na identificação de problemas
- **Controle financeiro** preciso sobre os recebimentos do iFood
- **Rastreabilidade** de todas as ações tomadas

---

## Como funciona — Fluxo Principal

### 1. Entrada de Dados

O sistema recebe dados de duas fontes:

- **iFood**: Através de integração direta com a API do iFood, o sistema busca automaticamente os pedidos realizados em cada loja. Para isso, cada loja precisa ter suas credenciais (Client ID e Client Secret) cadastradas no sistema.

- **ERP**: Os dados do sistema interno da empresa são importados via upload de planilhas Excel (.xlsx). O arquivo deve conter informações como data, hora, valor, loja e número do pedido.

### 2. Processamento e Conciliação

Após a entrada dos dados de ambas as fontes, o sistema realiza o cruzamento automático:

- Identifica pedidos que existem em ambos os sistemas (**conciliados**)
- Detecta pedidos que estão no iFood mas não no ERP (ou vice-versa) (**pendentes**)
- Aponta diferenças de valores entre os dois sistemas (**divergentes**)

### 3. Gestão de Divergências

As divergências encontradas são transformadas em **tarefas** categorizadas por tipo de ação necessária:

- **Cancelar**: Pedidos que precisam ser cancelados no iFood
- **Contestar**: Valores que precisam ser contestados junto ao iFood
- **Investigar**: Casos que requerem análise manual mais detalhada
- **Alterar Pedido**: Correções que precisam ser feitas nos registros

Cada tarefa possui um ciclo de vida (Aberto → Finalizado) com registro de observações.

### 4. Acompanhamento

O **Dashboard** oferece uma visão consolidada em tempo real com:

- Quantidade e valor de pedidos conciliados
- Quantidade e valor de pedidos pendentes
- Quantidade e valor de divergências
- Quantidade de tarefas abertas
- Filtros por período, regional, loja e status

---

## Módulos do Sistema

### Autenticação e Controle de Acesso

O sistema possui três perfis de acesso hierárquicos:

| Perfil | Escopo | Permissões |
|--------|--------|------------|
| **Loja** | Uma loja específica | Visualiza apenas dados da própria loja |
| **Regional** | Grupo de lojas | Gerencia as lojas de sua região |
| **Corporativo** | Todas as lojas | Acesso total, incluindo configurações, uploads e gestão de usuários |

A autenticação é feita por email e senha, com funcionalidades de recuperação de senha e validação de força.

### Cadastros

- **Regionais**: Agrupamentos geográficos de lojas (ex: Regional Sul, Regional Sudeste)
- **Lojas**: Unidades físicas vinculadas a uma regional, com identificadores tanto do ERP quanto do iFood
- **Usuários**: Pessoas que acessam o sistema, vinculadas a um perfil e opcionalmente a uma regional/loja

### Integração iFood

- **Credenciais**: Cadastro e teste das credenciais de API do iFood por loja
- **Sincronização**: Processo automático de busca de pedidos, com histórico detalhado de cada execução (logs)
- **Monitoramento**: Status de conexão de cada loja e detalhes de erros

### Integração ERP

- **Upload de Vendas**: Interface de arrastar e soltar para importação de planilhas com validação de formato
- **Histórico**: Registro de todas as importações realizadas com status, quantidade de pedidos e valores
- **Detalhamento**: Visualização linha a linha dos dados importados

### Base de Pedidos

Repositório central com todos os pedidos históricos já processados, permitindo:

- Busca e filtragem
- Ordenação por qualquer coluna
- Exportação para Excel
- Visualização lado a lado dos dados iFood e ERP

### Configurações

Parâmetros do sistema divididos em:

- **Parâmetros de Setup**: Configurações iniciais (somente leitura após definição)
- **Parâmetros Personalizados**: Ajustáveis pelo perfil Corporativo (textos, números, booleanos, seleções)

---

## Interface e Experiência

O sistema adota uma **estética minimalista e profissional**, com:

- Paleta de cores neutra (preto, branco, tons de cinza)
- Tipografia Inter para legibilidade
- Layout com header fixo e sidebar colapsável
- Cards com bordas sutis e tabelas limpas
- Paginação padronizada (50 registros por página)
- Feedbacks visuais via toasts e modais de confirmação

O menu lateral é organizado por contexto funcional:

- **iFood**: Credenciais e Histórico de sincronização
- **ERP**: Upload de vendas e Histórico de uploads
- **Divergências**: Gestão de tarefas
- **Cadastros**: Regionais, Lojas e Usuários

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Roteamento | React Router v6 |
| Formulários | React Hook Form + Zod |
| Estado/Cache | TanStack Query (React Query) |
| Notificações | Sonner |
| Exportação | SheetJS (xlsx) |
| Build | Vite |

---

## Resumo Quantitativo

| Item | Quantidade |
|------|-----------|
| Páginas | 17 |
| Rotas protegidas | 14 |
| Rotas públicas | 3 |
| Perfis de acesso | 3 |
| Módulos funcionais | 7 |
| Grupos de menu | 4 |

---

*Este documento descreve o estado atual do sistema. Funcionalidades futuras incluem integração real com API iFood, banco de dados PostgreSQL com RLS, relatórios em PDF, dashboards com gráficos temporais, alertas por email e aplicativo mobile (PWA).*
