// app/api/users/route.js
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.users.findMany();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    return new Response(JSON.stringify({ message: 'Impossible de récupérer les utilisateurs.' }), { status: 500 });
  }
}
