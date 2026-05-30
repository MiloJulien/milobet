"use client";

import { useEffect, useState } from "react";

export default function Stats() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats`);
        if (!res.ok) throw new Error("Erreur lors du chargement des données");
        
        const data = await res.json();
        setMatches(data.stats);
      } catch (err) {
        setError(err.message);
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const colorPalette = { name: "Italien", colors: ["#10b981", "#ffffff", "#ef4444"] };

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

  const translateTeam = (teamName) => {
    return countryTranslations[teamName] || teamName;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-white">Aucun match disponible</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matches.map((match) => {
          const totalBets = match.total;
          const home_pct = totalBets > 0 ? ((match.stats.home / totalBets) * 100).toFixed(1) : 0;
          const draw_pct = totalBets > 0 ? ((match.stats.draw / totalBets) * 100).toFixed(1) : 0;
          const away_pct = totalBets > 0 ? ((match.stats.away / totalBets) * 100).toFixed(1) : 0;
          
          const team1Translated = translateTeam(match.team1);
          const team2Translated = translateTeam(match.team2);

          return (
            <div key={match.id} className="bg-gray-800 rounded-lg">
              <div className="p-2 border-b-1 border-emerald-700">
                <h3 className="font-bold text-center">
                  {team1Translated} - {team2Translated}
                </h3>
              </div>
              <div className="p-4">
                <div className="w-full bg-gray-700 rounded-lg h-6 overflow-hidden flex mb-6" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)" }}>
                  {match.stats.home > 0 && (
                    <div 
                      className="h-full flex items-center justify-center" 
                      style={{ width: `${home_pct}%`, backgroundColor: colorPalette.colors[0], boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}
                    >
                      <span className="font-bold text-sm text-white">{match.stats.home}</span>
                    </div>
                  )}
                  {match.stats.draw > 0 && (
                    <div 
                      className="h-full flex items-center justify-center" 
                      style={{ width: `${draw_pct}%`, backgroundColor: colorPalette.colors[1], boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}
                    >
                      <span className="font-bold text-sm text-gray-900">{match.stats.draw}</span>
                    </div>
                  )}
                  {match.stats.away > 0 && (
                    <div 
                      className="h-full flex items-center justify-center" 
                      style={{ width: `${away_pct}%`, backgroundColor: colorPalette.colors[2], boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}
                    >
                      <span className="font-bold text-sm text-white">{match.stats.away}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {match.stats.home > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPalette.colors[0] }}></div>
                      <div className="flex justify-between flex-1">
                        <p className="text-white text-xs font-bold">{team1Translated}</p>
                        <p className="text-gray-400 text-xs">{match.stats.home} pronostics ({home_pct}%)</p>
                      </div>
                    </div>
                  )}
                  {match.stats.draw > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPalette.colors[1] }}></div>
                      <div className="flex justify-between flex-1">
                        <p className="text-white text-xs font-bold">Nul</p>
                        <p className="text-gray-400 text-xs">{match.stats.draw} pronostics ({draw_pct}%)</p>
                      </div>
                    </div>
                  )}
                  {match.stats.away > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPalette.colors[2] }}></div>
                      <div className="flex justify-between flex-1">
                        <p className="text-white text-xs font-bold">{team2Translated}</p>
                        <p className="text-gray-400 text-xs">{match.stats.away} pronostics ({away_pct}%)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
