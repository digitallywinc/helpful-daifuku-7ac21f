import OpenAI from 'openai';
import { ENV, isOpenAIConfigured } from './env.js';

let openaiClient: OpenAI | null = null;

if (isOpenAIConfigured) {
  try {
    openaiClient = new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized.');
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
  }
} else {
  console.warn(
    '⚠️ OpenAI API Key not configured in server/.env. AI Chat will run with intelligent simulated responses.'
  );
}

export const getOpenAI = (): OpenAI | null => openaiClient;

