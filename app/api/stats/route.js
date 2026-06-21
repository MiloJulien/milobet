import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Query PostgreSQL optimisée pour récupérer les matches et compter les bets
    const result = await prisma.$queryRaw`
      SELECT 
        m.id,
        m.home_team_name,
        m.away_team_name,
        m.utc_date,
        m.score_winner,
        m.status,        COALESCE(SUM(CASE WHEN b.prediction = 'HOME_TEAM' THEN 1 ELSE 0 END), 0) as home_count,
        COALESCE(SUM(CASE WHEN b.prediction = 'DRAW' THEN 1 ELSE 0 END), 0) as draw_count,
        COALESCE(SUM(CASE WHEN b.prediction = 'AWAY_TEAM' THEN 1 ELSE 0 END), 0) as away_count
      FROM matches m
      LEFT JOIN bet b ON m.id = b.match_id
      GROUP BY m.id, m.home_team_name, m.away_team_name, m.utc_date, m.status
      ORDER BY m.utc_date ASC
    `;

    // Formater les données
    const matchesStats = result.map((row) => {
      const total = Number(row.home_count) + Number(row.draw_count) + Number(row.away_count);
      
      return {
        id: row.id,
        team1: row.home_team_name,
        team2: row.away_team_name,
        utc_date: row.utc_date,
        score_winner: row.score_winner,
        status: row.status,
        stats: {
          home: Number(row.home_count),
          draw: Number(row.draw_count),
          away: Number(row.away_count),
        },
        total,
      };
    });

    return NextResponse.json(
      { stats: matchesStats },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des stats :', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des stats' },
      { status: 500 }
    );
  }
}
