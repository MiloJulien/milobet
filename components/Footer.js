"use client";

import { signOut, useSession } from "next-auth/react";
import { useTabs } from "@/app/TabContext";

export default function Footer() {
  const { data: session } = useSession();
  const { activeTab, goToTab } = useTabs();

  const tabs = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 3v18h18M7 13h3v8H7zm4-6h3v14h-3zm4 3h3v11h-3z" />
        </svg>
      ),
      label: "Résultats",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="28" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
          <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
        </svg>
      ),
      label: "Pronostics",
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
              className={`flex flex-col items-center ${activeTab === index ? "text-emerald-400" : "text-gray-400"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-person-x" viewBox="0 0 16 16">
              <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z" />
              <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-.646-4.854.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 .708-.708" />
            </svg>
            <span className="text-sm mt-1">Déconnexion</span>
          </button>
        )}
      </nav>
    </footer>
  );
}
