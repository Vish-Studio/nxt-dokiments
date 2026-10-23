"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/commons/button/button";
import { LineItemHeader } from "@/components/commons/line-item-header/line-item-header";
import {
  cvListConfigs,
  cvListRows,
  writeCvList,
  type CvListKey,
} from "@/lib/market-place/cv-lists";

import { CvListRowFields } from "./cv-list-row-fields";
import { CvListSummary } from "./cv-list-summary";

interface Props {
  listKey: CvListKey;
  onChange: (value: string) => void;
  value: string;
}

export const CvListEditor = ({ listKey, onChange, value }: Props) => {
  const config = cvListConfigs[listKey];
  const rows = cvListRows(listKey, value);
  // With several rows, only the one being edited shows its inputs; the rest are summaries.
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const isEditing = (index: number) =>
    rows.length === 1 || editingIndex === index;

  const update = (index: number, key: string, text: string) =>
    onChange(
      writeCvList(
        rows.map((row, i) => (i === index ? { ...row, [key]: text } : row)),
      ),
    );

  const move = (index: number, step: -1 | 1) => {
    const next = [...rows];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(writeCvList(next));
    setEditingIndex(index + step);
  };

  const remove = (index: number) => {
    onChange(writeCvList(rows.filter((_, i) => i !== index)));
    setEditingIndex(null);
  };

  const add = () => {
    onChange(writeCvList([...rows, { ...config.blankRow }]));
    setEditingIndex(rows.length);
  };

  return (
    <section
      aria-label={config.title}
      className="cv-list-editor grid min-w-0 gap-4"
    >
      {rows.map((row, index) => {
        const rowProps = {
          index,
          isFirst: index === 0,
          isLast: index === rows.length - 1,
          onMoveDown: () => move(index, 1),
          onMoveUp: () => move(index, -1),
          onRemove: () => remove(index),
        };
        return isEditing(index) ? (
          <div
            aria-label={`Item ${index + 1}`}
            className="grid min-w-0 gap-3 rounded-field border border-steel-mist p-4"
            key={index}
            role="group"
          >
            <LineItemHeader
              {...rowProps}
              onDone={rows.length > 1 ? () => setEditingIndex(null) : undefined}
            />
            <CvListRowFields
              fields={config.fields}
              onChange={(key, text) => update(index, key, text)}
              row={row}
            />
          </div>
        ) : (
          <CvListSummary
            {...rowProps}
            config={config}
            key={index}
            onEdit={() => setEditingIndex(index)}
            row={row}
          />
        );
      })}
      <Button
        icon={
          <PlusIcon
            aria-hidden
            size={16}
            weight="bold"
          />
        }
        iconPosition="left"
        onClick={add}
        size="sm"
        variant="primary"
      >
        {config.addLabel}
      </Button>
    </section>
  );
};

export default CvListEditor;
