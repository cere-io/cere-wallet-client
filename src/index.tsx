import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { UIProvider } from "@cere-wallet/ui";

import { App } from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </StrictMode>
);
