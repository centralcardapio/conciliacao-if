import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ArrowLeft, FileSpreadsheet, User, Calendar, Clock, CheckCircle, XCircle, Package, Store, DollarSign, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 50;

interface UploadRecord {
  id: string;
  dataHora: Date;
  usuario: string;
  status: 'sucesso' | 'erro' | 'processando';
  totalLinhas: number;
  linhasValidas: number;
  erros: number;
  nomeArquivo: string;
  totalPedidos: number;
  totalLojas: number;
  valorTotal: number;
  periodoInicio: string;
  periodoFim: string;
}

interface LinhaUpload {
  id: string;
  linha: number;
  data: string;
  hora: string;
  loja: string;
  pedido: string;
  valor: number;
  status: 'válido' | 'erro';
  mensagemErro?: string;
}

// Mock data
const mockUploads: UploadRecord[] = [
  { id: '1', dataHora: new Date('2026-01-08T14:30:00'), usuario: 'João Silva', status: 'sucesso', totalLinhas: 1250, linhasValidas: 1250, erros: 0, nomeArquivo: 'vendas_janeiro_2026.xlsx', totalPedidos: 1250, totalLojas: 15, valorTotal: 187500.00, periodoInicio: '01/01/2026', periodoFim: '07/01/2026' },
  { id: '2', dataHora: new Date('2026-01-08T11:15:00'), usuario: 'Maria Santos', status: 'sucesso', totalLinhas: 890, linhasValidas: 845, erros: 0, nomeArquivo: 'vendas_loja_centro.xlsx', totalPedidos: 845, totalLojas: 1, valorTotal: 42250.00, periodoInicio: '01/01/2026', periodoFim: '07/01/2026' },
  { id: '3', dataHora: new Date('2026-01-07T16:45:00'), usuario: 'Pedro Costa', status: 'erro', totalLinhas: 500, linhasValidas: 0, erros: 500, nomeArquivo: 'vendas_corrupto.xlsx', totalPedidos: 0, totalLojas: 0, valorTotal: 0, periodoInicio: '-', periodoFim: '-' },
  { id: '4', dataHora: new Date('2026-01-07T09:20:00'), usuario: 'Ana Oliveira', status: 'sucesso', totalLinhas: 2100, linhasValidas: 2100, erros: 0, nomeArquivo: 'vendas_regional_sul.xlsx', totalPedidos: 2100, totalLojas: 8, valorTotal: 315000.00, periodoInicio: '01/01/2026', periodoFim: '06/01/2026' },
  { id: '5', dataHora: new Date('2026-01-06T15:00:00'), usuario: 'João Silva', status: 'processando', totalLinhas: 3500, linhasValidas: 1200, erros: 0, nomeArquivo: 'vendas_consolidado.xlsx', totalPedidos: 1200, totalLojas: 25, valorTotal: 180000.00, periodoInicio: '01/01/2026', periodoFim: '05/01/2026' },
  { id: '6', dataHora: new Date('2026-01-06T10:30:00'), usuario: 'Carlos Mendes', status: 'sucesso', totalLinhas: 780, linhasValidas: 780, erros: 0, nomeArquivo: 'vendas_loja_shopping.xlsx', totalPedidos: 780, totalLojas: 1, valorTotal: 117000.00, periodoInicio: '01/01/2026', periodoFim: '05/01/2026' },
  { id: '7', dataHora: new Date('2026-01-05T14:10:00'), usuario: 'Maria Santos', status: 'sucesso', totalLinhas: 1560, linhasValidas: 1560, erros: 0, nomeArquivo: 'vendas_dezembro_2025.xlsx', totalPedidos: 1560, totalLojas: 12, valorTotal: 234000.00, periodoInicio: '01/12/2025', periodoFim: '31/12/2025' },
  { id: '8', dataHora: new Date('2026-01-05T08:45:00'), usuario: 'Pedro Costa', status: 'erro', totalLinhas: 420, linhasValidas: 0, erros: 420, nomeArquivo: 'vendas_loja_matriz.xlsx', totalPedidos: 0, totalLojas: 0, valorTotal: 0, periodoInicio: '-', periodoFim: '-' },
];

const mockLojas = ['Loja Centro', 'Loja Norte', 'Loja Sul', 'Loja Oeste', 'Loja Leste', 'Loja Shopping'];

const generateMockLinhas = (count: number, hasErrors: boolean): LinhaUpload[] => {
  return Array.from({ length: count }, (_, i) => {
    const isError = hasErrors && Math.random() > 0.7;
    const randomDay = Math.floor(Math.random() * 7) + 1;
    const randomHour = Math.floor(Math.random() * 12) + 8;
    return {
      id: `${i + 1}`,
      linha: i + 2,
      data: `0${randomDay}/01/2026`,
      hora: `${String(randomHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      loja: mockLojas[Math.floor(Math.random() * mockLojas.length)],
      pedido: `PED-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      valor: Math.floor(Math.random() * 500) + 20,
      status: isError ? 'erro' : 'válido',
      mensagemErro: isError ? ['Loja não encontrada', 'Formato de data inválido', 'Valor negativo'][Math.floor(Math.random() * 3)] : undefined,
    };
  });
};

const DetalheUpload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const upload = mockUploads.find(u => u.id === id);
  const allLinhas = useMemo(() => 
    upload ? generateMockLinhas(upload.totalLinhas, upload.status === 'erro') : [],
    [upload]
  );
  
  const totalPages = Math.ceil(allLinhas.length / ITEMS_PER_PAGE);
  const paginatedLinhas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allLinhas.slice(start, start + ITEMS_PER_PAGE);
  }, [allLinhas, currentPage]);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const getStatusIcon = (status: UploadRecord['status']) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'erro':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processando':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusLabel = (status: UploadRecord['status']) => {
    switch (status) {
      case 'sucesso':
        return 'Sucesso';
      case 'erro':
        return 'Erro';
      case 'processando':
        return 'Processando';
    }
  };

  const getStatusClass = (status: UploadRecord['status']) => {
    switch (status) {
      case 'sucesso':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'erro':
        return 'bg-red-500/10 text-red-600';
      case 'processando':
        return 'bg-blue-500/10 text-blue-600';
    }
  };

  if (!upload) {
    return (
      <Layout title="Detalhe do Upload">
        <div className="flex flex-col items-center justify-center py-16">
          <FileSpreadsheet className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Upload não encontrado</h2>
          <p className="text-muted-foreground mb-6">O registro solicitado não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/historico-uploads')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao histórico
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Detalhe do Upload">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 animate-fade-in">
          <button
            onClick={() => navigate('/historico-uploads')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detalhe do Upload</h1>
            <p className="text-muted-foreground text-sm">
              {upload.nomeArquivo}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in">
          {/* Usuário */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Usuário</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{upload.usuario}</p>
          </div>

          {/* Data/Hora */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Data/Hora</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {format(upload.dataHora, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>

          {/* Linhas Processadas */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Linhas</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {upload.linhasValidas.toLocaleString('pt-BR')} / {upload.totalLinhas.toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Valor Total */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {upload.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          {/* Status */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                {getStatusIcon(upload.status)}
              </div>
              <span className="text-sm font-medium text-muted-foreground">Status</span>
            </div>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
              getStatusClass(upload.status)
            )}>
              {getStatusIcon(upload.status)}
              {getStatusLabel(upload.status)}
            </span>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-4">Informações do Arquivo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nome do Arquivo</p>
              <p className="font-medium text-foreground">{upload.nomeArquivo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Lojas</p>
              <p className="font-medium text-foreground">{upload.totalLojas}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Pedidos</p>
              <p className="font-medium text-foreground">{upload.totalPedidos.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Período dos Dados</p>
              <p className="font-medium text-foreground">{upload.periodoInicio} a {upload.periodoFim}</p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Linhas Processadas</h2>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground/5 border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Linha
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Data
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Loja
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLinhas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Nenhuma linha encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLinhas.map((linha, index) => (
                    <tr 
                      key={linha.id} 
                      className="group hover:bg-secondary/40 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-muted-foreground">{linha.linha}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{linha.data}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{linha.hora}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{linha.loja}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{linha.pedido}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-foreground">
                          {linha.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          {linha.status === 'válido' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-xs font-medium rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Válido
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-600 text-xs font-medium rounded-full">
                                <XCircle className="w-3 h-3" />
                                Erro
                              </span>
                              {linha.mensagemErro && (
                                <span className="text-xs text-red-500">{linha.mensagemErro}</span>
                              )}
                            </>
                          )}
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
              Mostrando {paginatedLinhas.length} de {allLinhas.length.toLocaleString('pt-BR')} linhas
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
                  {getVisiblePages().map((page, idx) => (
                    typeof page === 'number' ? (
                      <button
                        key={idx}
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
                    ) : (
                      <span key={idx} className="px-2 text-muted-foreground">...</span>
                    )
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

export default DetalheUpload;
