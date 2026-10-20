import { Input } from "@/components/commons/input/input";
import { RangeSlider } from "@/components/commons/range-slider/range-slider";
import {
  clampLevel,
  type CvListFieldConfig,
  type CvRow,
} from "@/lib/market-place/cv-lists";

interface Props {
  fields: CvListFieldConfig[];
  onChange: (key: string, value: string) => void;
  row: CvRow;
}

export const CvListRowFields = ({ fields, onChange, row }: Props) => (
  <div className="cv-list-row-fields grid min-w-0 gap-3">
    {fields.map((field) => {
      const value = row[field.key] ?? "";
      if (field.type === "level") {
        return (
          <RangeSlider
            key={field.key}
            label={field.label}
            onChange={(level) => onChange(field.key, String(level))}
            value={clampLevel(value)}
          />
        );
      }
      if (field.type === "textarea") {
        return (
          <label
            className="form-control w-full"
            key={field.key}
          >
            <span className="label pb-2">
              <span className="label-text font-title text-sm font-semibold text-nox-noir">
                {field.label}
              </span>
            </span>
            <textarea
              className="textarea min-h-20 w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-nox-noir focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-nox-noir/15"
              onChange={(event) => onChange(field.key, event.target.value)}
              placeholder={field.placeholder}
              value={value}
            />
          </label>
        );
      }
      return (
        <Input
          key={field.key}
          label={field.label}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          value={value}
        />
      );
    })}
  </div>
);

export default CvListRowFields;
