import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { FileSpreadsheet, Download, Calendar, Building2, Store, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
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

// Mock pedidos data
const mockPedidos = [
  { nfIfood: 'IF-001234', nfErp: 'NF-2024-0001' },
  { nfIfood: 'IF-001235', nfErp: 'NF-2024-0002' },
  { nfIfood: 'IF-001236', nfErp: 'NF-2024-0003' },
  { nfIfood: 'IF-001237', nfErp: 'NF-2024-0004' },
  { nfIfood: 'IF-001238', nfErp: 'NF-2024-0005' },
];

const BasePedidos: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedRegional, setSelectedRegional] = useState<string>('');
  const [selectedLojas, setSelectedLojas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const canGenerate = dateFrom && dateTo && selectedLojas.length > 0;

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

        {/* Filters Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-6">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>

          {/* Lojas Selection */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Lojas
              </label>
              <button
                onClick={handleSelectAllLojas}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {selectedLojas.length === filteredLojas.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredLojas.map(loja => (
                <button
                  key={loja.id}
                  onClick={() => handleLojaToggle(loja.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                    selectedLojas.includes(loja.id)
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground/30"
                  )}
                >
                  <Store className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{loja.nome}</span>
                </button>
              ))}
            </div>

            {filteredLojas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma loja encontrada para a regional selecionada.
              </div>
            )}
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">Gerar Planilha</h3>
              <p className="text-sm text-muted-foreground">
                {selectedLojas.length > 0 
                  ? `${selectedLojas.length} loja${selectedLojas.length > 1 ? 's' : ''} selecionada${selectedLojas.length > 1 ? 's' : ''}`
                  : 'Selecione pelo menos uma loja para continuar'
                }
              </p>
            </div>
            
            <button
              onClick={handleGenerateDownload}
              disabled={!canGenerate || isGenerating}
              className="h-11 px-6 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Gerar e Baixar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BasePedidos;
