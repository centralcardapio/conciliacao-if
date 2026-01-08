import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { z } from 'zod';

interface Regional {
  id: string;
  nome: string;
}

const regionalSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
});

const Regionais: React.FC = () => {
  const [regionais, setRegionais] = useState<Regional[]>([
    { id: '1', nome: 'Sul' },
    { id: '2', nome: 'Sudeste' },
    { id: '3', nome: 'Centro-Oeste' },
    { id: '4', nome: 'Nordeste' },
    { id: '5', nome: 'Norte' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRegional, setEditingRegional] = useState<Regional | null>(null);
  const [deletingRegional, setDeletingRegional] = useState<Regional | null>(null);
  const [formData, setFormData] = useState({ nome: '' });
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRegionais = regionais.filter(r =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingRegional(null);
    setFormData({ nome: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (regional: Regional) => {
    setEditingRegional(regional);
    setFormData({ nome: regional.nome });
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
    setFormData({ nome: '' });
    setFormError('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingRegional(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = regionalSchema.safeParse(formData);
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    if (editingRegional) {
      // Edição
      setRegionais(prev =>
        prev.map(r =>
          r.id === editingRegional.id ? { ...r, nome: formData.nome.trim() } : r
        )
      );
    } else {
      // Criação
      const newRegional: Regional = {
        id: Date.now().toString(),
        nome: formData.nome.trim(),
      };
      setRegionais(prev => [...prev, newRegional]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deletingRegional) {
      setRegionais(prev => prev.filter(r => r.id !== deletingRegional.id));
      closeDeleteModal();
    }
  };

  return (
    <Layout title="Regionais">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Regionais</h1>
            <p className="text-muted-foreground mt-1">Gerencie as regionais do sistema</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Regional
          </button>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar regional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 max-w-md"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegionais.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      {searchTerm ? 'Nenhuma regional encontrada' : 'Nenhuma regional cadastrada'}
                    </td>
                  </tr>
                ) : (
                  filteredRegionais.map((regional) => (
                    <tr key={regional.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-foreground font-mono text-sm">{regional.id}</td>
                      <td className="p-4 text-foreground">{regional.nome}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(regional)}
                            className="p-2 hover:bg-secondary rounded-md transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(regional)}
                            className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <p className="text-sm text-muted-foreground animate-fade-in">
          Total: {filteredRegionais.length} {filteredRegionais.length === 1 ? 'regional' : 'regionais'}
        </p>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingRegional ? 'Editar Regional' : 'Nova Regional'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-secondary rounded-md transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {formError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
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
                  onChange={(e) => setFormData({ nome: e.target.value })}
                  placeholder="Digite o nome da regional"
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingRegional ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingRegional && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg w-full max-w-md animate-fade-in">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Confirmar Exclusão</h2>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground">
                Tem certeza que deseja excluir a regional <strong className="text-foreground">{deletingRegional.nome}</strong>?
              </p>
              <p className="text-sm text-muted-foreground mt-2">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3 p-4 border-t border-border">
              <button onClick={closeDeleteModal} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleDelete} className="btn-primary bg-destructive hover:bg-destructive/90 flex-1">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Regionais;
