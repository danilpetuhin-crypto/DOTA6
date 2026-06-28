import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

export const User = {
  async findByLogin(login) {
    return prisma.user.findUnique({ where: { login } });
  },

  async findByIp(ip) {
    return prisma.user.findFirst({ where: { ip } });
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create({ login, password, ip }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: { login, password: hashedPassword, ip }
    });
  },

  async updateSubscription(userId, subscription, subExpires, licenseKey) {
    return prisma.user.update({
      where: { id: userId },
      data: { subscription, subExpires, licenseKey }
    });
  },

  async cancelSubscription(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { subscription: 'free', subExpires: null, licenseKey: null }
    });
  },

  async comparePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
};
