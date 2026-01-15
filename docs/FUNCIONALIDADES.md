# Conciliação iFood/ERP - Lista de Funcionalidades

## Visão Geral
Sistema de conciliação automática de vendas e recebimentos entre plataformas iFood e sistemas ERP para redes varejistas supermercadistas.

---

## 1. Autenticação e Controle de Acesso

### 1.1 Login
- Autenticação por email e senha
- Persistência de sessão via JWT no localStorage
- Redirecionamento automático para área logada

### 1.2 Recuperação de Senha
- Solicitação de reset via email
- Validação de força da senha (8+ caracteres, maiúsculas, minúsculas, números, especiais)
- Feedback visual de força da senha em tempo real

### 1.3 Perfis de Acesso
| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| **Loja** | Acesso restrito a uma loja específica | Visualização de dados da própria loja |
| **Regional** | Acesso a múltiplas lojas de uma região | Gestão de lojas da regional |
| **Corporativo** | Acesso total ao sistema | Gestão completa + configurações + uploads |

---

## 2. Dashboard Principal

### 2.1 Métricas Principais
- Pedidos Conciliados (quantidade e variação)
- Pedidos Pendentes
- Divergências identificadas
- Tarefas abertas

### 2.2 Estatísticas Financeiras
- Volume Conciliado (R$)
- Valor em Divergência (R$)

### 2.3 Estatísticas Operacionais
- Lojas Ativas
- Status da última atualização iFood

### 2.4 Filtros Avançados
- **Data**: Período início e fim (calendário)
- **Regional**: Seleção única
- **Loja**: Seleção múltipla via Popover
- **Status**: Conciliado, Pendente, Divergente

---

## 3. Gestão de Cadastros

### 3.1 Regionais
- Listagem com busca e ordenação
- Criação de nova regional
- Edição de regional existente
- Exclusão com confirmação
- Paginação (50 registros por página)

### 3.2 Lojas
- Listagem com busca e ordenação
- Campos: Nome, ID ERP, ID iFood, Regional
- Criação/Edição via modal com validação Zod
- Ativação/Desativação de lojas
- Exclusão com confirmação
- Paginação (50 registros por página)

### 3.3 Usuários
- Listagem com busca e ordenação
- Campos: Nome, Email, Tipo (Loja/Regional/Corporativo)
- Vinculação a Regional e/ou Loja
- Criação/Edição via modal com validação
- Ativação/Desativação de usuários
- Paginação (50 registros por página)

---

## 4. Integração iFood

### 4.1 Gestão de Credenciais
- Cadastro de Client ID e Client Secret por loja
- Validação de credenciais
- Status de conexão (Conectado/Desconectado/Erro)
- Teste de conexão com API iFood
- Renovação automática de tokens

### 4.2 Histórico de Sincronização (Batch Logs)
- Listagem de execuções de sincronização
- Filtros: Período, Regional, Lojas (múltipla seleção), Status
- Status: Processando, Sucesso, Erro, Cancelado
- Detalhes: Duração, Pedidos processados, Mensagens de erro
- Ações: Visualizar detalhes, Exportar planilha, Cancelar
- Paginação (50 registros por página)

### 4.3 Detalhes de Sincronização
- Cards de resumo: Regional, Loja, Duração, Pedidos, Status
- Tabela de registros processados
- Colunas: ID iFood, Data, Loja

---

## 5. Integração ERP

### 5.1 Upload de Vendas
- Interface drag-and-drop para upload de planilhas
- Formatos aceitos: Excel (.xlsx, .xls)
- Validação de formato: Data, Hora, Valor, Loja, Pedido
- Guia de formato esperado
- Painel de progresso com etapas:
  1. Upload do arquivo
  2. Validação de estrutura
  3. Processamento de dados
  4. Conciliação

### 5.2 Histórico de Uploads
- Listagem de importações realizadas
- Filtros: Período, Status (Sucesso, Erro, Processando)
- Colunas: Data, Arquivo, Status, Lojas, Valor, Pedidos
- Ações condicionais por status:
  - Visualizar (apenas Sucesso)
  - Baixar planilha (apenas Sucesso)
  - Cancelar (Sucesso e Processando)
- Paginação (50 registros por página)

### 5.3 Detalhes de Upload
- Cards de resumo: Total de lojas, Valor total, Pedidos
- Informações do arquivo
- Tabela paginada com todas as linhas processadas

---

## 6. Base de Pedidos

### 6.1 Visualização
- Tabela com todos os pedidos históricos
- Colunas ordenáveis:
  - Data iFood / NF iFood / Valor iFood
  - Data ERP / NF ERP / Valor ERP
  - Regional / Loja
- NFs exibidas como badges

### 6.2 Busca e Filtros
- Busca textual por NF ou outros campos
- Paginação (50 registros por página)

### 6.3 Exportação
- Exportação para Excel (.xlsx)
- Texto dinâmico indicando quantidade de pedidos
- Download direto do navegador

---

## 7. Gestão de Divergências (Tarefas)

### 7.1 Painel de Resumo
Cards com barras de progresso por tipo:
- **Cancelar**: Pedidos a cancelar no iFood
- **Contestar**: Valores a contestar
- **Investigar**: Casos para análise manual
- **Alterar Pedido**: Correções necessárias

### 7.2 Listagem de Tarefas
- Filtros: Data, Regional, Loja, Status
- Colunas: Tipo, Pedido iFood, Pedido ERP, Valor, Data, Status
- Status: Aberto, Finalizado

### 7.3 Ações
- Finalizar tarefa (com confirmação modal)
- Registro de observações
- Toast de confirmação

---

## 8. Configurações e Parâmetros

### 8.1 Parâmetros de Setup (Somente Leitura)
- Configurações iniciais do sistema
- Visíveis para todos os perfis
- Não editáveis após setup

### 8.2 Parâmetros Personalizados
- Editáveis pelo perfil Corporativo
- Tipos de parâmetros:
  - Texto
  - Número
  - Booleano (switch)
  - Seleção (dropdown)
- Agrupamento por categoria
- Validação de valores

### 8.3 Acesso
- Ícone de configurações no header (apenas Corporativo)
- Rota: `/parametros`

---

## 9. Interface e Experiência

### 9.1 Layout
- Header fixo (60px) com:
  - Título da página
  - Nome da corporação (centralizado)
  - Dropdown do usuário
  - Ícone de configurações (Corporativo)
- Sidebar colapsável (250px → 60px)
- Área de conteúdo responsiva

### 9.2 Menu Lateral (Sidebar)
Organização por grupos:
- **IFOOD**: Credenciais, Histórico
- **ERP**: Vendas (Upload), Histórico
- **DIVERGÊNCIAS**: Tarefas
- **CADASTROS**: Regionais, Lojas, Usuários

### 9.3 Padrões Visuais
- Estética minimalista (inspirada OpenAI)
- Paleta neutra: preto, branco, tons de cinza
- Tipografia: Inter
- Cards com bordas sutis
- Tabelas com cabeçalhos em `bg-foreground/5`
- Badges para identificadores
- Animações suaves (fade-in)

### 9.4 Componentes Reutilizáveis
- Paginação unificada (50 registros)
- Modais de confirmação
- Toasts de feedback
- Tooltips informativos
- Formulários com validação Zod

---

## 10. Funcionalidades Técnicas

### 10.1 Autenticação
- Context API para gerenciamento de estado
- Persistência de tokens JWT
- Proteção de rotas (ProtectedRoute)
- Logout com limpeza de sessão

### 10.2 Validação
- Zod para validação de formulários
- React Hook Form para gerenciamento
- Feedback visual de erros

### 10.3 Notificações
- Sonner para toasts
- Confirmações via modais

### 10.4 Performance
- React Query para cache de dados
- Componentes otimizados
- Lazy loading de rotas

---

## 11. Rotas da Aplicação

| Rota | Página | Acesso |
|------|--------|--------|
| `/login` | Login | Público |
| `/forgot-password` | Esqueci a Senha | Público |
| `/reset-password` | Redefinir Senha | Público |
| `/home` | Home | Autenticado |
| `/dashboard` | Dashboard | Autenticado |
| `/regionais` | Gestão de Regionais | Autenticado |
| `/lojas` | Gestão de Lojas | Autenticado |
| `/usuarios` | Gestão de Usuários | Autenticado |
| `/credenciais-ifood` | Credenciais iFood | Autenticado |
| `/historico-ifood` | Histórico iFood | Autenticado |
| `/historico-ifood/:id` | Detalhe Sync iFood | Autenticado |
| `/upload-vendas` | Upload de Vendas | Corporativo |
| `/historico-uploads` | Histórico Uploads | Autenticado |
| `/historico-uploads/:id` | Detalhe Upload | Autenticado |
| `/base-pedidos` | Base de Pedidos | Autenticado |
| `/tarefas` | Divergências | Autenticado |
| `/parametros` | Configurações | Corporativo |

---

## 12. Próximas Funcionalidades (Roadmap)

### Fase 2
- [ ] Integração real com API iFood
- [ ] Conexão com banco de dados PostgreSQL
- [ ] Row Level Security (RLS) por corporação
- [ ] Relatórios em PDF

### Fase 3
- [ ] Dashboard com gráficos temporais
- [ ] Alertas por email
- [ ] API REST para integrações
- [ ] Auditoria de ações

### Fase 4
- [ ] Multi-idioma
- [ ] Temas personalizados
- [ ] App mobile (PWA)
- [ ] Webhooks para automações

---

## Resumo Quantitativo

| Categoria | Quantidade |
|-----------|------------|
| Páginas | 17 |
| Rotas protegidas | 14 |
| Rotas públicas | 3 |
| Perfis de acesso | 3 |
| Entidades do banco | 10 |
| Grupos de menu | 4 |

---

*Documento gerado em: Janeiro 2026*
*Versão: 1.0*
