import { prisma } from '../../config/prisma';

export const userRepository = {
  async exists(userId: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { id: userId } });
    return count > 0;
  },

  findChats(userId: string) {
    return prisma.chat.findMany({
      where: { members: { some: { userId } } },
      select: {
        id: true,
        type: true,
        name: true,
        createdAt: true,
        members: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};