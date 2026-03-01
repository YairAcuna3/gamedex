"use client";

import { getProgressLabel } from "@/lib/utils";

interface GameCardProps {
    game: any;
    onEdit: (game: any) => void;
    onDelete: (id: string) => void;
}

export default function GameCard({ game, onEdit, onDelete }: GameCardProps) {
    const awardCounts = {
        gold: game.awards?.filter((a: any) => a.award.code === "GOLD").length || 0,
        silver: game.awards?.filter((a: any) => a.award.code === "SILVER").length || 0,
        bronze: game.awards?.filter((a: any) => a.award.code === "BRONZE").length || 0,
        goty: game.awards?.filter((a: any) => a.award.code === "GOTY").length || 0,
    };

    const hasAwards = awardCounts.gold + awardCounts.silver + awardCounts.bronze + awardCounts.goty > 0;

    return (
        <div className="card group flex flex-col h-full">
            {game.image && (
                <div className="w-full aspect-square mb-4 rounded overflow-hidden shrink-0">
                    <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            <h3 className="text-xl font-bold mb-2 break-words">{game.name}</h3>
            {game.description && (
                <p className="text-secondary text-sm mb-3 line-clamp-2 break-words">
                    {game.description}
                </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
                {game.platform && (
                    <span className="px-2 py-1 bg-tertiary rounded text-xs break-words">
                        {game.platform}
                    </span>
                )}
                <span className="px-2 py-1 bg-tertiary rounded text-xs">
                    {getProgressLabel(game.progress)}
                </span>
                {game.notes && (
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs flex items-center gap-1" title="Tiene notas">
                        📝
                    </span>
                )}
            </div>

            {game.tags && game.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {game.tags.map((gameTag: any) => (
                        <span
                            key={gameTag.id}
                            className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                        >
                            {gameTag.tag.name}
                        </span>
                    ))}
                </div>
            )}

            {hasAwards && (
                <div className="flex flex-wrap gap-3 mb-4 text-sm">
                    {awardCounts.gold > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="text-gold">🥇</span> {awardCounts.gold}
                        </span>
                    )}
                    {awardCounts.silver > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="text-silver">🥈</span> {awardCounts.silver}
                        </span>
                    )}
                    {awardCounts.bronze > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="text-bronze">🥉</span> {awardCounts.bronze}
                        </span>
                    )}
                    {awardCounts.goty > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="text-goty">🏆</span> {awardCounts.goty}
                        </span>
                    )}
                </div>
            )}

            <div className="flex gap-2 mt-auto pt-4">
                <button
                    onClick={() => onEdit(game)}
                    className="flex-1 px-3 py-2 bg-accent text-white rounded hover:bg-accent-hover transition text-sm"
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(game.id)}
                    className="px-3 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition text-sm whitespace-nowrap"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}
