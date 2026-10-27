import { AppError } from '../../utils/AppError';
import { chatRepository } from '../chat/chat.repository';
import { LastSeen, Message, messageRepository } from './message.repository';

export const messageService = {
  async send(chatId: string, senderId: string, text: string): Promise<Message> {
    if (!(await chatRepository.chatExists(chatId))) {
      throw new AppError(404, 'Chat not found');
    }
    if (!(await chatRepository.isMember(chatId, senderId))) {
      throw new AppError(403, 'Sender is not a member of this chat');
    }
    return messageRepository.create(chatId, senderId, text);
  },

  async list(chatId: string, limit: number): Promise<Message[]> {
    if (!(await chatRepository.chatExists(chatId))) {
      throw new AppError(404, 'Chat not found');
    }
    return messageRepository.list(chatId, limit);
  },
    async markRead(chatId: string, messageId: string, userId: string): Promise<Message> {
    if (!(await chatRepository.chatExists(chatId))) {
      throw new AppError(404, 'Chat not found');
    }
    if (!(await chatRepository.isMember(chatId, userId))) {
      throw new AppError(403, 'User is not a member of this chat');
    }

    const message = await messageRepository.getById(chatId, messageId);
    if (!message) {
      throw new AppError(404, 'Message not found');
    }
    if (message.senderId === userId) {
      throw new AppError(400, 'Cannot mark your own message as read');
    }

    const updated = await messageRepository.markRead(chatId, messageId, userId);
    if (!updated) {
      throw new AppError(404, 'Message not found');
    }
    return updated;
  },

  async updateLastSeen(chatId: string, userId: string, messageId: string): Promise<LastSeen> {
    if (!(await chatRepository.chatExists(chatId))) {
      throw new AppError(404, 'Chat not found');
    }
    if (!(await chatRepository.isMember(chatId, userId))) {
      throw new AppError(403, 'User is not a member of this chat');
    }

    const message = await messageRepository.getById(chatId, messageId);
    if (!message) {
      throw new AppError(404, 'Message not found in this chat');
    }

    return messageRepository.setLastSeen(chatId, userId, messageId);
  },

    async edit(chatId: string, messageId: string, userId: string, text: string): Promise<Message> {
    const message = await messageService.loadOwnMessage(chatId, messageId, userId);

    if (message.deletedAt) {
      throw new AppError(400, 'Cannot edit a deleted message');
    }

    const updated = await messageRepository.edit(chatId, messageId, text);
    if (!updated) {
      throw new AppError(404, 'Message not found');
    }
    return updated;
  },

  async remove(chatId: string, messageId: string, userId: string): Promise<Message> {
    const message = await messageService.loadOwnMessage(chatId, messageId, userId);

    if (message.deletedAt) {
      return message;
    }

    const updated = await messageRepository.softDelete(chatId, messageId);
    if (!updated) {
      throw new AppError(404, 'Message not found');
    }
    return updated;
  },

  async loadOwnMessage(chatId: string, messageId: string, userId: string): Promise<Message> {
    if (!(await chatRepository.chatExists(chatId))) {
      throw new AppError(404, 'Chat not found');
    }
    if (!(await chatRepository.isMember(chatId, userId))) {
      throw new AppError(403, 'User is not a member of this chat');
    }

    const message = await messageRepository.getById(chatId, messageId);
    if (!message) {
      throw new AppError(404, 'Message not found');
    }
    if (message.senderId !== userId) {
      throw new AppError(403, 'Only the sender can change this message');
    }
    return message;
  },
};