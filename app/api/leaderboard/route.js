// app/api/leaderboard/route.js
import { getLeaderboard } from '@/lib/dbService';

export async function GET(req) {
  try {
    const users = await getLeaderboard();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du classement :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur." }), { status: 500 });
  }
}
