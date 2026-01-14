import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { FileSpreadsheet, Download, Calendar, Building2, Store, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import Pagination from '@/components/Pagination';

interface Regional {
  id: string;
  nome: string;
}

interface Loja {
  id: string;
  nome: string;
  regionalId: string;
}

interface Pedido {
  id: string;
  nfIfood: string;
  nfErp: string;
  dataErp: string;
  dataIfood: string;
  loja: string;
  regional: string;
  valorErp: number;
  valorIfood: number;
}

type SortField = 'nfIfood' | 'nfErp' | 'dataErp' | 'dataIfood' | 'loja' | 'valorErp' | 'valorIfood';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 50;

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

// Mock pedidos data expandido
const mockPedidos: Pedido[] = [
  { id: '1', nfIfood: 'IF-001234', nfErp: 'NF-2024-0001', dataErp: '2024-01-15', dataIfood: '2024-01-15', loja: 'Loja Centro', regional: 'Sudeste', valorErp: 125.50, valorIfood: 125.50 },
  { id: '2', nfIfood: 'IF-001235', nfErp: 'NF-2024-0002', dataErp: '2024-01-15', dataIfood: '2024-01-14', loja: 'Loja Norte', regional: 'Norte', valorErp: 89.90, valorIfood: 89.90 },
  { id: '3', nfIfood: 'IF-001236', nfErp: 'NF-2024-0003', dataErp: '2024-01-14', dataIfood: '2024-01-14', loja: 'Loja Sul', regional: 'Sul', valorErp: 234.00, valorIfood: 230.00 },
  { id: '4', nfIfood: 'IF-001237', nfErp: 'NF-2024-0004', dataErp: '2024-01-14', dataIfood: '2024-01-13', loja: 'Loja Oeste', regional: 'Centro-Oeste', valorErp: 156.75, valorIfood: 156.75 },
  { id: '5', nfIfood: 'IF-001238', nfErp: 'NF-2024-0005', dataErp: '2024-01-13', dataIfood: '2024-01-13', loja: 'Loja Leste', regional: 'Sudeste', valorErp: 312.40, valorIfood: 315.00 },
  { id: '6', nfIfood: 'IF-001239', nfErp: 'NF-2024-0006', dataErp: '2024-01-13', dataIfood: '2024-01-12', loja: 'Loja Zona Norte', regional: 'Norte', valorErp: 78.25, valorIfood: 78.25 },
  { id: '7', nfIfood: 'IF-001240', nfErp: 'NF-2024-0007', dataErp: '2024-01-12', dataIfood: '2024-01-12', loja: 'Loja Zona Sul', regional: 'Sul', valorErp: 445.00, valorIfood: 445.00 },
  { id: '8', nfIfood: 'IF-001241', nfErp: 'NF-2024-0008', dataErp: '2024-01-12', dataIfood: '2024-01-11', loja: 'Loja Centro', regional: 'Sudeste', valorErp: 67.80, valorIfood: 70.00 },
  { id: '9', nfIfood: 'IF-001242', nfErp: 'NF-2024-0009', dataErp: '2024-01-11', dataIfood: '2024-01-11', loja: 'Loja Norte', regional: 'Norte', valorErp: 198.30, valorIfood: 198.30 },
  { id: '10', nfIfood: 'IF-001243', nfErp: 'NF-2024-0010', dataErp: '2024-01-11', dataIfood: '2024-01-10', loja: 'Loja Sul', regional: 'Sul', valorErp: 523.60, valorIfood: 520.00 },
];

const BasePedidos: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedRegional, setSelectedRegional] = useState<string>('');
  const [selectedLojas, setSelectedLojas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lojasDropdownOpen, setLojasDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dataErp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
    if (selectedLojas.length === 0) return 'Selecione as lojas';
    if (selectedLojas.length === filteredLojas.length) return 'Todas as lojas';
    if (selectedLojas.length === 1) {
      return filteredLojas.find(l => l.id === selectedLojas[0])?.nome || '1 loja';
    }
    return `${selectedLojas.length} lojas selecionadas`;
  };

  const canGenerate = dateFrom && dateTo && selectedLojas.length > 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const sortedAndFilteredPedidos = useMemo(() => {
    let filtered = [...mockPedidos];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pedido =>
        pedido.nfIfood.toLowerCase().includes(term) ||
        pedido.nfErp.toLowerCase().includes(term) ||
        pedido.loja.toLowerCase().includes(term) ||
        pedido.regional.toLowerCase().includes(term)
      );
    }

    // Filter by regional
    if (selectedRegional) {
      const regionalNome = mockRegionais.find(r => r.id === selectedRegional)?.nome;
      if (regionalNome) {
        filtered = filtered.filter(pedido => pedido.regional === regionalNome);
      }
    }

    // Filter by lojas
    if (selectedLojas.length > 0) {
      const lojasNomes = selectedLojas.map(id => mockLojas.find(l => l.id === id)?.nome);
      filtered = filtered.filter(pedido => lojasNomes.includes(pedido.loja));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'nfIfood':
          comparison = a.nfIfood.localeCompare(b.nfIfood);
          break;
        case 'nfErp':
          comparison = a.nfErp.localeCompare(b.nfErp);
          break;
        case 'dataErp':
          comparison = a.dataErp.localeCompare(b.dataErp);
          break;
        case 'dataIfood':
          comparison = a.dataIfood.localeCompare(b.dataIfood);
          break;
        case 'loja':
          comparison = a.loja.localeCompare(b.loja);
          break;
        case 'valorErp':
          comparison = a.valorErp - b.valorErp;
          break;
        case 'valorIfood':
          comparison = a.valorIfood - b.valorIfood;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, selectedRegional, selectedLojas, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedAndFilteredPedidos.length / ITEMS_PER_PAGE);

  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredPedidos.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredPedidos, currentPage]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5" /> 
      : <ArrowDown className="w-3.5 h-3.5" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleGenerateDownload = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet data
    const wsData = [
      ['# NF IFOOD', '# NF ERP'],
      ...mockPedidos.map(p => [p.nfIfood, p.nfErp])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

    // Generate filename
    const fromStr = dateFrom ? format(dateFrom, 'ddMMyyyy') : '';
    const toStr = dateTo ? format(dateTo, 'ddMMyyyy') : '';
    const filename = `base_pedidos_${fromStr}_${toStr}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    setIsGenerating(false);
  };

  return (
    <Layout title="Base de Pedidos">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Base de Pedidos</h1>
              <p className="text-muted-foreground mt-1">
                Gere e exporte a base de pedidos com notas fiscais iFood e ERP.
              </p>
            </div>
          </div>
        </div>

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
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por NF iFood, NF ERP, loja ou regional..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleGenerateDownload}
              disabled={!canGenerate || isGenerating}
              className="h-11 px-6 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exportar Planilha
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('dataIfood')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Data iFood
                      <SortIcon field="dataIfood" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('nfIfood')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      NF iFood
                      <SortIcon field="nfIfood" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button onClick={() => handleSort('valorIfood')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors ml-auto">
                      Valor iFood
                      <SortIcon field="valorIfood" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('dataErp')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Data ERP
                      <SortIcon field="dataErp" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('nfErp')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      NF ERP
                      <SortIcon field="nfErp" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4">
                    <button onClick={() => handleSort('valorErp')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors ml-auto">
                      Valor ERP
                      <SortIcon field="valorErp" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Regional
                  </th>
                  <th className="text-left px-6 py-4">
                    <button onClick={() => handleSort('loja')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Loja
                      <SortIcon field="loja" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedPedidos.length > 0 ? (
                  paginatedPedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(pedido.dataIfood)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {pedido.nfIfood}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground text-right font-medium">
                        {formatCurrency(pedido.valorIfood)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(pedido.dataErp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {pedido.nfErp}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground text-right font-medium">
                        {formatCurrency(pedido.valorErp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {pedido.regional}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {pedido.loja}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="w-8 h-8 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                        <p className="text-sm text-muted-foreground/70">
                          Ajuste os filtros para visualizar os pedidos
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sortedAndFilteredPedidos.length > 0 && (
            <div className="border-t border-border px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedAndFilteredPedidos.length}
                itemsPerPage={ITEMS_PER_PAGE}
                itemLabel="pedido"
                itemLabelPlural="pedidos"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BasePedidos;
