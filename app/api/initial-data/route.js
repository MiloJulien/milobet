// app/api/initial-data/route.js
// API centralisée pour précharger toutes les données au chargement initial
import { getMatches, getLeaderboard } from '@/lib/dbService';

export async function GET(req) {
  try {
    // Charger les matchs et le leaderboard en parallèle
    const [matches, leaderboard] = await Promise.all([
      getMatches(),
      getLeaderboard(),
    ]);

    return new Response(JSON.stringify({
      matches,
      leaderboard,
      timestamp: new Date().toISOString(),
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache 5 minutes
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des données initiales :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur." }), { status: 500 });
  }
}
