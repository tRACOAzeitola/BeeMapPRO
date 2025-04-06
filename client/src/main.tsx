import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./contexts/theme-context";
import { ApiaryProvider } from "./contexts/apiary-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ApiaryProvider>
        <App />
      </ApiaryProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
