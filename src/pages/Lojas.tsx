import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Plus, Pencil, Trash2, X, Search, Store, AlertTriangle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { z } from 'zod';

interface Regional {
  id: string;
  nome: string;
}

interface Loja {
  id: string;
  nome: string;
  idLojaErp: string;
  idLojaIfood: string;
  regionalId: string;
}

type SortField = 'id' | 'nome' | 'idLojaErp' | 'idLojaIfood' | 'regional';
type SortDirection = 'asc' | 'desc';

const lojaSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  idLojaErp: z.string().trim().min(1, 'ID Loja ERP é obrigatório').max(50, 'ID Loja ERP deve ter no máximo 50 caracteres'),
  idLojaIfood: z.string().trim().min(1, 'ID Loja iFood é obrigatório').max(50, 'ID Loja iFood deve ter no máximo 50 caracteres'),
  regionalId: z.string().min(1, 'Regional é obrigatória'),
});

const ITEMS_PER_PAGE = 10;

// Mock regionais para o select
const mockRegionais: Regional[] = [
  { id: '1', nome: 'Sul' },
  { id: '2', nome: 'Sudeste' },
  { id: '3', nome: 'Centro-Oeste' },
  { id: '4', nome: 'Nordeste' },
  { id: '5', nome: 'Norte' },
];

const Lojas: React.FC = () => {
  const [lojas, setLojas] = useState<Loja[]>([
    { id: '1', nome: 'Loja Centro', idLojaErp: 'ERP001', idLojaIfood: 'IF001', regionalId: '2' },
    { id: '2', nome: 'Loja Norte', idLojaErp: 'ERP002', idLojaIfood: 'IF002', regionalId: '5' },
    { id: '3', nome: 'Loja Sul', idLojaErp: 'ERP003', idLojaIfood: 'IF003', regionalId: '1' },
    { id: '4', nome: 'Loja Oeste', idLojaErp: 'ERP004', idLojaIfood: 'IF004', regionalId: '3' },
    { id: '5', nome: 'Loja Leste', idLojaErp: 'ERP005', idLojaIfood: 'IF005', regionalId: '2' },
  ]);

  const [regionais] = useState<Regional[]>(mockRegionais);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null);
  const [deletingLoja, setDeletingLoja] = useState<Loja | null>(null);
  const [formData, setFormData] = useState({ nome: '', idLojaErp: '', idLojaIfood: '', regionalId: '' });
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const getRegionalNome = (regionalId: string) => {
    return regionais.find(r => r.id === regionalId)?.nome || '-';
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
      l.idLojaErp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.idLojaIfood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRegionalNome(l.regionalId).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = Number(a.id) - Number(b.id);
      } else if (sortField === 'nome') {
        comparison = a.nome.localeCompare(b.nome, 'pt-BR');
      } else if (sortField === 'idLojaErp') {
        comparison = a.idLojaErp.localeCompare(b.idLojaErp, 'pt-BR');
      } else if (sortField === 'idLojaIfood') {
        comparison = a.idLojaIfood.localeCompare(b.idLojaIfood, 'pt-BR');
      } else {
        comparison = getRegionalNome(a.regionalId).localeCompare(getRegionalNome(b.regionalId), 'pt-BR');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [lojas, searchTerm, sortField, sortDirection, regionais]);

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

  const openCreateModal = () => {
    setEditingLoja(null);
    setFormData({ nome: '', idLojaErp: '', idLojaIfood: '', regionalId: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (loja: Loja) => {
    setEditingLoja(loja);
    setFormData({ nome: loja.nome, idLojaErp: loja.idLojaErp, idLojaIfood: loja.idLojaIfood, regionalId: loja.regionalId });
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
    setFormData({ nome: '', idLojaErp: '', idLojaIfood: '', regionalId: '' });
    setFormError('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingLoja(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = lojaSchema.safeParse(formData);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    if (editingLoja) {
      setLojas(prev =>
        prev.map(l =>
          l.id === editingLoja.id 
            ? { 
                ...l, 
                nome: formData.nome.trim(), 
                idLojaErp: formData.idLojaErp.trim(),
                idLojaIfood: formData.idLojaIfood.trim(),
                regionalId: formData.regionalId 
              } 
            : l
        )
      );
    } else {
      const newLoja: Loja = {
        id: Date.now().toString(),
        nome: formData.nome.trim(),
        idLojaErp: formData.idLojaErp.trim(),
        idLojaIfood: formData.idLojaIfood.trim(),
        regionalId: formData.regionalId,
      };
      setLojas(prev => [...prev, newLoja]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deletingLoja) {
      setLojas(prev => prev.filter(l => l.id !== deletingLoja.id));
      closeDeleteModal();
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar loja por nome ou regional..."
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
            Nova Loja
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground/5 border-b border-border">
                  <th className="text-left px-6 py-4 w-24">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      ID
                      <SortIcon field="id" />
                    </button>
                  </th>
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
                      onClick={() => handleSort('idLojaErp')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      ID ERP
                      <SortIcon field="idLojaErp" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort('idLojaIfood')}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-foreground/80 transition-colors"
                    >
                      ID iFood
                      <SortIcon field="idLojaIfood" />
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
                  <th className="text-right px-6 py-4 text-xs font-semibold text-foreground uppercase tracking-wider w-28">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedAndFilteredLojas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
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
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-secondary rounded-lg text-xs font-mono text-muted-foreground">
                          {loja.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-foreground/5 rounded-lg flex items-center justify-center">
                            <Store className="w-4 h-4 text-foreground/70" />
                          </div>
                          <span className="font-medium text-foreground">{loja.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-muted-foreground">{loja.idLojaErp}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-muted-foreground">{loja.idLojaIfood}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-secondary rounded-md text-sm text-foreground">
                          {getRegionalNome(loja.regionalId)}
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
                <label htmlFor="nome" className="block text-sm font-medium text-foreground">
                  Nome da Loja
                </label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Loja Centro, Loja Norte..."
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="idLojaErp" className="block text-sm font-medium text-foreground">
                  ID Loja ERP
                </label>
                <input
                  id="idLojaErp"
                  type="text"
                  value={formData.idLojaErp}
                  onChange={(e) => setFormData(prev => ({ ...prev, idLojaErp: e.target.value }))}
                  placeholder="Ex: ERP001"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="idLojaIfood" className="block text-sm font-medium text-foreground">
                  ID Loja iFood
                </label>
                <input
                  id="idLojaIfood"
                  type="text"
                  value={formData.idLojaIfood}
                  onChange={(e) => setFormData(prev => ({ ...prev, idLojaIfood: e.target.value }))}
                  placeholder="Ex: IF001"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="regional" className="block text-sm font-medium text-foreground">
                  Regional
                </label>
                <select
                  id="regional"
                  value={formData.regionalId}
                  onChange={(e) => setFormData(prev => ({ ...prev, regionalId: e.target.value }))}
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                >
                  <option value="">Selecione uma regional</option>
                  {regionais.map(regional => (
                    <option key={regional.id} value={regional.id}>
                      {regional.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  A loja será vinculada à regional selecionada.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 h-11 px-4 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 h-11 px-4 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors">
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
                <strong className="text-foreground">{deletingLoja.nome}</strong>?
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
