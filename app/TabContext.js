"use client";

import { createContext, useContext, useRef, useState } from "react";

const TabContext = createContext(null);

export function TabProvider({ children }) {
  const scrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  const goToTab = (index) => {
    setActiveTab(index);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const scrollLeft = scrollRef.current.scrollLeft;
    const clientWidth = scrollRef.current.clientWidth;

    // Calculer l'index de l'onglet actif
    const index = Math.round(scrollLeft / clientWidth);
    setActiveTab(index);
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, goToTab, scrollRef, handleScroll }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  return useContext(TabContext);
}
