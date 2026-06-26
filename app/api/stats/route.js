import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Query PostgreSQL optimisée pour récupérer les matches et compter les bets
    const result = await prisma.matches.findMany({
      include: {
        bet: {
          include: {
            users: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        utc_date: "asc",
      },
    });
    
    // Formater les données
    const matchesStats = result.map((match) => {
      const home = match.bet.filter(b => b.prediction === "HOME_TEAM").length;
      const draw = match.bet.filter(b => b.prediction === "DRAW").length;
      const away = match.bet.filter(b => b.prediction === "AWAY_TEAM").length;
      
      return {
        id: match.id,
        team1: match.home_team_name,
        team2: match.away_team_name,
        utc_date: match.utc_date,
        score_winner: match.score_winner,
        status: match.status,
        
        stats: {
          home,
          draw,
          away,
        },
        
        total: match.bet.length,
        
        bets: match.bet.map((b) => ({
          username: b.users.username,
          prediction: b.prediction,
        })),
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
