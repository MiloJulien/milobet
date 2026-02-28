import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
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
      <div className="space-y-3">
        {
          leaderboard.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700" >
              <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-700" : "bg-gray-700"} `} >
                {index + 1}
              </div>
              <div className="flex flex-col flex-1 ml-4">
                <span className="text-white font-semibold">
                  {player.username}
                </span>
                <span className="text-sm text-gray-400">
                  {player.progress > 0 && `+${player.progress} places`} {player.progress < 0 && `${player.progress} places`} {player.progress === 0 && "Stable"}
                </span>
                <span className="text-sm text-emerald-400 font-medium">
                  {player.successRate}% de réussite
                </span>
              </div>
              <div className="text-emerald-400 font-bold text-lg">
                {player.points} pts
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Dashboard;