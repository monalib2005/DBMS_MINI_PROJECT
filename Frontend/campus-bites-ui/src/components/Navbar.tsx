import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Package, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isAdmin?: boolean; // optional prop to indicate admin
}

const Navbar = ({ isAdmin = false }: NavbarProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: ShoppingCart, label: "Cart", path: "/cart" },
    { icon: Package, label: "Orders", path: "/orders" },
    { icon: History, label: "History", path: "/history" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={isAdmin ? "/admin/dashboard" : "/home"} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              {isAdmin ? "Admin Panel" : "Smart Canteen"}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {!isAdmin &&
              navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to={item.path} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}

            <Button variant="destructive" size="sm" asChild>
              <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Link>
            </Button>
          </div>

          {/* Mobile menu */}
          {!isAdmin && (
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/cart">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/orders">
                  <Package className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {!isAdmin && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border shadow-lg">
          <div className="flex items-center justify-around h-16 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
