import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTabs } from "@/app/TabContext";

const MatchList = () => {
  const { data: session } = useSession();
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]); // Stocke les paris existants
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState({}); // Stocke les pronostics pour chaque match
  const [errors, setErrors] = useState({}); // Stocke les erreurs pour chaque match
  const firstErrorRef = useRef(null); // Référence pour le premier champ avec une erreur
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState("loading");
  const [modalMessage, setModalMessage] = useState("");
  const { setActiveTab } = useTabs();


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
              acc[bet.match_id] = bet.prediction; // Associe chaque match à son pronostic
              return acc;
            }, {});
            setPredictions(betsMap); // Initialise les pronostics avec les paris existants
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
        <Image
          src="/images/logos/logo-white.png"
          alt="Logo"
          className="w-32 h-32 mb-4"
          width={256}
          height={256}
          unoptimized
        />
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Chargement de la page...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return <p>Aucun match disponible.</p>;
  }

  const formatGroupName = (group) => {
    if (!group) return "";
    const letter = group.split("_")[1];
    return `Groupe ${letter}`;
  };

  const countryTranslations = {
    "Mexico": "Mexique",
    "South Africa": "Afrique du Sud",
    "South Korea": "Corée du Sud",
    "Czechia": "Tchéquie",
    "Switzerland": "Suisse",
    "Bosnia-Herzegovina": "Bosnie",
    "Brazil": "Brésil",
    "Morocco": "Maroc",
    "Haiti": "Haïti",
    "Scotland": "Écosse",
    "United States": "États-Unis",
    "Australia": "Australie",
    "Turkey": "Turquie",
    "Germany": "Allemagne",
    "Ivory Coast": "Côte d'Ivoire",
    "Ecuador": "Équateur",
    "Netherlands": "Pays-Bas",
    "Japan": "Japon",
    "Tunisia": "Tunisie",
    "Sweden": "Suède",
    "Belgium": "Belgique",
    "Egypt": "Égypte",
    "New Zealand": "Nouvelle-Zélande",
    "Spain": "Espagne",
    "Cape Verde Islands": "Cap-Vert",
    "Saudi Arabia": "Arabie Saoudite",
    "Senegal": "Sénégal",
    "Iraq": "Irak",
    "Norway": "Norvège",
    "Argentina": "Argentine",
    "Algeria": "Algérie",
    "Austria": "Autriche",
    "Jordan": "Jordanie",
    "Congo DR": "RD Congo",
    "Uzbekistan": "Ouzbékistan",
    "Colombia": "Colombie",
    "England": "Angleterre",
    "Croatia": "Croatie",
  };

  const translateCountry = (name) => {
    return countryTranslations[name] || name;
  };

  const safeSrc = (src) => {
    if (!src || src.trim() === "") return null;
    return src;
  };

  // Met à jour le pronostic pour un match spécifique
  const handlePredictionChange = (matchId, prediction) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: prediction,
    }));
    setErrors((prev) => ({
      ...prev,
      [matchId]: false, // Supprime l'erreur si un pronostic est fait
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    let firstErrorFound = false;

    matches.forEach((match) => {
      if (!predictions[match.id]) {
        newErrors[match.id] = "Veuillez faire un pronostic pour ce match.";
        if (!firstErrorFound) {
          firstErrorRef.current = document.getElementById(`match-${match.id}`);
          firstErrorFound = true;
        }
      }
    });

    setErrors(newErrors);

    if (firstErrorFound) {
      firstErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // ⬅️ Dès le clic
    setShowModal(true);
    setModalState("loading");
    setModalMessage("Envoi des pronostics...");

    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions }),
      });

      if (response.ok) {
        // Succès → afficher succès
        setModalState("success");
        setModalMessage("Pronostics enregistrés avec succès !");

        // Puis passer automatiquement en mode redirection
        setTimeout(() => {
          setModalState("redirect");
          setModalMessage("Redirection...");
        }, 1200);
        window.location.reload();

      } else {
        setModalState("error");
        setModalMessage("Erreur lors de l'enregistrement des pronostics.");
      }
    } catch (error) {
      setModalState("error");
      setModalMessage("Une erreur est survenue.");
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
              Une fois tes pronostics enregistrés, tu pourras les mettre à jour avant le début des matchs.
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
                  {formatGroupName(match.group_name)} - {new Date(match.utc_date).toLocaleString("fr-FR", {
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
                      checked={predictions[match.id] === "HOME_TEAM"}
                      onChange={() => handlePredictionChange(match.id, "HOME_TEAM")}
                    />
                    <label
                      htmlFor={`home-${match.id}`}
                      className="w-22 min-h-[120px] border-3 rounded-xl px-3 py-2 flex flex-col items-center justify-center gap-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-950"
                    >
                      {safeSrc(match.home_team_crest) ? (
                        <Image
                          src={match.home_team_crest}
                          alt={`${match.home_team_name} crest`}
                          className="w-12 h-12 object-cover rounded-full"
                          width={256}
                          height={256}
                          unoptimized
                        />) : (<div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xs"> ? </div>)}
                      <span className="text-sm text-center leading-tight">
                        {safeSrc(match.home_team_crest) ? (
                          translateCountry(match.home_team_name)
                        ) : ("Pays inconnu")}
                      </span>
                    </label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id={`draw-${match.id}`}
                      name={`match-${match.id}`}
                      value="DRAW"
                      className="hidden peer"
                      checked={predictions[match.id] === "DRAW"}
                      onChange={() => handlePredictionChange(match.id, "DRAW")}
                    />
                    <label
                      htmlFor={`draw-${match.id}`}
                      className="w-22 min-h-[120px] border-3 rounded-xl px-3 py-2 flex flex-col items-center justify-center gap-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-950"
                    >
                      <Image
                        src="/images/logos/logo.png"
                        alt="Draw"
                        className="w-12 h-12 object-cover rounded-full"
                        width={256}
                        height={256}
                        unoptimized
                      />
                      <span className="text-sm text-center leading-tight">Nul</span>
                    </label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id={`away-${match.id}`}
                      name={`match-${match.id}`}
                      value="AWAY_TEAM"
                      className="hidden peer"
                      checked={predictions[match.id] === "AWAY_TEAM"}
                      onChange={() => handlePredictionChange(match.id, "AWAY_TEAM")}
                    />
                    <label
                      htmlFor={`away-${match.id}`}
                      className="w-22 min-h-[120px] border-3 rounded-xl px-3 py-2 flex flex-col items-center justify-center gap-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-950"
                    >
                      {safeSrc(match.away_team_crest) ? (
                        <Image
                          src={match.away_team_crest}
                          alt={`${match.away_team_name} crest`}
                          className="w-12 h-12 object-cover rounded-full"
                          width={256}
                          height={256}
                          unoptimized
                        />) : (<div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xs"> ? </div>)}
                      <span className="text-sm text-center leading-tight">
                        {safeSrc(match.away_team_crest) ? (
                          translateCountry(match.away_team_name)
                        ) : ("Pays inconnu")}
                      </span>
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
          {session.user.has_bet === 0 ? "Envoyer mes pronostics" : "Mettre à jour mes pronostics"}
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 text-center w-80">

            {/* Message */}
            <p className="text-emerald-500 text-lg mb-4">{modalMessage}</p>

            {/* Spinner pendant le chargement */}
            {(modalState === "loading" || modalState === "success" || modalState === "redirect") && (
              <div className="flex justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Bouton si erreur */}
            {modalState === "error" && (
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      )}


    </section>
  );
};

export default MatchList;