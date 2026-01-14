import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import Pagination from '@/components/Pagination';
import { ClipboardList, Calendar, Building2, Store, Search, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, CheckCircle } from 'lucide-react';
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
interface Tarefa {
  id: string;
  numeroPedidoIfood: string;
  numeroPedidoVarejo: string;
  valor: number;
  data: Date;
  tipo: 'cancelar' | 'contestar';
  status: 'aberto' | 'finalizado';
  lojaId: string;
  regionalId: string;
}
type SortField = 'data' | 'numeroPedidoIfood' | 'numeroPedidoVarejo' | 'regional' | 'loja' | 'valor' | 'tipo' | 'status';
type SortDirection = 'asc' | 'desc';

// Mock data
const mockRegionais: Regional[] = [{
  id: '1',
  nome: 'Sul'
}, {
  id: '2',
  nome: 'Sudeste'
}, {
  id: '3',
  nome: 'Centro-Oeste'
}, {
  id: '4',
  nome: 'Nordeste'
}, {
  id: '5',
  nome: 'Norte'
}];
const mockLojas: Loja[] = [{
  id: '1',
  nome: 'Loja Centro',
  regionalId: '2'
}, {
  id: '2',
  nome: 'Loja Norte',
  regionalId: '5'
}, {
  id: '3',
  nome: 'Loja Sul',
  regionalId: '1'
}, {
  id: '4',
  nome: 'Loja Oeste',
  regionalId: '3'
}, {
  id: '5',
  nome: 'Loja Leste',
  regionalId: '2'
}, {
  id: '6',
  nome: 'Loja Zona Norte',
  regionalId: '5'
}, {
  id: '7',
  nome: 'Loja Zona Sul',
  regionalId: '1'
}];
const mockTarefas: Tarefa[] = [{
  id: '1',
  numeroPedidoIfood: 'IF-001234',
  numeroPedidoVarejo: 'NF-2024-0001',
  valor: 125.50,
  data: new Date('2024-01-15'),
  tipo: 'cancelar',
  status: 'aberto',
  lojaId: '1',
  regionalId: '2'
}, {
  id: '2',
  numeroPedidoIfood: 'IF-001235',
  numeroPedidoVarejo: 'NF-2024-0002',
  valor: 89.90,
  data: new Date('2024-01-15'),
  tipo: 'contestar',
  status: 'finalizado',
  lojaId: '2',
  regionalId: '5'
}, {
  id: '3',
  numeroPedidoIfood: 'IF-001236',
  numeroPedidoVarejo: 'NF-2024-0003',
  valor: 234.00,
  data: new Date('2024-01-14'),
  tipo: 'cancelar',
  status: 'aberto',
  lojaId: '3',
  regionalId: '1'
}, {
  id: '4',
  numeroPedidoIfood: 'IF-001237',
  numeroPedidoVarejo: 'NF-2024-0004',
  valor: 56.75,
  data: new Date('2024-01-14'),
  tipo: 'contestar',
  status: 'finalizado',
  lojaId: '1',
  regionalId: '2'
}, {
  id: '5',
  numeroPedidoIfood: 'IF-001238',
  numeroPedidoVarejo: 'NF-2024-0005',
  valor: 178.30,
  data: new Date('2024-01-13'),
  tipo: 'cancelar',
  status: 'aberto',
  lojaId: '5',
  regionalId: '2'
}, {
  id: '6',
  numeroPedidoIfood: 'IF-001239',
  numeroPedidoVarejo: 'NF-2024-0006',
  valor: 312.00,
  data: new Date('2024-01-13'),
  tipo: 'contestar',
  status: 'aberto',
  lojaId: '4',
  regionalId: '3'
}, {
  id: '7',
  numeroPedidoIfood: 'IF-001240',
  numeroPedidoVarejo: 'NF-2024-0007',
  valor: 45.50,
  data: new Date('2024-01-12'),
  tipo: 'cancelar',
  status: 'finalizado',
  lojaId: '6',
  regionalId: '5'
}, {
  id: '8',
  numeroPedidoIfood: 'IF-001241',
  numeroPedidoVarejo: 'NF-2024-0008',
  valor: 199.99,
  data: new Date('2024-01-12'),
  tipo: 'contestar',
  status: 'aberto',
  lojaId: '7',
  regionalId: '1'
}];
const tiposTarefa = [{
  value: '',
  label: 'Todos os tipos'
}, {
  value: 'cancelar',
  label: 'Cancelar Pedido'
}, {
  value: 'contestar',
  label: 'Contestar Pedido'
}];
const statusOptions = [{
  value: '',
  label: 'Todos'
}, {
  value: 'aberto',
  label: 'Aberto'
}, {
  value: 'finalizado',
  label: 'Finalizado'
}];
const ITEMS_PER_PAGE = 50;
const Tarefas: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedRegional, setSelectedRegional] = useState<string>('');
  const [selectedLojas, setSelectedLojas] = useState<string[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [lojasDropdownOpen, setLojasDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('data');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const regionais = mockRegionais;
  const filteredLojas = useMemo(() => {
    if (!selectedRegional) return mockLojas;
    return mockLojas.filter(loja => loja.regionalId === selectedRegional);
  }, [selectedRegional]);
  const handleRegionalChange = (value: string) => {
    setSelectedRegional(value);
    setSelectedLojas([]);
    setCurrentPage(1);
  };
  const handleLojaToggle = (lojaId: string) => {
    setSelectedLojas(prev => prev.includes(lojaId) ? prev.filter(id => id !== lojaId) : [...prev, lojaId]);
    setCurrentPage(1);
  };
  const handleSelectAllLojas = () => {
    if (selectedLojas.length === filteredLojas.length) {
      setSelectedLojas([]);
    } else {
      setSelectedLojas(filteredLojas.map(l => l.id));
    }
    setCurrentPage(1);
  };
  const getSelectedLojasText = () => {
    if (selectedLojas.length === 0) return 'Todas as lojas';
    if (selectedLojas.length === filteredLojas.length) return 'Todas as lojas';
    if (selectedLojas.length === 1) {
      return filteredLojas.find(l => l.id === selectedLojas[0])?.nome || '1 loja';
    }
    return `${selectedLojas.length} lojas selecionadas`;
  };
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  const SortIcon = ({
    field
  }: {
    field: SortField;
  }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 text-foreground" /> : <ArrowDown className="w-4 h-4 text-foreground" />;
  };
  const getLojaNome = (lojaId: string) => {
    return mockLojas.find(l => l.id === lojaId)?.nome || '-';
  };
  const getRegionalNome = (regionalId: string) => {
    return mockRegionais.find(r => r.id === regionalId)?.nome || '-';
  };
  const filteredTarefas = useMemo(() => {
    return mockTarefas.filter(tarefa => {
      if (dateFrom && tarefa.data < dateFrom) return false;
      if (dateTo && tarefa.data > dateTo) return false;
      if (selectedRegional && tarefa.regionalId !== selectedRegional) return false;
      if (selectedLojas.length > 0 && !selectedLojas.includes(tarefa.lojaId)) return false;
      if (selectedTipo && tarefa.tipo !== selectedTipo) return false;
      if (selectedStatus && tarefa.status !== selectedStatus) return false;
      return true;
    });
  }, [dateFrom, dateTo, selectedRegional, selectedLojas, selectedTipo, selectedStatus]);
  const sortedTarefas = useMemo(() => {
    return [...filteredTarefas].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'data':
          comparison = a.data.getTime() - b.data.getTime();
          break;
        case 'numeroPedidoIfood':
          comparison = a.numeroPedidoIfood.localeCompare(b.numeroPedidoIfood);
          break;
        case 'numeroPedidoVarejo':
          comparison = a.numeroPedidoVarejo.localeCompare(b.numeroPedidoVarejo);
          break;
        case 'regional':
          comparison = getRegionalNome(a.regionalId).localeCompare(getRegionalNome(b.regionalId), 'pt-BR');
          break;
        case 'loja':
          comparison = getLojaNome(a.lojaId).localeCompare(getLojaNome(b.lojaId), 'pt-BR');
          break;
        case 'valor':
          comparison = a.valor - b.valor;
          break;
        case 'tipo':
          comparison = a.tipo.localeCompare(b.tipo);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTarefas, sortField, sortDirection]);
  const totalPages = Math.ceil(sortedTarefas.length / ITEMS_PER_PAGE);
  const paginatedTarefas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTarefas.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTarefas, currentPage]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const getTipoLabel = (tipo: 'cancelar' | 'contestar') => {
    return tipo === 'cancelar' ? 'Cancelar Pedido' : 'Contestar Pedido';
  };
  const getTipoBadgeClass = (tipo: 'cancelar' | 'contestar') => {
    return tipo === 'cancelar' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  };
  const getStatusLabel = (status: 'aberto' | 'finalizado') => {
    return status === 'aberto' ? 'Aberto' : 'Finalizado';
  };
  const getStatusBadgeClass = (status: 'aberto' | 'finalizado') => {
    return status === 'aberto' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  };
  return <Layout title="Tarefas">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
              <p className="text-muted-foreground mt-1">Gerencie as tarefas originadas a partir das divergências nas conciliações.</p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Data Início
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("w-full h-11 px-4 bg-background border border-border rounded-lg text-left flex items-center gap-3 hover:border-foreground/30 transition-colors", !dateFrom && "text-muted-foreground")}>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", {
                    locale: ptBR
                  }) : "Selecione"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateFrom} onSelect={date => {
                  setDateFrom(date);
                  setCurrentPage(1);
                }} initialFocus className={cn("p-3 pointer-events-auto")} />
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
                  <button className={cn("w-full h-11 px-4 bg-background border border-border rounded-lg text-left flex items-center gap-3 hover:border-foreground/30 transition-colors", !dateTo && "text-muted-foreground")}>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", {
                    locale: ptBR
                  }) : "Selecione"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateTo} onSelect={date => {
                  setDateTo(date);
                  setCurrentPage(1);
                }} initialFocus className={cn("p-3 pointer-events-auto")} />
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
                <select value={selectedRegional} onChange={e => handleRegionalChange(e.target.value)} className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer">
                  <option value="">Todas</option>
                  {regionais.map(regional => <option key={regional.id} value={regional.id}>
                      {regional.nome}
                    </option>)}
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
                  <button className={cn("w-full h-11 px-4 pl-11 bg-background border border-border rounded-lg text-left flex items-center gap-3 hover:border-foreground/30 transition-colors relative", selectedLojas.length === 0 && "text-muted-foreground")}>
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{getSelectedLojasText()}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 bg-card border border-border z-50" align="start">
                  <div className="p-2 border-b border-border">
                    <button onClick={handleSelectAllLojas} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors font-medium">
                      {selectedLojas.length === filteredLojas.length ? 'Desmarcar todas' : 'Selecionar todas'}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {filteredLojas.map(loja => <label key={loja.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
                        <input type="checkbox" checked={selectedLojas.includes(loja.id)} onChange={() => handleLojaToggle(loja.id)} className="w-4 h-4 rounded border-border" />
                        <span className="text-sm text-foreground">{loja.nome}</span>
                      </label>)}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tipo de Tarefa */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Tipo de Tarefa
              </label>
              <div className="relative">
                <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select value={selectedTipo} onChange={e => {
                setSelectedTipo(e.target.value);
                setCurrentPage(1);
              }} className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer">
                  {tiposTarefa.map(tipo => <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>)}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Status
              </label>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select value={selectedStatus} onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }} className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer">
                  {statusOptions.map(status => <option key={status.value} value={status.value}>
                      {status.label}
                    </option>)}
                </select>
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
                    <button onClick={() => handleSort('data')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Data
                      <SortIcon field="data" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('numeroPedidoIfood')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Pedido iFood
                      <SortIcon field="numeroPedidoIfood" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('numeroPedidoVarejo')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Pedido Varejo
                      <SortIcon field="numeroPedidoVarejo" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('regional')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Regional
                      <SortIcon field="regional" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('loja')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Loja
                      <SortIcon field="loja" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button onClick={() => handleSort('valor')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors ml-auto">
                      Valor
                      <SortIcon field="valor" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('tipo')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Tipo
                      <SortIcon field="tipo" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Status
                      <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-24">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
              {sortedTarefas.length === 0 ? <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <ClipboardList className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">Nenhuma tarefa encontrada</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tente ajustar os filtros
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr> : paginatedTarefas.map((tarefa, index) => <tr key={tarefa.id} className="group hover:bg-secondary/40 transition-colors" style={{
                animationDelay: `${index * 50}ms`
              }}>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {format(tarefa.data, "dd/MM/yyyy", {
                      locale: ptBR
                    })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{tarefa.numeroPedidoIfood}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{tarefa.numeroPedidoVarejo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{getRegionalNome(tarefa.regionalId)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{getLojaNome(tarefa.lojaId)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-foreground">{formatCurrency(tarefa.valor)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", getTipoBadgeClass(tarefa.tipo))}>
                          {getTipoLabel(tarefa.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", getStatusBadgeClass(tarefa.status))}>
                          {getStatusLabel(tarefa.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-8 h-8 flex items-center justify-center">
                            {tarefa.status === 'aberto' && (
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <AlertDialogTrigger asChild>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                    </AlertDialogTrigger>
                                    <TooltipContent>
                                      <p>Concluir tarefa</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Concluir Tarefa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja concluir a tarefa do pedido <strong>{tarefa.numeroPedidoIfood}</strong>?
                                      Esta ação marcará a tarefa como finalizada.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        toast({
                                          title: "Tarefa concluída",
                                          description: `A tarefa do pedido ${tarefa.numeroPedidoIfood} foi concluída com sucesso.`,
                                        });
                                      }}
                                      className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                      Concluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedTarefas.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="tarefa"
          />
        </div>
      </div>
    </Layout>;
};
export default Tarefas;