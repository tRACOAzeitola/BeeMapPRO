import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Apiary } from "@shared/schema";

type ApiaryContextType = {
  selectedApiaryId: number | null;
  setSelectedApiaryId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedApiary: Apiary | null;
  apiaryList: Apiary[];
  isLoading: boolean;
};

const ApiaryContext = createContext<ApiaryContextType>({
  selectedApiaryId: null,
  setSelectedApiaryId: () => {},
  selectedApiary: null,
  apiaryList: [],
  isLoading: false,
});

export const useApiaryContext = () => useContext(ApiaryContext);

export const ApiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedApiaryId, setSelectedApiaryId] = useState<number | null>(null);

  // Fetch all apiaries
  const { data: apiaryList = [], isLoading } = useQuery<Apiary[]>({
    queryKey: ['/api/apiaries'],
  });

  // Set first apiary as selected when data loads
  useEffect(() => {
    if (apiaryList.length > 0 && selectedApiaryId === null) {
      setSelectedApiaryId(apiaryList[0].id);
    }
  }, [apiaryList, selectedApiaryId]);

  // Find the selected apiary from the list
  const selectedApiary = selectedApiaryId
    ? apiaryList.find((apiary) => apiary.id === selectedApiaryId) || null
    : null;

  return (
    <ApiaryContext.Provider
      value={{
        selectedApiaryId,
        setSelectedApiaryId,
        selectedApiary,
        apiaryList,
        isLoading,
      }}
    >
      {children}
    </ApiaryContext.Provider>
  );
};
