"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface GameEntry {
    id: number;
    name: string;
    image?: string;
    platform?: string;
    awards: any[];
    totalAwards: number;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    gotyCount: number;
    score: number;
}

interface ScoreGroup {
    score: number;
    rank: number;
    games: GameEntry[];
    totalAwards: number;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    gotyCount: number;
}

function GameImage({ game, showOverlay }: { game: GameEntry; showOverlay: boolean }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative w-20 shrink-0"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {game.image ? (
                <div className="relative w-20 h-20 rounded overflow-hidden">
                    <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover"
                    />
                    {showOverlay && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                            <p className="text-white text-xs font-semibold truncate">
                                {game.name}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-20 h-20 rounded bg-tertiary flex items-end overflow-hidden">
                    {showOverlay && (
                        <div className="w-full bg-black/60 px-1 py-0.5">
                            <p className="text-white text-xs font-semibold truncate">
                                {game.name}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Hover tooltip — only for grouped cards */}
            {showOverlay && hovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 rounded-lg shadow-lg bg-secondary border border-tertiary p-3 pointer-events-none">
                    <p className="font-bold text-sm mb-2 leading-tight">{game.name}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {game.gotyCount > 0 && (
                            <span className="flex items-center gap-1">
                                <span>🏆</span>
                                <span className="font-bold">{game.gotyCount}</span>
                            </span>
                        )}
                        {game.goldCount > 0 && (
                            <span className="flex items-center gap-1">
                                <span>🥇</span>
                                <span className="font-bold">{game.goldCount}</span>
                            </span>
                        )}
                        {game.silverCount > 0 && (
                            <span className="flex items-center gap-1">
                                <span>🥈</span>
                                <span className="font-bold">{game.silverCount}</span>
                            </span>
                        )}
                        {game.bronzeCount > 0 && (
                            <span className="flex items-center gap-1">
                                <span>🥉</span>
                                <span className="font-bold">{game.bronzeCount}</span>
                            </span>
                        )}
                        <span className="text-secondary ml-auto">{game.score} pts</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LeaderboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [groups, setGroups] = useState<ScoreGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchGames();
        }
    }, [status, router]);

    const fetchGames = async () => {
        setLoading(true);
        const res = await fetch("/api/games");
        const data = await res.json();

        const gamesWithAwards: GameEntry[] = data
            .filter((game: any) => game.awards && game.awards.length > 0)
            .map((game: any) => {
                const gotyCount = game.awards.filter((a: any) => a.award.code === "GOTY").length;
                const goldCount = game.awards.filter((a: any) => a.award.code === "GOLD").length;
                const silverCount = game.awards.filter((a: any) => a.award.code === "SILVER").length;
                const bronzeCount = game.awards.filter((a: any) => a.award.code === "BRONZE").length;
                const score = gotyCount * 12 + goldCount * 3 + silverCount * 2 + bronzeCount * 1;
                return {
                    ...game,
                    totalAwards: game.awards.length,
                    goldCount,
                    silverCount,
                    bronzeCount,
                    gotyCount,
                    score,
                };
            })
            .sort((a: GameEntry, b: GameEntry) => b.score - a.score);

        const scoreMap = new Map<number, GameEntry[]>();
        for (const game of gamesWithAwards) {
            const bucket = scoreMap.get(game.score) ?? [];
            bucket.push(game);
            scoreMap.set(game.score, bucket);
        }

        let rank = 1;
        const grouped: ScoreGroup[] = [];
        for (const [score, games] of scoreMap) {
            grouped.push({
                score,
                rank,
                games,
                totalAwards: games.reduce((s, g) => s + g.totalAwards, 0),
                goldCount: games.reduce((s, g) => s + g.goldCount, 0),
                silverCount: games.reduce((s, g) => s + g.silverCount, 0),
                bronzeCount: games.reduce((s, g) => s + g.bronzeCount, 0),
                gotyCount: games.reduce((s, g) => s + g.gotyCount, 0),
            });
            rank += 1;
        }

        setGroups(grouped);
        setLoading(false);
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <div className="text-xl">Cargando...</div>
            </div>
        );
    }

    if (!session) return null;

    const rankEmoji = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    return (
        <div className="min-h-screen">
            <Navbar user={session.user} />
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>

                {groups.length === 0 ? (
                    <div className="card text-center text-secondary">
                        No hay juegos con premios aún
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => {
                            const isTied = group.games.length > 1;
                            const game = group.games[0];

                            return (
                                <div
                                    key={group.score + "-" + group.rank}
                                    className="card flex items-center gap-4 hover:scale-[1.02] transition-transform overflow-visible"
                                >
                                    {/* Rank badge */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-tertiary shrink-0">
                                        <span className="text-2xl font-bold">
                                            {rankEmoji(group.rank)}
                                        </span>
                                    </div>

                                    {isTied ? (
                                        /* ── Tied group: images side by side with overlay + hover tooltip ── */
                                        <div className="flex gap-2 shrink-0">
                                            {group.games.map((g) => (
                                                <GameImage key={g.id} game={g} showOverlay={true} />
                                            ))}
                                        </div>
                                    ) : (
                                        /* ── Single game: normal image without overlay ── */
                                        game.image && (
                                            <div className="w-20 h-20 rounded overflow-hidden shrink-0">
                                                <img
                                                    src={game.image}
                                                    alt={game.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        {!isTied && (
                                            <h3 className="text-xl font-bold mb-1 truncate">
                                                {game.name}
                                            </h3>
                                        )}
                                        {!isTied && game.platform && (
                                            <p className="text-sm text-secondary mb-2">
                                                {game.platform}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            {group.gotyCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-goty">🏆</span>
                                                    <span className="font-bold">{group.gotyCount}</span>
                                                </span>
                                            )}
                                            {group.goldCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-gold">🥇</span>
                                                    <span className="font-bold">{group.goldCount}</span>
                                                </span>
                                            )}
                                            {group.silverCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-silver">🥈</span>
                                                    <span className="font-bold">{group.silverCount}</span>
                                                </span>
                                            )}
                                            {group.bronzeCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-bronze">🥉</span>
                                                    <span className="font-bold">{group.bronzeCount}</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-secondary mt-1">
                                            {group.score} pts
                                        </div>
                                    </div>

                                    {/* Total awards */}
                                    <div className="text-right shrink-0">
                                        <div className="text-3xl font-bold text-accent">
                                            {group.totalAwards}
                                        </div>
                                        <div className="text-xs text-secondary">
                                            {group.totalAwards === 1 ? "premio" : "premios"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
