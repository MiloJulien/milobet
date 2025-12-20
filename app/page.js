"use client";

import Connexion from '../components/Connexion';
import Inscription from '../components/Inscription';
import { useSession } from 'next-auth/react';
import MatchList from '@/components/MatchList';
import Leaderboard from '@/components/Leaderboard';
import Testtab from '@/components/Testtab';
import Testtaaab from '@/components/Testtaaab';
import Footer from '@/components/Footer';
import { useEffect } from "react";
import { useTabs } from "@/app/TabContext";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const { scrollRef, handleScroll } = useTabs();

  const tabComponents = [
    Leaderboard,
    MatchList,
    Testtaaab
  ];

  const deadline = new Date("2026-06-11");
  const now = new Date();

  useEffect(() => {
    if (!scrollRef.current) return;

    const el = scrollRef.current;

    // Connecter handleScroll au défilement horizontal
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollRef, handleScroll]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        {/* Logo */}
        <Image
          src="/images/logos/logo-white.png"
          alt="Logo"
          className="w-32 h-32 mb-4"
          width={12}
          height={12}
        />
        {/* Barre de chargement */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-loading-bar"></div>
        </div>
        {/* Texte de chargement */}
        <p className="text-white mt-4">Chargement de la page...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <section className="container mx-auto p-4">
        <Connexion />
        {now <= deadline && (
          <>
            <hr className="mt-5 mb-5" />
            <Inscription />
          </>
        )}
      </section>
    );
  }

  if (session.user.has_bet === 0) {
    return (
      <MatchList />
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <main
        ref={scrollRef}
        className="flex-1 flex overflow-x-scroll snap-x snap-mandatory"
        style={{ marginBottom: "84px" }}
      >
        {tabComponents.map((Component, i) => (
          <div
            key={i}
            className="snap-center w-full flex-shrink-0 tab-content"
            style={{ scrollSnapAlign: "center" }}
          >
            <Component/>
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
}