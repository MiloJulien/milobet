import { fetchFootballData } from '@/lib/footballApi'
import { saveMatches } from '@/lib/dbService'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache' 

export async function GET(req) {
    try {
        // Appelle l'API pour récupérer les matchs
        const data = await fetchFootballData('/competitions/WC/matches');
        const matches = data.matches;

        // Sauvegarde les matchs dans la base de données
        await saveMatches(matches);

        // Simuler des résultats pour les matchs de groupe (pour les tests)
        // const fakeResults = ["HOME_TEAM", "AWAY_TEAM", "DRAW"];
        // const groupStageMatches = matches.filter(m => m.stage === "GROUP_STAGE");
        // for (const match of groupStageMatches) {
        //     const randomWinner = fakeResults[Math.floor(Math.random() * fakeResults.length)];
        //     await prisma.matches.update({
        //         where: { id: match.id },
        //         data: {
        //             score_winner: randomWinner,
        //             status: "FINISHED",
        //         },
        //     });
        // }

        revalidateTag('results');      // ← invalide le cache avant le calcul
        revalidateTag('predictions');

        // Appeler la route pour calculer les points
        const calculatePointsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/calculate-points`, {
            method: 'POST',
        });

        if (!calculatePointsResponse.ok) {
            throw new Error('Erreur lors du calcul des points.');
        }

         revalidateTag('leaderboard');

        return new Response(JSON.stringify({ message: 'Matchs synchronisés et points calculés avec succès.' }), { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la synchronisation des matchs :', error);
        return new Response(JSON.stringify({ message: 'Erreur lors de la synchronisation des matchs.' }), { status: 500 });
    }
}