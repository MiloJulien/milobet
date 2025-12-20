import { findUserByEmail } from '@/lib/userService'
import { sendResetPasswordEmail } from '@/lib/emailService'
import jwt from 'jsonwebtoken'

export async function POST(req) {
    try {
        const { email } = await req.json()

        const user = await findUserByEmail(email)
        if (!user) {
            return new Response(JSON.stringify({ message: 'Utilisateur non trouvé.' }), { status: 404 })
        }

        // Génère un token de réinitialisation
        const resetToken = generateResetToken(user.id)
        const resetLink = `/${resetToken}`

        // Envoie l'email avec le lien de réinitialisation
        await sendResetPasswordEmail(email, resetLink)

        return new Response(JSON.stringify({ message: 'Email envoyé.' }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Erreur interne du serveur.' }), { status: 500 })
    }
}

// Fonction pour générer un token de réinitialisation
function generateResetToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }) // Token valide 1 heure
}