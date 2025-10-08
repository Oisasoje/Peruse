"use client";
import React, { createContext, useContext, useState } from "react";

type ActivePageContextType = {
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
};

// default value so TS stops complaining
const ActivePageContext = createContext<ActivePageContextType | undefined>(
  undefined
);

export const ActivePageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activePage, setActivePage] = useState("take-quiz");

  //

  return (
    <ActivePageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </ActivePageContext.Provider>
  );
};

export const useActivePage = () => {
  const ctx = useContext(ActivePageContext);
  if (!ctx) {
    throw new Error("useActivePage must be used inside ActivePageProvider");
  }
  return ctx;
};
