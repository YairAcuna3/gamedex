"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { MONTHS, SCOPE_OPTIONS } from "@/lib/constants";

export default function AwardsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [games, setGames] = useState([]);
    const [awards, setAwards] = useState([]);
    const [selectedGame, setSelectedGame] = useState("");
    const [selectedAward, setSelectedAward] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [showAwardModal, setShowAwardModal] = useState(false);
    const [editingAward, setEditingAward] = useState<any>(null);
    const [awardForm, setAwardForm] = useState({
        code: "",
        name: "",
        scope: "MONTHLY" as "MONTHLY" | "YEARLY",
    });
    const [gameSearch, setGameSearch] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchGames();
            fetchAwards();
        }
    }, [status, router]);

    const fetchGames = async () => {
        const res = await fetch("/api/games");
        const data = await res.json();
        setGames(data);
    };

    const fetchAwards = async () => {
        const res = await fetch("/api/awards/list");
        const data = await res.json();
        setAwards(data);
    };

    const selectedAwardData = awards.find((a: any) => a.code === selectedAward) as any;
    const isMonthly = selectedAwardData?.scope === "MONTHLY";

    const filteredGames = games.filter((game: any) =>
        game.name.toLowerCase().includes(gameSearch.toLowerCase())
    );

    const handleAssignAward = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await fetch("/api/awards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                gameId: selectedGame,
                awardCode: selectedAward,
                year,
                month: isMonthly ? month : null,
            }),
        });

        setLoading(false);
        setSelectedGame("");
        setSelectedAward("");
        fetchGames();
    };

    const handleCreateOrUpdateAward = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = editingAward ? "PUT" : "POST";
        const url = editingAward ? `/api/awards/manage/${editingAward.id}` : "/api/awards/manage";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(awardForm),
        });

        setLoading(false);
        setShowAwardModal(false);
        setEditingAward(null);
        setAwardForm({ code: "", name: "", scope: "MONTHLY" });
        fetchAwards();
    };

    const handleEditAward = (award: any) => {
        setEditingAward(award);
        setAwardForm({
            code: award.code,
            name: award.name,
            scope: award.scope,
        });
        setShowAwardModal(true);
    };

    const handleDeleteAward = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este premio?")) return;

        await fetch(`/api/awards/manage/${id}`, {
            method: "DELETE",
        });

        fetchAwards();
    };

    const handleRemoveGameAward = async (gameAwardId: string) => {
        if (!confirm("¿Estás seguro de quitar este premio del juego?")) return;

        await fetch(`/api/awards/game/${gameAwardId}`, {
            method: "DELETE",
        });

        fetchGames();
    };

    const openCreateModal = () => {
        setEditingAward(null);
        setAwardForm({ code: "", name: "", scope: "MONTHLY" });
        setShowAwardModal(true);
    };

    if (status === "loading") return null;

    return (
        <div className="min-h-screen">
            <Navbar user={session?.user || null} />
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Gestión de Premios</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Premios Disponibles</h2>
                            <button
                                onClick={openCreateModal}
                                className="btn btn-primary text-sm"
                            >
                                + Crear Premio
                            </button>
                        </div>
                        <div className="space-y-2">
                            {awards.map((award: any) => (
                                <div
                                    key={award.id}
                                    className="flex items-center justify-between p-3 bg-tertiary rounded"
                                >
                                    <div>
                                        <span className="font-medium">{award.name}</span>
                                        <span className="text-sm text-secondary ml-2">
                                            ({award.code}) - {award.scope === "MONTHLY" ? "Mensual" : "Anual"}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditAward(award)}
                                            className="px-3 py-1 bg-accent text-white rounded text-sm hover:bg-accent-hover"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAward(award.id)}
                                            className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-sm hover:bg-red-500/30"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Asignar Premio a Juego</h2>
                        <form onSubmit={handleAssignAward} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Buscar Juego</label>
                                <input
                                    type="text"
                                    value={gameSearch}
                                    onChange={(e) => setGameSearch(e.target.value)}
                                    className="input mb-2"
                                    placeholder="Escribe para buscar..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Juego</label>
                                <select
                                    value={selectedGame}
                                    onChange={(e) => setSelectedGame(e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="">Seleccionar juego...</option>
                                    {filteredGames.map((game: any) => (
                                        <option key={game.id} value={game.id}>
                                            {game.name}
                                        </option>
                                    ))}
                                </select>
                                {gameSearch && filteredGames.length === 0 && (
                                    <p className="text-sm text-secondary mt-1">No se encontraron juegos</p>
                                )}
                                {gameSearch && filteredGames.length > 0 && (
                                    <p className="text-sm text-secondary mt-1">
                                        {filteredGames.length} juego{filteredGames.length !== 1 ? 's' : ''} encontrado{filteredGames.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Premio</label>
                                <select
                                    value={selectedAward}
                                    onChange={(e) => setSelectedAward(e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="">Seleccionar premio...</option>
                                    {awards.map((award: any) => (
                                        <option key={award.code} value={award.code}>
                                            {award.name} ({award.scope === "MONTHLY" ? "Mensual" : "Anual"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Año</label>
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                        className="input"
                                        required
                                    />
                                </div>
                                {isMonthly && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mes</label>
                                        <select
                                            value={month || ""}
                                            onChange={(e) => setMonth(parseInt(e.target.value))}
                                            className="input"
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            {MONTHS.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? "Asignando..." : "Asignar Premio"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Juegos con Premios</h2>
                    <div className="space-y-4">
                        {games
                            .filter((game: any) => game.awards && game.awards.length > 0)
                            .map((game: any) => (
                                <div key={game.id} className="border border-border rounded p-4">
                                    <h3 className="font-bold mb-2">{game.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {game.awards.map((award: any) => (
                                            <div
                                                key={award.id}
                                                className="flex items-center gap-2"
                                            >
                                                <span
                                                    className={`px-3 py-1 rounded text-sm ${award.award.code === "GOLD"
                                                        ? "bg-gold text-black"
                                                        : award.award.code === "SILVER"
                                                            ? "bg-silver text-black"
                                                            : award.award.code === "BRONZE"
                                                                ? "bg-bronze text-black"
                                                                : "bg-goty text-white"
                                                        }`}
                                                >
                                                    {award.award.code === "GOLD" && "🥇"}
                                                    {award.award.code === "SILVER" && "🥈"}
                                                    {award.award.code === "BRONZE" && "🥉"}
                                                    {award.award.code === "GOTY" && "🏆"}
                                                    {" "}
                                                    {award.award.scope === "MONTHLY"
                                                        ? `${award.period.month}/${award.period.year}`
                                                        : award.period.year}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveGameAward(award.id)}
                                                    className="text-red-500 hover:text-red-400 text-lg font-bold"
                                                    title="Quitar premio"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {showAwardModal && (
                    <div className="modal-overlay" onClick={() => setShowAwardModal(false)}>
                        <div className="bg-secondary border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-4">
                                {editingAward ? "Editar Premio" : "Crear Premio"}
                            </h3>
                            <form onSubmit={handleCreateOrUpdateAward} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Código</label>
                                    <input
                                        type="text"
                                        value={awardForm.code}
                                        onChange={(e) => setAwardForm({ ...awardForm, code: e.target.value.toUpperCase() })}
                                        className="input"
                                        placeholder="GOLD, SILVER, etc."
                                        required
                                        disabled={!!editingAward}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        value={awardForm.name}
                                        onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })}
                                        className="input"
                                        placeholder="Oro, Plata, etc."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Alcance</label>
                                    <select
                                        value={awardForm.scope}
                                        onChange={(e) => setAwardForm({ ...awardForm, scope: e.target.value as "MONTHLY" | "YEARLY" })}
                                        className="input"
                                        required
                                    >
                                        {SCOPE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary flex-1"
                                    >
                                        {loading ? "Guardando..." : editingAward ? "Actualizar" : "Crear"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAwardModal(false)}
                                        className="btn bg-tertiary text-white flex-1"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
