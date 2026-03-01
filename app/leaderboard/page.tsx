"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LeaderboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [games, setGames] = useState([]);
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

        // Filtrar juegos con premios y ordenar por cantidad
        const gamesWithAwards = data
            .filter((game: any) => game.awards && game.awards.length > 0)
            .map((game: any) => ({
                ...game,
                totalAwards: game.awards.length,
                goldCount: game.awards.filter((a: any) => a.award.code === "GOLD").length,
                silverCount: game.awards.filter((a: any) => a.award.code === "SILVER").length,
                bronzeCount: game.awards.filter((a: any) => a.award.code === "BRONZE").length,
                gotyCount: game.awards.filter((a: any) => a.award.code === "GOTY").length,
            }))
            .sort((a: any, b: any) => {
                // Ordenar por GOTY primero, luego por total de premios
                if (b.gotyCount !== a.gotyCount) {
                    return b.gotyCount - a.gotyCount;
                }
                return b.totalAwards - a.totalAwards;
            });

        setGames(gamesWithAwards);
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

    return (
        <div className="min-h-screen">
            <Navbar user={session.user} />
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>
                <p className="text-secondary mb-6">
                    Juegos ordenados por cantidad de premios
                </p>

                {games.length === 0 ? (
                    <div className="card text-center text-secondary">
                        No hay juegos con premios aún
                    </div>
                ) : (
                    <div className="space-y-4">
                        {games.map((game: any, index: number) => (
                            <div
                                key={game.id}
                                className="card flex items-center gap-4 hover:scale-[1.02] transition-transform"
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-tertiary shrink-0">
                                    <span className="text-2xl font-bold">
                                        {index === 0 && "🥇"}
                                        {index === 1 && "🥈"}
                                        {index === 2 && "🥉"}
                                        {index > 2 && `#${index + 1}`}
                                    </span>
                                </div>

                                {game.image && (
                                    <div className="w-20 h-20 rounded overflow-hidden shrink-0">
                                        <img
                                            src={game.image}
                                            alt={game.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold mb-1 truncate">
                                        {game.name}
                                    </h3>
                                    {game.platform && (
                                        <p className="text-sm text-secondary mb-2">
                                            {game.platform}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-3 text-sm">
                                        {game.gotyCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span className="text-goty">🏆</span>
                                                <span className="font-bold">{game.gotyCount}</span>
                                            </span>
                                        )}
                                        {game.goldCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span className="text-gold">🥇</span>
                                                <span className="font-bold">{game.goldCount}</span>
                                            </span>
                                        )}
                                        {game.silverCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span className="text-silver">🥈</span>
                                                <span className="font-bold">{game.silverCount}</span>
                                            </span>
                                        )}
                                        {game.bronzeCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span className="text-bronze">🥉</span>
                                                <span className="font-bold">{game.bronzeCount}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="text-3xl font-bold text-accent">
                                        {game.totalAwards}
                                    </div>
                                    <div className="text-xs text-secondary">
                                        {game.totalAwards === 1 ? "premio" : "premios"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
