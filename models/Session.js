import { prisma } from '../lib/prisma.js';

export const Session = {
  async findByUserId(userId) {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id) {
    return prisma.session.findUnique({ where: { id } });
  },

  async findByIdAndUser(id, userId) {
    return prisma.session.findFirst({ where: { id, userId } });
  },

  async create({ userId, name }) {
    return prisma.session.create({
      data: { userId, name: name || 'Текущая сессия' }
    });
  },

  async deleteByIdAndUser(id, userId) {
    await prisma.session.deleteMany({ where: { id, userId } });
  }
};
