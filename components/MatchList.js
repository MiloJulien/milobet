import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

const MatchList = () => {
  const { data: session } = useSession();
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]); // Stocke les paris existants
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState({}); // Stocke les prédictions pour chaque match
  const [errors, setErrors] = useState({}); // Stocke les erreurs pour chaque match
  const firstErrorRef = useRef(null); // Référence pour le premier champ avec une erreur

  useEffect(() => {
    const fetchMatchesAndBets = async () => {
      try {
        // Récupérer les matchs
        const responseMatches = await fetch("/api/matches");
        const dataMatches = await responseMatches.json();
        setMatches(dataMatches);

        // Si l'utilisateur a déjà fait ses paris (has_bet === 1), récupérer les paris
        if (session.user.has_bet === 1) {
          const responseBets = await fetch("/api/bets");
          const dataBets = await responseBets.json();
          setBets(dataBets);

          // Associer les paris existants aux matchs
          if (Array.isArray(dataBets)) {
            const betsMap = dataBets.reduce((acc, bet) => {
              acc[bet.match_id] = bet.prediction; // Associe chaque match à sa prédiction
              return acc;
            }, {});
            setPredictions(betsMap); // Initialise les prédictions avec les paris existants
          } else {
            console.error("Les données des paris ne sont pas un tableau :", dataBets);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchesAndBets();
  }, [session]);

  if (status === 'loading') {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      {/* Logo */}
      <Image
        src="/images/logos/logo-white.png" // Remplacez par le chemin de votre logo
        alt="Logo"
        className="w-32 h-32 mb-4"
        width={12}
        height={12}
      />
      {/* Barre de chargement */}
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 animate-loading-bar"></div>
      </div>
      {/* Texte de chargement */}
      <p className="text-white mt-4">Chargement des matchs...</p>
    </div>
  );
}

  if (matches.length === 0) {
    return <p>Aucun match disponible.</p>;
  }

  // Met à jour la prédiction pour un match spécifique
  const handlePredictionChange = (matchId, prediction) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: prediction,
    }));
    setErrors((prev) => ({
      ...prev,
      [matchId]: false, // Supprime l'erreur si une prédiction est faite
    }));
  };

  // Envoie les prédictions à l'API
  const handleSubmit = async () => {
    const newErrors = {};
    let firstErrorFound = false;

    // Vérifie que toutes les prédictions sont remplies
    matches.forEach((match) => {
      if (!predictions[match.id]) {
        newErrors[match.id] = "Veuillez faire une prédiction pour ce match.";
        if (!firstErrorFound) {
          firstErrorRef.current = document.getElementById(`match-${match.id}`);
          firstErrorFound = true;
        }
      }
    });

    setErrors(newErrors);

    if (firstErrorFound) {
      // Déplace le focus sur le premier champ avec une erreur
      firstErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ predictions }),
      });

      if (response.ok) {
        alert("Prédictions enregistrées avec succès !");
        window.location.reload(); // Recharge la page après succès
      } else {
        alert("Erreur lors de l'enregistrement des prédictions.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des prédictions :", error);
    }
  };

  return (
    <section>
      <div className="container mx-auto p-4">
        {session.user.has_bet === 0 && (
        <div className="bg-emerald-800 text-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-2">Bienvenue sur MiloBet {session.user.username} !</h2>
          <p className="text-sm">
            Ici, tu peux faire tes pronostics pour les matchs de groupes de la Coupe du monde 2026.
            Sélectionnes le vainqueur ou choisis une égalité en cliquant sur les options disponibles pour chaque match.
            Une fois tes prédictions enregistrées, tu pourras les mettre à jour avant le début des matchs.
          </p>
          <p className="text-sm mt-2">
            Bonne chance et que le meilleur gagne !
          </p>
        </div>
      )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matches.map((match) => (
            <div key={match.id} id={`match-${match.id}`} className="bg-gray-800 rounded-lg">
              <div className="p-2 border-b-1 border-emerald-700">
                <h3 className="font-bold text-center">
                  {match.group_name} - {new Date(match.utc_date).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </h3>
              </div>
              <div className="p-3">
                <ul className="flex items-center justify-center space-x-4">
                  <li>
                    <input
                      type="radio"
                      id={`home-${match.id}`}
                      name={`match-${match.id}`}
                      value="HOME_TEAM"
                      className="hidden peer"
                      checked={predictions[match.id] === "HOME_TEAM"} // Coche si la prédiction est "HOME_TEAM"
                      onChange={() => handlePredictionChange(match.id, "HOME_TEAM")}
                    />
                    <label
                      htmlFor={`home-${match.id}`}
                      className="border-3 rounded-xl px-3 py-2 flex flex-col items-center gap-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-950"
                    >
                      <Image
                        src={match.home_team_crest}
                        alt={`${match.home_team_name} crest`}
                        className="w-12 h-12 object-cover rounded-full"
                        width={12}
                        height={12}
                      />
                      <span className="text-sm">{match.home_team_name}</span>
                    </label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id={`draw-${match.id}`}
                      name={`match-${match.id}`}
                      value="DRAW"
                      className="hidden peer"
                      checked={predictions[match.id] === "DRAW"} // Coche si la prédiction est "DRAW"
                      onChange={() => handlePredictionChange(match.id, "DRAW")}
                    />
                    <label
                      htmlFor={`draw-${match.id}`}
                      className="border-3 rounded-xl px-3 py-2 flex flex-col items-center gap-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-950"
                    >
                      <Image
                        src="/images/logos/logo.png"
                        alt="Draw"
                        className="w-12 h-12 object-cover rounded-full"
                        width={12}
                        height={12}
                      />
                      <span className="text-sm">Nul</span>
                    </label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id={`away-${match.id}`}
                      name={`match-${match.id}`}
                      value="AWAY_TEAM"
                      className="hidden peer"
                      checked={predictions[match.id] === "AWAY_TEAM"} // Coche si la prédiction est "AWAY_TEAM"
                      onChange={() => handlePredictionChange(match.id, "AWAY_TEAM")}
                    />
                    <label
                      htmlFor={`away-${match.id}`}
                      className="border-3 rounded-xl px-3 py-2 flex flex-col items-center gap-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-950"
                    >
                      <Image
                        src={match.away_team_crest}
                        alt={`${match.away_team_name} crest`}
                        className="w-12 h-12 object-cover rounded-full"
                        width={12}
                        height={12}
                      />
                      <span className="text-sm">{match.away_team_name}</span>
                    </label>
                  </li>
                </ul>
                {errors[match.id] && (
                  <p className="text-red-500 text-sm mt-2">{errors[match.id]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-4 border-b-4 border-emerald-500 hover:border-emerald-400 rounded"
        >
           {session.user.has_bet === 0 ? "Envoyer mes prédictions" : "Mettre à jour mes prédictions"}
        </button>
      </div>
    </section>
  );
};

export default MatchList;