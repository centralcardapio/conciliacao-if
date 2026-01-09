import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { ClipboardList, Calendar, Building2, Store, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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

const mockTarefas: Tarefa[] = [
  { id: '1', numeroPedidoIfood: 'IF-001234', numeroPedidoVarejo: 'NF-2024-0001', valor: 125.50, data: new Date('2024-01-15'), tipo: 'cancelar', status: 'aberto', lojaId: '1', regionalId: '2' },
  { id: '2', numeroPedidoIfood: 'IF-001235', numeroPedidoVarejo: 'NF-2024-0002', valor: 89.90, data: new Date('2024-01-15'), tipo: 'contestar', status: 'finalizado', lojaId: '2', regionalId: '5' },
  { id: '3', numeroPedidoIfood: 'IF-001236', numeroPedidoVarejo: 'NF-2024-0003', valor: 234.00, data: new Date('2024-01-14'), tipo: 'cancelar', status: 'aberto', lojaId: '3', regionalId: '1' },
  { id: '4', numeroPedidoIfood: 'IF-001237', numeroPedidoVarejo: 'NF-2024-0004', valor: 56.75, data: new Date('2024-01-14'), tipo: 'contestar', status: 'finalizado', lojaId: '1', regionalId: '2' },
  { id: '5', numeroPedidoIfood: 'IF-001238', numeroPedidoVarejo: 'NF-2024-0005', valor: 178.30, data: new Date('2024-01-13'), tipo: 'cancelar', status: 'aberto', lojaId: '5', regionalId: '2' },
  { id: '6', numeroPedidoIfood: 'IF-001239', numeroPedidoVarejo: 'NF-2024-0006', valor: 312.00, data: new Date('2024-01-13'), tipo: 'contestar', status: 'aberto', lojaId: '4', regionalId: '3' },
  { id: '7', numeroPedidoIfood: 'IF-001240', numeroPedidoVarejo: 'NF-2024-0007', valor: 45.50, data: new Date('2024-01-12'), tipo: 'cancelar', status: 'finalizado', lojaId: '6', regionalId: '5' },
  { id: '8', numeroPedidoIfood: 'IF-001241', numeroPedidoVarejo: 'NF-2024-0008', valor: 199.99, data: new Date('2024-01-12'), tipo: 'contestar', status: 'aberto', lojaId: '7', regionalId: '1' },
];

const tiposTarefa = [
  { value: '', label: 'Todos os tipos' },
  { value: 'cancelar', label: 'Cancelar Pedido' },
  { value: 'contestar', label: 'Contestar Pedido' },
];

const Tarefas: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedRegional, setSelectedRegional] = useState<string>('');
  const [selectedLojas, setSelectedLojas] = useState<string[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [lojasDropdownOpen, setLojasDropdownOpen] = useState(false);

  const regionais = mockRegionais;

  const filteredLojas = useMemo(() => {
    if (!selectedRegional) return mockLojas;
    return mockLojas.filter(loja => loja.regionalId === selectedRegional);
  }, [selectedRegional]);

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

  const filteredTarefas = useMemo(() => {
    return mockTarefas.filter(tarefa => {
      // Filtro por data
      if (dateFrom && tarefa.data < dateFrom) return false;
      if (dateTo && tarefa.data > dateTo) return false;
      
      // Filtro por regional
      if (selectedRegional && tarefa.regionalId !== selectedRegional) return false;
      
      // Filtro por lojas
      if (selectedLojas.length > 0 && !selectedLojas.includes(tarefa.lojaId)) return false;
      
      // Filtro por tipo
      if (selectedTipo && tarefa.tipo !== selectedTipo) return false;
      
      return true;
    });
  }, [dateFrom, dateTo, selectedRegional, selectedLojas, selectedTipo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getTipoLabel = (tipo: 'cancelar' | 'contestar') => {
    return tipo === 'cancelar' ? 'Cancelar Pedido' : 'Contestar Pedido';
  };

  const getTipoBadgeClass = (tipo: 'cancelar' | 'contestar') => {
    return tipo === 'cancelar' 
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  };

  const getLojaNome = (lojaId: string) => {
    return mockLojas.find(l => l.id === lojaId)?.nome || '-';
  };

  const getRegionalNome = (regionalId: string) => {
    return mockRegionais.find(r => r.id === regionalId)?.nome || '-';
  };

  const getStatusLabel = (status: 'aberto' | 'finalizado') => {
    return status === 'aberto' ? 'Aberto' : 'Finalizado';
  };

  const getStatusBadgeClass = (status: 'aberto' | 'finalizado') => {
    return status === 'aberto'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  };

  return (
    <Layout title="Tarefas">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as tarefas originadas a partir das conciliações.
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
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
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
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
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
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
                  <option value="">Todas</option>
                  {regionais.map(regional => (
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

            {/* Tipo de Tarefa */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Tipo de Tarefa
              </label>
              <div className="relative">
                <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer"
                >
                  {tiposTarefa.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
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
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Data
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Pedido iFood
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Pedido Varejo
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Regional
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Loja
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                    Valor
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTarefas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma tarefa encontrada</p>
                    </td>
                  </tr>
                ) : (
                  filteredTarefas.map((tarefa) => (
                    <tr key={tarefa.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-sm text-muted-foreground">
                          {format(tarefa.data, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-foreground">{tarefa.numeroPedidoIfood}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-foreground">{tarefa.numeroPedidoVarejo}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-foreground">{getRegionalNome(tarefa.regionalId)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-foreground">{getLojaNome(tarefa.lojaId)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-medium text-foreground">{formatCurrency(tarefa.valor)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          getTipoBadgeClass(tarefa.tipo)
                        )}>
                          {getTipoLabel(tarefa.tipo)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          getStatusBadgeClass(tarefa.status)
                        )}>
                          {getStatusLabel(tarefa.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              {filteredTarefas.length} {filteredTarefas.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tarefas;
