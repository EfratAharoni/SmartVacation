import AppRoutes from "./route";
import "./App.css";
import { UserListsProvider } from "./context/UserListsContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { Toaster } from "./components/Toast";

function App() {
  return (
    <PreferencesProvider>
      <UserListsProvider>
        <AppRoutes />
        <Toaster />
      </UserListsProvider>
    </PreferencesProvider>
  );
}

export default App;
