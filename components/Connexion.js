'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function Connexion() {
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        const email = e.target.email.value
        const password = e.target.password.value

        // Appelle la fonction signIn de next-auth
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false, // Empêche la redirection automatique
        })

        if (result?.error) {
            setError(result.error) // Affiche l'erreur si la connexion échoue
        } else {
            setError(null) // Réinitialise l'erreur si la connexion réussit
            console.log('Connexion réussie:', result)
        }
    }

    return (
       
            <div className="container mx-auto bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Connexion</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-bold mb-2">Adresse mail</label>
                        <input type="email" id="email" name="email" className="border rounded w-full py-2 px-3" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-bold mb-2">Mot de passe</label>
                        <input type="password" id="password" name="password" className="border rounded w-full py-2 px-3" required />
                    </div>
                    <input className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-4 border-b-4 border-emerald-500 hover:border-emerald-400 rounded"
                        type="submit" value="Se connecter" />
                </form>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <p className="flex justify-end mt-6 text-sm">
                    <a href="/reset-password" className="ml-1 text-sm font-semibold underline">
                        Mot de passe oublié ?
                    </a>
                </p>
            </div>
       
    )
}