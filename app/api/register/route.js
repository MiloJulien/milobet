import { findUserByEmail, findUserByUsername, createUser } from '@/lib/userService'
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { username, email, password } = await req.json()

        // Vérifie si l'email existe déjà
        const existingEmail = await findUserByEmail(email)
        if (existingEmail) {
            return new Response(JSON.stringify({ message: 'Cet email est déjà utilisé.' }), { status: 400 })
        }

        // Vérifie si le nom d'utilisateur existe déjà
        const existingUsername = await findUserByUsername(username)
        if (existingUsername) {
            return new Response(JSON.stringify({ message: 'Ce nom d\'utilisateur est déjà pris.' }), { status: 400 })
        }

        // Hash le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10)

        // Crée l'utilisateur
        const userId = await createUser({ username, email, password: hashedPassword })

        return new Response(JSON.stringify({ message: 'Utilisateur créé avec succès.', userId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(JSON.stringify({ message: 'Erreur interne du serveur.' }), { status: 500 })
    }
}
