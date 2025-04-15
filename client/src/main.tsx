import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ApiaryProvider } from "./contexts/apiary-context";
import { NotificationProvider } from "./contexts/notification-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <ApiaryProvider>
        <App />
      </ApiaryProvider>
    </NotificationProvider>
  </QueryClientProvider>
);
