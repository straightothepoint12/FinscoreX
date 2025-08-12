import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette,
  Save,
  RefreshCcw
} from "lucide-react";

export default function Settings() {
  const { user, isLoading, isAuthenticated } = useAuth();
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

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been successfully updated.",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="settings-page">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2" data-testid="settings-title">
            Settings
          </h1>
          <p className="text-neutral-600">
            Configure your notification preferences
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Notification Settings */}
          <Card data-testid="notifications-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email notifications</Label>
                  <p className="text-sm text-neutral-600">
                    Receive email updates about your account
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-email-notifications" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Loan alerts</Label>
                  <p className="text-sm text-neutral-600">
                    Notifications when new loans become available
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-loan-alerts" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Investment alerts</Label>
                  <p className="text-sm text-neutral-600">
                    Alerts for new investment opportunities
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-investment-alerts" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Payment reminders</Label>
                  <p className="text-sm text-neutral-600">
                    Reminders for upcoming payment due dates
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-payment-reminders" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Security alerts</Label>
                  <p className="text-sm text-neutral-600">
                    Important security and account notifications
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-security-alerts" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 max-w-2xl mx-auto flex justify-end space-x-4">
          <Button variant="outline" data-testid="button-reset">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset to defaults
          </Button>
          <Button onClick={handleSaveSettings} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            Save preferences
          </Button>
        </div>
      </div>
    </div>
  );
}