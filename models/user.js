import { prisma } from '@/lib/prisma';

const User = {
  create: async ({ username, email, password}) => {
    try {
      const user = await prisma.users.create({
        data: {
          username,
          email,
          password,
        },
      });

      return user.id;
    } catch (error) {
      throw new Error('Erreur lors de la création de l’utilisateur : ' + error.message);
    }
  },
};

export default User;
