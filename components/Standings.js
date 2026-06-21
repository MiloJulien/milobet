"use client";

import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Standings() {
    const [standings, setStandings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [standingsRes, statsRes] = await Promise.all([
                    fetch(`/api/standings`),
                    fetch(`/api/stats`),
                ]);
                if (!standingsRes.ok || !statsRes.ok) throw new Error("Erreur lors du chargement des données");
                
                const standingsData = await standingsRes.json();
                const statsData = await statsRes.json();
                setStandings(standingsData.standings || []);
                setMatches(statsData.stats || []);
            } catch (err) {
                setError(err.message);
                console.error("Erreur:", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
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
    
    if (!standings || standings.length === 0) {
        return (
            <div className="p-6 bg-gray-900 min-h-screen">
            <div className="text-white">Aucun joueur pour le moment</div>
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
    
    // Grouper les matches par statut, triés du plus ancien au plus récent
    // pour correspondre à l'ordre chronologique de standings[i].history
    const finishedMatches = matches.filter(m => m.status === 'FINISHED').sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date));
    
    // Préparer les données pour le graphique des positions
    const chartData = standings[0]?.history?.map((_, matchIdx) => {
        const matchInfo = finishedMatches[matchIdx];
        const team1Translated = matchInfo ? translateTeam(matchInfo.team1) : '?';
        const team2Translated = matchInfo ? translateTeam(matchInfo.team2) : '?';
        
        const dataPoint = {
            match: `Match ${matchIdx + 1}`,
            matchLabel: `Match ${matchIdx + 1} : ${team1Translated} - ${team2Translated}`,
        };
        
        // Pour chaque match, créer un classement temporaire
        const matchStandings = standings
        .map(player => ({
            ...player,
            points_at_match: player.history[matchIdx]?.cumulative_points || 0,
        }))
        .sort((a, b) => b.points_at_match - a.points_at_match)
        .map((player, rank) => ({
            ...player,
            rank_at_match: rank + 1,
        }));
        
        matchStandings.forEach(player => {
            dataPoint[player.username] = player.rank_at_match;
        });
        
        return dataPoint;
    }) || [];
    
    // Palette fixe de 28 couleurs distinctes pour les joueurs
    const colors = [
        '#fbbf24', '#60a5fa', '#34d399', '#f87171', '#a78bfa',
        '#fb923c', '#22d3ee', '#f472b6', '#a3e635', '#818cf8',
        '#facc15', '#2dd4bf', '#fb7185', '#c084fc', '#4ade80',
        '#38bdf8', '#e879f9', '#fdba74', '#94a3b8', '#f43f5e',
        '#84cc16', '#06b6d4', '#d946ef', '#eab308', '#10b981',
        '#6366f1', '#ec4899', '#f97316',
    ];
    const getPlayerColor = (idx) => colors[idx % colors.length];
    
    // Composant personnalisé pour le Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const sortedPayload = [...payload].sort((a, b) => a.value - b.value);
            const matchLabel = payload[0]?.payload?.matchLabel || label;
            return (
                <div className="bg-gray-900 border border-gray-600 p-3 rounded shadow-lg">
                <p className="text-white mb-2 text-sm">{matchLabel}</p>
                {sortedPayload.map((entry, idx) => (
                    <p key={idx} style={{ color: entry.color }} className="text-sm">
                    #{entry.value} : {entry.name}
                    </p>
                ))}
                </div>
            );
        }
        return null;
    };
    
    // Centre horizontalement le point cliqué dans le conteneur scrollable
    const handleChartClick = (chartState) => {
        if (!chartState) return;
        const container = scrollContainerRef.current;
        if (!container) return;
        
        // chartX est relatif à la zone visible du SVG (qui fait width=100% du scroll),
        // donc on ajoute le scroll actuel pour obtenir la position absolue dans le conteneur
        const pointX = (chartState.chartX ?? 0) + container.scrollLeft;
        
        const targetScrollLeft = pointX - container.clientWidth / 2;
        container.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth',
        });
    };
    
    return (
        <div className="p-4 bg-gray-950 min-h-screen pb-24">
        {/* Graphique des positions */}
        <div ref={scrollContainerRef} className="bg-gray-800 rounded-lg border border-gray-600 overflow-x-auto">
        {chartData.length > 0 ? (
            <div style={{ minWidth: '4000px', height: '700px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} onClick={handleChartClick} margin={{ top: 30, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis 
            dataKey="match" 
            stroke="#ffffff"
            padding={{ left: 80 }}
            />
            <YAxis 
            stroke="#ffffff"
            label={{ value: '', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
            reversed
            domain={[0.5, standings.length + 0.5]}
            ticks={Array.from({ length: standings.length }, (_, i) => i + 1)}
            allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {standings.map((player, idx) => (
                <Line
                key={player.id}
                type="monotone"
                dataKey={player.username}
                stroke={getPlayerColor(idx)}
                strokeWidth={2}
                dot={{ fill: getPlayerColor(idx), r: 5 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
                />
            ))}
            </LineChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <div className="text-gray-400 text-center py-8">Aucune donnée disponible</div>
        )}
        </div>
        </div>
    );
}