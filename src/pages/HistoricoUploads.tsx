import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { History, Search, Download, CheckCircle, AlertCircle, Clock, XCircle, ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, Eye, Store, DollarSign, Calendar, Filter, Ban } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface UploadRecord {
  id: string;
  dataHora: Date;
  usuario: string;
  status: 'sucesso' | 'erro' | 'processando';
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

const ITEMS_PER_PAGE = 50;

const mockUploads: UploadRecord[] = [
  { id: '1', dataHora: new Date('2026-01-08T14:30:00'), usuario: 'João Silva', status: 'sucesso', totalLinhas: 1250, linhasValidas: 1250, erros: 0, avisos: 3, nomeArquivo: 'vendas_janeiro_2026.xlsx', totalPedidos: 1250, totalLojas: 15, valorTotal: 187500.00, periodoInicio: '01/01/2026', periodoFim: '07/01/2026' },
  { id: '2', dataHora: new Date('2026-01-08T11:15:00'), usuario: 'Maria Santos', status: 'sucesso', totalLinhas: 890, linhasValidas: 845, erros: 0, avisos: 12, nomeArquivo: 'vendas_loja_centro.xlsx', totalPedidos: 845, totalLojas: 1, valorTotal: 42250.00, periodoInicio: '01/01/2026', periodoFim: '07/01/2026' },
  { id: '3', dataHora: new Date('2026-01-07T16:45:00'), usuario: 'Pedro Costa', status: 'erro', totalLinhas: 500, linhasValidas: 0, erros: 500, avisos: 0, nomeArquivo: 'vendas_corrupto.xlsx', totalPedidos: 0, totalLojas: 0, valorTotal: 0, periodoInicio: '-', periodoFim: '-' },
  { id: '4', dataHora: new Date('2026-01-07T09:20:00'), usuario: 'Ana Oliveira', status: 'sucesso', totalLinhas: 2100, linhasValidas: 2100, erros: 0, avisos: 8, nomeArquivo: 'vendas_regional_sul.xlsx', totalPedidos: 2100, totalLojas: 8, valorTotal: 315000.00, periodoInicio: '01/01/2026', periodoFim: '06/01/2026' },
  { id: '5', dataHora: new Date('2026-01-06T15:00:00'), usuario: 'João Silva', status: 'processando', totalLinhas: 3500, linhasValidas: 1200, erros: 0, avisos: 0, nomeArquivo: 'vendas_consolidado.xlsx', totalPedidos: 1200, totalLojas: 25, valorTotal: 180000.00, periodoInicio: '01/01/2026', periodoFim: '05/01/2026' },
  { id: '6', dataHora: new Date('2026-01-06T10:30:00'), usuario: 'Carlos Mendes', status: 'sucesso', totalLinhas: 780, linhasValidas: 780, erros: 0, avisos: 2, nomeArquivo: 'vendas_loja_shopping.xlsx', totalPedidos: 780, totalLojas: 1, valorTotal: 117000.00, periodoInicio: '01/01/2026', periodoFim: '05/01/2026' },
  { id: '7', dataHora: new Date('2026-01-05T14:10:00'), usuario: 'Maria Santos', status: 'sucesso', totalLinhas: 1560, linhasValidas: 1560, erros: 0, avisos: 0, nomeArquivo: 'vendas_dezembro_2025.xlsx', totalPedidos: 1560, totalLojas: 12, valorTotal: 234000.00, periodoInicio: '01/12/2025', periodoFim: '31/12/2025' },
  { id: '8', dataHora: new Date('2026-01-05T08:45:00'), usuario: 'Pedro Costa', status: 'erro', totalLinhas: 420, linhasValidas: 0, erros: 420, avisos: 0, nomeArquivo: 'vendas_loja_matriz.xlsx', totalPedidos: 0, totalLojas: 0, valorTotal: 0, periodoInicio: '-', periodoFim: '-' },
];

const HistoricoUploads: React.FC = () => {
  const navigate = useNavigate();
  const [uploads] = useState<UploadRecord[]>(mockUploads);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dataHora');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

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

    if (dateFrom) {
      filtered = filtered.filter(u => u.dataHora >= dateFrom);
    }

    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(u => u.dataHora <= endOfDay);
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
  }, [uploads, searchTerm, sortField, sortDirection, statusFilter, dateFrom, dateTo]);

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

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Data Início
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full h-11 px-4 bg-background border border-border rounded-lg text-left flex items-center gap-3 hover:border-foreground/30 transition-colors",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => { setDateFrom(date); setCurrentPage(1); }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Data Fim
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full h-11 px-4 bg-background border border-border rounded-lg text-left flex items-center gap-3 hover:border-foreground/30 transition-colors",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => { setDateTo(date); setCurrentPage(1); }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Status
              </label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="todos">Todos os status</option>
                  <option value="sucesso">Sucesso</option>
                  <option value="erro">Erro</option>
                  <option value="processando">Processando</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Usuário ou arquivo..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                />
              </div>
            </div>
          </div>
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
                        {upload.status === 'sucesso' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="inline-flex items-center gap-1.5 text-foreground">
                                <Store className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="font-medium">{upload.totalLojas ?? 0}</span>
                                <span className="text-muted-foreground">{(upload.totalLojas ?? 0) === 1 ? 'loja' : 'lojas'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-foreground">
                                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="font-medium">{(upload.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground">
                                {(upload.totalPedidos ?? 0).toLocaleString()} pedidos
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {upload.periodoInicio ?? '-'} a {upload.periodoFim ?? '-'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-8 h-8 flex items-center justify-center">
                            {upload.status === 'sucesso' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => navigate(`/historico-uploads/${upload.id}`)}
                                      className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visualizar detalhes</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center">
                            {upload.status === 'sucesso' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Baixar planilha</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center">
                            {(upload.status === 'sucesso' || upload.status === 'processando') && (
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <AlertDialogTrigger asChild>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                          <Ban className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                    </AlertDialogTrigger>
                                    <TooltipContent>
                                      <p>Cancelar upload</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancelar Upload</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja cancelar o upload <strong>{upload.nomeArquivo}</strong>?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Não, manter</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        toast({
                                          title: "Upload cancelado",
                                          description: `O upload ${upload.nomeArquivo} foi cancelado com sucesso.`,
                                        });
                                      }}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Sim, cancelar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedAndFilteredUploads.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="upload"
          />
        </div>
      </div>
    </Layout>
  );
};

export default HistoricoUploads;
