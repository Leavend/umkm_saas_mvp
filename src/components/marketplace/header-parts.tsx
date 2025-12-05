import Link from "next/link";
import Image from "next/image";
import { Sparkles, Coins, User, Search, Settings } from "lucide-react";
import { Suspense } from "react";
import { LanguageToggle } from "~/components/language-toggle";
import { cn } from "~/lib/utils";
import type { ModalType } from "~/lib/types";

export function HeaderBrand({
    isSearchOpen,
    brandName,
}: {
    isSearchOpen: boolean;
    brandName: string;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-2 transition-all duration-300 ease-in-out",
                isSearchOpen && "xs:translate-x-1 sm:translate-x-2 md:translate-x-0",
            )}
        >
            <div className="bg-brand-500 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg shadow-lg">
                <Sparkles className="h-5 w-5 text-slate-900" />
            </div>
            <span
                className={cn(
                    "text-brand-700 brand-text-truncate text-xl font-bold transition-all duration-300",
                    isSearchOpen && "xs:text-base sm:text-lg md:text-xl",
                )}
            >
                {brandName}
            </span>
        </div>
    );
}

export function HeaderActions({
    isSearchOpen,
    toggleSearch,
    isAdmin,
    lang,
    isAuthenticated,
    user,
    credits,
    onOpenModal,
}: {
    isSearchOpen: boolean;
    toggleSearch: () => void;
    isAdmin: boolean;
    lang: string;
    isAuthenticated: boolean;
    user: any;
    credits: number | null;
    onOpenModal: (modal: ModalType) => void;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-2 transition-all duration-300 ease-in-out",
                isSearchOpen && "xs:-translate-x-6 sm:-translate-x-8 md:translate-x-0",
            )}
        >
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isSearchOpen &&
                    "xs:-translate-x-1 sm:-translate-x-2 md:translate-x-0",
                )}
            >
                <Suspense fallback={null}>
                    <LanguageToggle />
                </Suspense>
            </div>

            <SearchButton isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />

            {isAdmin && <AdminButton lang={lang} />}

            {isAuthenticated && user ? (
                <UserButton
                    user={user}
                    credits={credits}
                    onClick={() => onOpenModal("topup")}
                />
            ) : (
                <LoginButton onClick={() => onOpenModal("auth")} />
            )}
        </div>
    );
}

function SearchButton({
    isSearchOpen,
    toggleSearch,
}: {
    isSearchOpen: boolean;
    toggleSearch: () => void;
}) {
    const btn =
        "md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full " +
        "border border-slate-200 bg-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-brand-500/40";
    const on = "bg-[#FFC72C] text-slate-900 border-[#FFC72C]";
    const off = "hover:bg-slate-100";

    return (
        <button
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
            aria-controls="mobile-searchbar"
            onClick={toggleSearch}
            className={cn(btn, isSearchOpen ? on : off)}
            type="button"
        >
            <Search className="h-5 w-5" />
            <span className="sr-only">Toggle search</span>
        </button>
    );
}

function AdminButton({ lang }: { lang: string }) {
    return (
        <Link href={`/${lang}/admin`}>
            <button
                type="button"
                className="focus-visible:ring-brand-500/40 hidden h-8 items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 focus-visible:ring-2 sm:inline-flex"
                aria-label="Admin CMS"
            >
                <Settings className="h-4 w-4" />
                Admin
            </button>
        </Link>
    );
}

function UserButton({
    user,
    credits,
    onClick,
}: {
    user: any;
    credits: number | null;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="focus-visible:ring-brand-500/40 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-sm font-semibold shadow-sm transition hover:bg-slate-100 focus-visible:ring-2 active:bg-slate-200"
            aria-label="Lihat kredit dan top up"
        >
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-slate-100">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name ?? "User avatar"}
                        fill
                        sizes="28px"
                        className="object-cover"
                    />
                ) : (
                    <User className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-slate-500" />
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                    {user.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() ?? "U"}
                </span>
                {credits !== null && (
                    <>
                        <Coins className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-semibold">{credits}</span>
                    </>
                )}
            </div>
        </button>
    );
}

function LoginButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="focus-visible:ring-brand-500/40 inline-flex h-8 w-auto items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-0 text-sm font-semibold text-slate-900 transition hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Login"
        >
            <div className="flex h-8 w-8 items-center justify-center bg-[#D97706]">
                <User className="h-4 w-4 text-white" />
            </div>
            <span className="px-3">Login</span>
        </button>
    );
}
