import axios from 'axios'

const BASE_URL = 'https://api.football-data.org/v4'

export async function fetchFootballData(endpoint) {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
                'X-Auth-Token': process.env.FOOTBALL_API_KEY, // Clé API
            },
        })
        return response.data
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Football Data :', error.response?.data || error.message)
        throw new Error('Impossible de récupérer les données de l\'API.')
    }
}