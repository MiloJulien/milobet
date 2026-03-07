import { 
  getResults, 
  getUserPredictions, 
  updateUserPoints 
} from '@/lib/dbService';

export async function POST(req) {
  try {
    const results = await getResults();               // Tous les matchs
    const predictions = await getUserPredictions();   // Tous les pronostics

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
    for (const userId in userStats) {
      await updateUserPoints(userId, userStats[userId].points);
    }

    // Statistiques globales
    const perfectForAll = Object.values(matchStats)
      .filter(m => m.correct === m.total).length;

    const noCorrect = Object.values(matchStats)
      .filter(m => m.correct === 0).length;

    const globalSuccessRate = Math.round(
      (Object.values(userStats).reduce((acc, u) => acc + u.correct, 0) /
       Object.values(userStats).reduce((acc, u) => acc + u.total, 0)) * 100
    );

    // Meilleur user par groupe
    const bestByGroup = {};
    for (const userId in userStats) {
      const user = userStats[userId];
      for (const group in user.groups) {
        if (!bestByGroup[group] || user.points > bestByGroup[group].points) {
          bestByGroup[group] = {
            userId,
            points: user.points
          };
        }
      }
    }

    // Ajouter successRate, failRate, bestGroup
    for (const userId in userStats) {
      const u = userStats[userId];
      u.successRate = Math.round((u.correct / u.total) * 100);
      u.failRate = 100 - u.successRate;

      u.bestGroup = Object.entries(u.groups)
        .sort((a, b) => b[1].correct - a[1].correct)[0][0];
    }

    return new Response(JSON.stringify({
      message: "Stats calculées",
      users: userStats,
      global: {
        perfectForAll,
        noCorrect,
        globalSuccessRate,
        bestByGroup
      }
    }), { status: 200 });

  } catch (error) {
    console.error("Erreur :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
