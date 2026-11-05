import React, { useState, useEffect } from 'react';
import { FAQ } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq?: FAQ | null;
  onSave: (data: {
    question: string;
    answer: string;
    category: string;
    is_published: boolean;
  }) => Promise<void>;
}

const CATEGORIES = [
  'General Questions',
  'Technical Support',
  'Account Issues',
  'Billing',
  'Other',
];

export const FaqModal: React.FC<FaqModalProps> = ({
  isOpen,
  onClose,
  faq,
  onSave,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setCategory(faq.category);
      setIsPublished(faq.is_published);
    } else {
      setQuestion('');
      setAnswer('');
      setCategory(CATEGORIES[0]);
      setIsPublished(true);
    }
    setError('');
  }, [faq, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError('Both question and answer are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        question: question.trim(),
        answer: answer.trim(),
        category,
        is_published: isPublished,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={faq ? 'Edit Knowledge Base FAQ' : 'Create Knowledge Base FAQ'}
      description="Published FAQs are immediately accessible to customers and utilized by the AI Chatbot for instant RAG responses."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Input
          label="Question"
          placeholder="e.g., How do I export audit logs to CSV?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <Textarea
          label="Detailed Answer"
          placeholder="Provide clear, concise steps and explanations..."
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />

        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Published (Visible to customers and indexed by AI)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            {faq ? 'Update FAQ' : 'Create FAQ'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

