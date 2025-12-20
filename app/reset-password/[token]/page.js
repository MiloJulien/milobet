'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const router = useRouter()
    const params = useParams()


    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: params.token, password }),
            })

            const data = await response.json()
            if (!response.ok) {
                setError(data.message || 'Une erreur est survenue.')
                return
            }

            alert('Mot de passe réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.')
            router.push('/')
        } catch (error) {
            console.error('Erreur lors de la soumission du formulaire :', error)
            setError('Erreur de connexion au serveur.')
        }
    }

    return (
            <section className="container mx-auto p-4">
            <div className="container mx-auto bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Réinitialiser le mot de passe</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-bold mb-2">
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="border rounded w-full py-2 px-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <input
                        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-4 border-b-4 border-emerald-500 hover:border-emerald-400 rounded"
                        type="submit"
                        value="Réinitialiser"
                    />
                </form>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </section>
    )
}