import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Récupérer tous les matches terminés, triés par date
    const finishedMatches = await prisma.matches.findMany({
      where: {
        status: 'FINISHED',
        score_winner: {
          not: null,
        },
      },
      orderBy: {
        utc_date: 'asc',
      },
    });

    // Récupérer tous les utilisateurs qui ont parié
    const allUsers = await prisma.users.findMany({
      where: {
        has_bet: 1,
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Récupérer tous les paris
    const allBets = await prisma.bet.findMany();

    // Créer une map pour les paris par utilisateur et match
    const betsMap = {};
    allBets.forEach(bet => {
      if (!betsMap[bet.user_id]) {
        betsMap[bet.user_id] = {};
      }
      betsMap[bet.user_id][bet.match_id] = bet.prediction;
    });

    // Initialiser les points de chaque utilisateur
    const userPoints = {};
    const userHistory = {};

    allUsers.forEach(user => {
      userPoints[user.id] = 0;
      userHistory[user.id] = {
        id: user.id,
        username: user.username,
        points_by_match: [],
        current_points: 0,
      };
    });

    // Calculer les points après chaque match
    finishedMatches.forEach(match => {
      allUsers.forEach(user => {
        if (betsMap[user.id] && betsMap[user.id][match.id]) {
          const userPrediction = betsMap[user.id][match.id];
          const matchWinner = match.score_winner;
          let pointsGained = 0;

          if (userPrediction === matchWinner) {
            pointsGained = 1;
            userPoints[user.id]++;
          }

          userHistory[user.id].points_by_match.push({
            match_id: match.id,
            match_date: match.utc_date,
            home_team: match.home_team_name,
            away_team: match.away_team_name,
            prediction: userPrediction,
            winner: matchWinner,
            points_gained: pointsGained,
            cumulative_points: userPoints[user.id],
          });
        }
      });
    });

    // Finalement, classer les utilisateurs par points
    const standings = allUsers
      .map(user => ({
        ...user,
        current_points: userPoints[user.id],
        history: userHistory[user.id].points_by_match,
      }))
      .sort((a, b) => b.current_points - a.current_points)
      .map((user, idx) => ({
        ...user,
        rank: idx + 1,
      }));

    return NextResponse.json(
      { standings },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du classement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du classement' },
      { status: 500 }
    );
  }
}
