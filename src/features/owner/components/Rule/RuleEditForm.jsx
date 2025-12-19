import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RuleSchema } from "@/lib/validation/rule";
import { useGetRuleByIdQuery, useUpdateRuleMutation } from "../../store/houseApi";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const RuleEditForm = ({ ruleId, onFormSubmitSuccess }) => {
  const { t } = useTranslation("repairreportrule");
  const { data: rule, isLoading } = useGetRuleByIdQuery(ruleId, { skip: !ruleId });
  const [updateRule, { isLoading: isUpdating }] = useUpdateRuleMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(RuleSchema),
    defaultValues: { name: "", description: "" },
  });

  React.useEffect(() => {
    if (rule) reset({ name: rule.name || "", description: rule.description || "" });
  }, [rule, reset]);

  const onSubmit = async (data) => {
    try {
      await updateRule({ ruleId, ...data }).unwrap();
      toast.success(t("UpdateSuccess") || "Cập nhật thành công");
      onFormSubmitSuccess();
    } catch (err) {
      console.error(err);
      toast.error(t("UpdateFailed") || "Cập nhật thất bại");
    }
  };

  if (isLoading) return <div className="py-6 text-center"><Spinner /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">{t("Name")}</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="description">{t("Description")}</FieldLabel>
          <Textarea id="description" {...register("description")} rows={4} />
          <FieldError>{errors.description?.message}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={isUpdating}>
        {isUpdating ? <Spinner /> : t("Update")}
      </Button>
    </form>
  );
};

export default RuleEditForm;
