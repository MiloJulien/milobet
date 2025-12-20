'use client';
import { useState } from 'react';
import { signIn } from "next-auth/react";

export default function Inscription() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Inscription réussie !');
        setFormData({ username: '', email: '', password: '' });
        setError(null);
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: true,
          callbackUrl: "/", // redirection après login
        });
      } else {
        setError(data.message); // Affiche le message d'erreur spécifique
      }
    } catch (error) {
      setError('Erreur de connexion au serveur.');
    }
  };

  return (
    <div className="container mx-auto bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Inscription</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-bold mb-2 text-white">
            Pseudo
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-bold mb-2 text-white">
            Adresse mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-bold mb-2 text-white">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border rounded w-full py-2 px-3"
            required
          />
        </div>
        <input
          type="submit"
          value="S'inscrire"
          className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-4 border-b-4 border-emerald-500 hover:border-emerald-400 rounded"
        />
        <input
          type="text"
          name="honeypot"
          style={{ display: 'none' }}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        />
      </form>
      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
