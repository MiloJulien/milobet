import { getResults, getUserPredictions, updateUserPoints } from '@/lib/dbService';

export async function POST(req) {
    try {
        // Récupérer les résultats des matchs depuis la base de données
        const results = await getResults();

        // Récupérer les pronostics des utilisateurs
        const predictions = await getUserPredictions();

        // Calculer les points pour chaque utilisateur
        const userPoints = {};

        predictions.forEach((prediction) => {
            const result = results.find((r) => r.match_id === prediction.match_id);

            if (result) {
                if (!userPoints[prediction.user_id]) {
                    userPoints[prediction.user_id] = 0;
                }

                // Ajouter des points pour une prédiction correcte
                if (prediction.prediction === result.score_winner) {
                    userPoints[prediction.user_id] += 1;
                }
            }
        });

        // Mettre à jour les points des utilisateurs dans la base de données
        for (const userId in userPoints) {
            await updateUserPoints(userId, userPoints[userId]);
        }

        return new Response(JSON.stringify({ message: 'Points calculés avec succès.' }), { status: 200 });
    } catch (error) {
        console.error('Erreur lors du calcul des points :', error);
        return new Response(JSON.stringify({ message: 'Erreur lors du calcul des points.' }), { status: 500 });
    }
}
