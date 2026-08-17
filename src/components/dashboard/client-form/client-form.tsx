"use client";

import { useForm } from "react-hook-form";

import { Input } from "@/components/commons/input/input";
import type { ClientInput } from "@/types/client";

interface Props {
  formId: string;
  onAdd: (input: ClientInput) => void;
}

const emptyClient: ClientInput = {
  brn: "",
  companyName: "",
  email: "",
  name: "",
  nationalId: "",
  phone: "",
};

export const ClientForm = ({ formId, onAdd }: Props) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ClientInput>({ defaultValues: emptyClient });

  const submitForm = (client: ClientInput) => {
    onAdd({
      brn: client.brn.trim(),
      companyName: client.companyName.trim(),
      email: client.email.trim(),
      name: client.name.trim(),
      nationalId: client.nationalId.trim(),
      phone: client.phone.trim(),
    });
    reset(emptyClient);
  };

  return (
    <form className="client-form grid gap-5 p-4 sm:grid-cols-2 sm:p-6" id={formId} noValidate onSubmit={handleSubmit(submitForm)}>
      <Input
        label="National ID (optional)"
        placeholder="e.g. A1234567890123"
        {...register("nationalId")}
      />
      <Input
        error={errors.name?.message}
        label="Client name"
        placeholder="e.g. Maya Chen"
        {...register("name", { required: "Client name is required." })}
      />
      <Input
        error={errors.companyName?.message}
        label="Company"
        placeholder="e.g. Northline Studio"
        {...register("companyName", { required: "Company is required." })}
      />
      <Input
        autoComplete="email"
        error={errors.email?.message}
        label="Email"
        placeholder="maya@northline.com"
        type="email"
        {...register("email", {
          pattern: {
            message: "Enter a valid email address.",
            value: /\S+@\S+\.\S+/,
          },
          required: "Email is required.",
        })}
      />
      <Input
        autoComplete="tel"
        error={errors.phone?.message}
        label="Phone number"
        placeholder="e.g. +230 5 123 4567"
        type="tel"
        {...register("phone", { required: "Phone number is required." })}
      />
      <Input
        label="BRN (optional)"
        placeholder="e.g. C12345678"
        {...register("brn")}
      />
    </form>
  );
};
