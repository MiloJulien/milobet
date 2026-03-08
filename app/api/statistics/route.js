export const revalidate = 60;

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET() {
  try {
    // 🔐 Récupération de la session côté serveur
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401 });
    }

    const userId = session.user.id;

    // --- STATISTIQUES PERSONNELLES ---
    const userBets = await prisma.bet.findMany({
      where: { user_id: userId },
      include: { matches: true },
    });

    const allBets = await prisma.bet.findMany({
      include: { matches: true, users: true },
    });

    const total = userBets.length;
    const correct = userBets.filter(b => b.prediction === b.matches.score_winner).length;
    const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;
    const failRate = 100 - successRate;

    // Groupe le plus réussi
    const groupStats = {};
    for (const bet of userBets) {
      const group = bet.matches.group_name || "UNKNOWN";
      if (!groupStats[group]) groupStats[group] = { total: 0, correct: 0 };
      groupStats[group].total++;
      if (bet.prediction === bet.matches.score_winner) groupStats[group].correct++;
    }

    const bestGroup = Object.entries(groupStats)
      .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))[0]?.[0] || "N/A";

    // --- STATISTIQUES GLOBALES ---
    const matches = await prisma.matches.findMany({
      where: { status: "FINISHED" },
    });

    let perfectForAll = 0;
    let noCorrect = 0;

    for (const match of matches) {
      const betsForMatch = allBets.filter(b => b.match_id === match.id);
      const correctBets = betsForMatch.filter(b => b.prediction === match.score_winner);

      if (correctBets.length === betsForMatch.length) perfectForAll++;
      if (correctBets.length === 0) noCorrect++;
    }

    const globalCorrect = allBets.filter(b => b.prediction === b.matches.score_winner).length;
    const globalTotal = allBets.length;
    const globalSuccessRate = globalTotal > 0 ? Math.round((globalCorrect / globalTotal) * 100) : 0;

    // Meilleurs par groupe
    const bestByGroup = {};
    const users = await prisma.users.findMany();

    for (const group of Object.keys(groupStats)) {
      const usersInGroup = users
        .map(u => ({
          username: u.username,
          points: u.points,
        }))
        .sort((a, b) => b.points - a.points);

      bestByGroup[group] = usersInGroup[0];
    }

    return new Response(
      JSON.stringify({
        user: {
          successRate,
          failRate,
          bestGroup,
          total,
          correct,
        },
        global: {
          perfectForAll,
          noCorrect,
          globalSuccessRate,
          bestByGroup,
        },
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur API /statistics :", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}
