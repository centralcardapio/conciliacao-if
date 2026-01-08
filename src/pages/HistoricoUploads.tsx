import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { History, Search, Download, CheckCircle, AlertCircle, Clock, XCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, Eye, Store, DollarSign } from 'lucide-react';

interface UploadRecord {
  id: string;
  dataHora: Date;
  usuario: string;
  status: 'sucesso' | 'erro' | 'parcial' | 'processando';
  totalLinhas: number;
  linhasValidas: number;
  erros: number;
  avisos: number;
  nomeArquivo: string;
  // Resumo dos dados do arquivo
  totalPedidos: number;
  totalLojas: number;
  valorTotal: number;
  periodoInicio: string;
  periodoFim: string;
}

type SortField = 'dataHora' | 'usuario' | 'status' | 'totalLinhas' | 'valorTotal';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const mockUploads: UploadRecord[] = [
  { id: '1', dataHora: new Date('2026-01-08T14:30:00'), usuario: 'João Silva', status: 'sucesso', totalLinhas: 1250, linhasValidas: 1250, erros: 0, avisos: 3, nomeArquivo: 'vendas_janeiro_2026.xlsx', totalPedidos: 1250, totalLojas: 15, valorTotal: 187500.00, periodoInicio: '01/01/2026', periodoFim: '07/01/2026' },
  { id: '2', dataHora: new Date('2026-01-08T11:15:00'), usuario: 'Maria Santos', status: 'parcial', totalLinhas: 890, linhasValidas: 845, erros: 45, avisos: 12, nomeArquivo: 'vendas_loja_centro.xlsx', totalPedidos: 845, totalLojas: 1, valorTotal: 42250.00, periodoInicio: '01/01/2026', periodoFim: '07/01/2026' },
  { id: '3', dataHora: new Date('2026-01-07T16:45:00'), usuario: 'Pedro Costa', status: 'erro', totalLinhas: 500, linhasValidas: 0, erros: 500, avisos: 0, nomeArquivo: 'vendas_corrupto.xlsx', totalPedidos: 0, totalLojas: 0, valorTotal: 0, periodoInicio: '-', periodoFim: '-' },
  { id: '4', dataHora: new Date('2026-01-07T09:20:00'), usuario: 'Ana Oliveira', status: 'sucesso', totalLinhas: 2100, linhasValidas: 2100, erros: 0, avisos: 8, nomeArquivo: 'vendas_regional_sul.xlsx', totalPedidos: 2100, totalLojas: 8, valorTotal: 315000.00, periodoInicio: '01/01/2026', periodoFim: '06/01/2026' },
  { id: '5', dataHora: new Date('2026-01-06T15:00:00'), usuario: 'João Silva', status: 'processando', totalLinhas: 3500, linhasValidas: 1200, erros: 0, avisos: 0, nomeArquivo: 'vendas_consolidado.xlsx', totalPedidos: 1200, totalLojas: 25, valorTotal: 180000.00, periodoInicio: '01/01/2026', periodoFim: '05/01/2026' },
  { id: '6', dataHora: new Date('2026-01-06T10:30:00'), usuario: 'Carlos Mendes', status: 'sucesso', totalLinhas: 780, linhasValidas: 780, erros: 0, avisos: 2, nomeArquivo: 'vendas_loja_shopping.xlsx', totalPedidos: 780, totalLojas: 1, valorTotal: 117000.00, periodoInicio: '01/01/2026', periodoFim: '05/01/2026' },
  { id: '7', dataHora: new Date('2026-01-05T14:10:00'), usuario: 'Maria Santos', status: 'sucesso', totalLinhas: 1560, linhasValidas: 1560, erros: 0, avisos: 0, nomeArquivo: 'vendas_dezembro_2025.xlsx', totalPedidos: 1560, totalLojas: 12, valorTotal: 234000.00, periodoInicio: '01/12/2025', periodoFim: '31/12/2025' },
  { id: '8', dataHora: new Date('2026-01-05T08:45:00'), usuario: 'Pedro Costa', status: 'parcial', totalLinhas: 420, linhasValidas: 398, erros: 22, avisos: 5, nomeArquivo: 'vendas_loja_matriz.xlsx', totalPedidos: 398, totalLojas: 1, valorTotal: 59700.00, periodoInicio: '01/01/2026', periodoFim: '04/01/2026' },
];

const HistoricoUploads: React.FC = () => {
  const [uploads] = useState<UploadRecord[]>(mockUploads);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dataHora');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const sortedAndFilteredUploads = useMemo(() => {
    let filtered = uploads.filter(u => 
      u.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nomeArquivo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'dataHora':
          comparison = a.dataHora.getTime() - b.dataHora.getTime();
          break;
        case 'usuario':
          comparison = a.usuario.localeCompare(b.usuario, 'pt-BR');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'totalLinhas':
          comparison = a.totalLinhas - b.totalLinhas;
          break;
        case 'valorTotal':
          comparison = a.valorTotal - b.valorTotal;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [uploads, searchTerm, sortField, sortDirection, statusFilter]);

  const totalPages = Math.ceil(sortedAndFilteredUploads.length / ITEMS_PER_PAGE);
  const paginatedUploads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredUploads.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredUploads, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-foreground" />
      : <ArrowDown className="w-4 h-4 text-foreground" />;
  };

  const getStatusBadge = (status: UploadRecord['status']) => {
    switch (status) {
      case 'sucesso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 text-xs font-medium rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Sucesso
          </span>
        );
      case 'erro':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
            <XCircle className="w-3.5 h-3.5" />
            Erro
          </span>
        );
      case 'parcial':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-medium rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            Parcial
          </span>
        );
      case 'processando':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Processando
          </span>
        );
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Layout title="Histórico de Uploads">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <History className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Histórico de Uploads</h1>
              <p className="text-muted-foreground mt-1">
                Visualize todos os uploads de planilhas realizados no sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por usuário ou arquivo..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
          >
            <option value="todos">Todos os status</option>
            <option value="sucesso">Sucesso</option>
            <option value="parcial">Parcial</option>
            <option value="erro">Erro</option>
            <option value="processando">Processando</option>
          </select>
        </div>

        {/* Table Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground/5 border-b border-border">
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('dataHora')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Data/Hora
                      <SortIcon field="dataHora" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('usuario')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Usuário
                      <SortIcon field="usuario" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Status
                      <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('totalLinhas')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Resumo
                      <SortIcon field="totalLinhas" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-28">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedAndFilteredUploads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <History className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {searchTerm || statusFilter !== 'todos' ? 'Nenhum upload encontrado' : 'Nenhum upload realizado'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm || statusFilter !== 'todos' ? 'Tente ajustar os filtros' : 'Os uploads aparecerão aqui'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUploads.map((upload, index) => (
                    <tr 
                      key={upload.id} 
                      className="group hover:bg-secondary/40 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-foreground/5 rounded-lg flex items-center justify-center">
                            <FileSpreadsheet className="w-4 h-4 text-foreground/70" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{formatDateTime(upload.dataHora)}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{upload.nomeArquivo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground">{upload.usuario}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(upload.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="inline-flex items-center gap-1.5 text-foreground">
                              <Store className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-medium">{upload.totalLojas}</span>
                              <span className="text-muted-foreground">{upload.totalLojas === 1 ? 'loja' : 'lojas'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-foreground">
                              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-medium">{upload.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground">
                              {upload.totalPedidos.toLocaleString()} pedidos
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {upload.periodoInicio} a {upload.periodoFim}
                            </span>
                          </div>
                          {(upload.erros > 0 || upload.avisos > 0) && (
                            <div className="flex items-center gap-2 text-xs">
                              {upload.erros > 0 && (
                                <span className="text-destructive">{upload.erros} erros</span>
                              )}
                              {upload.avisos > 0 && (
                                <span className="text-yellow-600">{upload.avisos} avisos</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            title="Visualizar detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            title="Baixar planilha"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-secondary/30">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedUploads.length} de {sortedAndFilteredUploads.length} {sortedAndFilteredUploads.length === 1 ? 'upload' : 'uploads'}
            </span>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-foreground text-background'
                          : 'border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HistoricoUploads;
