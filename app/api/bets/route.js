// app/api/bets/route.js
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Utilisateur non authentifié.' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les paris de l'utilisateur
    const bets = await prisma.bet.findMany({
      where: { user_id: userId },
      select: { match_id: true, prediction: true },
    });

    // Retourner le même format que l'ancien code
    const formattedBets = bets.map(b => ({
      match_id: b.match_id,
      prediction: b.prediction,
    }));

    return NextResponse.json(formattedBets, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des paris :', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des paris.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Utilisateur non authentifié.' }, { status: 401 });
    }

    const userId = session.user.id;
    const { predictions } = await req.json();

    for (const [matchId, prediction] of Object.entries(predictions)) {
      await prisma.bet.upsert({
        where: {
          user_id_match_id: { user_id: userId, match_id: parseInt(matchId) },
        },
        update: { prediction },
        create: {
          user_id: userId,
          match_id: parseInt(matchId),
          prediction,
        },
      });
    }

    // Mettre à jour le champ `bet` de l'utilisateur à 1
    await prisma.users.update({
      where: { id: userId },
      data: { has_bet: 1 },
    });

    return NextResponse.json({ message: 'Prédictions enregistrées avec succès.' }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des prédictions :", error);
    return NextResponse.json({ message: "Erreur lors de l'enregistrement des prédictions." }, { status: 500 });
  }
}
