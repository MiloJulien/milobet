// lib/users.js
import { prisma } from '@/lib/prisma';

// Trouver un utilisateur par email
async function findUserByEmail(email) {
  return await prisma.users.findUnique({
    where: { email },
  });
}

// Trouver un utilisateur par username
async function findUserByUsername(username) {
  return await prisma.users.findUnique({
    where: { username },
  });
}

// Créer un utilisateur
async function createUser({ username, email, password }) {
  const user = await prisma.users.create({
    data: {
      username,
      email,
      password,
    },
  });
  return user.id;
}

// Mettre à jour le mot de passe
async function updatePassword(userId, hashedPassword) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  } catch (error) {
    throw new Error('Impossible de mettre à jour le mot de passe.');
  }
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  createUser,
  updatePassword,
};
