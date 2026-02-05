import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import Pagination from '@/components/Pagination';
import { Plus, Pencil, Trash2, X, Search, Users, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, Filter, Loader2, Key } from 'lucide-react';
import { z } from 'zod';
import { UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Regional {
  id: string;
  name: string;
}

interface Loja {
  id: string;
  name: string;
  region_id: string;
}

interface Usuario {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  region_id: string | null;
  store_id: string | null;
}

type SortField = 'id' | 'name' | 'email' | 'role' | 'region' | 'store';
type SortDirection = 'asc' | 'desc';

const tipoOptions: { value: UserRole; label: string }[] = [
  { value: 'store', label: 'Loja' },
  { value: 'regional', label: 'Regional' },
  { value: 'corporate', label: 'Corporativo' },
];

const usuarioSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['store', 'regional', 'corporate'], { required_error: 'Tipo é obrigatório' }),
  region_id: z.string().optional().nullable(),
  store_id: z.string().optional().nullable(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
});

const ITEMS_PER_PAGE = 50;

const Usuarios: React.FC = () => {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'store' as UserRole,
    region_id: '',
    store_id: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegionalId, setFilterRegionalId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profiles (Users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;

      // 2. Fetch Regions
      const { data: regions, error: regionsError } = await supabase
        .from('regions')
        .select('id, name')
        .order('name');
      if (regionsError) throw regionsError;

      // 3. Fetch Stores
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, region_id')
        .order('name');
      if (storesError) throw storesError;

      setUsuarios(profiles || []);
      setRegionais(regions || []);
      setLojas(stores || []);

    } catch (error: any) {
      console.error('Error fetching users data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRegionalNome = (regionalId: string | null) => {
    if (!regionalId) return '-';
    return regionais.find(r => r.id === regionalId)?.name || '-';
  };

  const getLojaNome = (lojaId: string | null) => {
    if (!lojaId) return '-';
    return lojas.find(l => l.id === lojaId)?.name || '-';
  };

  const getTipoLabel = (tipo: UserRole) => {
    return tipoOptions.find(t => t.value === tipo)?.label || tipo;
  };

  const filteredLojasByRegional = useMemo(() => {
    if (!formData.region_id) return [];
    return lojas.filter(l => l.region_id === formData.region_id);
  }, [formData.region_id, lojas]);

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
      filtered = filtered.filter(u => u.region_id === filterRegionalId);
    }

    // Busca por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name?.toLowerCase() || '').includes(term) ||
        (u.email?.toLowerCase() || '').includes(term) ||
        getTipoLabel(u.role).toLowerCase().includes(term) ||
        getRegionalNome(u.region_id).toLowerCase().includes(term) ||
        getLojaNome(u.store_id).toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '', 'pt-BR');
      } else if (sortField === 'email') {
        comparison = (a.email || '').localeCompare(b.email || '', 'pt-BR');
      } else if (sortField === 'role') {
        comparison = getTipoLabel(a.role).localeCompare(getTipoLabel(b.role), 'pt-BR');
      } else if (sortField === 'region') {
        comparison = getRegionalNome(a.region_id).localeCompare(getRegionalNome(b.region_id), 'pt-BR');
      } else {
        comparison = getLojaNome(a.store_id).localeCompare(getLojaNome(b.store_id), 'pt-BR');
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
    setFormData({
      name: '',
      email: '',
      role: 'store',
      region_id: '',
      store_id: '',
      password: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      name: usuario.name || '',
      email: usuario.email || '',
      role: usuario.role,
      region_id: usuario.region_id || '',
      store_id: usuario.store_id || '',
      password: '' // Don't show password on edit
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
    setFormData({ name: '', email: '', role: 'store', region_id: '', store_id: '', password: '' });
    setFormError('');
    setIsSubmitting(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUsuario(null);
  };

  const handleRegionalChange = (regionalId: string) => {
    setFormData(prev => ({ ...prev, region_id: regionalId, store_id: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = usuarioSchema.safeParse(formData);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    if (!editingUsuario && !formData.password) {
      setFormError('Senha é obrigatória para novos usuários');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUsuario) {
        // Update Profile
        const updateData: any = {
          name: formData.name.trim(),
          role: formData.role,
          region_id: formData.region_id || null,
          store_id: formData.store_id || null
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingUsuario.id);

        if (error) throw error;
        toast({ title: "Usuário atualizado com sucesso" });
      } else {
        // Create User (via Edge Function)
        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email.trim(),
            password: formData.password,
            name: formData.name.trim(),
            role: formData.role,
            region_id: formData.region_id || null,
            store_id: formData.store_id || null
          }
        });

        if (error) throw new Error(error.message || 'Erro ao chamar função de criação');
        if (data?.error) throw new Error(data.error);

        toast({ title: "Usuário criado com sucesso!" });
      }

      await fetchData();
      closeModal();
    } catch (error: any) {
      console.error('Error saving user:', error);
      setFormError(error.message || "Erro ao salvar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUsuario) return;
    setIsSubmitting(true);

    try {
      // NOTE: Strictly speaking we should delete from auth.users via Edge Function.
      // But deleting the profile is often enough to break access in RLS app logic.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deletingUsuario.id);

      if (error) throw error;

      toast({
        title: "Perfil desativado",
        description: "O usuário foi removido da lista."
      });

      await fetchData();
      closeDeleteModal();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
                  <option key={r.id} value={r.id}>{r.name}</option>
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
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-foreground/5 border-b border-border">
                      <th className="text-left px-6 py-4">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                        >
                          Nome
                          <SortIcon field="name" />
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
                          onClick={() => handleSort('region')}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                        >
                          Regional
                          <SortIcon field="region" />
                        </button>
                      </th>
                      <th className="text-left px-6 py-4">
                        <button
                          onClick={() => handleSort('store')}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                        >
                          Loja
                          <SortIcon field="store" />
                        </button>
                      </th>
                      <th className="text-left px-6 py-4">
                        <button
                          onClick={() => handleSort('role')}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                        >
                          Tipo
                          <SortIcon field="role" />
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
                                Clique em "Novo Usuário" para começar
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
                                  {(usuario.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-foreground">{usuario.name || 'Sem nome'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-muted-foreground">{usuario.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                              {getRegionalNome(usuario.region_id)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                              {getLojaNome(usuario.store_id)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-1 bg-foreground/10 rounded-md text-sm font-medium text-foreground">
                              {getTipoLabel(usuario.role)}
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
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label htmlFor="nome" className="block text-sm font-medium text-foreground">
                    Nome Completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: João da Silva"
                    className="form-input w-full"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@empresa.com"
                    className="form-input w-full"
                    disabled={isSubmitting || !!editingUsuario}
                  />
                  {editingUsuario && <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>}
                </div>

                {!editingUsuario && (
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Senha Inicial
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        className="form-input w-full pl-9"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="tipo" className="block text-sm font-medium text-foreground">
                  Nível de Acesso
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {tipoOptions.map(tipo => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: tipo.value }))}
                      disabled={isSubmitting}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                        ${formData.role === tipo.value
                          ? 'bg-foreground/5 border-foreground text-foreground ring-1 ring-foreground'
                          : 'bg-background border-border text-muted-foreground hover:bg-secondary/50'}
                      `}
                    >
                      <span className="font-medium">{tipo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="regional" className="block text-sm font-medium text-foreground">
                    Regional
                  </label>
                  <select
                    id="regional"
                    value={formData.region_id}
                    onChange={(e) => handleRegionalChange(e.target.value)}
                    className="form-select w-full"
                    disabled={isSubmitting || formData.role === 'corporate'}
                  >
                    <option value="">Selecione...</option>
                    {regionais.map(regional => (
                      <option key={regional.id} value={regional.id}>
                        {regional.name}
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
                    value={formData.store_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, store_id: e.target.value }))}
                    className="form-select w-full"
                    disabled={!formData.region_id || isSubmitting || formData.role === 'corporate' || formData.role === 'regional'}
                  >
                    <option value="">Selecione...</option>
                    {filteredLojasByRegional.map(loja => (
                      <option key={loja.id} value={loja.id}>
                        {loja.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
                <strong className="text-foreground">{deletingUsuario.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground mt-3 p-3 bg-secondary/50 rounded-lg">
                O usuário perderá acesso ao sistema imediatamente.
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={closeDeleteModal}
                className="flex-1 h-11 px-4 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
