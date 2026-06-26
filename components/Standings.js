"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';

export default function Standings() {
    const [standings, setStandings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const chartWrapperRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [animMatchIdx, setAnimMatchIdx] = useState(-1);
    const animTimer = useRef(null);
    const ANIM_SPEED = 800;
    const { data: session } = useSession();
    const connectedUsername = session?.user?.name;
    const [animPlayer, setAnimPlayer] = useState(null);
    const chartDataRef = useRef([]);
    const scrollContainerRef = useRef(null);
    const standingsRef = useRef([]);

    const MARGIN = { top: 30, bottom: 60, right: 10, left: 120 };
    const Y_AXIS_WIDTH = 60;
    const CHART_HEIGHT = 1000;

    const togglePlay = () => {
        if (isPlaying) {
            clearInterval(animTimer.current);
            setIsPlaying(false);
            setAnimPlayer(null);
            return;
        }

        const data = chartDataRef.current;
        if (!data.length) return;

        const playerToFollow = selectedPlayer || connectedUsername || null;

        const startIdx = (playerToFollow !== animPlayer && animPlayer !== null) ? 0
            : (animMatchIdx >= data.length - 1 ? 0 : animMatchIdx + 1);

        setAnimPlayer(playerToFollow);
        if (playerToFollow) setSelectedPlayer(playerToFollow);

        setIsPlaying(true);
        let idx = startIdx;

        const step = () => {
            setAnimMatchIdx(idx);

            const container = scrollContainerRef.current;
            const wrapper = chartWrapperRef.current;

            if (container && wrapper) {
                const totalWidth = wrapper.scrollWidth;
                const ratio = data.length > 1 ? idx / (data.length - 1) : 0;
                const target = ratio * totalWidth - container.clientWidth / 2;
                container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
            }

            if (wrapper) {
                const rank = data[idx]?.[playerToFollow];
                if (rank != null) {
                    const plotTop = MARGIN.top;
                    const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
                    const domainMin = 0.5;
                    const domainMax = standingsRef.current.length + 0.5;
                    const yRatio = (rank - domainMin) / (domainMax - domainMin);
                    const yInChart = plotTop + yRatio * plotHeight;
                    const wrapperRect = wrapper.getBoundingClientRect();
                    const absoluteY = wrapperRect.top + window.scrollY + yInChart;
                    window.scrollTo({ top: absoluteY - window.innerHeight / 2, behavior: 'smooth' });
                }
            }

            idx++;
            if (idx >= data.length) {
                clearInterval(animTimer.current);
                setIsPlaying(false);
                setAnimPlayer(null);
                setSelectedPlayer(null);
            }
        };

        step();
        animTimer.current = setInterval(step, ANIM_SPEED);
    };

    useEffect(() => () => clearInterval(animTimer.current), []);

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
                const newStandings = standingsData.standings || [];
                setStandings(newStandings);
                standingsRef.current = newStandings;
                setMatches(statsData.stats || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const countryTranslations = {
        "Mexico": "Mexique", "South Africa": "Afrique du Sud", "South Korea": "Corée du Sud",
        "Czechia": "Tchéquie", "Switzerland": "Suisse", "Bosnia-Herzegovina": "Bosnie",
        "Brazil": "Brésil", "Morocco": "Maroc", "Haiti": "Haïti", "Scotland": "Écosse",
        "United States": "États-Unis", "Australia": "Australie", "Turkey": "Turquie",
        "Germany": "Allemagne", "Ivory Coast": "Côte d'Ivoire", "Ecuador": "Équateur",
        "Netherlands": "Pays-Bas", "Japan": "Japon", "Tunisia": "Tunisie", "Sweden": "Suède",
        "Belgium": "Belgique", "Egypt": "Égypte", "New Zealand": "Nouvelle-Zélande",
        "Spain": "Espagne", "Cape Verde Islands": "Cap-Vert", "Saudi Arabia": "Arabie Saoudite",
        "Senegal": "Sénégal", "Iraq": "Irak", "Norway": "Norvège", "Argentina": "Argentine",
        "Algeria": "Algérie", "Austria": "Autriche", "Jordan": "Jordanie", "Congo DR": "RD Congo",
        "Uzbekistan": "Ouzbékistan", "Colombia": "Colombie", "England": "Angleterre", "Croatia": "Croatie",
    };

    const translateTeam = (teamName) => countryTranslations[teamName] || teamName;

    if (loading) return <div className="p-6 bg-gray-900 min-h-screen"><div className="text-white">Chargement...</div></div>;
    if (error) return <div className="p-6 bg-gray-900 min-h-screen"><div className="text-red-500">Erreur: {error}</div></div>;
    if (!standings || standings.length === 0) return <div className="p-6 bg-gray-900 min-h-screen"><div className="text-white">Aucun joueur pour le moment</div></div>;
    if (!matches || matches.length === 0) return <div className="p-6 bg-gray-900 min-h-screen"><div className="text-white">Aucun match disponible</div></div>;

    const finishedMatches = matches
        .filter(m => m.status === 'FINISHED')
        .sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date));

    const chartData = standings[0]?.history?.map((_, matchIdx) => {
        const matchInfo = finishedMatches[matchIdx];
        const team1Translated = matchInfo ? translateTeam(matchInfo.team1) : '?';
        const team2Translated = matchInfo ? translateTeam(matchInfo.team2) : '?';

        const dataPoint = {
            match: `Match ${matchIdx + 1}`,
            matchLabel: `Match ${matchIdx + 1} : ${team1Translated} - ${team2Translated}`,
        };

        const matchStandings = standings
            .map(player => ({
                ...player,
                points_at_match: player.history[matchIdx]?.cumulative_points || 0,
            }))
            .sort((a, b) => b.points_at_match - a.points_at_match)
            .map((player, rank) => ({ ...player, rank_at_match: rank + 1 }));

        matchStandings.forEach(player => {
            dataPoint[player.username] = player.rank_at_match;
        });

        return dataPoint;
    }) || [];

    chartDataRef.current = chartData;

    const colors = [
        '#fbbf24', '#60a5fa', '#34d399', '#f87171', '#a78bfa',
        '#fb923c', '#22d3ee', '#f472b6', '#a3e635', '#818cf8',
        '#facc15', '#2dd4bf', '#fb7185', '#c084fc', '#4ade80',
        '#38bdf8', '#e879f9', '#fdba74', '#94a3b8', '#f43f5e',
        '#84cc16', '#06b6d4', '#d946ef', '#eab308', '#10b981',
        '#6366f1', '#ec4899', '#f97316',
    ];
    const getPlayerColor = (idx) => colors[idx % colors.length];

    const handleWrapperClick = (e) => {
        const wrapper = chartWrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();

        const plotLeft = MARGIN.left + Y_AXIS_WIDTH;
        const plotRight = rect.width - MARGIN.right;
        const plotTop = MARGIN.top;
        const plotBottom = CHART_HEIGHT - MARGIN.bottom;
        const plotWidth = plotRight - plotLeft;
        const plotHeight = plotBottom - plotTop;

        const clickXInWrapper = e.clientX - rect.left;
        const clickXInPlot = clickXInWrapper - plotLeft;
        const clickYInPlot = (e.clientY - rect.top) - plotTop;

        if (clickXInPlot < 0 || clickXInPlot > plotWidth) return;
        if (clickYInPlot < 0 || clickYInPlot > plotHeight) return;

        const xRatio = clickXInPlot / plotWidth;
        const matchIdx = Math.round(xRatio * (chartData.length - 1));

        // axe Y reversed : y=0 → rang 1 (haut), y=plotHeight → rang N (bas)
        const clickedRank = 1 + (clickYInPlot / plotHeight) * (standings.length - 1);

        let closest = null;
        let minDist = Infinity;
        standings.forEach(player => {
            const rank = chartData[matchIdx]?.[player.username];
            if (rank == null) return;
            const dist = Math.abs(rank - clickedRank);
            if (dist < minDist) {
                minDist = dist;
                closest = player.username;
            }
        });

        if (closest) {
            setSelectedPlayer(prev => {
                if (prev === closest) return null;
                if (isPlaying) {
                    clearInterval(animTimer.current);
                    setIsPlaying(false);
                    setAnimPlayer(null);
                }
                setAnimMatchIdx(-1);
                return closest;
            });
        }
    };

    const isActive = (username) => !selectedPlayer || selectedPlayer === username;

    const renderLastLabel = (props, username, color) => {
        const { viewBox, index } = props;
        if (!viewBox) return null;
        const { x, y } = viewBox;

        if (index === 0) {
            return (
                <text x={x - 10} y={y + 4} fill={color} fontSize={12} fontWeight="bold" textAnchor="end">
                    {username}
                </text>
            );
        }

        if (index === chartData.length - 1) {
            return (
                <text x={x} y={y + 20} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle">
                    {username}
                </text>
            );
        }

        if (isPlaying && index === animMatchIdx && username === selectedPlayer) {
            const rank = chartData[animMatchIdx]?.[username];
            return (
                <text x={x} y={y - 12} fill={color} fontSize={13} fontWeight="bold" textAnchor="middle">
                    #{rank}
                </text>
            );
        }

        return null;
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <button
                    onClick={togglePlay}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                        ${isPlaying
                            ? 'bg-blue-900 border-blue-600 text-blue-300'
                            : 'bg-gray-700 border-gray-500 text-white hover:bg-gray-600'}`}
                >
                    {isPlaying ? '⏸ Pause' : '▶ Cinématique'}
                </button>

                {animMatchIdx >= 0 && (
                    <span className="text-sm text-gray-400">
                        {chartData[animMatchIdx]?.matchLabel}
                    </span>
                )}
            </div>
            <div className="p-4 bg-gray-950 min-h-screen pb-24">
                <div ref={scrollContainerRef} className="bg-gray-800 rounded-lg border border-gray-600 overflow-x-auto">
                    {chartData.length > 0 ? (
                        <div
                            ref={chartWrapperRef}
                            style={{ minWidth: '4000px', height: `${CHART_HEIGHT}px`, cursor: 'pointer' }}
                            onClick={handleWrapperClick}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={MARGIN}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <XAxis
                                        dataKey="match"
                                        stroke="#ffffff"
                                        padding={{ left: 80 }}
                                        interval={0}
                                        tickFormatter={(value, index) => {
                                            const total = chartData.length;
                                            if (index === 0 || index === total - 1 || index % 2 === 0) return value;
                                            return '';
                                        }}
                                    />
                                    <YAxis
                                        orientation="right"
                                        stroke="#ffffff"
                                        reversed
                                        domain={[0.5, standings.length + 0.5]}
                                        ticks={Array.from({ length: standings.length }, (_, i) => i + 1)}
                                        allowDecimals={false}
                                    />
                                    {standings.map((player, idx) => {
                                        const color = getPlayerColor(idx);
                                        const active = isActive(player.username);
                                        const isSelected = selectedPlayer === player.username;
                                        return (
                                            <Line
                                                key={player.id}
                                                type="monotone"
                                                dataKey={player.username}
                                                stroke={color}
                                                strokeWidth={isSelected ? 4 : 2}
                                                strokeOpacity={active ? 1 : 0.1}
                                                dot={{ fill: color, r: isSelected ? 6 : 4, fillOpacity: active ? 1 : 0.1, strokeOpacity: 0 }}
                                                activeDot={{ r: isSelected ? 8 : 5, fill: color, fillOpacity: active ? 1 : 0.1 }}
                                                isAnimationActive={false}
                                            >
                                                <LabelList
                                                    content={(props) => renderLastLabel(props, player.username, active ? color : 'transparent')}
                                                />
                                            </Line>
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-8">Aucune donnée disponible</div>
                    )}
                </div>
            </div>
        </div>
    );
}