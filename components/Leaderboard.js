import React, { useEffect, useState } from "react";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) throw new Error("Erreur lors de la récupération du classement.");
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

  if (loading) return <p className="text-white p-4">Chargement du classement...</p>;
  if (error) return <p className="text-red-500 p-4">Erreur : {error}</p>;

  // On récupère les 3 premiers
  const top3 = leaderboard.slice(0, 3);

  // On les réorganise : [2e, 1er, 3e]
  const podium = [top3[1], top3[0], top3[2]];

  const medalColors = [
    "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-white", // 1er
    "bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 text-white",      // 2e
    "bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 text-white",      // 3e
  ];

  const rankIcons = {
    0: (
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-1-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M9.283 4.002H7.971L6.072 5.385v1.271l1.834-1.318h.065V12h1.312z" />
      </svg>
    ),
    1: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-2-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.646 6.24c0-.691.493-1.306 1.336-1.306.756 0 1.313.492 1.313 1.236 0 .697-.469 1.23-.902 1.705l-2.971 3.293V12h5.344v-1.107H7.268v-.077l1.974-2.22.096-.107c.688-.763 1.287-1.428 1.287-2.43 0-1.266-1.031-2.215-2.613-2.215-1.758 0-2.637 1.19-2.637 2.402v.065h1.271v-.07Z" />
      </svg>
    ),
    2: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-3-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8.082.414c.92 0 1.535.54 1.541 1.318.012.791-.615 1.36-1.588 1.354-.861-.006-1.482-.469-1.54-1.066H5.104c.047 1.177 1.05 2.144 2.754 2.144 1.653 0 2.954-.937 2.93-2.396-.023-1.278-1.031-1.846-1.734-1.916v-.07c.597-.1 1.505-.739 1.482-1.876-.03-1.177-1.043-2.074-2.637-2.062-1.675.006-2.59.984-2.625 2.12h1.248c.036-.556.557-1.054 1.348-1.054.785 0 1.348.486 1.348 1.195.006.715-.563 1.237-1.342 1.237h-.838v1.072h.879Z" />
      </svg>
    ),
  };

  const podiumHeights = {
    0: "h-20", // 1er : plus haut
    1: "h-15", // 2e : moyen
    2: "h-10", // 3e : plus bas
  };

  return (
    <div className="container mx-auto p-4">
      {/* Podium */}
      <div className="flex justify-center items-end space-x-2 mb-8 h-48">
        {podium.map((player, index) => {
          const realRank = leaderboard.indexOf(player); // 0 = 1er, 1 = 2e, 2 = 3e
          return (
            <div
              key={player.id}
              className="flex flex-col items-center justify-end h-48"
            >
              <div className="w-27 h-20 rounded-xl flex items-center justify-center border-1 border-emerald-400 bg-gray-800">
                <div>
                  <p className="text-white font-semibold mt-2 text-center max-w-[90px] truncate">
                    {player.username}
                  </p>

                  <div className="flex flex-col items-center text-emerald-400 font-bold text-lg mt-1">
                    <span className="flex items-center gap-1">
                      {player.points}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-p-circle-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.5 4.002V12h1.283V9.164h1.668C10.033 9.164 11 8.08 11 6.586c0-1.482-.955-2.584-2.538-2.584zm2.77 4.072c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`w-27 ${podiumHeights[realRank]} mt-3 rounded flex items-center justify-center text-sm font-bold ${medalColors[realRank]}`}
              >
                {rankIcons[realRank]}
              </div>
            </div>
          );
        })}
      </div>
      {/* liste des autres joueurs */}
      <div className="space-y-3">
        {leaderboard.slice(3).map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700"
          >
            {/* Rang */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white font-bold">
              {index + 4}
            </div>

            {/* Infos joueur */}
            <div className="flex flex-col flex-1 ml-4">
              <span className="text-white font-semibold max-w-[190px] truncate">{player.username}</span>

              <span className="text-sm text-gray-400">
                {player.progress > 0 && `+${player.progress} places`}
                {player.progress < 0 && `${player.progress} places`}
                {player.progress === 0 && "Stable"}
              </span>
            </div>

            {/* Points */}
            <div className="text-emerald-400 font-bold text-lg flex items-center gap-1">
              <span>{player.points}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-p-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.5 4.002V12h1.283V9.164h1.668C10.033 9.164 11 8.08 11 6.586c0-1.482-.955-2.584-2.538-2.584zm2.77 4.072c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97z" />
              </svg>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
