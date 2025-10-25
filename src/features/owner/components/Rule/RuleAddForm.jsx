import React from "react";
import { useCreateRuleMutation } from "../../store/houseApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RuleSchema } from "@/lib/validation/rule";
import toast from "react-hot-toast";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
const defaultValues = {
  name: "",
  description: "",
};
const RuleAddForm = ({ onFormSubmitSuccess }) => {
  const [createRule, { isLoading }] = useCreateRuleMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(RuleSchema),
    defaultValues: defaultValues,
  });
  const onSubmit = async (data) => {
    try {
      const result = await createRule(data).unwrap();
      if (result.code === 1000) {
        toast.success("CreateSuccess");
        reset();
        onFormSubmitSuccess();
      } else {
        toast.error("CreateFail");
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            {...register("name")}
            placeholder="Do not make noise"
            disabled={isLoading}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>
        <Field>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Detail about rule..."
            disabled={isLoading}
            rows={4}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isLoading} className={"w-full"}>
        {isLoading ? <Spinner /> : "Create"}
      </Button>
    </form>
  );
};

export default RuleAddForm;
