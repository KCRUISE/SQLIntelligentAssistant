import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import ChatPage from "@/pages/chat";
import HistoryPage from "@/pages/history";
import FavoritesPage from "@/pages/favorites";
import SharedPage from "@/pages/shared";
import VisualizationPage from "@/pages/visualization";
import SchemaManagerPage from "@/pages/schema-manager";
import SQLFormatterPage from "@/pages/sql-formatter";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

function Router() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          showMenuButton={true}
        />
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
          <Switch>
            <Route path="/" component={ChatPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/favorites" component={FavoritesPage} />
            <Route path="/shared" component={SharedPage} />
            <Route path="/visualization" component={VisualizationPage} />
            <Route path="/schema-manager" component={SchemaManagerPage} />
            <Route path="/sql-formatter" component={SQLFormatterPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
