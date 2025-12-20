'use client'

import { useState } from 'react'

export default function ResetPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.message || 'Une erreur est survenue.')
                return
            }

            const data = await response.json()
            setMessage(data.message)
            setError(null)
        } catch (error) {
            setError('Erreur de connexion au serveur.')
        }
    }

    return (
      <section className="container mx-auto p-4">
            <div className="container mx-auto bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Réinitialiser le mot de passe</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-bold mb-2">
                            Adresse mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="border rounded w-full py-2 px-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <input
                        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-4 border-b-4 border-emerald-500 hover:border-emerald-400 rounded"
                        type="submit"
                        value="Envoyer le lien"
                    />
                </form>
                {message && <p className="text-green-500 mt-4">{message}</p>}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </section>
    )
}