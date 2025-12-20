import React from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useGetPublicRoomDetailQuery } from "@/store/api/publicApi";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Users,
  Maximize,
  Home,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { Card, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/theme/mode-toggle";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const RoomDetailPublic = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { data: room, isLoading } = useGetPublicRoomDetailQuery(roomId);

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-12 text-primary" />
      </div>
    );
  if (!room)
    return (
      <div className="text-center py-20">Không tìm thấy thông tin phòng.</div>
    );

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        <div className="ml-auto flex items-center gap-2">
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
              Đăng nhập
            </NavLink>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ảnh và Mô tả (Cột trái) */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden aspect-video border shadow-sm">
            <img
              src={
                room.avatarUrl ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
              }
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold">
              {room.houseName} - {room.code}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <span>
                {room.address}, {room.district}, {room.province}
              </span>
            </div>
            <div className="p-6 bg-muted rounded-xl border">
              <h3 className="font-semibold text-lg mb-2">Mô tả phòng</h3>
              <p className=" leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>
          </div>
        </div>

        {/* Thông số và Liên hệ (Cột phải) */}
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-lg shadow-primary/5">
            <CardContent className="p-6 space-y-6">
              <div className="text-center pb-4 border-b">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(room.rent)}
                </span>
                <span className="text-slate-400 text-sm ml-1">/tháng</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Maximize className="h-4 w-4" /> Diện tích
                  </div>
                  <span className="font-semibold">{room.area} m²</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" /> Sức chứa
                  </div>
                  <span className="font-semibold">{room.maxPeople} người</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Home className="h-4 w-4" /> Tầng
                  </div>
                  <span className="font-semibold">{room.floor}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button className="w-full h-12 text-lg gap-2" asChild>
                  <a href={`tel:${room.ownerPhone}`}>
                    <Phone className="h-5 w-5" /> {room.ownerPhone}
                  </a>
                </Button>
                <p className="text-center text-xs text-muted-foreground italic">
                  Liên hệ chủ nhà: {room.ownerName}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPublic;
