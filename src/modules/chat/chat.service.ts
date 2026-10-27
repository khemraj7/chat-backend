import { ChatType, Prisma } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { chatRepository } from './chat.repository';

interface CreateChatResult {
  chatId: string;
  created: boolean;
}

export const chatService = {
  async createOrGetDirect(userAId: string, userBId: string): Promise<CreateChatResult> {
    if (userAId === userBId) {
      throw new AppError(400, 'Cannot create a chat with yourself');
    }

    const count = await chatRepository.countUsers([userAId, userBId]);
    if (count !== 2) {
      throw new AppError(404, 'User not found');
    }

    const directKey = [userAId, userBId].sort().join('_');

    const existing = await chatRepository.findByDirectKey(directKey);
    if (existing) {
      return { chatId: existing.id, created: false };
    }

    try {
      const chat = await chatRepository.createDirect(directKey, [userAId, userBId]);
      return { chatId: chat.id, created: true };
    } catch (err) {
      // Race: doosri request ne pehle chat bana di
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const winner = await chatRepository.findByDirectKey(directKey);
        if (winner) {
          return { chatId: winner.id, created: false };
        }
      }
      throw err;
    }
  },

    async loadGroup(
    chatId: string,
  ): Promise<{ id: string; type: ChatType; createdBy: string | null }> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) {
      throw new AppError(404, 'Chat not found');
    }
    if (chat.type !== 'GROUP') {
      throw new AppError(400, 'This is not a group chat');
    }
    return chat;
  },

  async createGroup(creatorId: string, name: string, memberIds: string[]): Promise<string> {
    const userIds = Array.from(new Set([creatorId, ...memberIds]));
    if (userIds.length < 2) {
      throw new AppError(400, 'A group needs at least one other member');
    }

    const count = await chatRepository.countUsers(userIds);
    if (count !== userIds.length) {
      throw new AppError(404, 'User not found');
    }

    const chat = await chatRepository.createGroup(name, creatorId, userIds);
    return chat.id;
  },

  async addMember(chatId: string, requesterId: string, userId: string): Promise<string[]> {
    const chat = await chatService.loadGroup(chatId);

    if (chat.createdBy !== requesterId) {
      throw new AppError(403, 'Only the group admin can add members');
    }
    if ((await chatRepository.countUsers([userId])) !== 1) {
      throw new AppError(404, 'User not found');
    }

    await chatRepository.addMember(chatId, userId);
    return chatRepository.memberIds(chatId);
  },

  async removeMember(chatId: string, requesterId: string, userId: string): Promise<string[]> {
    const chat = await chatService.loadGroup(chatId);

    if (requesterId !== chat.createdBy && requesterId !== userId) {
      throw new AppError(403, 'Only the admin can remove other members');
    }
    if (userId === chat.createdBy) {
      throw new AppError(400, 'The group admin cannot be removed');
    }
    if (!(await chatRepository.isMember(chatId, userId))) {
      throw new AppError(404, 'User is not a member of this group');
    }

    await chatRepository.removeMember(chatId, userId);
    return chatRepository.memberIds(chatId);
  },
};