// lib/dbservice.js
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Sauvegarder les matchs (phase de groupes)
async function saveMatches(matches) {
  try {
    const groupStageMatches = matches.filter(match => match.stage === 'GROUP_STAGE');

    for (const match of groupStageMatches) {
      await prisma.matches.upsert({
        where: { id: match.id },
        update: {
          utc_date: match.utcDate,
          status: match.status,
          group_name: match.group,
          home_team_name: match.homeTeam.name,
          home_team_crest: match.homeTeam.crest,
          away_team_name: match.awayTeam.name,
          away_team_crest: match.awayTeam.crest,
          score_winner: match.score.winner,
          home_score: match.score.fullTime.home,
          away_score: match.score.fullTime.away,
          stage: match.stage,
        },
        create: {
          id: match.id,
          utc_date: match.utcDate,
          status: match.status,
          group_name: match.group,
          home_team_name: match.homeTeam.name,
          home_team_crest: match.homeTeam.crest,
          away_team_name: match.awayTeam.name,
          away_team_crest: match.awayTeam.crest,
          score_winner: match.score.winner,
          home_score: match.score.fullTime.home,
          away_score: match.score.fullTime.away,
          stage: match.stage,
        },
      });
    }

    console.log('Matchs de la phase de groupes sauvegardés avec succès.');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des matchs :', error);
    throw new Error('Impossible de sauvegarder les matchs.');
  }
}

// Récupérer les résultats des matchs finis
async function getResultsUncached() {
  try {
    const results = await prisma.matches.findMany({
      where: { status: 'FINISHED' },
      select: { id: true, score_winner: true },
    });

    // Transformer pour correspondre à ton ancien format
    return results.map(r => ({ match_id: r.id, score_winner: r.score_winner }));
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats des matchs :', error);
    throw new Error('Impossible de récupérer les résultats des matchs.');
  }
}

// Version cachée - revalidate toutes les 30 minutes
const getResults = unstable_cache(
  async () => getResultsUncached(),
  ['get-results'],
  { revalidate: 1800, tags: ['results'] }
);

// Récupérer les pronostics des utilisateurs
async function getUserPredictionsUncached() {
  try {
    const predictions = await prisma.bet.findMany({
      select: { user_id: true, match_id: true, prediction: true },
    });

    // Transformer pour correspondre à ton ancien format
    return predictions.map(p => ({
      user_id: p.user_id,
      match_id: p.match_id,
      prediction: p.prediction,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des pronostics des utilisateurs :', error);
    throw new Error('Impossible de récupérer les pronostics des utilisateurs.');
  }
}

// Version cachée - revalidate toutes les 5 minutes
const getUserPredictions = unstable_cache(
  async () => getUserPredictionsUncached(),
  ['get-predictions'],
  { revalidate: 300, tags: ['predictions'] }
);

// Mettre à jour les points des utilisateurs
async function updateUserPoints(userId, points) {
  try {
    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { points },
    });
    console.log(`Points mis à jour pour l'utilisateur ${userId} : ${points}`);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des points pour l'utilisateur ${userId} :`, error);
    throw new Error('Impossible de mettre à jour les points de l\'utilisateur.');
  }
}

// Récupérer les matchs (mis en cache)
async function getMatchesUncached() {
  try {
    return await prisma.matches.findMany({
      orderBy: [
        { group_name: 'asc' },
        { utc_date: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs :', error);
    throw new Error('Impossible de récupérer les matchs.');
  }
}

// Version cachée - revalidate toutes les 1 heure
const getMatches = unstable_cache(
  async () => getMatchesUncached(),
  ['get-matches'],
  { revalidate: 3600, tags: ['matches'] }
);

// Récupérer le leaderboard (mis en cache)
async function getLeaderboardUncached() {
  try {
    return await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        points: true,
        has_bet: true
      },
      orderBy: {
        points: 'desc',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du leaderboard :', error);
    throw new Error('Impossible de récupérer le leaderboard.');
  }
}

// Version cachée - revalidate toutes les 5 minutes
const getLeaderboard = unstable_cache(
  async () => getLeaderboardUncached(),
  ['get-leaderboard'],
  { revalidate: 300, tags: ['leaderboard'] }
);

module.exports = {
  saveMatches,
  getResults,
  getUserPredictions,
  updateUserPoints,
  getMatches,
  getLeaderboard,
};
