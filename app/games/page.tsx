"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import GameCard from "@/components/GameCard";
import GameModal from "@/components/GameModal";
import { PROGRESS_OPTIONS } from "@/lib/constants";

export default function GamesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [search, setSearch] = useState("");
    const [progressFilter, setProgressFilter] = useState("");
    const [platformFilter, setPlatformFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchGames();
        }
    }, [status, router]);

    useEffect(() => {
        let filtered = games;

        // Filtrar por búsqueda de texto
        if (search) {
            filtered = filtered.filter((game: any) => {
                const searchLower = search.toLowerCase();
                const nameMatch = game.name.toLowerCase().includes(searchLower);
                const tagMatch = game.tags?.some((gameTag: any) =>
                    gameTag.tag.name.toLowerCase().includes(searchLower)
                );
                return nameMatch || tagMatch;
            });
        }

        // Filtrar por progreso
        if (progressFilter) {
            filtered = filtered.filter((game: any) => game.progress === progressFilter);
        }

        // Filtrar por plataforma
        if (platformFilter) {
            filtered = filtered.filter((game: any) =>
                game.platform?.toLowerCase().includes(platformFilter.toLowerCase())
            );
        }

        setFilteredGames(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [search, progressFilter, platformFilter, games]);

    const fetchGames = async () => {
        const res = await fetch("/api/games");
        const data = await res.json();
        setGames(data);
        setFilteredGames(data);
    };

    const handleAddGame = () => {
        setEditingGame(null);
        setIsModalOpen(true);
    };

    const handleEditGame = (game: any) => {
        setEditingGame(game);
        setIsModalOpen(true);
    };

    const handleDeleteGame = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este juego?")) return;

        await fetch(`/api/games/${id}`, { method: "DELETE" });
        fetchGames();
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingGame(null);
        fetchGames();
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <div className="text-xl">Cargando...</div>
            </div>
        );
    }

    if (!session) return null;

    // Calcular paginación
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentGames = filteredGames.slice(startIndex, endIndex);

    // Generar números de página para mostrar
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="min-h-screen w-full">
            <Navbar user={session.user} />
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold">Mis Juegos</h1>
                        <button onClick={handleAddGame} className="btn btn-primary whitespace-nowrap">
                            + Agregar Juego
                        </button>
                    </div>

                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o tags..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input w-full max-w-md"
                            />
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium whitespace-nowrap">Mostrar:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="input w-20"
                                >
                                    <option value="20">20</option>
                                    <option value="40">40</option>
                                    <option value="60">60</option>
                                    <option value="80">80</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium mb-2">Progreso</label>
                                <select
                                    value={progressFilter}
                                    onChange={(e) => setProgressFilter(e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="">Todos</option>
                                    {PROGRESS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium mb-2">Plataforma</label>
                                <input
                                    type="text"
                                    placeholder="Ej: PS5, PC, Xbox..."
                                    value={platformFilter}
                                    onChange={(e) => setPlatformFilter(e.target.value)}
                                    className="input w-full"
                                />
                            </div>

                            {(search || progressFilter || platformFilter) && (
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            setSearch("");
                                            setProgressFilter("");
                                            setPlatformFilter("");
                                        }}
                                        className="btn bg-tertiary text-white whitespace-nowrap"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                        {currentGames.map((game: any) => (
                            <GameCard
                                key={game.id}
                                game={game}
                                onEdit={handleEditGame}
                                onDelete={handleDeleteGame}
                            />
                        ))}
                    </div>

                    {filteredGames.length === 0 && (
                        <div className="text-center text-secondary mt-12">
                            {search || progressFilter || platformFilter ? "No se encontraron juegos" : "No tienes juegos aún. ¡Agrega uno!"}
                        </div>
                    )}

                    {filteredGames.length > 0 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="text-sm text-secondary">
                                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredGames.length)} de {filteredGames.length} juegos
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded bg-tertiary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
                                    >
                                        ← Anterior
                                    </button>

                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-2 text-secondary">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page as number)}
                                                className={`px-3 py-2 rounded transition ${currentPage === page
                                                    ? "bg-accent text-white"
                                                    : "bg-tertiary text-white hover:bg-accent"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 rounded bg-tertiary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <GameModal game={editingGame} onClose={handleModalClose} />
            )}
        </div>
    );
}
