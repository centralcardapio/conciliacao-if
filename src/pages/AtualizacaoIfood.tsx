import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { RefreshCw, Calendar, Building2, Store, CheckCircle, XCircle, Clock, AlertTriangle, Filter, Eye, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Ban } from 'lucide-react';
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
interface Regional {
  id: string;
  nome: string;
}

interface Loja {
  id: string;
  nome: string;
  regionalId: string;
}

interface BatchLog {
  id: string;
  dataExecucao: Date;
  regionalId: string;
  lojaId: string;
  status: 'sucesso' | 'erro' | 'processando' | 'cancelado';
  pedidosProcessados: number;
  pedidosComErro: number;
  duracaoSegundos: number;
  mensagem?: string;
}

// Mock data
const mockRegionais: Regional[] = [
  { id: '1', nome: 'Sul' },
  { id: '2', nome: 'Sudeste' },
  { id: '3', nome: 'Centro-Oeste' },
  { id: '4', nome: 'Nordeste' },
  { id: '5', nome: 'Norte' },
];

const mockLojas: Loja[] = [
  { id: '1', nome: 'Loja Centro', regionalId: '2' },
  { id: '2', nome: 'Loja Norte', regionalId: '5' },
  { id: '3', nome: 'Loja Sul', regionalId: '1' },
  { id: '4', nome: 'Loja Oeste', regionalId: '3' },
  { id: '5', nome: 'Loja Leste', regionalId: '2' },
  { id: '6', nome: 'Loja Zona Norte', regionalId: '5' },
  { id: '7', nome: 'Loja Zona Sul', regionalId: '1' },
];

const mockBatchLogs: BatchLog[] = [
  { id: '1', dataExecucao: new Date('2026-01-08T06:00:00'), regionalId: '2', lojaId: '1', status: 'sucesso', pedidosProcessados: 245, pedidosComErro: 0, duracaoSegundos: 120 },
  { id: '2', dataExecucao: new Date('2026-01-08T06:00:00'), regionalId: '2', lojaId: '5', status: 'sucesso', pedidosProcessados: 189, pedidosComErro: 0, duracaoSegundos: 95 },
  { id: '3', dataExecucao: new Date('2026-01-08T06:00:00'), regionalId: '1', lojaId: '3', status: 'processando', pedidosProcessados: 312, pedidosComErro: 8, duracaoSegundos: 180, mensagem: 'Processando pedidos...' },
  { id: '4', dataExecucao: new Date('2026-01-08T06:00:00'), regionalId: '1', lojaId: '7', status: 'erro', pedidosProcessados: 0, pedidosComErro: 0, duracaoSegundos: 15, mensagem: 'Falha na autenticação iFood' },
  { id: '5', dataExecucao: new Date('2026-01-07T06:00:00'), regionalId: '2', lojaId: '1', status: 'sucesso', pedidosProcessados: 278, pedidosComErro: 0, duracaoSegundos: 135 },
  { id: '6', dataExecucao: new Date('2026-01-07T06:00:00'), regionalId: '5', lojaId: '2', status: 'cancelado', pedidosProcessados: 0, pedidosComErro: 0, duracaoSegundos: 5, mensagem: 'Cancelado pelo usuário' },
  { id: '7', dataExecucao: new Date('2026-01-07T06:00:00'), regionalId: '3', lojaId: '4', status: 'sucesso', pedidosProcessados: 203, pedidosComErro: 0, duracaoSegundos: 110 },
  { id: '8', dataExecucao: new Date('2026-01-06T06:00:00'), regionalId: '2', lojaId: '1', status: 'sucesso', pedidosProcessados: 301, pedidosComErro: 0, duracaoSegundos: 145 },
  { id: '9', dataExecucao: new Date('2026-01-06T06:00:00'), regionalId: '1', lojaId: '3', status: 'sucesso', pedidosProcessados: 267, pedidosComErro: 0, duracaoSegundos: 128 },
  { id: '10', dataExecucao: new Date('2026-01-05T06:00:00'), regionalId: '2', lojaId: '5', status: 'cancelado', pedidosProcessados: 0, pedidosComErro: 0, duracaoSegundos: 8, mensagem: 'Cancelado por timeout' },
];

type SortField = 'dataExecucao' | 'regional' | 'loja' | 'status' | 'pedidosProcessados';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 50;

const AtualizacaoIfood: React.FC = () => {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedRegional, setSelectedRegional] = useState<string>('');
  const [selectedLojas, setSelectedLojas] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [lojasDropdownOpen, setLojasDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dataExecucao');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredLojas = useMemo(() => {
    if (!selectedRegional) return mockLojas;
    return mockLojas.filter(loja => loja.regionalId === selectedRegional);
  }, [selectedRegional]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleRegionalChange = (value: string) => {
    setSelectedRegional(value);
    setSelectedLojas([]);
  };

  const handleLojaToggle = (lojaId: string) => {
    setSelectedLojas(prev => 
      prev.includes(lojaId) 
        ? prev.filter(id => id !== lojaId)
        : [...prev, lojaId]
    );
  };

  const handleSelectAllLojas = () => {
    if (selectedLojas.length === filteredLojas.length) {
      setSelectedLojas([]);
    } else {
      setSelectedLojas(filteredLojas.map(l => l.id));
    }
  };

  const getSelectedLojasText = () => {
    if (selectedLojas.length === 0) return 'Todas as lojas';
    if (selectedLojas.length === filteredLojas.length) return 'Todas as lojas';
    if (selectedLojas.length === 1) {
      return filteredLojas.find(l => l.id === selectedLojas[0])?.nome || '1 loja';
    }
    return `${selectedLojas.length} lojas selecionadas`;
  };

  const filteredLogs = useMemo(() => {
    return mockBatchLogs.filter(log => {
      if (dateFrom && log.dataExecucao < dateFrom) return false;
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (log.dataExecucao > endOfDay) return false;
      }
      if (selectedRegional && log.regionalId !== selectedRegional) return false;
      if (selectedLojas.length > 0 && !selectedLojas.includes(log.lojaId)) return false;
      if (selectedStatus && log.status !== selectedStatus) return false;
      return true;
    });
  }, [dateFrom, dateTo, selectedRegional, selectedLojas, selectedStatus]);

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'dataExecucao':
          comparison = a.dataExecucao.getTime() - b.dataExecucao.getTime();
          break;
        case 'regional':
          comparison = getRegionalName(a.regionalId).localeCompare(getRegionalName(b.regionalId), 'pt-BR');
          break;
        case 'loja':
          comparison = getLojaName(a.lojaId).localeCompare(getLojaName(b.lojaId), 'pt-BR');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'pedidosProcessados':
          comparison = a.pedidosProcessados - b.pedidosProcessados;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredLogs, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedLogs, currentPage]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-foreground" />
      : <ArrowDown className="w-4 h-4 text-foreground" />;
  };

  const getStatusIcon = (status: BatchLog['status']) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processando':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'cancelado':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: BatchLog['status']) => {
    switch (status) {
      case 'sucesso':
        return 'Sucesso';
      case 'erro':
        return 'Erro';
      case 'processando':
        return 'Processando';
      case 'cancelado':
        return 'Cancelado';
    }
  };

  const getStatusClass = (status: BatchLog['status']) => {
    switch (status) {
      case 'sucesso':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'erro':
        return 'bg-red-500/10 text-red-600';
      case 'processando':
        return 'bg-blue-500/10 text-blue-600';
      case 'cancelado':
        return 'bg-amber-500/10 text-amber-600';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getLojaName = (lojaId: string) => mockLojas.find(l => l.id === lojaId)?.nome || '-';
  const getRegionalName = (regionalId: string) => mockRegionais.find(r => r.id === regionalId)?.nome || '-';

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const sucesso = filteredLogs.filter(l => l.status === 'sucesso').length;
    const erro = filteredLogs.filter(l => l.status === 'erro').length;
    const processando = filteredLogs.filter(l => l.status === 'processando').length;
    const cancelado = filteredLogs.filter(l => l.status === 'cancelado').length;
    const totalPedidos = filteredLogs.reduce((acc, l) => acc + l.pedidosProcessados, 0);
    return { total, sucesso, erro, processando, cancelado, totalPedidos };
  }, [filteredLogs]);

  return (
    <Layout title="Histórico iFood">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Histórico de Atualizações iFood</h1>
              <p className="text-muted-foreground mt-1">
                Visualize o status e resultados das sincronizações diárias com o iFood.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    onSelect={setDateFrom}
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
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Regional */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Regional
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedRegional}
                  onChange={(e) => handleRegionalChange(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas as regionais</option>
                  {mockRegionais.map(regional => (
                    <option key={regional.id} value={regional.id}>
                      {regional.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lojas - Multi-select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Lojas
              </label>
              <Popover open={lojasDropdownOpen} onOpenChange={setLojasDropdownOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full h-11 px-4 pl-11 bg-background border border-border rounded-lg text-left flex items-center gap-3 hover:border-foreground/30 transition-colors relative",
                      selectedLojas.length === 0 && "text-muted-foreground"
                    )}
                  >
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{getSelectedLojasText()}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 bg-card border border-border z-50" align="start">
                  <div className="p-2 border-b border-border">
                    <button
                      onClick={handleSelectAllLojas}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors font-medium"
                    >
                      {selectedLojas.length === filteredLojas.length ? 'Desmarcar todas' : 'Selecionar todas'}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {filteredLojas.map(loja => (
                      <label
                        key={loja.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLojas.includes(loja.id)}
                          onChange={() => handleLojaToggle(loja.id)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-sm text-foreground">{loja.nome}</span>
                      </label>
                    ))}
                  </div>
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
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todos os status</option>
                  <option value="sucesso">Sucesso</option>
                  <option value="erro">Erro</option>
                  <option value="processando">Processando</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total Execuções</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Com Sucesso</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.sucesso}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Com Erro</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.erro}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Pedidos Processados</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalPedidos.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground/5 border-b border-border">
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('dataExecucao')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Data/Hora
                      <SortIcon field="dataExecucao" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('regional')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Regional
                      <SortIcon field="regional" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('loja')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Loja
                      <SortIcon field="loja" />
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
                  <th className="text-right px-6 py-4">
                    <button
                      onClick={() => handleSort('pedidosProcessados')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors ml-auto"
                    >
                      Processados
                      <SortIcon field="pedidosProcessados" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-28">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">Nenhum registro encontrado</p>
                          <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => (
                    <tr 
                      key={log.id} 
                      className="group hover:bg-secondary/40 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">
                          {format(log.dataExecucao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                          {getRegionalName(log.regionalId)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-foreground/70" />
                          <span className="font-medium text-foreground text-sm">{getLojaName(log.lojaId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          getStatusClass(log.status)
                        )}>
                          {getStatusIcon(log.status)}
                          {getStatusLabel(log.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground text-right font-medium">
                        {log.pedidosProcessados.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-8 h-8 flex items-center justify-center">
                            {log.status === 'sucesso' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => navigate(`/historico-ifood/${log.id}`)}
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
                            {log.status === 'sucesso' && (
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
                                    <p>Exportar planilha</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center">
                            {(log.status === 'sucesso' || log.status === 'processando') && (
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
                                      <p>Cancelar processamento</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancelar Processamento</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja cancelar o processamento da loja <strong>{getLojaName(log.lojaId)}</strong>?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Não, manter</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        toast({
                                          title: "Processamento cancelado",
                                          description: `O processamento da loja ${getLojaName(log.lojaId)} foi cancelado com sucesso.`,
                                        });
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white"
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

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-secondary/30">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedLogs.length} de {sortedLogs.length} {sortedLogs.length === 1 ? 'registro' : 'registros'}
            </span>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                        currentPage === page
                          ? "bg-foreground text-background"
                          : "border border-border bg-background text-foreground hover:bg-secondary"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default AtualizacaoIfood;
