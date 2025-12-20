// app/api/matches/route.js
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const matches = await prisma.matches.findMany({
      orderBy: [
        { group_name: 'asc' },
        { utc_date: 'asc' }
      ]
    });

    return new Response(JSON.stringify(matches), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs :', error);
    return new Response(JSON.stringify({ message: 'Erreur lors de la récupération des matchs.' }), { status: 500 });
  }
}
