import { 
  getResults, 
  getUserPredictions, 
  updateUserPoints 
} from '@/lib/dbService';

export async function POST(req) {
  try {
    const results = await getResults();               // Tous les matchs
    const predictions = await getUserPredictions();   // Tous les pronostics

    await prisma.users.updateMany({ data: { points: 0 } }); // Reset points avant recalcul

    const userStats = {};   // Stats par user
    const matchStats = {};  // Stats par match

    // Initialiser les stats par match
    results.forEach(result => {
      matchStats[result.match_id] = {
        correct: 0,
        perfect: 0,
        total: 0
      };
    });

    // Parcourir tous les pronostics
    predictions.forEach(pred => {
      const result = results.find(r => r.match_id === pred.match_id);
      if (!result) return;

      // Init user
      if (!userStats[pred.user_id]) {
        userStats[pred.user_id] = {
          points: 0,
          correct: 0,
          total: 0,
          groups: {}
        };
      }

      const user = userStats[pred.user_id];
      user.total++;

      // Init groupe
      if (!user.groups[pred.group]) {
        user.groups[pred.group] = { correct: 0, total: 0 };
      }
      user.groups[pred.group].total++;

      // Match stats
      matchStats[pred.match_id].total++;

      // Pronostic correct ?
      if (pred.prediction === result.score_winner) {
        user.points++;
        user.correct++;
        user.groups[pred.group].correct++;
        matchStats[pred.match_id].correct++;
      }

      // Score parfait ?
      if (pred.prediction === result.score_exact) {
        matchStats[pred.match_id].perfect++;
      }
    });

    // Mettre à jour les points en base
    await prisma.$transaction(
      Object.entries(userStats).map(([userId, stats]) =>
        prisma.users.update({
          where: { id: parseInt(userId) },
          data: { points: stats.points },
        })
      )
    );

    return new Response(JSON.stringify({
      message: "Points calculés",
    }), { status: 200 });

  } catch (error) {
    console.error("Erreur :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
