import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { chatService } from '../services/chatService.js';
import { aiService } from '../services/aiService.js';

export const chatController = {
  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const conversations = await chatService.getConversations(userId);
      res.json({ success: true, conversations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'admin';
      const { id } = req.params;

      const result = await chatService.getConversation(id, userId, isAdmin);
      if (!result) {
        res.status(404).json({ success: false, message: 'Conversation not found' });
        return;
      }

      res.json({
        success: true,
        conversation: result.conversation,
        messages: result.messages,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { conversationId, content } = req.body;

      if (!content || typeof content !== 'string' || !content.trim()) {
        res.status(400).json({ success: false, message: 'Message content is required' });
        return;
      }

      let activeConvId = conversationId;

      // Create conversation if none provided
      if (!activeConvId) {
        const titleSnippet = content.trim().slice(0, 30) + (content.length > 30 ? '...' : '');
        const newConv = await chatService.createConversation(userId, titleSnippet);
        activeConvId = newConv.id;
      } else {
        // Verify conversation belongs to user
        const existing = await chatService.getConversation(activeConvId, userId, false);
        if (!existing) {
          // If conversation ID is invalid, create a fresh one
          const newConv = await chatService.createConversation(userId, 'Support Inquiry');
          activeConvId = newConv.id;
        }
      }

      // Save user message
      const userMsg = await chatService.addMessage(activeConvId, 'user', content.trim());

      // Fetch chat history for context
      const chatData = await chatService.getConversation(activeConvId, userId, false);
      const history = (chatData?.messages || []).map((m) => ({
        role: m.sender as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      // Generate AI response
      const aiResult = await aiService.generateResponse(content.trim(), history);

      // Save assistant message
      const assistantMsg = await chatService.addMessage(
        activeConvId,
        'assistant',
        aiResult.response
      );

      res.json({
        success: true,
        conversationId: activeConvId,
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        suggestedAction: aiResult.suggestedAction,
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process AI chat message: ' + error.message,
      });
    }
  },

  async deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'admin';
      const { id } = req.params;

      const deleted = await chatService.deleteConversation(id, userId, isAdmin);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
        return;
      }

      res.json({ success: true, message: 'Conversation deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

