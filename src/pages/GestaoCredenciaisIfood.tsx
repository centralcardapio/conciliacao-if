import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Search, Key, Store, Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
interface Regional {
  id: string;
  nome: string;
}
interface Loja {
  id: string;
  nome: string;
  regionalId: string;
}
interface Credencial {
  id: string;
  lojaId: string;
  regionalId: string;
  clientId: string;
  clientSecret: string;
  token: string;
}
type SortField = 'id' | 'loja' | 'regional';
type SortDirection = 'asc' | 'desc';
const ITEMS_PER_PAGE = 10;
const credencialSchema = z.object({
  regionalId: z.string().min(1, 'Regional é obrigatória'),
  lojaId: z.string().min(1, 'Loja é obrigatória'),
  clientId: z.string().trim().min(1, 'Client ID é obrigatório').max(100, 'Client ID deve ter no máximo 100 caracteres'),
  clientSecret: z.string().trim().min(1, 'Client Secret é obrigatório').max(200, 'Client Secret deve ter no máximo 200 caracteres'),
  token: z.string().trim().max(500, 'Token deve ter no máximo 500 caracteres').optional()
});

// Mock regionais
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

// Mock lojas
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
  nome: 'Loja Shopping',
  regionalId: '2'
}, {
  id: '7',
  nome: 'Loja Aeroporto',
  regionalId: '1'
}, {
  id: '8',
  nome: 'Loja Rodoviária',
  regionalId: '4'
}];

// Mock credenciais iniciais
const mockCredenciais: Credencial[] = [{
  id: '1',
  lojaId: '1',
  regionalId: '2',
  clientId: 'client_abc123',
  clientSecret: 'secret_xyz789',
  token: 'token_loja1_active'
}, {
  id: '2',
  lojaId: '2',
  regionalId: '5',
  clientId: 'client_def456',
  clientSecret: 'secret_uvw012',
  token: ''
}, {
  id: '3',
  lojaId: '5',
  regionalId: '2',
  clientId: 'client_jkl012',
  clientSecret: 'secret_rst345',
  token: 'token_loja5_active'
}, {
  id: '4',
  lojaId: '7',
  regionalId: '1',
  clientId: 'client_mno345',
  clientSecret: 'secret_opq678',
  token: ''
}];
const GestaoCredenciaisIfood: React.FC = () => {
  const [regionais] = useState<Regional[]>(mockRegionais);
  const [lojas] = useState<Loja[]>(mockLojas);
  const [credenciais, setCredenciais] = useState<Credencial[]>(mockCredenciais);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCredencial, setEditingCredencial] = useState<Credencial | null>(null);
  const [deletingCredencial, setDeletingCredencial] = useState<Credencial | null>(null);
  const [formData, setFormData] = useState({
    regionalId: '',
    lojaId: '',
    clientId: '',
    clientSecret: '',
    token: ''
  });
  const [formError, setFormError] = useState('');
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const getRegionalNome = (regionalId: string) => {
    return regionais.find(r => r.id === regionalId)?.nome || '-';
  };
  const getLojaNome = (lojaId: string) => {
    return lojas.find(l => l.id === lojaId)?.nome || '-';
  };
  const filteredLojasByRegional = useMemo(() => {
    if (!formData.regionalId) return [];
    return lojas.filter(l => l.regionalId === formData.regionalId);
  }, [formData.regionalId, lojas]);
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  const sortedAndFilteredCredenciais = useMemo(() => {
    const filtered = credenciais.filter(c => {
      const lojaNome = getLojaNome(c.lojaId).toLowerCase();
      const regionalNome = getRegionalNome(c.regionalId).toLowerCase();
      const search = searchTerm.toLowerCase();
      return lojaNome.includes(search) || regionalNome.includes(search) || c.clientId.toLowerCase().includes(search);
    });
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = Number(a.id) - Number(b.id);
      } else if (sortField === 'loja') {
        comparison = getLojaNome(a.lojaId).localeCompare(getLojaNome(b.lojaId), 'pt-BR');
      } else if (sortField === 'regional') {
        comparison = getRegionalNome(a.regionalId).localeCompare(getRegionalNome(b.regionalId), 'pt-BR');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [credenciais, searchTerm, sortField, sortDirection]);
  const totalPages = Math.ceil(sortedAndFilteredCredenciais.length / ITEMS_PER_PAGE);
  const paginatedCredenciais = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredCredenciais.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredCredenciais, currentPage]);
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
  const maskValue = (value: string) => {
    if (!value) return '—';
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };
  const openCreateModal = () => {
    setEditingCredencial(null);
    setFormData({
      regionalId: '',
      lojaId: '',
      clientId: '',
      clientSecret: '',
      token: ''
    });
    setFormError('');
    setShowClientSecret(false);
    setShowToken(false);
    setIsModalOpen(true);
  };
  const openEditModal = (credencial: Credencial) => {
    setEditingCredencial(credencial);
    setFormData({
      regionalId: credencial.regionalId,
      lojaId: credencial.lojaId,
      clientId: credencial.clientId,
      clientSecret: credencial.clientSecret,
      token: credencial.token
    });
    setFormError('');
    setShowClientSecret(false);
    setShowToken(false);
    setIsModalOpen(true);
  };
  const openDeleteModal = (credencial: Credencial) => {
    setDeletingCredencial(credencial);
    setIsDeleteModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCredencial(null);
    setFormData({
      regionalId: '',
      lojaId: '',
      clientId: '',
      clientSecret: '',
      token: ''
    });
    setFormError('');
    setShowClientSecret(false);
    setShowToken(false);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCredencial(null);
  };
  const handleRegionalChange = (regionalId: string) => {
    setFormData(prev => ({
      ...prev,
      regionalId,
      lojaId: ''
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const result = credencialSchema.safeParse(formData);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    // Check if loja already has credentials (when creating new)
    if (!editingCredencial) {
      const existingCred = credenciais.find(c => c.lojaId === formData.lojaId);
      if (existingCred) {
        setFormError('Esta loja já possui credenciais cadastradas.');
        return;
      }
    }
    if (editingCredencial) {
      setCredenciais(prev => prev.map(c => c.id === editingCredencial.id ? {
        ...c,
        regionalId: formData.regionalId,
        lojaId: formData.lojaId,
        clientId: formData.clientId.trim(),
        clientSecret: formData.clientSecret.trim(),
        token: formData.token.trim()
      } : c));
      toast.success('Credencial atualizada com sucesso!');
    } else {
      const newCredencial: Credencial = {
        id: Date.now().toString(),
        regionalId: formData.regionalId,
        lojaId: formData.lojaId,
        clientId: formData.clientId.trim(),
        clientSecret: formData.clientSecret.trim(),
        token: formData.token.trim()
      };
      setCredenciais(prev => [...prev, newCredencial]);
      toast.success('Credencial cadastrada com sucesso!');
    }
    closeModal();
  };
  const handleDelete = () => {
    if (deletingCredencial) {
      setCredenciais(prev => prev.filter(c => c.id !== deletingCredencial.id));
      toast.success('Credencial excluída com sucesso!');
      closeDeleteModal();
    }
  };
  return <Layout title="Credenciais iFood">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Credenciais iFood</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as credenciais de integração iFood para cada loja.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" placeholder="Buscar por loja, regional ou client ID..." value={searchTerm} onChange={e => handleSearchChange(e.target.value)} className="w-full h-11 pl-12 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all" />
          </div>
          <button onClick={openCreateModal} className="h-11 px-4 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Credencial
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground/5 border-b border-border">
                  <th className="text-left px-4 py-4 w-20">
                    <button onClick={() => handleSort('id')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      ID
                      <SortIcon field="id" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-4">
                    <button onClick={() => handleSort('regional')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Regional
                      <SortIcon field="regional" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-4">
                    <button onClick={() => handleSort('loja')} className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors">
                      Loja
                      <SortIcon field="loja" />
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
                  <th className="text-right px-4 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-28">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedAndFilteredCredenciais.length === 0 ? <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <Key className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {searchTerm ? 'Nenhuma credencial encontrada' : 'Nenhuma credencial cadastrada'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm ? 'Tente buscar por outro termo' : 'Clique em "Nova Credencial" para começar'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr> : paginatedCredenciais.map((cred, index) => <tr key={cred.id} className="group hover:bg-secondary/40 transition-colors" style={{
                animationDelay: `${index * 50}ms`
              }}>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-secondary rounded-lg text-xs font-mono text-muted-foreground">
                          {cred.id}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                          {getRegionalNome(cred.regionalId)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-foreground/70" />
                          <span className="font-medium text-foreground text-sm">{getLojaNome(cred.lojaId)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-foreground/80 font-mono">
                          {cred.clientId || <span className="text-muted-foreground italic">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-foreground/80 font-mono">
                          {maskValue(cred.clientSecret)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-foreground/80 font-mono">
                          {maskValue(cred.token)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(cred)} className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(cred)} className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-secondary/30">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedCredenciais.length} de {sortedAndFilteredCredenciais.length} {sortedAndFilteredCredenciais.length === 1 ? 'credencial' : 'credenciais'}
            </span>
            
            {totalPages > 1 && <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({
                length: totalPages
              }, (_, i) => i + 1).map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-foreground text-background' : 'border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                      {page}
                    </button>)}
                </div>
                
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-foreground/5 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {editingCredencial ? 'Editar Credencial' : 'Nova Credencial'}
                </h2>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{formError}</p>
                </div>}
              
              <div className="space-y-2">
                <label htmlFor="regional" className="block text-sm font-medium text-foreground">
                  Regional
                </label>
                <select id="regional" value={formData.regionalId} onChange={e => handleRegionalChange(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all">
                  <option value="">Selecione uma regional</option>
                  {regionais.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="loja" className="block text-sm font-medium text-foreground">
                  Loja
                </label>
                <select id="loja" value={formData.lojaId} onChange={e => setFormData(prev => ({
              ...prev,
              lojaId: e.target.value
            }))} disabled={!formData.regionalId} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">
                    {formData.regionalId ? 'Selecione uma loja' : 'Selecione uma regional primeiro'}
                  </option>
                  {filteredLojasByRegional.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="clientId" className="block text-sm font-medium text-foreground">
                  Client ID
                </label>
                <input id="clientId" type="text" value={formData.clientId} onChange={e => setFormData(prev => ({
              ...prev,
              clientId: e.target.value
            }))} placeholder="Ex: client_abc123" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all font-mono" />
              </div>

              <div className="space-y-2">
                <label htmlFor="clientSecret" className="block text-sm font-medium text-foreground">
                  Client Secret
                </label>
                <div className="relative">
                  <input id="clientSecret" type={showClientSecret ? 'text' : 'password'} value={formData.clientSecret} onChange={e => setFormData(prev => ({
                ...prev,
                clientSecret: e.target.value
              }))} placeholder="Ex: secret_xyz789" className="w-full h-11 px-4 pr-12 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all font-mono" />
                  <button type="button" onClick={() => setShowClientSecret(!showClientSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showClientSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="token" className="block text-sm font-medium text-foreground">
                  Token <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <input id="token" type={showToken ? 'text' : 'password'} value={formData.token} onChange={e => setFormData(prev => ({
                ...prev,
                token: e.target.value
              }))} placeholder="Token de acesso" className="w-full h-11 px-4 pr-12 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all font-mono" />
                  <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 h-11 px-4 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 h-11 px-4 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors">
                  {editingCredencial ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingCredencial && <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Excluir Credencial</h3>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja excluir as credenciais de <strong>{getLojaNome(deletingCredencial.lojaId)}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button onClick={closeDeleteModal} className="flex-1 h-11 px-4 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleDelete} className="flex-1 h-11 px-4 bg-destructive text-destructive-foreground font-medium rounded-lg hover:bg-destructive/90 transition-colors">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>}
    </Layout>;
};
export default GestaoCredenciaisIfood;