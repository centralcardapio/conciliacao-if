import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ArrowLeft, RefreshCw, Store, Building2, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Package, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

interface Pedido {
  id: string;
  idIfood: string;
  data: Date;
  loja: string;
  numeroPedido: string;
  valor: number;
  status: 'processado' | 'erro' | 'pendente';
  mensagemErro?: string;
}

// Mock data
const mockRegionais = [
  { id: '1', nome: 'Sul' },
  { id: '2', nome: 'Sudeste' },
  { id: '3', nome: 'Centro-Oeste' },
  { id: '4', nome: 'Nordeste' },
  { id: '5', nome: 'Norte' },
];

const mockLojas = [
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

// Mock pedidos for detail view
const generateMockPedidos = (count: number, lojaId: string): Pedido[] => {
  const lojaName = mockLojas.find(l => l.id === lojaId)?.nome || 'Loja';
  return Array.from({ length: count }, (_, i) => {
    const randomDays = Math.floor(Math.random() * 7);
    const randomHours = Math.floor(Math.random() * 12) + 8;
    return {
      id: `${i + 1}`,
      idIfood: `IF-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      data: new Date(2026, 0, 8 - randomDays, randomHours, Math.floor(Math.random() * 60)),
      loja: lojaName,
      numeroPedido: `PED-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      valor: Math.floor(Math.random() * 500) + 20,
      status: Math.random() > 0.1 ? 'processado' : (Math.random() > 0.5 ? 'erro' : 'pendente'),
      mensagemErro: Math.random() > 0.9 ? 'Dados do pedido incompletos' : undefined,
    };
  });
};

const DetalheAtualizacaoIfood: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const log = mockBatchLogs.find(l => l.id === id);
  const pedidos = log ? generateMockPedidos(log.pedidosProcessados || 10, log.lojaId) : [];

  const getLojaName = (lojaId: string) => mockLojas.find(l => l.id === lojaId)?.nome || '-';
  const getRegionalName = (regionalId: string) => mockRegionais.find(r => r.id === regionalId)?.nome || '-';

  const getStatusIcon = (status: BatchLog['status']) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'erro':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processando':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'cancelado':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
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

  const getPedidoStatusClass = (status: Pedido['status']) => {
    switch (status) {
      case 'processado':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'erro':
        return 'bg-red-500/10 text-red-600';
      case 'pendente':
        return 'bg-amber-500/10 text-amber-600';
    }
  };

  const getPedidoStatusLabel = (status: Pedido['status']) => {
    switch (status) {
      case 'processado':
        return 'Processado';
      case 'erro':
        return 'Erro';
      case 'pendente':
        return 'Pendente';
    }
  };

  if (!log) {
    return (
      <Layout title="Detalhe Atualização">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Registro não encontrado</h2>
          <p className="text-muted-foreground mb-6">O registro solicitado não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/historico-ifood')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Histórico
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Detalhe Atualização">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 animate-fade-in">
          <button
            onClick={() => navigate('/historico-ifood')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detalhe da Atualização</h1>
            <p className="text-muted-foreground">
              {format(log.dataExecucao, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-foreground/70" />
              </div>
              <span className="text-sm text-muted-foreground">Regional</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{getRegionalName(log.regionalId)}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-foreground/70" />
              </div>
              <span className="text-sm text-muted-foreground">Loja</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{getLojaName(log.lojaId)}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-foreground/70" />
              </div>
              <span className="text-sm text-muted-foreground">Duração</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{formatDuration(log.duracaoSegundos)}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-muted-foreground">Pedidos Processados</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{log.pedidosProcessados.toLocaleString('pt-BR')}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                {getStatusIcon(log.status)}
              </div>
              <span className="text-sm text-muted-foreground">Status</span>
            </div>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
              getStatusClass(log.status)
            )}>
              {getStatusIcon(log.status)}
              {getStatusLabel(log.status)}
            </span>
          </div>
        </div>

        {/* Message if exists */}
        {log.mensagem && (
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-foreground/70" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Mensagem do Sistema</p>
                <p className="text-muted-foreground">{log.mensagem}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pedidos Table */}
        {log.pedidosProcessados > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pedidos Processados</h2>
                <p className="text-sm text-muted-foreground mt-1">Lista de pedidos incluídos nesta atualização</p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-foreground/5 border-b border-border">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                      ID iFood
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Data
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Loja
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Nº Pedido
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Observação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pedidos.slice(0, 20).map((pedido, index) => (
                    <tr 
                      key={pedido.id} 
                      className="group hover:bg-secondary/40 transition-colors"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{pedido.idIfood}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">
                          {format(pedido.data, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{pedido.loja}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{pedido.numeroPedido}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-foreground">
                          {pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          getPedidoStatusClass(pedido.status)
                        )}>
                          {getPedidoStatusLabel(pedido.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {pedido.mensagemErro || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pedidos.length > 20 && (
              <div className="px-6 py-4 border-t border-border bg-secondary/30 text-center">
                <span className="text-sm text-muted-foreground">
                  Exibindo 20 de {pedidos.length} pedidos. Exporte para visualizar todos.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DetalheAtualizacaoIfood;
