import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./web3-styles.css";
import { LanguageProvider } from "./components/LanguageContext";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);