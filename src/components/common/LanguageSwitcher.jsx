import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language || "en";

  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleChange("en")}
          className={currentLang === "en" ? "font-semibold text-primary" : ""}
        >
          <img
            src="https://flagcdn.com/w20/gb.png"
            alt="English"
            className="inline-block mr-2 h-4 w-6 rounded-sm"
          />{" "}
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleChange("vi")}
          className={currentLang === "vi" ? "font-semibold text-primary" : ""}
        >
          <img
            src="https://flagcdn.com/w20/vn.png"
            alt="English"
            className="inline-block mr-2 h-4 w-6 rounded-sm"
          />{" "}
          Tiếng Việt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
