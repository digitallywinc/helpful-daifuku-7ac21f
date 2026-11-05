import { getSupabaseAdmin, getSupabase } from '../config/supabase.js';
import { FAQ } from '../types/index.js';
import { memoryStore } from './store.js';

export const faqService = {
  async getAllFaqs(onlyPublished = true, category?: string, search?: string): Promise<FAQ[]> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        let query = supabase.from('faqs').select('*');

        if (onlyPublished) {
          query = query.eq('is_published', true);
        }

        if (category && category !== 'All') {
          query = query.eq('category', category);
        }

        if (search) {
          query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (!error && data) {
          return data as FAQ[];
        }
      } catch (err) {
        console.warn('Supabase FAQ fetch failed, using fallback store:', err);
      }
    }

    // Fallback store
    let list = Array.from(memoryStore.faqs.values());

    if (onlyPublished) {
      list = list.filter((f) => f.is_published);
    }

    if (category && category !== 'All') {
      list = list.filter((f) => f.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (f) => f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s)
      );
    }

    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createFaq(data: {
    question: string;
    answer: string;
    category: string;
    is_published?: boolean;
  }): Promise<FAQ> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data: created, error } = await supabase
          .from('faqs')
          .insert({
            question: data.question,
            answer: data.answer,
            category: data.category,
            is_published: data.is_published ?? true,
          })
          .select()
          .single();

        if (!error && created) {
          return created as FAQ;
        }
      } catch (err) {
        console.warn('Supabase create FAQ failed, using fallback:', err);
      }
    }

    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      question: data.question,
      answer: data.answer,
      category: data.category,
      is_published: data.is_published ?? true,
      helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryStore.faqs.set(newFaq.id, newFaq);
    return newFaq;
  },

  async updateFaq(id: string, updates: Partial<FAQ>): Promise<FAQ | null> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('faqs')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && updated) {
          return updated as FAQ;
        }
      } catch (err) {
        console.warn('Supabase update FAQ failed, using fallback:', err);
      }
    }

    const existing = memoryStore.faqs.get(id);
    if (!existing) return null;

    const modified = { ...existing, ...updates, updated_at: new Date().toISOString() };
    memoryStore.faqs.set(id, modified);
    return modified;
  },

  async deleteFaq(id: string): Promise<boolean> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase delete FAQ failed, using fallback:', err);
      }
    }

    return memoryStore.faqs.delete(id);
  },
};

