import { Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <SidebarTrigger />
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-foreground">GSECD</span>
              <span className="text-xs text-muted-foreground">Global Socio-Economic Crisis Dashboard</span>
            </div>
          </Link>
        </div>

        <Button variant="outline" size="sm" onClick={signOut}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;

