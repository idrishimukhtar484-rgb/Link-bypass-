import { Link, useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { Button, buttonVariants } from "@/src/components/ui/button";
import { auth, logout } from "@/src/lib/firebase";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import { Link2, Menu, User as UserIcon, LogOut, LayoutDashboard, Zap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function Navbar({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "CPM Rates", path: "/cpm" },
    { name: "Payment Proof", path: "/payment-proof" },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Zap className="h-6 w-6 text-white fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Link<span className="text-primary-500">Pulse</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className="text-slate-600 hover:text-primary-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative h-8 w-8 rounded-full p-0")}>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 ring-offset-background transition-colors hover:bg-slate-200">
                    <UserIcon className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Administration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate("/auth")}>Login</Button>
                <Button onClick={() => navigate("/auth")}>Sign Up</Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-semibold text-slate-900"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-4">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-lg font-semibold text-primary-500"
                    >
                      Dashboard
                    </Link>
                    <Button variant="destructive" onClick={handleLogout} className="w-full">
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Button variant="outline" onClick={() => navigate("/auth")} className="w-full">Login</Button>
                    <Button onClick={() => navigate("/auth")} className="w-full">Sign Up</Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
