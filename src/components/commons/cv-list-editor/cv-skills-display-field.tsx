"use client";

import { CaretDownIcon } from "@phosphor-icons/react";

import { Dropdown } from "@/components/commons/dropdown/dropdown";

interface Props {
  onChange: (value: string) => void;
  value: string;
}

const options = [
  { label: "Bars", value: "" },
  { label: "Plain list", value: "list" },
];

export const CvSkillsDisplayField = ({ onChange, value }: Props) => (
  <div className="cv-skills-display-field grid gap-2">
    <span className="font-title text-sm font-semibold text-nox-noir">
      Skills display
    </span>
    <Dropdown
      align="start"
      ariaLabel="Skills display"
      className="w-full"
      buttonClassName="w-full justify-between"
      groups={[{ label: "Show skills as", onChange, options, value }]}
      menuClassName="w-full"
      trigger={
        <>
          <span>
            {options.find((option) => option.value === value)?.label ?? "Bars"}
          </span>
          <CaretDownIcon
            aria-hidden
            size={12}
          />
        </>
      }
    />
  </div>
);

export default CvSkillsDisplayField;
