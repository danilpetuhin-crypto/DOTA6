import { prisma } from '../lib/prisma.js';

export const Analysis = {
  async findBySessionId(sessionId) {
    return prisma.analysis.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id) {
    return prisma.analysis.findUnique({ where: { id } });
  },

  async create({ sessionId, userId, hole, board, equity, combo, action, actionClass, pot, outcome, createdAt }) {
    return prisma.analysis.create({
      data: {
        sessionId,
        userId,
        hole,
        board,
        equity,
        combo,
        action,
        actionClass,
        pot,
        outcome,
        createdAt: createdAt || new Date()
      }
    });
  },

  async deleteById(id) {
    await prisma.analysis.delete({ where: { id } });
  }
};
