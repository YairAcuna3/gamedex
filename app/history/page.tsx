"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { MONTHS } from "@/lib/constants";

interface GameAwardEntry {
    id: string;
    description?: string | null;
    award: {
        id: string;
        code: string;
        name: string;
        scope: string;
    };
    game: {
        id: string;
        name: string;
        image?: string | null;
        platform?: string | null;
    };
}

interface Period {
    id: string;
    year: number;
    month: number | null;
    gameAwards: GameAwardEntry[];
}

const AWARD_PRIORITY: Record<string, number> = {
    GOLD: 0,
    SILVER: 1,
    BRONZE: 2,
    GOTY: 3,
};

const AWARD_STYLES: Record<string, { bg: string; text: string; emoji: string }> = {
    GOLD: { bg: "bg-gold", text: "text-black", emoji: "🥇" },
    SILVER: { bg: "bg-silver", text: "text-black", emoji: "🥈" },
    BRONZE: { bg: "bg-bronze", text: "text-black", emoji: "🥉" },
    GOTY: { bg: "bg-goty", text: "text-white", emoji: "🏆" },
};

function periodLabel(year: number, month: number | null): string {
    if (month === null) return `${year}`;
    const m = MONTHS.find((mo) => mo.value === month);
    return m ? `${m.label} ${year}` : `${month}/${year}`;
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchHistory();
        }
    }, [status, router]);

    const fetchHistory = async () => {
        setLoading(true);
        const res = await fetch("/api/awards/history");
        const data = await res.json();
        setPeriods(data);
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

    // Separate yearly and monthly periods
    const yearlyPeriods = periods.filter((p) => p.month === null);
    const monthlyPeriods = periods.filter((p) => p.month !== null);

    // Group monthly periods by year
    const byYear = monthlyPeriods.reduce<Record<number, Period[]>>((acc, p) => {
        (acc[p.year] ??= []).push(p);
        return acc;
    }, {});

    const sortedYears = Object.keys(byYear)
        .map(Number)
        .sort((a, b) => b - a);

    return (
        <div className="min-h-screen">
            <Navbar user={session.user} />
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-2">📅 History</h1>

                {periods.length === 0 ? (
                    <div className="card text-center text-secondary">
                        No hay premios asignados aún
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* ── GOTY / Yearly awards ── */}
                        {yearlyPeriods.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    🏆 Premios Anuales
                                </h2>
                                <div className="space-y-4">
                                    {yearlyPeriods.map((period) => (
                                        <PeriodCard key={period.id} period={period} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── Monthly awards grouped by year ── */}
                        {sortedYears.map((year) => (
                            <section key={year}>
                                <h2 className="text-xl font-bold mb-4">{year}</h2>
                                <div className="space-y-4">
                                    {byYear[year].map((period) => (
                                        <PeriodCard key={period.id} period={period} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PeriodCard({ period }: { period: Period }) {
    return (
        <div className="card">
            <h3 className="font-bold text-lg mb-3 text-accent">
                {periodLabel(period.year, period.month)}
            </h3>
            <div className="space-y-3">
                {[...period.gameAwards]
                    .sort((a, b) => (AWARD_PRIORITY[a.award.code] ?? 99) - (AWARD_PRIORITY[b.award.code] ?? 99))
                    .map((ga) => {
                        const style = AWARD_STYLES[ga.award.code] ?? {
                            bg: "bg-tertiary",
                            text: "text-white",
                            emoji: "🎖️",
                        };
                        return (
                            <div key={ga.id} className="flex items-center gap-3">
                                {/* Game image */}
                                {ga.game.image ? (
                                    <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                                        <img
                                            src={ga.game.image}
                                            alt={ga.game.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded bg-tertiary shrink-0 flex items-center justify-center text-xl">
                                        🎮
                                    </div>
                                )}

                                {/* Game info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{ga.game.name}</p>
                                    {ga.game.platform && (
                                        <p className="text-xs text-secondary">{ga.game.platform}</p>
                                    )}
                                    {ga.description && (
                                        <p className="text-xs text-secondary italic mt-0.5">
                                            {ga.description}
                                        </p>
                                    )}
                                </div>

                                {/* Award badge */}
                                <span
                                    className={`shrink-0 px-3 py-1 rounded text-sm font-semibold ${style.bg} ${style.text}`}
                                >
                                    {style.emoji} {ga.award.name}
                                </span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
