import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Agenda from './pages/Agenda';
import Historico from './pages/Historico';
import Painel from './pages/Painel';
import PainelMetas from './pages/PainelMetas';
import Produtividade from "./pages/Produtividade";
import Financeiro from "./pages/Financeiro";
import SetupSupabase from "./pages/SetupSupabase";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
        <Route path="/agenda" component={Agenda} />
        <Route path="/historico" component={Historico} />
        <Route path="/painel" component={Painel} />
        <Route path="/painel-metas" component={PainelMetas} />
      <Route path={"/produtividade"} component={Produtividade} />
      <Route path={"/financeiro"} component={Financeiro} />
      <Route path={"/setup-supabase"} component={SetupSupabase} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
