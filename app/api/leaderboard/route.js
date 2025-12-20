// app/api/leaderboard/route.js
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const users = await prisma.users.findMany({
      select: {
        username: true,
        points: true,
        has_bet: true
      },
      orderBy: {
        points: 'desc',
      },
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du classement :", error);
    return new Response(JSON.stringify({ message: "Erreur serveur." }), { status: 500 });
  }
}
