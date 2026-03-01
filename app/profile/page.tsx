"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            const res = await fetch("/api/profile");
            const data = await res.json();
            setName(data.name || "");
            setDescription(data.description || "");
            setPhoto(data.photo || "");
        };

        fetchProfile();
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, photo }),
            });

            if (res.ok) {
                setMessage("Perfil actualizado exitosamente");
                await update();
                setTimeout(() => router.push("/games"), 1500);
            } else {
                setMessage("Error al actualizar perfil");
            }
        } catch (error) {
            setMessage("Error al actualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    return (
        <div className="min-h-screen">
            <Navbar user={session.user} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>
                <form onSubmit={handleSubmit} className="card space-y-4">
                    {message && (
                        <div className={`px-4 py-2 rounded ${message.includes("Error") ? "bg-red-500/10 border border-red-500 text-red-500" : "bg-green-500/10 border border-green-500 text-green-500"}`}>
                            {message}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-2">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input resize-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                        <input
                            type="url"
                            value={photo}
                            onChange={(e) => setPhoto(e.target.value)}
                            className="input"
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>
                    {photo && (
                        <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Vista previa:</p>
                            <img
                                src={photo}
                                alt="Preview"
                                className="w-32 h-32 rounded-full object-cover border-2 border-accent"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </form>
            </div>
        </div>
    );
}
