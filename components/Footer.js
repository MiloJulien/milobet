"use client";

import { signOut, useSession } from "next-auth/react";
import { useTabs } from "@/app/TabContext";
import { useEffect } from "react";

export default function Footer() {
  const { data: session } = useSession();
  const { activeTab, goToTab, scrollRef } = useTabs();

  // Si le scroll est resté sur MatchList après reload → forcer activeTab = 1
  useEffect(() => {
    if (!scrollRef?.current) return;

    const clientWidth = scrollRef.current.clientWidth;
    const scrollLeft = scrollRef.current.scrollLeft;

    const index = Math.round(scrollLeft / clientWidth);

    if (index !== activeTab) {
      goToTab(index);
    }
  }, [scrollRef]);


  const tabs = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-list-ol" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/>
          <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"/>
        </svg>
      ),
      label: "Classement",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-pen-fill" viewBox="0 0 16 16">
          <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001"/>
        </svg>
      ),
      label: "Pronostics",
    },
     {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-distribute-vertical" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1 1.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13a.5.5 0 0 0-.5.5m0 13a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13a.5.5 0 0 0-.5.5"/>
          <path d="M2 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
        </svg>
      ),
      label: "Statistiques",
    },
  ];

  return (
    <footer
      className="bg-gray-800 text-white fixed bottom-0 w-full shadow-lg border-t-4 border-emerald-400"
      style={{ height: "84px" }}
    >
      <nav className="container mx-auto flex justify-between items-center h-full p-4">
        {/* Onglets avec icônes SVG */}
        <div className="flex space-x-5">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => goToTab(index)}
              className={`flex flex-col items-center ${activeTab === index ? "text-emerald-400" : "text-gray-400"
                } hover:text-emerald-300`}
            >
              {tab.icon}
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Séparation visuelle */}
        {/* <div className="h-8 border-l border-gray-600 mx-1"></div> */}

        {/* Bouton de déconnexion */}
        {session && (
          <button
            onClick={async () => await signOut({ redirect: false })}
            className={`flex flex-col items-center text-red-400 hover:text-red-500`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-person-fill-x" viewBox="0 0 16 16">
              <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
              <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-.646-4.854.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 .708-.708"/>
            </svg>
            <span className="text-xs mt-1">Déconnexion</span>
          </button>
        )}
      </nav>
    </footer>
  );
}
