import { z } from 'zod';

export const createChatBody = z.object({
  userAId: z.string().uuid(),
  userBId: z.string().uuid(),
});

export const createGroupBody = z.object({
  creatorId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  memberIds: z.array(z.string().uuid()).min(1).max(100),
});

export const groupIdParam = z.object({
  chatId: z.string().uuid(),
});

export const memberChangeBody = z.object({
  requesterId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type CreateGroupBody = z.infer<typeof createGroupBody>;
export type MemberChangeBody = z.infer<typeof memberChangeBody>;
export type CreateChatBody = z.infer<typeof createChatBody>;