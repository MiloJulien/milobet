import React, { useEffect, useState } from "react";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard"); // Assurez-vous que cette route existe
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du classement.");
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <p className="text-white p-4">Chargement du classement...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-4">Erreur : {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Classement des joueurs</h2>
      <table className="table-auto w-full text-white border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-gray-700 px-4 py-2">Position</th>
            <th className="border border-gray-700 px-4 py-2">Joueurs</th>
            <th className="border border-gray-700 px-4 py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr
              key={player.id || `player-${index}`} // Utilise player.id ou une clé de secours basée sur l'index
              className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
            >
              <td className="border border-gray-700 px-4 py-2 text-center">{index + 1}</td>
              <td className="border border-gray-700 px-4 py-2 text-center">{player.username}</td>
              <td className="border border-gray-700 px-4 py-2 text-center">{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;