import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Mail, 
  Shield,
  Calendar,
  Edit,
  Save
} from "lucide-react";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case "borrower":
        return { label: "Borrower", color: "bg-blue-100 text-blue-800" };
      case "investor":
        return { label: "Investor", color: "bg-green-100 text-green-800" };
      case "admin":
        return { label: "Administrator", color: "bg-purple-100 text-purple-800" };
      default:
        return { label: "User", color: "bg-gray-100 text-gray-800" };
    }
  };

  const userTypeInfo = getUserTypeDisplay(user.userType || "");

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="profile-page">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2" data-testid="profile-title">
            My Profile
          </h1>
          <p className="text-neutral-600">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card data-testid="profile-info-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile photo"
                    className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
                    data-testid="profile-avatar"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-neutral-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800" data-testid="profile-name">
                    {user.firstName} {user.lastName}
                  </h3>
                  <Badge className={userTypeInfo.color} data-testid="profile-user-type">
                    {userTypeInfo.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user.firstName || ""}
                    readOnly
                    className="bg-neutral-50"
                    data-testid="input-first-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user.lastName || ""}
                    readOnly
                    className="bg-neutral-50"
                    data-testid="input-last-name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    readOnly
                    className="bg-neutral-50"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-500 text-center">
                  Profile information is managed through your authentication provider
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card data-testid="account-info-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since</span>
                </Label>
                <p className="text-neutral-700" data-testid="member-since">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : "Unknown date"}
                </p>
              </div>

              <div>
                <Label>Unique ID</Label>
                <p className="text-sm text-neutral-600 font-mono bg-neutral-50 p-2 rounded border" data-testid="user-id">
                  {user.id}
                </p>
              </div>

              <div>
                <Label>Account Type</Label>
                <div className="mt-2">
                  <Badge className={userTypeInfo.color} data-testid="account-type-badge">
                    {userTypeInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  {user.userType === "borrower" && "You can request loans and manage your borrowings."}
                  {user.userType === "investor" && "You can invest in loans and manage your portfolio."}
                  {user.userType === "admin" && "You have access to all administration tools."}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <Button variant="outline" className="w-full" data-testid="button-security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                      window.location.href = '/auth';
                    } catch (error) {
                      console.error('Logout failed:', error);
                      window.location.href = '/auth';
                    }
                  }}
                  data-testid="button-logout"
                >
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}