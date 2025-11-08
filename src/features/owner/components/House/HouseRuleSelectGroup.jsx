import React, { useEffect, useMemo } from "react";
import { useGetRulesQuery } from "../../store/houseApi";
import { FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const HouseRuleSelectGroup = ({ field, error }) => {
  const { t } = useTranslation("house");
  const { data, isLoading } = useGetRulesQuery({ page: 0, size: 100 });
  const allRules = data?.rules || [];

  const sortedRules = useMemo(() => {
    return [...allRules].sort((a, b) => a.name.localeCompare(b.name));
  }, [allRules]);
  const selectedIds = field.value || [];

  useEffect(() => {
    if (
      !isLoading &&
      allRules.length > 0 &&
      selectedIds.length === 0 &&
      field.value?.length === 0
    ) {
      const allRuleIds = allRules.map((rule) => rule.id);
      field.onChange(allRuleIds);
    }
  }, [isLoading, allRules.length, field.onChange, field.value]);
  const handleCheckedChange = (ruleId, checked) => {
    let newIds;
    if (checked) {
      newIds = [...selectedIds, ruleId];
    } else {
      newIds = selectedIds.filter((id) => id !== ruleId);
    }
    field.onChange(newIds);
  };
  return (
    <div className="space-y-2">
      <FieldLabel>Rules</FieldLabel>
      <div className="border rounded-md p-3 max-h-48">
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : sortedRules.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("NoRule")}</p>
        ) : (
          <ScrollArea className={"h-40"}>
            <div className="space-y-2">
              {sortedRules.map((rule) => (
                <div key={rule.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`rule-${rule.id}`}
                    checked={selectedIds.includes(rule.id)}
                    onCheckedChange={(checked) =>
                      handleCheckedChange(rule.id, checked)
                    }
                  />
                  <Label htmlFor={`rule-${rule.id}`}>{rule.name}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
};

export default HouseRuleSelectGroup;
