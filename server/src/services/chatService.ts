import { getSupabaseAdmin, getSupabase } from '../config/supabase.js';
import { Conversation, Message } from '../types/index.js';
import { memoryStore } from './store.js';

export const chatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return data as Conversation[];
        }
      } catch (err) {
        console.warn('Supabase fetch conversations error, using fallback:', err);
      }
    }

    return Array.from(memoryStore.conversations.values())
      .filter((c) => c.user_id === userId)
      .sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  },

  async getAllConversationsForAdmin(): Promise<(Conversation & { user_email?: string; full_name?: string })[]> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*, profiles:user_id(email, full_name)')
          .order('updated_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            title: item.title,
            created_at: item.created_at,
            updated_at: item.updated_at,
            user_email: item.profiles?.email,
            full_name: item.profiles?.full_name,
          }));
        }
      } catch (err) {
        console.warn('Supabase admin conversations error, using fallback:', err);
      }
    }

    return Array.from(memoryStore.conversations.values()).map((conv) => {
      const profile = memoryStore.profiles.get(conv.user_id);
      return {
        ...conv,
        user_email: profile?.email,
        full_name: profile?.full_name,
      };
    });
  },

  async getConversation(
    conversationId: string,
    userId: string,
    isAdmin = false
  ): Promise<{ conversation: Conversation; messages: Message[] } | null> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        let convQuery = supabase.from('conversations').select('*').eq('id', conversationId);
        if (!isAdmin) {
          convQuery = convQuery.eq('user_id', userId);
        }

        const { data: conv, error: convError } = await convQuery.single();

        if (!convError && conv) {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          return {
            conversation: conv as Conversation,
            messages: (messages || []) as Message[],
          };
        }
      } catch (err) {
        console.warn('Supabase get conversation error, using fallback:', err);
      }
    }

    const conv = memoryStore.conversations.get(conversationId);
    if (!conv || (!isAdmin && conv.user_id !== userId)) {
      return null;
    }

    const messages = memoryStore.messages.get(conversationId) || [];
    return {
      conversation: conv,
      messages: [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    };
  },

  async createConversation(userId: string, title?: string): Promise<Conversation> {
    const defaultTitle = title || 'Support Inquiry';
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: userId,
            title: defaultTitle,
          })
          .select()
          .single();

        if (!error && data) {
          return data as Conversation;
        }
      } catch (err) {
        console.warn('Supabase create conversation error, using fallback:', err);
      }
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      user_id: userId,
      title: defaultTitle,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryStore.conversations.set(newConv.id, newConv);
    memoryStore.messages.set(newConv.id, []);
    return newConv;
  },

  async addMessage(
    conversationId: string,
    sender: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<Message> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data: msg, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender,
            content,
          })
          .select()
          .single();

        if (!error && msg) {
          // Update conversation updated_at
          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

          return msg as Message;
        }
      } catch (err) {
        console.warn('Supabase add message error, using fallback:', err);
      }
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversation_id: conversationId,
      sender,
      content,
      created_at: new Date().toISOString(),
    };

    const currentList = memoryStore.messages.get(conversationId) || [];
    currentList.push(newMsg);
    memoryStore.messages.set(conversationId, currentList);

    const conv = memoryStore.conversations.get(conversationId);
    if (conv) {
      conv.updated_at = new Date().toISOString();
      // If it was the first user message, update title
      if (sender === 'user' && currentList.filter((m) => m.sender === 'user').length === 1) {
        conv.title = content.slice(0, 35) + (content.length > 35 ? '...' : '');
      }
    }

    return newMsg;
  },

  async deleteConversation(
    conversationId: string,
    userId: string,
    isAdmin = false
  ): Promise<boolean> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        let query = supabase.from('conversations').delete().eq('id', conversationId);
        if (!isAdmin) {
          query = query.eq('user_id', userId);
        }
        const { error } = await query;
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase delete conversation error, using fallback:', err);
      }
    }

    const conv = memoryStore.conversations.get(conversationId);
    if (!conv || (!isAdmin && conv.user_id !== userId)) {
      return false;
    }

    memoryStore.conversations.delete(conversationId);
    memoryStore.messages.delete(conversationId);
    return true;
  },
};

