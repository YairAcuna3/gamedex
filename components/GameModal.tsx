"use client";

import { useState, useEffect } from "react";
import { PROGRESS_OPTIONS } from "@/lib/constants";

interface GameModalProps {
    game?: any;
    onClose: () => void;
}

export default function GameModal({ game, onClose }: GameModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        systemRequirements: "",
        releaseDate: "",
        image: "",
        developer: "",
        publisher: "",
        platform: "",
        singleplayer: false,
        multiplayer: false,
        nPlayers: "",
        progress: "UNPLAYED",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [availableTags, setAvailableTags] = useState<any[]>([]);

    useEffect(() => {
        const fetchTags = async () => {
            const res = await fetch("/api/tags");
            const data = await res.json();
            setAvailableTags(data);
        };
        fetchTags();

        const initial = {
            name: "",
            description: "",
            systemRequirements: "",
            releaseDate: "",
            image: "",
            developer: "",
            publisher: "",
            platform: "",
            singleplayer: false,
            multiplayer: false,
            nPlayers: "",
            progress: "UNPLAYED",
            notes: "",
        };

        if (game) {
            const gameData = {
                name: game.name || "",
                description: game.description || "",
                systemRequirements: game.systemRequirements || "",
                releaseDate: game.releaseDate ? game.releaseDate.split("T")[0] : "",
                image: game.image || "",
                developer: game.developer || "",
                publisher: game.publisher || "",
                platform: game.platform || "",
                singleplayer: game.singleplayer || false,
                multiplayer: game.multiplayer || false,
                nPlayers: game.nPlayers?.toString() || "",
                progress: game.progress || "UNPLAYED",
                notes: game.notes || "",
            };
            setFormData(gameData);
            setInitialData(gameData);
            setTags(game.tags?.map((t: any) => t.tag.name) || []);
        } else {
            setInitialData(initial);
        }
    }, [game]);

    const hasChanges = () => {
        if (!initialData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    };

    const handleClose = () => {
        if (hasChanges()) {
            setShowConfirm(true);
        } else {
            onClose();
        }
    };

    const confirmClose = () => {
        setShowConfirm(false);
        onClose();
    };

    const cancelClose = () => {
        setShowConfirm(false);
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            ...formData,
            nPlayers: formData.nPlayers ? parseInt(formData.nPlayers) : null,
            releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : null,
            tags,
        };

        const url = game ? `/api/games/${game.id}` : "/api/games";
        const method = game ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        setLoading(false);
        onClose();
    };

    return (
        <>
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">
                        {game ? "Editar Juego" : "Agregar Juego"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input resize-none"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="input"
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="mt-2 w-full h-48 object-cover rounded"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Desarrollador</label>
                                <input
                                    type="text"
                                    value={formData.developer}
                                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Publisher</label>
                                <input
                                    type="text"
                                    value={formData.publisher}
                                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Plataforma</label>
                                <input
                                    type="text"
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Fecha de Lanzamiento</label>
                                <input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Requisitos del Sistema</label>
                            <textarea
                                value={formData.systemRequirements}
                                onChange={(e) => setFormData({ ...formData, systemRequirements: e.target.value })}
                                className="input resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.singleplayer}
                                    onChange={(e) => setFormData({ ...formData, singleplayer: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Singleplayer</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.multiplayer}
                                    onChange={(e) => setFormData({ ...formData, multiplayer: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Multiplayer</span>
                            </label>
                        </div>

                        {formData.multiplayer && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Número de Jugadores</label>
                                <input
                                    type="number"
                                    value={formData.nPlayers}
                                    onChange={(e) => setFormData({ ...formData, nPlayers: e.target.value })}
                                    className="input"
                                    min="1"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Progreso</label>
                            <select
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                                className="input"
                            >
                                {PROGRESS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tags</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="input flex-1"
                                    placeholder="Agregar tag..."
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="btn btn-primary px-4"
                                >
                                    +
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-accent text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-red-300"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Notas</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="input resize-none"
                                rows={4}
                                placeholder="Notas personales sobre el juego..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex-1"
                            >
                                {loading ? "Guardando..." : game ? "Actualizar" : "Agregar"}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn bg-tertiary text-white flex-1"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showConfirm && (
                <div className="modal-overlay" style={{ zIndex: 60 }} onClick={cancelClose}>
                    <div className="bg-secondary border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">¿Estás seguro?</h3>
                        <p className="text-secondary mb-6">Los cambios no guardados se perderán.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmClose}
                                className="btn btn-primary flex-1"
                            >
                                Sí, cerrar
                            </button>
                            <button
                                onClick={cancelClose}
                                className="btn bg-tertiary text-white flex-1"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
