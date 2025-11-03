import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, MapPin } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { useGetRoomsByHouseIdQuery } from "../../store/roomApi";

const HouseCard = ({ house }) => {
  const {
    data: roomsData,
    isLoading,
    isFetching,
    isError,
  } = useGetRoomsByHouseIdQuery({
    houseId: house.id,
    page: 0,
    size: 1000,
  });
  const rooms = roomsData?.content || [];
  const totalRooms = rooms.length || 0;
  const rentRooms = rooms.filter((room) => room.status === 1);

  return (
    <Card className={" shadow-md group"}>
      <CardHeader className={"space-y-1"}>
        <CardTitle className={"line-clamp-2"}>{house.name}</CardTitle>
        <CardDescription>Code: {house.code}</CardDescription>
        <CardDescription>
          Rent: {rentRooms.length}/{totalRooms}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-x-2 text-primary transition-all duration-200 ease-in-out relative top-12 group-hover:top-0">
          <MapPin />
          <p>
            {house.district} - {house.province}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={
            "w-full transition-all duration-300 ease-in-out opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }
          asChild
        >
          <NavLink
            to={`/owner/houses/${house.id}`}
            className={"flex items-center gap-2"}
          >
            <Eye /> View
          </NavLink>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HouseCard;
