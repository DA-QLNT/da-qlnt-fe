import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EllipsisIcon, EllipsisVertical, Plus, Trash } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useGetRulesQuery } from "../../store/houseApi";
import { Spinner } from "@/components/ui/spinner";
import RuleAddDialog from "../../components/Rule/RuleAddDialog";

const RuleOwner = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching, isError } = useGetRulesQuery({
    page: page,
    size: pageSize,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const rawRules = data?.rules || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const sortedRules = useMemo(() => {
    return [...rawRules].sort((a, b) => {
      const nameA = a.name;
      const nameB = b.name;
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [rawRules]);
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi tải danh sách nội quy.
      </div>
    );
  }
  if (isLoading || isFetching) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }
  return (
    <div className="px-4 lg:px-6">
      <RuleAddDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      <div className="flex flex-col gap-8">
        <div className="text-end ">
          <Button
            onClick={() => {
              setIsAddDialogOpen(true);
            }}
          >
            <Plus />
            Add Rule
          </Button>
        </div>
        <div className="w-full rounded-lg border shadow-md shadow-secondary">
          <Table>
            <TableHeader className={"bg-sidebar"}>
              <TableRow>
                <TableHead className={"w-[50px]"}>No</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead className={"text-right w-[100px]"}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRules.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No Rule
                  </TableCell>
                </TableRow>
              ) : (
                sortedRules.map((rule, index) => (
                  <TableRow key={rule.id}>
                    <TableCell>{page * pageSize + index + 1}</TableCell>
                    <TableCell>
                      <h4 className="font-semibold line-clamp-1">
                        {rule.name}
                      </h4>
                      <p className="text-muted-foreground text-wrap line-clamp-4">
                        {rule.description}
                      </p>
                    </TableCell>
                    <TableCell className={"text-right w-[100px]"}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <EllipsisIcon
                              size={20}
                              className="hidden sm:block"
                            />
                            <EllipsisVertical
                              size={20}
                              className="block sm:hidden"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className={"text-red-500"}>
                            <Trash className="mr-2 h-4 w-4 text-red-500" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setPage(i)}
                    isActive={i === page}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  disabled={page === totalPages - 1}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default RuleOwner;
