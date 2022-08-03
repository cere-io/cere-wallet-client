import { UIProvider } from "@cere-wallet/ui";

import { Hello } from "./components";

export const App = () => (
  <UIProvider>
    <Hello />
  </UIProvider>
);
