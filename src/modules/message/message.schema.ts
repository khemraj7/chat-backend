import { z } from 'zod';

export const chatIdParam = z.object({
  chatId: z.string().uuid(),
});

export const sendMessageBody = z.object({
  senderId: z.string().uuid(),
  text: z.string().trim().min(1).max(2000),
});

export const listMessagesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type SendMessageBody = z.infer<typeof sendMessageBody>;

export const messageParams = z.object({
  chatId: z.string().uuid(),
  messageId: z.string().min(1),
});

export const markReadBody = z.object({
  userId: z.string().uuid(),
});

export const lastSeenBody = z.object({
  userId: z.string().uuid(),
  messageId: z.string().min(1),
});

export const editMessageBody = z.object({
  userId: z.string().uuid(),
  text: z.string().trim().min(1).max(2000),
});

export const deleteMessageBody = z.object({
  userId: z.string().uuid(),
});

export type EditMessageBody = z.infer<typeof editMessageBody>;
export type DeleteMessageBody = z.infer<typeof deleteMessageBody>;

export type MarkReadBody = z.infer<typeof markReadBody>;
export type LastSeenBody = z.infer<typeof lastSeenBody>;