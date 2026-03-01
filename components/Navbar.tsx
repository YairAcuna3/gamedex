"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavbarProps {
    user: {
        name?: string | null;
        photo?: string | null;
    } | null;
}

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();

    return (
        <nav className="bg-secondary border-b border-border sticky top-0 z-40 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4 sm:gap-8">
                            <Link href="/games" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-accent">
                                <Image
                                    src="/img/icon.png"
                                    alt="Gamedex Logo"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                />
                                Gamedex
                            </Link>
                            <div className="flex gap-2 sm:gap-4">
                                <Link
                                    href="/games"
                                    className={`px-3 py-2 rounded-md transition text-sm sm:text-base ${pathname === "/games"
                                        ? "bg-accent text-white"
                                        : "text-secondary hover:text-white"
                                        }`}
                                >
                                    Juegos
                                </Link>
                                <Link
                                    href="/awards"
                                    className={`px-3 py-2 rounded-md transition text-sm sm:text-base ${pathname === "/awards"
                                        ? "bg-accent text-white"
                                        : "text-secondary hover:text-white"
                                        }`}
                                >
                                    Premios
                                </Link>
                                <Link
                                    href="/leaderboard"
                                    className={`px-3 py-2 rounded-md transition text-sm sm:text-base ${pathname === "/leaderboard"
                                        ? "bg-accent text-white"
                                        : "text-secondary hover:text-white"
                                        }`}
                                >
                                    Leaderboard
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                            {user && (
                                <>
                                    <Link href="/profile">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-accent cursor-pointer hover:border-accent-hover transition">
                                            {user.photo ? (
                                                <img
                                                    src={user.photo}
                                                    alt={user.name || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-tertiary flex items-center justify-center text-sm sm:text-lg font-bold">
                                                    {user.name?.[0]?.toUpperCase() || "U"}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="text-secondary hover:text-white transition text-sm sm:text-base"
                                    >
                                        Salir
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
