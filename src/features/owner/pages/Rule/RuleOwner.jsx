import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { Plus, Eye, Edit3, Trash } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useGetRulesQuery } from "../../store/houseApi";
import { Spinner } from "@/components/ui/spinner";
import RuleAddDialog from "../../components/Rule/RuleAddDialog";
import RuleViewDialog from "../../components/Rule/RuleViewDialog";
import RuleEditDialog from "../../components/Rule/RuleEditDialog";
import RuleDeleteConfirm from "../../components/Rule/RuleDeleteConfirm";
import { useTranslation } from "react-i18next";

const RuleOwner = () => {
  const { t } = useTranslation("repairreportrule");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching, isError } = useGetRulesQuery({
    page: page,
    size: pageSize,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
  // if (isError) {
  //   return (
  //     <div className="p-6 text-center text-red-500">
  //       Lỗi tải danh sách nội quy.
  //     </div>
  //   );
  // }
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
      {/* View / Edit / Delete dialogs */}
      {selectedRuleId && (
        <>
          <RuleViewDialog
            ruleId={selectedRuleId}
            open={isViewOpen}
            onOpenChange={setIsViewOpen}
          />
          <RuleEditDialog
            ruleId={selectedRuleId}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
          <RuleDeleteConfirm
            ruleId={selectedRuleId}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onDeleted={() => setSelectedRuleId(null)}
          />
        </>
      )}

      <div className="flex flex-col gap-8">
        <div className="text-end ">
          <Button
            onClick={() => {
              setIsAddDialogOpen(true);
            }}
          >
            <Plus />
            {t("AddRule")}
          </Button>
        </div>
        <div className="w-full p-1 rounded-lg border border-purple-300 shadow-md shadow-secondary">
          <Table>
            <TableHeader className={"bg-sidebar"}>
              <TableRow>
                <TableHead className={"w-[50px]"}>{t("No")}</TableHead>
                <TableHead>{t("Rule")}</TableHead>
                <TableHead className={"text-right w-[100px]"}>
                  {t("Action")}
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
                    {t("NoRule")}
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
                      {/* --- GIAO DIỆN DESKTOP (Màn hình md trở lên) --- */}
                      <div className="hidden md:flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRuleId(rule.id);
                            setIsViewOpen(true);
                          }}
                        >
                          {t("View")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedRuleId(rule.id);
                            setIsEditOpen(true);
                          }}
                        >
                          {t("Edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRuleId(rule.id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          {t("Delete")}
                        </Button>
                      </div>

                      {/* --- GIAO DIỆN MOBILE (Dưới màn hình md) --- */}
                      <div className="md:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="">
                              {t("Action")}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRuleId(rule.id);
                                setIsViewOpen(true);
                              }}
                            >
                              {t("View")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRuleId(rule.id);
                                setIsEditOpen(true);
                              }}
                            >
                              {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedRuleId(rule.id);
                                setIsDeleteOpen(true);
                              }}
                            >
                              {t("Delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
