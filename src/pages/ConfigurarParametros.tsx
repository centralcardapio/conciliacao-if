import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Settings, Lock, Pencil, X, Save, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type ParametroTipo = 'texto' | 'numero' | 'booleano' | 'selecao';

interface Parametro {
  id: string;
  nome: string;
  descricao: string;
  valor: string | number | boolean;
  tipo: ParametroTipo;
  opcoes?: string[]; // Para tipo 'selecao'
  editavel: boolean;
  categoria: 'setup' | 'personalizado';
  grupo: string;
}

// Mock de parâmetros simulados
const mockParametros: Parametro[] = [
  // Parâmetros do Setup (não editáveis)
  {
    id: '1',
    nome: 'Nome da Corporação',
    descricao: 'Nome oficial da corporação cadastrada no sistema',
    valor: 'Rede Alimenta Brasil',
    tipo: 'texto',
    editavel: false,
    categoria: 'setup',
    grupo: 'Identificação',
  },
  {
    id: '2',
    nome: 'CNPJ Principal',
    descricao: 'CNPJ da matriz da corporação',
    valor: '12.345.678/0001-90',
    tipo: 'texto',
    editavel: false,
    categoria: 'setup',
    grupo: 'Identificação',
  },
  {
    id: '3',
    nome: 'Data de Ativação',
    descricao: 'Data em que a corporação foi ativada no sistema',
    valor: '15/03/2024',
    tipo: 'texto',
    editavel: false,
    categoria: 'setup',
    grupo: 'Identificação',
  },
  {
    id: '4',
    nome: 'Plano Contratado',
    descricao: 'Tipo de plano de serviço contratado',
    valor: 'Enterprise',
    tipo: 'texto',
    editavel: false,
    categoria: 'setup',
    grupo: 'Contrato',
  },
  {
    id: '5',
    nome: 'Limite de Lojas',
    descricao: 'Quantidade máxima de lojas permitidas no plano',
    valor: 50,
    tipo: 'numero',
    editavel: false,
    categoria: 'setup',
    grupo: 'Contrato',
  },
  {
    id: '6',
    nome: 'Limite de Usuários',
    descricao: 'Quantidade máxima de usuários permitidos no plano',
    valor: 100,
    tipo: 'numero',
    editavel: false,
    categoria: 'setup',
    grupo: 'Contrato',
  },
  
  // Parâmetros Personalizados (editáveis)
  {
    id: '7',
    nome: 'Tempo Máximo de Processamento',
    descricao: 'Tempo limite em minutos para processamento de pedidos antes de alertar',
    valor: 30,
    tipo: 'numero',
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Operação',
  },
  {
    id: '8',
    nome: 'Notificar Pedidos Pendentes',
    descricao: 'Enviar notificação quando houver pedidos pendentes por mais de X minutos',
    valor: true,
    tipo: 'booleano',
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Notificações',
  },
  {
    id: '9',
    nome: 'E-mail de Alertas',
    descricao: 'Endereço de e-mail para receber alertas do sistema',
    valor: 'alertas@empresa.com.br',
    tipo: 'texto',
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Notificações',
  },
  {
    id: '10',
    nome: 'Frequência de Sincronização',
    descricao: 'Intervalo de sincronização com o iFood',
    valor: '5 minutos',
    tipo: 'selecao',
    opcoes: ['1 minuto', '5 minutos', '10 minutos', '15 minutos', '30 minutos'],
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Integração',
  },
  {
    id: '11',
    nome: 'Modo de Operação',
    descricao: 'Define o modo de operação das lojas',
    valor: 'Automático',
    tipo: 'selecao',
    opcoes: ['Manual', 'Semi-automático', 'Automático'],
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Operação',
  },
  {
    id: '12',
    nome: 'Permitir Cancelamento Automático',
    descricao: 'Cancelar automaticamente pedidos não aceitos após o tempo limite',
    valor: false,
    tipo: 'booleano',
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Operação',
  },
  {
    id: '13',
    nome: 'Valor Mínimo de Pedido',
    descricao: 'Valor mínimo em reais para aceitar pedidos',
    valor: 15,
    tipo: 'numero',
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Operação',
  },
  {
    id: '14',
    nome: 'Relatório Diário Automático',
    descricao: 'Gerar e enviar relatório diário por e-mail',
    valor: true,
    tipo: 'booleano',
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Relatórios',
  },
  {
    id: '15',
    nome: 'Horário do Relatório',
    descricao: 'Horário para envio do relatório diário',
    valor: '08:00',
    tipo: 'selecao',
    opcoes: ['06:00', '07:00', '08:00', '09:00', '10:00', '18:00', '22:00'],
    editavel: true,
    categoria: 'personalizado',
    grupo: 'Relatórios',
  },
];

const ConfigurarParametros: React.FC = () => {
  const [parametros, setParametros] = useState<Parametro[]>(mockParametros);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | number | boolean>('');
  const [formError, setFormError] = useState('');

  // Agrupa parâmetros por categoria e grupo
  const parametrosSetup = parametros.filter(p => p.categoria === 'setup');
  const parametrosPersonalizados = parametros.filter(p => p.categoria === 'personalizado');

  const gruposSetup = [...new Set(parametrosSetup.map(p => p.grupo))];
  const gruposPersonalizados = [...new Set(parametrosPersonalizados.map(p => p.grupo))];

  const startEditing = (parametro: Parametro) => {
    setEditingId(parametro.id);
    setEditValue(parametro.valor);
    setFormError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
    setFormError('');
  };

  const saveParametro = (parametro: Parametro) => {
    setFormError('');

    // Validação básica
    if (parametro.tipo === 'texto' && typeof editValue === 'string' && editValue.trim() === '') {
      setFormError('O valor não pode estar vazio');
      return;
    }

    if (parametro.tipo === 'numero') {
      const numValue = Number(editValue);
      if (isNaN(numValue) || numValue < 0) {
        setFormError('Informe um número válido');
        return;
      }
    }

    setParametros(prev =>
      prev.map(p =>
        p.id === parametro.id
          ? { ...p, valor: parametro.tipo === 'numero' ? Number(editValue) : editValue }
          : p
      )
    );

    setEditingId(null);
    setEditValue('');
    toast.success(`Parâmetro "${parametro.nome}" atualizado com sucesso!`);
  };

  const formatValue = (parametro: Parametro) => {
    if (parametro.tipo === 'booleano') {
      return parametro.valor ? 'Sim' : 'Não';
    }
    if (parametro.tipo === 'numero' && parametro.nome.includes('Valor')) {
      return `R$ ${Number(parametro.valor).toFixed(2)}`;
    }
    return String(parametro.valor);
  };

  const renderEditField = (parametro: Parametro) => {
    if (parametro.tipo === 'booleano') {
      return (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`param-${parametro.id}`}
              checked={editValue === true}
              onChange={() => setEditValue(true)}
              className="w-4 h-4 text-foreground"
            />
            <span className="text-sm text-foreground">Sim</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`param-${parametro.id}`}
              checked={editValue === false}
              onChange={() => setEditValue(false)}
              className="w-4 h-4 text-foreground"
            />
            <span className="text-sm text-foreground">Não</span>
          </label>
        </div>
      );
    }

    if (parametro.tipo === 'selecao' && parametro.opcoes) {
      return (
        <select
          value={String(editValue)}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
        >
          {parametro.opcoes.map(opcao => (
            <option key={opcao} value={opcao}>{opcao}</option>
          ))}
        </select>
      );
    }

    if (parametro.tipo === 'numero') {
      return (
        <input
          type="number"
          value={String(editValue)}
          onChange={(e) => setEditValue(e.target.value)}
          min={0}
          className="h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all w-32"
        />
      );
    }

    return (
      <input
        type="text"
        value={String(editValue)}
        onChange={(e) => setEditValue(e.target.value)}
        className="h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all flex-1 min-w-[200px]"
      />
    );
  };

  const renderParametroRow = (parametro: Parametro) => {
    const isEditing = editingId === parametro.id;

    return (
      <div
        key={parametro.id}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl transition-colors ${
          isEditing ? 'bg-secondary/60 ring-2 ring-foreground/10' : 'hover:bg-secondary/40'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground">{parametro.nome}</h4>
            {!parametro.editavel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                <Lock className="w-3 h-3" />
                Somente leitura
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{parametro.descricao}</p>
        </div>

        <div className="flex items-center gap-3 sm:ml-4">
          {isEditing ? (
            <>
              <div className="flex flex-col gap-1">
                {renderEditField(parametro)}
                {formError && (
                  <span className="text-xs text-destructive">{formError}</span>
                )}
              </div>
              <button
                onClick={() => saveParametro(parametro)}
                className="inline-flex items-center justify-center w-9 h-9 text-green-600 hover:bg-green-500/10 rounded-lg transition-colors"
                title="Salvar"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEditing}
                className="inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                  parametro.tipo === 'booleano'
                    ? parametro.valor
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-secondary text-muted-foreground'
                    : 'bg-secondary text-foreground'
                }`}>
                  {formatValue(parametro)}
                </span>
              </div>
              {parametro.editavel && (
                <button
                  onClick={() => startEditing(parametro)}
                  className="inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title="Alterar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout title="Configurar Parâmetros">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurar Parâmetros</h1>
              <p className="text-muted-foreground mt-1">
                Visualize os parâmetros do sistema e personalize as configurações disponíveis para sua operação.
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl animate-fade-in">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">
              <strong>Parâmetros do Setup</strong> são definidos durante a ativação e não podem ser alterados. 
              Para modificá-los, entre em contato com o suporte.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Parâmetros Personalizados</strong> podem ser ajustados conforme a necessidade da sua operação.
            </p>
          </div>
        </div>

        {/* Parâmetros do Setup */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="flex items-center gap-3 px-6 py-4 bg-foreground/5 border-b border-border">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Parâmetros do Setup</h2>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              Somente visualização
            </span>
          </div>
          <div className="p-4 space-y-2">
            {gruposSetup.map(grupo => (
              <div key={grupo} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3">
                  {grupo}
                </h3>
                {parametrosSetup
                  .filter(p => p.grupo === grupo)
                  .map(renderParametroRow)}
              </div>
            ))}
          </div>
        </div>

        {/* Parâmetros Personalizados */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="flex items-center gap-3 px-6 py-4 bg-foreground/5 border-b border-border">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-foreground">Parâmetros Personalizados</h2>
            <span className="ml-auto text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded">
              Editável
            </span>
          </div>
          <div className="p-4 space-y-2">
            {gruposPersonalizados.map(grupo => (
              <div key={grupo} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3">
                  {grupo}
                </h3>
                {parametrosPersonalizados
                  .filter(p => p.grupo === grupo)
                  .map(renderParametroRow)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfigurarParametros;
