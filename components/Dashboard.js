import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/statistics");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques.");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-white p-4">Chargement des statistiques...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-4">Erreur : {error}</p>;
  }

  const user = stats.user;
  const global = stats.global;

  return (
    <div className="container mx-auto p-4 space-y-6">

      {/* --- STATISTIQUES PERSONNELLES --- */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 space-y-3">
        <h2 className="text-xl font-bold text-white">Tes statistiques</h2>

        {/* Taux de réussite */}
        <div>
          <p className="text-gray-300 mb-1">Taux de réussite</p>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500"
              style={{ width: `${user.successRate}%` }}
            ></div>
            <div
              className="bg-red-500"
              style={{ width: `${100 - user.successRate}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {user.successRate}% corrects — {user.failRate}% incorrects
          </p>
        </div>

        {/* Groupe le plus réussi */}
        <p className="text-gray-300">
          Groupe le plus réussi :{" "}
          <span className="text-emerald-400 font-semibold">{user.bestGroup}</span>
        </p>

        {/* Totaux */}
        <div className="flex justify-between text-gray-300 text-sm">
          <p>Total pronostics : <span className="text-white">{user.total}</span></p>
          <p>Corrects : <span className="text-emerald-400">{user.correct}</span></p>
        </div>
      </div>

      {/* --- STATISTIQUES GLOBALES --- */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 space-y-3">
        <h2 className="text-xl font-bold text-white">Statistiques générales</h2>

        <p className="text-gray-300">
          Matchs où tout le monde a trouvé :{" "}
          <span className="text-emerald-400 font-semibold">
            {global.perfectForAll}
          </span>
        </p>

        <p className="text-gray-300">
          Matchs où personne n’a trouvé :{" "}
          <span className="text-red-400 font-semibold">
            {global.noCorrect}
          </span>
        </p>

        <p className="text-gray-300">
          Taux de réussite global :{" "}
          <span className="text-emerald-400 font-semibold">
            {global.globalSuccessRate}%
          </span>
        </p>

        {/* Meilleurs par groupe */}
        <div className="mt-3">
          <h3 className="text-lg font-semibold text-white mb-2">
            Meilleurs par groupe
          </h3>

          <div className="space-y-2">
            {Object.entries(global.bestByGroup).map(([group, user]) => (
              <div
                key={group}
                className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
              >
                <span className="text-gray-300 font-medium">
                  Groupe {group}
                </span>
                <span className="text-emerald-400 font-semibold">
                  {user.username} — {user.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
