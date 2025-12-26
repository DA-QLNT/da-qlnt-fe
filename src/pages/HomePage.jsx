import React, { useState } from "react";
import logoteam from "@/assets/logoteam.png";
import { useTranslation } from "react-i18next";
import { useSearchPublicRoomsQuery } from "@/store/api/publicApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format/currencyFormat";
import {
  Search,
  MapPin,
  Users,
  Maximize,
  Phone,
  Home,
  FilterX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NavLink, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/site-header";
import { ModeToggle } from "@/components/theme/mode-toggle";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import GradientText from "@/components/GradientText";

const HomePage = () => {
  const { t } = useTranslation("public");
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 0,
    size: 12,
    province: "",
    minPrice: "",
    maxPrice: "",
    maxPeople: "",
  });

  const { data, isLoading, isFetching } = useSearchPublicRoomsQuery(filters);
  const rooms = data?.content || [];

  return (
    <div className="min-h-screen bg-sidebar/10 pb-12 py-8 px-4 space-y-4">
      <header className="bg-sidebar ml-auto p-2 mb-4 flex items-center justify-end gap-2 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-md">
        <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
          <ModeToggle />
        </Button>
        <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
          <LanguageSwitcher />
        </Button>
        <Button
          variant={"outline"}
          className={
            "border-purple-400 dark:border-purple-400 hover:border-amber-500 hover:text-amber-500"
          }
          asChild
        >
          <NavLink to={`/auth/login`} className={"flex items-center gap-1"}>
            {t("login")}
          </NavLink>
        </Button>
      </header>
      {/* 🚨 HERO SECTION & HORIZONTAL FILTER */}
      <Card className="sticky top-0 z-10 p-1 md:p-6 bg-sidebar rounded-md shadow-sm">
        <CardContent className="space-y-4 p-0">
          <div className="flex flex-col md:flex-row md:items-end gap-3 relative">
            {/* Nút reset */}
            <FilterX
              className="absolute -top-4 right-0 text-red-500"
              onClick={() =>
                setFilters({
                  page: 0,
                  size: 12,
                  province: "",
                  minPrice: "",
                  maxPrice: "",
                  maxPeople: "",
                })
              }
            />
            {/* Tỉnh thành */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">
                {t("hero.area")}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("hero.provincePlaceholder")}
                  className="pl-9 bg-input  focus:bg-sidebar transition-colors"
                  value={filters.province}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Khoảng giá */}
            <div className="flex-[1.5] space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">
                {t("hero.priceRange")}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t("hero.from")}
                  className="bg-slate-50 "
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: e.target.value,
                    }))
                  }
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder={t("hero.to")}
                  className="bg-slate-50 "
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Số người */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">
                {t("hero.maxPeople")}
              </label>
              <Input
                type="number"
                placeholder={t("hero.maxPeoplePlaceholder")}
                className="bg-slate-50 "
                value={filters.maxPeople}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPeople: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚨 LISTING SECTION */}
      <div className=" mt-8">
        {isLoading || isFetching ? (
          <div className="flex justify-center py-20">
            <Spinner className="size-12 text-primary" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-sidebar rounded-2xl border-2 border-dashed">
            <p className="text-muted-foreground">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="group overflow-hidden  hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={
                      room.avatarUrl ||
                      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"
                    }
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge className="bg-sidebar/90 text-primary hover:bg-sidebar">
                      {room.area} {t("rooms.areaUnit")}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base line-clamp-1">
                      {room.houseName} - {room.code}
                    </CardTitle>
                    <span className="font-bold text-primary whitespace-nowrap">
                      {formatCurrency(room.rent)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" /> {room.district},{" "}
                    {room.province}
                  </div>
                </CardHeader>
                <CardFooter className="p-4 text-xs text-muted-foreground flex justify-between border-t mt-auto pt-3 border-slate-50">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />{" "}
                    {t("maxLabel", { count: room.maxPeople })}
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {t("ownerLabel")} {room.ownerName}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <footer className="rounded-xl w-full bg-linear-to-b from-[#F1EAFF] to-[#FFFFFF] text-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
          <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
            {t("Intro")}{" "}
            <a href="hdn@gmail.com" className="text-primary underline">
              hdn@gmail.com
            </a>
          </p>
        </div>
        <div className="border-t flex flex-col items-center pt-4 gap-4">
          <div className="flex ">
            <img
              className="h-12 w-12 object-contain rounded-full shadow-sm inline-block"
              src={logoteam}
              alt="logo"
            />
            <GradientText className="text-xl ml-4">HĐN Solutions</GradientText>
          </div>
          ©2025. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
