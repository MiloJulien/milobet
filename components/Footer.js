"use client";

import { signOut, useSession } from "next-auth/react";
import { useTabs } from "@/app/TabContext";

export default function Footer() {
  const { data: session } = useSession();
  const { activeTab, goToTab } = useTabs();

  const tabs = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9.75L12 3l9 6.75M21 10.5v8.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75V10.5m9 4.5v6"
          />
        </svg>
      ),
      label: "Accueil",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 8.25V6a4.5 4.5 0 10-9 0v2.25m9 0a6 6 0 11-12 0m12 0V21H6V8.25"
          />
        </svg>
      ),
      label: "Pronostics",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25V9m9 0v9.75a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18.75V9m11.25 0h-9"
          />
        </svg>
      ),
      label: "Profil",
    },
  ];

  return (
    <footer
      className="bg-gray-800 text-white fixed bottom-0 w-full shadow-lg border-t-4 border-emerald-400"
      style={{ height: "84px" }}
    >
      <nav className="container mx-auto flex justify-between items-center h-full p-4">
        {/* Onglets avec icônes SVG */}
        <div className="flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => goToTab(index)}
              className={`flex flex-col items-center ${
                activeTab === index ? "text-emerald-400" : "text-gray-400"
              } hover:text-emerald-300`}
            >
              {tab.icon}
              <span className="text-sm mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Séparation visuelle */}
        <div className="h-8 border-l border-gray-600"></div>

        {/* Bouton de déconnexion */}
        {session && (
          <button
            onClick={async () => await signOut({ redirect: false })}
            className={`flex flex-col items-center text-red-400 hover:text-red-500`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25V9m9 0v9.75a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18.75V9m11.25 0h-9"
              />
            </svg>
            <span className="text-sm mt-1">Déconnexion</span>
          </button>
        )}
      </nav>
    </footer>
  );
}
