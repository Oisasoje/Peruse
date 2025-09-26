"use client";
import React, { createContext, useContext, useState } from "react";

type LoaderContext = {
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

// default value so TS stops complaining
const LoaderContext = createContext<LoaderContext | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider
      value={{ isProcessing, setIsProcessing, loading, setLoading }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error("useLoader must be used inside useLoaderProvider");
  }
  return ctx;
};
