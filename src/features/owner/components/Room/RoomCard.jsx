import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Expand, Eye, PersonStanding } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import RoomStatusBadge from "./RoomStatusBadge";
const rooms = [
  {
    id: 3,
    houseId: 13,
    code: "p207",
    floor: 2,
    maxPeople: 5,
    rent: 2400000.0,
    area: 35.0,
    status: 0,
    description: "phòng vskk, dngd",
    avatarUrl:
      "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761556323/general/fz1w6mox7zvxudxukrar.jpg",
    images: [
      "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761556327/general/dvuhlwwfopfehl2yewep.jpg",
      "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761556331/general/wz8h2chr2zm06jjtp3wz.jpg",
    ],
  },
  {
    id: 2,
    houseId: 13,
    code: "p205",
    floor: 2,
    maxPeople: 4,
    rent: 2000000.0,
    area: 30.0,
    status: 1,
    description: "phòng vskk, dngd",
    avatarUrl:
      "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761555549/general/ftkn9brjwxgqi3a7dkwo.webp",
    images: [
      "http://res.cloudinary.com/dumrmr6xa/image/upload/v1761555558/general/iiv288uv2rcrh8ojkyql.webp",
    ],
  },
];
const RoomCard = ({ room, houseId }) => {
  return (
    <Card className={" shadow-md group pt-0"}>
      <div className="rounded-t-xl p-1 border border-purple-300">
        <img
          src={room.avatarUrl}
          alt={room.code}
          className="w-full aspect-square flex rounded-t-xl object-cover"
        />
      </div>
      <CardHeader className={"space-y-1"}>
        <CardTitle className={"line-clamp-2"}>Code: {room.code}</CardTitle>
        <CardDescription
          className={"flex md:flex-col md:gap-y-2 lg:flex-row justify-between"}
        >
          <span className="flex items-center xl:gap-x-1">
            <PersonStanding /> {room.maxPeople}
          </span>
          <span className="flex items-center lg:gap-x-1">
            <Expand /> {room.area}(m2)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col 2xl:flex-row justify-between gap-x-2 transition-all duration-200 ease-in-out relative top-12 group-hover:top-0">
          <p className="flex items-center text-sm md:text-base">
            <DollarSign size={16} />
            {room.rent}
          </p>
          <div className="text-end">
            <RoomStatusBadge status={room.status}/>
          </div>
        </div>
      </CardContent>
      <CardFooter className={"px-0"}>
        <Button
          className={
            "w-2/3 mx-auto transition-all duration-300 ease-in-out opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }
          asChild
        >
          <NavLink
            to={`/owner/houses/${houseId}/rooms/${room.id}`}
            className={"flex items-center gap-2"}
          >
            <Eye /> View
          </NavLink>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
