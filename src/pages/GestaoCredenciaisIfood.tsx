import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Search, Key, Store, Save, X, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Loja {
  id: string;
  nome: string;
}

interface Credencial {
  lojaId: string;
  clientId: string;
  clientSecret: string;
  token: string;
}

type SortField = 'id' | 'nome' | 'status';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

// Mock lojas
const mockLojas: Loja[] = [
  { id: '1', nome: 'Loja Centro' },
  { id: '2', nome: 'Loja Norte' },
  { id: '3', nome: 'Loja Sul' },
  { id: '4', nome: 'Loja Oeste' },
  { id: '5', nome: 'Loja Leste' },
  { id: '6', nome: 'Loja Shopping' },
  { id: '7', nome: 'Loja Aeroporto' },
  { id: '8', nome: 'Loja Rodoviária' },
];

// Mock credenciais iniciais
const mockCredenciais: Credencial[] = [
  { lojaId: '1', clientId: 'client_abc123', clientSecret: 'secret_xyz789', token: 'token_loja1_active' },
  { lojaId: '2', clientId: 'client_def456', clientSecret: 'secret_uvw012', token: '' },
  { lojaId: '3', clientId: '', clientSecret: '', token: '' },
  { lojaId: '4', clientId: 'client_ghi789', clientSecret: '', token: '' },
  { lojaId: '5', clientId: 'client_jkl012', clientSecret: 'secret_rst345', token: 'token_loja5_active' },
  { lojaId: '6', clientId: '', clientSecret: '', token: '' },
  { lojaId: '7', clientId: 'client_mno345', clientSecret: 'secret_opq678', token: '' },
  { lojaId: '8', clientId: '', clientSecret: '', token: '' },
];

interface EditableCredencial extends Credencial {
  lojaNome: string;
  isEditing: boolean;
  showClientSecret: boolean;
  showToken: boolean;
}

const GestaoCredenciaisIfood: React.FC = () => {
  const [lojas] = useState<Loja[]>(mockLojas);
  const [credenciais, setCredenciais] = useState<Credencial[]>(mockCredenciais);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editedValues, setEditedValues] = useState<Record<string, Partial<Credencial>>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, { clientSecret: boolean; token: boolean }>>({});

  const getCredencial = (lojaId: string): Credencial => {
    return credenciais.find(c => c.lojaId === lojaId) || {
      lojaId,
      clientId: '',
      clientSecret: '',
      token: '',
    };
  };

  const hasCompleteCredentials = (lojaId: string): boolean => {
    const cred = getCredencial(lojaId);
    return Boolean(cred.clientId && cred.clientSecret);
  };

  const hasToken = (lojaId: string): boolean => {
    const cred = getCredencial(lojaId);
    return Boolean(cred.token);
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

  const sortedAndFilteredLojas = useMemo(() => {
    const filtered = lojas.filter(l => 
      l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.includes(searchTerm)
    );
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = Number(a.id) - Number(b.id);
      } else if (sortField === 'nome') {
        comparison = a.nome.localeCompare(b.nome, 'pt-BR');
      } else if (sortField === 'status') {
        const statusA = hasCompleteCredentials(a.id) ? (hasToken(a.id) ? 2 : 1) : 0;
        const statusB = hasCompleteCredentials(b.id) ? (hasToken(b.id) ? 2 : 1) : 0;
        comparison = statusA - statusB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [lojas, searchTerm, sortField, sortDirection, credenciais]);

  const totalPages = Math.ceil(sortedAndFilteredLojas.length / ITEMS_PER_PAGE);
  const paginatedLojas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredLojas.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredLojas, currentPage]);

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

  const startEditing = (lojaId: string) => {
    const cred = getCredencial(lojaId);
    setEditingRows(prev => new Set(prev).add(lojaId));
    setEditedValues(prev => ({
      ...prev,
      [lojaId]: {
        clientId: cred.clientId,
        clientSecret: cred.clientSecret,
        token: cred.token,
      }
    }));
  };

  const cancelEditing = (lojaId: string) => {
    setEditingRows(prev => {
      const next = new Set(prev);
      next.delete(lojaId);
      return next;
    });
    setEditedValues(prev => {
      const next = { ...prev };
      delete next[lojaId];
      return next;
    });
  };

  const saveCredencial = (lojaId: string) => {
    const edited = editedValues[lojaId];
    if (!edited) return;

    setCredenciais(prev => {
      const existing = prev.find(c => c.lojaId === lojaId);
      if (existing) {
        return prev.map(c => 
          c.lojaId === lojaId 
            ? { ...c, ...edited }
            : c
        );
      } else {
        return [...prev, {
          lojaId,
          clientId: edited.clientId || '',
          clientSecret: edited.clientSecret || '',
          token: edited.token || '',
        }];
      }
    });

    setEditingRows(prev => {
      const next = new Set(prev);
      next.delete(lojaId);
      return next;
    });
    setEditedValues(prev => {
      const next = { ...prev };
      delete next[lojaId];
      return next;
    });

    toast.success('Credenciais salvas com sucesso!');
  };

  const handleInputChange = (lojaId: string, field: keyof Credencial, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [lojaId]: {
        ...prev[lojaId],
        [field]: value,
      }
    }));
  };

  const toggleSecretVisibility = (lojaId: string, field: 'clientSecret' | 'token') => {
    setVisibleSecrets(prev => ({
      ...prev,
      [lojaId]: {
        ...prev[lojaId],
        [field]: !prev[lojaId]?.[field],
      }
    }));
  };

  const maskValue = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  const getStatusBadge = (lojaId: string) => {
    if (hasToken(lojaId)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ativo
        </span>
      );
    }
    if (hasCompleteCredentials(lojaId)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          Sem Token
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary text-muted-foreground rounded-full text-xs font-medium">
        Não Configurado
      </span>
    );
  };

  return (
    <Layout title="Gestão Credenciais iFood">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestão Credenciais iFood</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as credenciais de integração iFood para cada loja. Clique em uma linha para editar.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar loja por nome ou ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
            />
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground/5 border-b border-border">
                  <th className="text-left px-4 py-4 w-20">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      ID
                      <SortIcon field="id" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-4 w-40">
                    <button
                      onClick={() => handleSort('nome')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Loja
                      <SortIcon field="nome" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Client ID
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Client Secret
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                    Token
                  </th>
                  <th className="text-left px-4 py-4 w-28">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Status
                      <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-24">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedAndFilteredLojas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {searchTerm ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm ? 'Tente buscar por outro termo' : 'Cadastre lojas primeiro'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLojas.map((loja) => {
                    const isEditing = editingRows.has(loja.id);
                    const cred = getCredencial(loja.id);
                    const editedCred = editedValues[loja.id] || cred;
                    const secrets = visibleSecrets[loja.id] || { clientSecret: false, token: false };

                    return (
                      <tr 
                        key={loja.id} 
                        className={`group transition-colors ${isEditing ? 'bg-secondary/60' : 'hover:bg-secondary/40'}`}
                        onClick={() => !isEditing && startEditing(loja.id)}
                        style={{ cursor: isEditing ? 'default' : 'pointer' }}
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-secondary rounded-lg text-xs font-mono text-muted-foreground">
                            {loja.id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-foreground/70" />
                            <span className="font-medium text-foreground text-sm">{loja.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedCred.clientId || ''}
                              onChange={(e) => handleInputChange(loja.id, 'clientId', e.target.value)}
                              placeholder="Ex: client_abc123"
                              className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                            />
                          ) : (
                            <span className="text-sm text-foreground/80 font-mono">
                              {cred.clientId || <span className="text-muted-foreground italic">—</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <div className="relative">
                              <input
                                type={secrets.clientSecret ? 'text' : 'password'}
                                value={editedCred.clientSecret || ''}
                                onChange={(e) => handleInputChange(loja.id, 'clientSecret', e.target.value)}
                                placeholder="Ex: secret_xyz789"
                                className="w-full h-9 px-3 pr-10 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => toggleSecretVisibility(loja.id, 'clientSecret')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {secrets.clientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-foreground/80 font-mono">
                              {cred.clientSecret ? maskValue(cred.clientSecret) : <span className="text-muted-foreground italic">—</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <div className="relative">
                              <input
                                type={secrets.token ? 'text' : 'password'}
                                value={editedCred.token || ''}
                                onChange={(e) => handleInputChange(loja.id, 'token', e.target.value)}
                                placeholder="Token de acesso"
                                className="w-full h-9 px-3 pr-10 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => toggleSecretVisibility(loja.id, 'token')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {secrets.token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-foreground/80 font-mono">
                              {cred.token ? maskValue(cred.token) : <span className="text-muted-foreground italic">—</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(loja.id)}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveCredencial(loja.id)}
                                  className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:bg-green-500/10 rounded-lg transition-colors"
                                  title="Salvar"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => cancelEditing(loja.id)}
                                  className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                Clique para editar
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-secondary/30">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedLojas.length} de {sortedAndFilteredLojas.length} {sortedAndFilteredLojas.length === 1 ? 'loja' : 'lojas'}
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

export default GestaoCredenciaisIfood;
