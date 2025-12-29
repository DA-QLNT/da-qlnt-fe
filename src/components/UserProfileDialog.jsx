import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar, CreditCard, User } from "lucide-react";
import { IconUserCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function UserProfileDialog({ user, open, onOpenChange }) {
  const { t } = useTranslation("usercontent");
  if (!user) return null;

  const infoItems = [
    { icon: <Mail size={16} />, label: "Email", value: user.email },
    {
      icon: <Phone size={16} />,
      label: t("PhoneNumber"),
      value: user.phoneNumber,
    },
    {
      icon: <MapPin size={16} />,
      label: t("Address"),
      value: user.address,
    },
    {
      icon: <Calendar size={16} />,
      label: t("DateOfBirthLabel"),
      value: user.dob,
    },
    { icon: <User size={16} />, label: t("User"), value: user.fullName },
    {
      icon: <CreditCard size={16} />,
      label: t("IDCard"),
      value: user.cccd || t("NotUpdated"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <IconUserCircle className="text-primary" />{" "}
            {t("AccountInformation")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="text-xl">CN</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-bold text-lg">{user.fullName}</h3>
            <Badge variant="secondary" className="mt-1">
              {user.userType}
            </Badge>
          </div>

          <div className="w-full grid gap-3 mt-4 text-sm">
            {infoItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-background"
              >
                <div className="text-primary">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    {item.label}
                  </p>
                  <p className="font-medium text-muted-foreground">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
