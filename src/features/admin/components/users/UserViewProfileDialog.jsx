import React from "react";
import { useGetUserByIdQuery } from "../../store/userApi";
import { format } from "date-fns/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel } from "@/components/ui/field";
import RoleBadgeGroup from "./RoleBadgeGroup";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const UserViewProfileDialog = ({ userId, open, onOpenChange }) => {
  const {t} = useTranslation("usercontent")
  const {
    data: user,
    isLoading,
    isFetching,
    isError,
  } = useGetUserByIdQuery(userId, {
    skip: !userId || !open,
  });
  const loading = isLoading || isFetching;
  const handleOpenChange = (newOpenState) => {
    if (!newOpenState) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };
  const formattedDob = user?.dob
    ? format(new Date(user.dob), "dd/MM/yyyy")
    : "N/A";
  if (isError) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={"sm:max-w-md text-center text-red-500"}>
          {t('ErrorLoadingData')}
        </DialogContent>
      </Dialog>
    );
  }
  const dialogContentClasses = cn(
      'w-full', 'sm:max-w-xl', 'md:max-w-2xl', 'lg:max-w-3xl', 'xl:max-w-4xl'
    );
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={dialogContentClasses}>
        <DialogHeader>
          <DialogTitle>{t('UserProfile')} {user?.id}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center">
            <Spinner />
            Loading...
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <img
                src={user?.avatarUrl || "/userDefault.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2"
              />
            </div>
            <Field>
              <FieldLabel>{t('Username')}</FieldLabel>
              <Input value={user?.username} readOnly />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={user?.email} readOnly />
              </Field>
              <Field>
                <FieldLabel>{t('PhoneNumber')}</FieldLabel>
                <Input value={user?.phoneNumber} readOnly />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>{t('Dob')}</FieldLabel>
                <Input value={formattedDob} readOnly />
              </Field>
              <Field>
                <FieldLabel>{t('Address')}</FieldLabel>
                <Input value={user?.address || "N/A"} readOnly />
              </Field>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Field>
                <FieldLabel>{t('Role')}</FieldLabel>
                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800/50 min-h-10 flex items-center">
                  <RoleBadgeGroup roles={user?.roles} />
                </div>
              </Field>

              <Field>
                <FieldLabel>{t('Bank')}</FieldLabel>
                <Input value={user?.bankAcc} readOnly />
              </Field>
              <Field>
                <FieldLabel>{t('BusinessNo')}</FieldLabel>
                <Input value={user?.businessNo} readOnly />
              </Field>
              <Field>
                <FieldLabel>{t('TaxCode')}</FieldLabel>
                <Input value={user?.taxCode} readOnly />
              </Field>
              <Field>
                <FieldLabel>{t('Verified')}</FieldLabel>
                <Input value={user?.verified} readOnly />
              </Field>
              <Field>
                <FieldLabel>{t('Representative')}</FieldLabel>
                <Input value={user?.representative} readOnly />
              </Field>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserViewProfileDialog;
