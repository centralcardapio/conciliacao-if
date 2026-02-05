import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import Pagination from '@/components/Pagination';
import { Plus, Pencil, Trash2, X, Search, Store, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, Filter, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Regional {
  id: string;
  name: string;
}

interface Loja {
  id: string;
  name: string;
  erp_code: string;
  ifood_code: string;
  region_id: string;
}

type SortField = 'id' | 'name' | 'erp_code' | 'ifood_code' | 'region';
type SortDirection = 'asc' | 'desc';

const lojaSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  erp_code: z.string().trim().min(1, 'ID Loja ERP é obrigatório').max(50, 'ID Loja ERP deve ter no máximo 50 caracteres'),
  ifood_code: z.string().trim().min(1, 'ID Loja iFood é obrigatório').max(50, 'ID Loja iFood deve ter no máximo 50 caracteres'),
  region_id: z.string().min(1, 'Regional é obrigatória'),
});

const ITEMS_PER_PAGE = 50;

const Lojas: React.FC = () => {
  const { toast } = useToast();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null);
  const [deletingLoja, setDeletingLoja] = useState<Loja | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', erp_code: '', ifood_code: '', region_id: '' });
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
      // Fetch Lojas
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*');

      if (storesError) throw storesError;

      // Fetch Regionais
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('id, name')
        .order('name');

      if (regionsError) throw regionsError;

      setLojas(storesData || []);
      setRegionais(regionsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
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

  const getRegionalNome = (regionalId: string) => {
    return regionais.find(r => r.id === regionalId)?.name || '-';
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
    let filtered = lojas;

    // Filtro por Regional
    if (filterRegionalId) {
      filtered = filtered.filter(l => l.region_id === filterRegionalId);
    }

    // Busca por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(term) ||
        l.erp_code.toLowerCase().includes(term) ||
        l.ifood_code.toLowerCase().includes(term) ||
        getRegionalNome(l.region_id).toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, 'pt-BR');
      } else if (sortField === 'erp_code') {
        comparison = a.erp_code.localeCompare(b.erp_code, 'pt-BR');
      } else if (sortField === 'ifood_code') {
        comparison = a.ifood_code.localeCompare(b.ifood_code, 'pt-BR');
      } else {
        comparison = getRegionalNome(a.region_id).localeCompare(getRegionalNome(b.region_id), 'pt-BR');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [lojas, searchTerm, filterRegionalId, sortField, sortDirection, regionais]);

  const totalPages = Math.ceil(sortedAndFilteredLojas.length / ITEMS_PER_PAGE);
  const paginatedLojas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredLojas.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredLojas, currentPage]);

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
    setEditingLoja(null);
    setFormData({ name: '', erp_code: '', ifood_code: '', region_id: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (loja: Loja) => {
    setEditingLoja(loja);
    setFormData({
      name: loja.name,
      erp_code: loja.erp_code,
      ifood_code: loja.ifood_code,
      region_id: loja.region_id
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (loja: Loja) => {
    setDeletingLoja(loja);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLoja(null);
    setFormData({ name: '', erp_code: '', ifood_code: '', region_id: '' });
    setFormError('');
    setIsSubmitting(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingLoja(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = lojaSchema.safeParse(formData);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingLoja) {
        // Update
        const { error } = await supabase
          .from('stores')
          .update(formData)
          .eq('id', editingLoja.id);

        if (error) throw error;
        toast({ title: "Loja atualizada com sucesso" });
      } else {
        // Create
        const { error } = await supabase
          .from('stores')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Loja criada com sucesso" });
      }

      await fetchData(); // Refresh list
      closeModal();
    } catch (error: any) {
      console.error('Error saving store:', error);
      setFormError(error.message || "Erro ao salvar loja");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLoja) return;

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', deletingLoja.id);

      if (error) throw error;

      toast({ title: "Loja excluída com sucesso" });
      await fetchData();
      closeDeleteModal();
    } catch (error: any) {
      console.error('Error deleting store:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Layout title="Lojas">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Lojas</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as lojas do sistema. Cada loja pertence a uma regional.
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
                placeholder="Buscar por nome, ID ERP ou ID iFood..."
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
            Nova Loja
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
                          onClick={() => handleSort('erp_code')}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                        >
                          ID ERP
                          <SortIcon field="erp_code" />
                        </button>
                      </th>
                      <th className="text-left px-6 py-4">
                        <button
                          onClick={() => handleSort('ifood_code')}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                        >
                          ID iFood
                          <SortIcon field="ifood_code" />
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
                      <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-28">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedAndFilteredLojas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                              <Store className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-foreground font-medium">
                                {searchTerm ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {searchTerm ? 'Tente buscar por outro termo' : 'Clique em "Nova Loja" para começar'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedLojas.map((loja, index) => (
                        <tr
                          key={loja.id}
                          className="group hover:bg-secondary/40 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-foreground/5 rounded-lg flex items-center justify-center">
                                <Store className="w-4 h-4 text-foreground/70" />
                              </div>
                              <span className="font-medium text-foreground">{loja.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-muted-foreground">{loja.erp_code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-muted-foreground">{loja.ifood_code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                              {getRegionalNome(loja.region_id)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(loja)}
                                className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(loja)}
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
                totalItems={sortedAndFilteredLojas.length}
                itemsPerPage={ITEMS_PER_PAGE}
                itemLabel="loja"
              />
            </>
          )}
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
                  <Store className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {editingLoja ? 'Editar Loja' : 'Nova Loja'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{formError}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Nome da Loja
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Loja Centro, Loja Norte..."
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="erp_code" className="block text-sm font-medium text-foreground">
                  ID ERP
                </label>
                <input
                  id="erp_code"
                  type="text"
                  value={formData.erp_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, erp_code: e.target.value }))}
                  placeholder="Ex: ERP001"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="ifood_code" className="block text-sm font-medium text-foreground">
                  ID iFood
                </label>
                <input
                  id="ifood_code"
                  type="text"
                  value={formData.ifood_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, ifood_code: e.target.value }))}
                  placeholder="Ex: IF001"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="regional" className="block text-sm font-medium text-foreground">
                  Regional
                </label>
                <select
                  id="regional"
                  value={formData.region_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, region_id: e.target.value }))}
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                  disabled={isSubmitting}
                >
                  <option value="">Selecione uma regional</option>
                  {regionais.map(regional => (
                    <option key={regional.id} value={regional.id}>
                      {regional.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  A loja será vinculada à regional selecionada.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 h-11 px-4 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="flex-1 h-11 px-4 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingLoja ? 'Salvar Alterações' : 'Criar Loja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingLoja && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Excluir Loja</h2>
              <p className="text-muted-foreground mt-2">
                Tem certeza que deseja excluir a loja{' '}
                <strong className="text-foreground">{deletingLoja.name}</strong>?
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

export default Lojas;
