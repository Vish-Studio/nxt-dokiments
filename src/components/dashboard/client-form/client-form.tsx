"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/components/commons/input/input";
import type { Client, ClientInput } from "@/types/client";

interface Props {
  /**
   * The client being edited. Omit to add a new one.
   *
   * Callers must key the element on the client's ID (`key={client?.id ?? "new"}`) —
   * react-hook-form reads `defaultValues` on first render only, so without a
   * remount a second client opened in the same session shows the first one's values.
   */
  client?: Client;
  formId: string;
  /**
   * Reports whether any field differs from `defaultValues`. Lets a caller whose
   * submit button lives outside the form disable it while the form is untouched.
   */
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (input: ClientInput) => void;
}

const emptyClient: ClientInput = {
  address: "",
  brn: "",
  companyName: "",
  email: "",
  name: "",
  nationalId: "",
  phone: "",
};

/** Narrows a stored client to just the editable fields, dropping `id`/`createdAt`/`updatedAt`. */
const toClientInput = (client: Client): ClientInput => ({
  address: client.address,
  brn: client.brn,
  companyName: client.companyName,
  email: client.email,
  name: client.name,
  nationalId: client.nationalId,
  phone: client.phone,
});

export const ClientForm = ({
  client,
  formId,
  onDirtyChange,
  onSubmit,
}: Props) => {
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<ClientInput>({
    defaultValues: client ? toClientInput(client) : emptyClient,
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const submitForm = (values: ClientInput) => {
    onSubmit({
      address: values.address.trim(),
      brn: values.brn.trim(),
      companyName: values.companyName.trim(),
      email: values.email.trim(),
      name: values.name.trim(),
      nationalId: values.nationalId.trim(),
      phone: values.phone.trim(),
    });

    // Add mode only. Clearing after an edit would blank the fields the user just
    // saved, while the panel behind is still showing them.
    if (!client) {
      reset(emptyClient);
    }
  };

  return (
    <form
      className="client-form grid gap-5 p-4 sm:grid-cols-2 sm:p-6"
      id={formId}
      noValidate
      onSubmit={handleSubmit(submitForm)}
    >
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
      <div className="sm:col-span-2">
        <Input
          autoComplete="street-address"
          label="Address (optional)"
          placeholder="e.g. 12 Rue La Bourdonnais, Port Louis"
          {...register("address")}
        />
      </div>
    </form>
  );
};
