import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import Pagination from '@/components/Pagination';
import { Plus, Pencil, Trash2, X, Search, Users, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { z } from 'zod';
import { UserRole } from '@/types';

interface Regional {
  id: string;
  nome: string;
}

interface Loja {
  id: string;
  nome: string;
  regionalId: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: UserRole;
  regionalId: string;
  lojaId: string;
}

type SortField = 'id' | 'nome' | 'email' | 'tipo' | 'regional' | 'loja';
type SortDirection = 'asc' | 'desc';

const tipoOptions: { value: UserRole; label: string }[] = [
  { value: 'loja', label: 'Loja' },
  { value: 'regional', label: 'Regional' },
  { value: 'corporativo', label: 'Corporativo' },
];

const usuarioSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().trim().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  tipo: z.enum(['loja', 'regional', 'corporativo'], { required_error: 'Tipo é obrigatório' }),
  regionalId: z.string().min(1, 'Regional é obrigatória'),
  lojaId: z.string().min(1, 'Loja é obrigatória'),
});

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
];

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: '1', nome: 'João Silva', email: 'joao@empresa.com', tipo: 'loja', regionalId: '2', lojaId: '1' },
    { id: '2', nome: 'Maria Santos', email: 'maria@empresa.com', tipo: 'regional', regionalId: '1', lojaId: '3' },
    { id: '3', nome: 'Carlos Oliveira', email: 'carlos@empresa.com', tipo: 'corporativo', regionalId: '5', lojaId: '2' },
    { id: '4', nome: 'Ana Costa', email: 'ana@empresa.com', tipo: 'loja', regionalId: '3', lojaId: '4' },
    { id: '5', nome: 'Pedro Lima', email: 'pedro@empresa.com', tipo: 'regional', regionalId: '2', lojaId: '5' },
  ]);

  const [regionais] = useState<Regional[]>(mockRegionais);
  const [lojas] = useState<Loja[]>(mockLojas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ nome: '', email: '', tipo: '' as UserRole | '', regionalId: '', lojaId: '' });
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegionalId, setFilterRegionalId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const getRegionalNome = (regionalId: string) => {
    return regionais.find(r => r.id === regionalId)?.nome || '-';
  };

  const getLojaNome = (lojaId: string) => {
    return lojas.find(l => l.id === lojaId)?.nome || '-';
  };

  const getTipoLabel = (tipo: UserRole) => {
    return tipoOptions.find(t => t.value === tipo)?.label || '-';
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

  const sortedAndFilteredUsuarios = useMemo(() => {
    let filtered = usuarios;
    
    // Filtro por Regional
    if (filterRegionalId) {
      filtered = filtered.filter(u => u.regionalId === filterRegionalId);
    }
    
    // Busca por texto (nome, email, tipo, regional, loja)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        getTipoLabel(u.tipo).toLowerCase().includes(term) ||
        getRegionalNome(u.regionalId).toLowerCase().includes(term) ||
        getLojaNome(u.lojaId).toLowerCase().includes(term)
      );
    }
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = Number(a.id) - Number(b.id);
      } else if (sortField === 'nome') {
        comparison = a.nome.localeCompare(b.nome, 'pt-BR');
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email, 'pt-BR');
      } else if (sortField === 'tipo') {
        comparison = getTipoLabel(a.tipo).localeCompare(getTipoLabel(b.tipo), 'pt-BR');
      } else if (sortField === 'regional') {
        comparison = getRegionalNome(a.regionalId).localeCompare(getRegionalNome(b.regionalId), 'pt-BR');
      } else {
        comparison = getLojaNome(a.lojaId).localeCompare(getLojaNome(b.lojaId), 'pt-BR');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [usuarios, searchTerm, filterRegionalId, sortField, sortDirection, regionais, lojas]);

  const totalPages = Math.ceil(sortedAndFilteredUsuarios.length / ITEMS_PER_PAGE);
  const paginatedUsuarios = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredUsuarios.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredUsuarios, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterRegionalChange = (value: string) => {
    setFilterRegionalId(value);
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

  const openCreateModal = () => {
    setEditingUsuario(null);
    setFormData({ nome: '', email: '', tipo: '', regionalId: '', lojaId: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({ 
      nome: usuario.nome, 
      email: usuario.email, 
      tipo: usuario.tipo,
      regionalId: usuario.regionalId, 
      lojaId: usuario.lojaId 
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (usuario: Usuario) => {
    setDeletingUsuario(usuario);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUsuario(null);
    setFormData({ nome: '', email: '', tipo: '', regionalId: '', lojaId: '' });
    setFormError('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUsuario(null);
  };

  const handleRegionalChange = (regionalId: string) => {
    setFormData(prev => ({ ...prev, regionalId, lojaId: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = usuarioSchema.safeParse(formData);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    if (editingUsuario) {
      setUsuarios(prev =>
        prev.map(u =>
          u.id === editingUsuario.id 
            ? { 
                ...u, 
                nome: formData.nome.trim(), 
                email: formData.email.trim(),
                tipo: formData.tipo as UserRole,
                regionalId: formData.regionalId,
                lojaId: formData.lojaId 
              } 
            : u
        )
      );
    } else {
      const newUsuario: Usuario = {
        id: Date.now().toString(),
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        tipo: formData.tipo as UserRole,
        regionalId: formData.regionalId,
        lojaId: formData.lojaId,
      };
      setUsuarios(prev => [...prev, newUsuario]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deletingUsuario) {
      setUsuarios(prev => prev.filter(u => u.id !== deletingUsuario.id));
      closeDeleteModal();
    }
  };

  return (
    <Layout title="Usuários">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os usuários do sistema. Cada usuário está vinculado a uma regional e loja.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between animate-fade-in">
          <div className="flex flex-1 gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, email, loja ou tipo..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-11 pl-12 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={filterRegionalId}
                onChange={(e) => handleFilterRegionalChange(e.target.value)}
                className="h-11 pl-9 pr-8 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">Todas Regionais</option>
                {regionais.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={openCreateModal} 
            className="h-11 px-4 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground/5 border-b border-border">
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('nome')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Nome
                      <SortIcon field="nome" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Email
                      <SortIcon field="email" />
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
                      onClick={() => handleSort('tipo')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      Tipo
                      <SortIcon field="tipo" />
                    </button>
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-28">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedAndFilteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm ? 'Tente buscar por outro termo' : 'Clique em "Novo Usuário" para começar'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsuarios.map((usuario, index) => (
                    <tr 
                      key={usuario.id} 
                      className="group hover:bg-secondary/40 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-foreground/5 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-foreground">
                              {usuario.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{usuario.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground">{usuario.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                          {getRegionalNome(usuario.regionalId)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                          {getLojaNome(usuario.lojaId)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-foreground/10 rounded-md text-sm font-medium text-foreground">
                          {getTipoLabel(usuario.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(usuario)}
                            className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(usuario)}
                            className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedAndFilteredUsuarios.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="usuário"
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-foreground/5 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
              </div>
              <button 
                onClick={closeModal} 
                className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{formError}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium text-foreground">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome completo"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@empresa.com"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tipo" className="block text-sm font-medium text-foreground">
                  Tipo de Usuário
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as UserRole }))}
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                >
                  <option value="">Selecione o tipo</option>
                  {tipoOptions.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="regional" className="block text-sm font-medium text-foreground">
                  Regional
                </label>
                <select
                  id="regional"
                  value={formData.regionalId}
                  onChange={(e) => handleRegionalChange(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                >
                  <option value="">Selecione uma regional</option>
                  {regionais.map(regional => (
                    <option key={regional.id} value={regional.id}>
                      {regional.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="loja" className="block text-sm font-medium text-foreground">
                  Loja
                </label>
                <select
                  id="loja"
                  value={formData.lojaId}
                  onChange={(e) => setFormData(prev => ({ ...prev, lojaId: e.target.value }))}
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.regionalId}
                >
                  <option value="">
                    {formData.regionalId ? 'Selecione uma loja' : 'Selecione uma regional primeiro'}
                  </option>
                  {filteredLojasByRegional.map(loja => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  As lojas disponíveis dependem da regional selecionada.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 h-11 px-4 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 h-11 px-4 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors">
                  {editingUsuario ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingUsuario && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Excluir Usuário</h2>
              <p className="text-muted-foreground mt-2">
                Tem certeza que deseja excluir o usuário{' '}
                <strong className="text-foreground">{deletingUsuario.nome}</strong>?
              </p>
              <p className="text-sm text-muted-foreground mt-3 p-3 bg-secondary/50 rounded-lg">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={closeDeleteModal} className="flex-1 h-11 px-4 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 h-11 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Usuarios;
