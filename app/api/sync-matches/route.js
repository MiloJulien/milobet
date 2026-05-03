import { fetchFootballData } from '@/lib/footballApi'
import { saveMatches } from '@/lib/dbService'

export async function GET(req) {
    try {
        // Appelle l'API pour récupérer les matchs
        const data = await fetchFootballData('/competitions/WC/matches');
        const matches = data.matches;

        // Sauvegarde les matchs dans la base de données
        await saveMatches(matches);

        // Appeler la route pour calculer les points
        const calculatePointsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/calculate-points`, {
            method: 'POST',
        });

        if (!calculatePointsResponse.ok) {
            throw new Error('Erreur lors du calcul des points.');
        }

        return new Response(JSON.stringify({ message: 'Matchs synchronisés et points calculés avec succès.' }), { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la synchronisation des matchs :', error);
        return new Response(JSON.stringify({ message: 'Erreur lors de la synchronisation des matchs.' }), { status: 500 });
    }
}