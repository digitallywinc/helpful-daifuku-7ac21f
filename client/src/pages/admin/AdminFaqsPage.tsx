import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Check, X, Eye } from 'lucide-react';
import { FAQ } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { FaqModal } from '../../components/admin/FaqModal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminFaqsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await api.faqs.getFaqs({
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        all: true,
      });
      setFaqs(data);
    } catch (err: any) {
      error('Failed to load FAQs', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFaqs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleSaveFaq = async (data: {
    question: string;
    answer: string;
    category: string;
    is_published: boolean;
  }) => {
    if (editingFaq) {
      const updated = await api.faqs.updateFaq(editingFaq.id, data);
      setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      success('FAQ Updated', 'Knowledge base entry updated successfully.');
    } else {
      const created = await api.faqs.createFaq(data);
      setFaqs((prev) => [created, ...prev]);
      success('FAQ Created', 'New knowledge base entry added and available for AI grounding.');
    }
  };

  const handleDeleteFaq = async () => {
    if (!deleteId) return;
    try {
      await api.faqs.deleteFaq(deleteId);
      setFaqs((prev) => prev.filter((f) => f.id !== deleteId));
      setDeleteId(null);
      success('FAQ Deleted', 'Article removed from knowledge base.');
    } catch (err: any) {
      error('Failed to delete FAQ', err.message);
    }
  };

  const handleTogglePublish = async (faq: FAQ) => {
    try {
      const updated = await api.faqs.updateFaq(faq.id, { is_published: !faq.is_published });
      setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      success(
        'Publication Status Updated',
        `Article is now ${updated.is_published ? 'Published' : 'Unpublished (Draft)'}.`
      );
    } catch (err: any) {
      error('Toggle failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Knowledge Base & FAQ Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage articles indexed by the AI Customer Support Assistant and viewed by customers
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="gap-2 font-semibold shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New FAQ Article</span>
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-card border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or keywords..."
            className="pl-9 h-9 text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 text-xs sm:w-48"
        >
          <option value="All">Category: All</option>
          <option value="General Questions">General Questions</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Account Issues">Account Issues</option>
          <option value="Billing">Billing</option>
          <option value="Other">Other</option>
        </Select>
      </div>

      {/* FAQ Table */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyState
              icon={BookOpen}
              title="No FAQs Found"
              description="No articles matched your current search filters. Click below to add an article."
              actionLabel="Create FAQ"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Question</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Helpful Votes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground max-w-md">
                      <div>{faq.question}</div>
                      <div className="text-[11px] font-normal text-muted-foreground mt-0.5 line-clamp-1">
                        {faq.answer}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="secondary">{faq.category}</Badge>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(faq)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
                          faq.is_published
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                        title="Click to toggle published status"
                      >
                        {faq.is_published ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground font-medium">
                      {faq.helpful_count || 0} votes
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(faq)}
                          className="h-8 w-8 p-0"
                          title="Edit Article"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(faq.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete Article"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit FAQ Modal */}
      <FaqModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faq={editingFaq}
        onSave={handleSaveFaq}
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete Knowledge Base Article"
        description="Are you sure you want to delete this FAQ article? The AI Assistant will no longer use this article for contextual response generation."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteFaq}>
            Delete Article
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

