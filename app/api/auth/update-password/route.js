import { updatePassword } from '@/lib/userService'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req) {
    try {
        const { token, password } = await req.json()
        const userId = verifyResetToken(token)

        if (!userId) {
            return new Response(JSON.stringify({ message: 'Token invalide ou expiré.' }), { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await updatePassword(userId, hashedPassword)

        return new Response(JSON.stringify({ message: 'Mot de passe mis à jour.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Erreur interne du serveur.' }), { status: 500 })
    }
}

function verifyResetToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return decoded.userId
    } catch (error) {
        return null
    }
}