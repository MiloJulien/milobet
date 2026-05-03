import { getMatches } from '@/lib/dbService';

export async function GET(req) {
  try {
    const matches = await getMatches();
    return new Response(JSON.stringify(matches), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs :', error);
    return new Response(JSON.stringify({ message: 'Erreur lors de la récupération des matchs.' }), { status: 500 });
  }
}
