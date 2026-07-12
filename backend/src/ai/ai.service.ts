import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../common/config.service';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    if (this.configService.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.configService.openaiApiKey,
      });
    }
  }

  async generateReply(conversationId: string, customerMessage: string) {
    if (!this.openai) {
      return {
        reply: 'AI is not configured. Please set up your OpenAI API key in Settings.',
        useAI: false,
      };
    }

    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          customer: { select: { name: true, tags: true, notes: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!conversation) {
        return { reply: 'Conversation not found', useAI: false };
      }

      const knowledgeBase = await this.prisma.knowledgeBase.findMany({
        where: { isActive: true },
      });

      const recentMessages = conversation.messages
        .reverse()
        .map((m) => `${m.direction === 'inbound' ? 'Customer' : 'Agent'}: ${m.content}`)
        .join('\n');

      const systemPrompt = `You are a helpful WhatsApp business assistant for ${
        conversation.customer.name
      }.
Customer info: ${JSON.stringify({
        name: conversation.customer.name,
        tags: JSON.parse(conversation.customer.tags || '[]'),
        notes: conversation.customer.notes,
      })}

Knowledge base:
${knowledgeBase.map((kb) => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n')}

Instructions:
- Be helpful, concise, and professional.
- Use knowledge base answers when relevant.
- If you cannot answer, suggest forwarding to a human agent.
- Keep responses under 200 words.`;

      const response = await this.openai.chat.completions.create({
        model: this.configService.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: recentMessages },
          { role: 'user', content: customerMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = response.choices[0]?.message?.content || '';

      return { reply, useAI: true };
    } catch (error) {
      this.logger.error(`AI generation error: ${error}`);
      return {
        reply: 'Sorry, I encountered an error generating a response. Please try again or contact support.',
        useAI: false,
      };
    }
  }

  async generateSuggestedReply(conversationId: string) {
    if (!this.openai) {
      return { suggestions: [] };
    }

    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!conversation) {
        return { suggestions: [] };
      }

      const recentMessages = conversation.messages
        .reverse()
        .map((m) => `${m.direction === 'inbound' ? 'Customer' : 'Agent'}: ${m.content}`)
        .join('\n');

      const response = await this.openai.chat.completions.create({
        model: this.configService.openaiModel,
        messages: [
          {
            role: 'system',
            content:
              'Generate 3 short suggested replies for a WhatsApp business conversation. Return as a JSON array of strings.',
          },
          { role: 'user', content: recentMessages },
        ],
        max_tokens: 200,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{"suggestions":[]}';
      const parsed = JSON.parse(content);

      return { suggestions: parsed.suggestions || [] };
    } catch {
      return { suggestions: [] };
    }
  }

  async summarizeConversation(conversationId: string) {
    if (!this.openai) {
      return { summary: 'AI not configured' };
    }

    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!conversation) {
        return { summary: 'Conversation not found' };
      }

      const fullConversation = conversation.messages
        .map(
          (m) =>
            `${m.direction === 'inbound' ? 'Customer' : 'Agent'} (${m.createdAt.toISOString()}): ${m.content}`,
        )
        .join('\n');

      const response = await this.openai.chat.completions.create({
        model: this.configService.openaiModel,
        messages: [
          {
            role: 'system',
            content:
              'Summarize this WhatsApp business conversation. Include: key topics, customer needs, decisions made, action items. Keep it under 150 words.',
          },
          { role: 'user', content: fullConversation },
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      return {
        summary: response.choices[0]?.message?.content || '',
      };
    } catch {
      return { summary: 'Failed to generate summary' };
    }
  }

  async answerFromKnowledgeBase(question: string) {
    const kb = await this.prisma.knowledgeBase.findMany({
      where: { isActive: true },
    });

    if (!this.openai) {
      const match = kb.find(
        (entry) =>
          entry.question.toLowerCase().includes(question.toLowerCase()) ||
          question.toLowerCase().includes(entry.question.toLowerCase()),
      );
      return { answer: match?.answer || 'No relevant answer found', source: 'keyword' };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.openaiModel,
        messages: [
          {
            role: 'system',
            content: `Answer based on this knowledge base:\n${kb.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n')}\nIf no relevant answer exists, say "I don't have information about that."`,
          },
          { role: 'user', content: question },
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      return {
        answer: response.choices[0]?.message?.content || 'No answer generated',
        source: 'ai',
      };
    } catch {
      return { answer: 'Failed to get answer', source: 'error' };
    }
  }
}
