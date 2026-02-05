import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import Pagination from '@/components/Pagination';
import { Plus, Pencil, Trash2, X, Search, Map, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Regional {
  id: string;
  name: string;
  created_at?: string;
}

type SortField = 'id' | 'name';
type SortDirection = 'asc' | 'desc';

const regionalSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
});

const ITEMS_PER_PAGE = 50;

const Regionais: React.FC = () => {
  const { toast } = useToast();
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRegional, setEditingRegional] = useState<Regional | null>(null);
  const [deletingRegional, setDeletingRegional] = useState<Regional | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch Data
  const fetchRegionais = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setRegionais(data || []);
    } catch (error: any) {
      console.error('Error fetching regions:', error);
      toast({
        title: "Erro ao carregar regionais",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionais();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedAndFilteredRegionais = useMemo(() => {
    const filtered = regionais.filter(r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      // Basic comparison
      comparison = a.name.localeCompare(b.name, 'pt-BR');

      // If sorting by ID (which is UUID now), strictly speaking we might want alphabetical too or creation date
      if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [regionais, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedAndFilteredRegionais.length / ITEMS_PER_PAGE);
  const paginatedRegionais = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredRegionais.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFilteredRegionais, currentPage]);

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

  const openCreateModal = () => {
    setEditingRegional(null);
    setFormData({ name: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (regional: Regional) => {
    setEditingRegional(regional);
    setFormData({ name: regional.name });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (regional: Regional) => {
    setDeletingRegional(regional);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRegional(null);
    setFormData({ name: '' });
    setFormError('');
    setIsSubmitting(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingRegional(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = regionalSchema.safeParse(formData);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingRegional) {
        // Update
        const { error } = await supabase
          .from('regions')
          .update({ name: formData.name.trim() })
          .eq('id', editingRegional.id);

        if (error) throw error;

        toast({ title: "Regional atualizada com sucesso" });
      } else {
        // Create
        const { error } = await supabase
          .from('regions')
          .insert([{ name: formData.name.trim() }]);

        if (error) throw error;

        toast({ title: "Regional criada com sucesso" });
      }

      await fetchRegionais();
      closeModal();
    } catch (error: any) {
      console.error('Error saving regional:', error);
      setFormError(error.message || "Erro ao salvar regional");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRegional) return;

    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', deletingRegional.id);

      if (error) throw error;

      toast({ title: "Regional excluída com sucesso" });
      await fetchRegionais();
      closeDeleteModal();
    } catch (error: any) {
      console.error('Error deleting regional:', error);
      // Check for foreign key constraint violation (usually code 23503)
      if (error.code === '23503') {
        toast({
          title: "Não é possível excluir",
          description: "Esta regional possui lojas vinculadas.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Layout title="Regionais">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Map className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Regionais</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as regionais do sistema. Cada regional agrupa múltiplas lojas.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar regional por nome..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="h-11 px-4 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Regional
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
                      <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-28">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedAndFilteredRegionais.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                              <Map className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-foreground font-medium">
                                {searchTerm ? 'Nenhuma regional encontrada' : 'Nenhuma regional cadastrada'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {searchTerm ? 'Tente buscar por outro termo' : 'Clique em "Nova Regional" para começar'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRegionais.map((regional, index) => (
                        <tr
                          key={regional.id}
                          className="group hover:bg-secondary/40 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-foreground/5 rounded-lg flex items-center justify-center">
                                <Map className="w-4 h-4 text-foreground/70" />
                              </div>
                              <span className="font-medium text-foreground">{regional.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(regional)}
                                className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(regional)}
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
                totalItems={sortedAndFilteredRegionais.length}
                itemsPerPage={ITEMS_PER_PAGE}
                itemLabel="regional"
                itemLabelPlural="regionais"
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
                  <Map className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {editingRegional ? 'Editar Regional' : 'Nova Regional'}
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
                  Nome da Regional
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Ex: Sul, Sudeste, Centro-Oeste..."
                  className="form-input"
                  autoFocus
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  O nome deve ser único e identificar claramente a região geográfica.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingRegional ? 'Salvar Alterações' : 'Criar Regional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingRegional && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Excluir Regional</h2>
              <p className="text-muted-foreground mt-2">
                Tem certeza que deseja excluir a regional{' '}
                <strong className="text-foreground">{deletingRegional.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground mt-3 p-3 bg-secondary/50 rounded-lg">
                Esta ação não pode ser desfeita. Todas as lojas vinculadas a esta regional precisarão ser reatribuídas.
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={closeDeleteModal} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground font-medium rounded-lg hover:bg-destructive/90 transition-colors"
                disabled={isSubmitting}
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

export default Regionais;
