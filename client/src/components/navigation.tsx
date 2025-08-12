import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coins, User, Settings, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";




export function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();



  const navigationItems = [
    { href: "/marketplace", label: "Marketplace", roles: ["investor", "borrower"] },
    { href: "/loan-application", label: "Apply for Loan", roles: ["borrower"] },
    { href: "/borrower-dashboard", label: "My Loans", roles: ["borrower"] },
    { href: "/investor-dashboard", label: "My Investments", roles: ["investor"] },
    { href: "/admin-dashboard", label: "Admin Dashboard", roles: ["admin"] },
  ];

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
    : 'U';

  const filteredNavItems = navigationItems.filter(item => 
    !user?.userType || item.roles.includes(user.userType)
  );

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-lg border-b border-neutral-100 sticky top-0 z-50" data-testid="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
              <Coins className="text-primary text-2xl" />
              <span className="text-xl font-bold text-neutral-800">FinScoreX</span>
            </Link>
            <div className="flex items-center space-x-4">

              
              <Link href="/auth" className="text-primary hover:text-blue-700 font-medium transition-colors duration-200" data-testid="login-link">
                Log in
              </Link>
              <Link href="/auth" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200" data-testid="register-link">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-neutral-100 sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
            <Coins className="text-primary text-2xl" />
            <span className="text-xl font-bold text-neutral-800">FinScoreX</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`text-neutral-600 hover:text-primary transition-colors duration-200 ${
                    location === item.href ? 'text-primary font-medium' : ''
                  }`}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {filteredNavItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <button
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                          location === item.href 
                            ? 'bg-primary text-white' 
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                        data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.label}
                      </button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu-trigger">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount data-testid="user-menu">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName || user?.lastName ? (
                      <p className="font-medium text-sm" data-testid="user-name">
                        {user.firstName} {user.lastName}
                      </p>
                    ) : null}
                    {user?.email && (
                      <p className="w-[200px] truncate text-xs text-neutral-500" data-testid="user-email">
                        {user.email}
                      </p>
                    )}
                    {user?.userType && (
                      <p className="text-xs text-neutral-500 capitalize" data-testid="user-type">
                        {user.userType}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer" data-testid="profile-link">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer" data-testid="settings-link">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button 
                    onClick={async () => {
                      try {
                        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                        window.location.href = '/auth';
                      } catch (error) {
                        console.error('Logout failed:', error);
                        window.location.href = '/auth';
                      }
                    }}
                    className="flex items-center cursor-pointer w-full text-left" 
                    data-testid="logout-button"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
