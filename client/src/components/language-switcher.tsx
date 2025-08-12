import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";

export function LanguageSwitcher() {
  const { language, setLanguage } = useSimpleLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="language-switcher">
          <Globe className="h-4 w-4" />
          {language === "fr" ? "FR" : "EN"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage("fr")}
          className="gap-2"
          data-testid="language-fr"
        >
          {language === "fr" && <Check className="h-4 w-4" />}
          <span className={language !== "fr" ? "ml-6" : ""}>Français</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className="gap-2"
          data-testid="language-en"
        >
          {language === "en" && <Check className="h-4 w-4" />}
          <span className={language !== "en" ? "ml-6" : ""}>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}