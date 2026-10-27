import { prisma } from "../../config/prisma";

export const chatRepository = {
  countUsers(ids: string[]) {
    return prisma.user.count({ where: { id: { in: ids } } });
  },

  findByDirectKey(directKey: string) {
    return prisma.chat.findUnique({
      where: { directKey },
      select: { id: true },
    });
  },

  createDirect(directKey: string, userIds: string[]) {
    return prisma.chat.create({
      data: {
        type: "DIRECT",
        directKey,
        members: { create: userIds.map((userId) => ({ userId })) },
      },
      select: { id: true },
    });
  },

  async chatExists(chatId: string): Promise<boolean> {
    const count = await prisma.chat.count({ where: { id: chatId } });
    return count > 0;
  },

  async isMember(chatId: string, userId: string): Promise<boolean> {
    const count = await prisma.chatMember.count({ where: { chatId, userId } });
    return count > 0;
  },

    findById(chatId: string) {
    return prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, type: true, createdBy: true },
    });
  },

  createGroup(name: string, createdBy: string, userIds: string[]) {
    return prisma.chat.create({
      data: {
        type: 'GROUP',
        name,
        createdBy,
        members: { create: userIds.map((userId) => ({ userId })) },
      },
      select: { id: true },
    });
  },

  async addMember(chatId: string, userId: string): Promise<void> {
    await prisma.chatMember.createMany({
      data: [{ chatId, userId }],
      skipDuplicates: true,
    });
  },

  async removeMember(chatId: string, userId: string): Promise<void> {
    await prisma.chatMember.deleteMany({ where: { chatId, userId } });
  },

  async memberIds(chatId: string): Promise<string[]> {
    const rows = await prisma.chatMember.findMany({
      where: { chatId },
      select: { userId: true },
    });
    return rows.map((r) => r.userId);
  },
};
