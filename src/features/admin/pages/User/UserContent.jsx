import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ellipsis,
  EllipsisVertical,
  FunnelPlus,
  KeyRound,
  Plus,
  Search,
  SquarePen,
  Trash,
  UserPen,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];
const UserContent = () => {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">
            All user <span>10</span>
          </h1>

          <div className="relative order-last w-full md:order-none md:w-1/3">
            <Search
              className="absolute left-2 top-1.5"
              size={24}
              strokeWidth={1.5}
            />
            <Input className="pl-9" type="text" placeholder="Search" />
          </div>
          <div className="flex items-center gap-2">
            <Button className="tracking-wider">
              <FunnelPlus />
              Filter
            </Button>
            <Button variant="outline">
              <Plus size={24} />
              Add
            </Button>
          </div>
        </div>
        <Separator />
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={1}>No</TableHead>
                <TableHead colSpan={2} className="w-[100px]">
                  User
                </TableHead>
                <TableHead colSpan={2}>Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice, index) => (
                <TableRow key={invoice.invoice}>
                  <TableCell colSpan={1}>{index + 1}</TableCell>
                  <TableCell colSpan={2} className="font-medium">
                    <div className="flex w-full items-center gap-2">
                      <div className="p-0.5 bg-amber-200 rounded-full">
                        <img
                          src="/public/canhdiem8-16803662980981638428853.jpg"
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                      <div>
                        <h4>LwongHoa</h4>
                        <p>abc@gmail.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Badge>{invoice.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div>
                            <EllipsisVertical
                              className="hidden md:block cursor-pointer "
                              size={24}
                            />
                            <Ellipsis
                              className="block md:hidden cursor-pointer "
                              size={24}
                            />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-48 mr-4"
                          align="start"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuItem>
                              <SquarePen />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPen />
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <KeyRound />
                              Permission
                            </DropdownMenuItem>
                            <DropdownMenuItem className=''>
                              <Trash color="red"/>
                              <span className="text-red-500">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default UserContent;
