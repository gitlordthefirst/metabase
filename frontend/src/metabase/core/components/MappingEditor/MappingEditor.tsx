import cx from "classnames";
import type React from "react";
import { useState } from "react";
import { t } from "ttag";
import _ from "underscore";

import CS from "metabase/css/core/index.css";
import { Button, type ButtonProps, Icon, TextInput } from "metabase/ui";

type DefaultRenderInputProps = {
  value: MappingValue;
  onChange: (val: string) => void;
  placeholder: string;
  error?: boolean | string;
};

const DefaultRenderInput = ({
  value,
  onChange,
  placeholder,
  error = false,
}: DefaultRenderInputProps) => (
  <TextInput
    value={value || ""}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    error={error}
  />
);

type MappingValue = string;
type MappingType = Record<string, MappingValue>;

export interface MappingEditorProps {
  value: MappingType;
  onChange: (val: MappingType) => void;
  onError?: (val: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  keyHeader?: JSX.Element;
  valueHeader?: JSX.Element;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  renderKeyInput?: (input: DefaultRenderInputProps) => JSX.Element;
  renderValueInput?: (input: DefaultRenderInputProps) => React.ReactNode;
  divider?: JSX.Element;
  canAdd?: boolean;
  canDelete?: boolean;
  addText?: string;
  addButtonProps?: ButtonProps;
  swapKeyAndValue?: boolean;
}

type Entry = {
  key: string;
  value: string;
};

const buildEntries = (mapping: MappingType): Entry[] =>
  Object.entries(mapping).map(([key, value]) => ({ key, value }));

const buildMapping = (entries: Entry[]): MappingType =>
  entries.reduce((memo: MappingType, { key, value }) => {
    if (key) {
      memo[key] = value;
    }
    return memo;
  }, {});

const entryError = (entries: Entry[], key: string) =>
  entries.filter((e) => e.key === key).length > 1
    ? t`Attribute keys can't have the same name`
    : false;

const hasError = (entries: Entry[]) => {
  const entryKeys = entries.map(({ key }) => key);
  const entrySet = new Set(entryKeys);

  return entryKeys.length !== entrySet.size;
};

export const MappingEditor = ({
  value: mapping,
  onChange,
  onError,
  className = "",
  style = {},
  keyHeader,
  valueHeader,
  keyPlaceholder = t`Key`,
  valuePlaceholder = t`Value`,
  renderKeyInput = DefaultRenderInput,
  renderValueInput = DefaultRenderInput,
  divider,
  canAdd = true,
  canDelete = true,
  addText = "Add",
  addButtonProps,
  swapKeyAndValue,
}: MappingEditorProps) => {
  const [entries, setEntries] = useState<Entry[]>(buildEntries(mapping));

  const handleChange = (newEntries: Entry[]) => {
    setEntries(newEntries);
    if (onError && hasError(newEntries)) {
      onError(hasError(newEntries));
    } else {
      onChange(buildMapping(newEntries));
    }
  };

  return (
    <table className={className} style={style}>
      {keyHeader || valueHeader ? (
        <thead>
          <tr>
            <td>{!swapKeyAndValue ? keyHeader : valueHeader}</td>
            <td />
            <td>{!swapKeyAndValue ? valueHeader : keyHeader}</td>
          </tr>
        </thead>
      ) : null}
      <tbody>
        {entries.map(({ key, value }, index) => {
          const keyInput = renderKeyInput({
            value: key,
            placeholder: keyPlaceholder,
            onChange: (newKey) =>
              handleChange(replaceEntryKey(entries, index, newKey)),
            error: entryError(entries, key),
          });
          const valueInput = renderValueInput({
            value: value,
            placeholder: valuePlaceholder,
            onChange: (newValue) =>
              handleChange(replaceEntryValue(entries, index, newValue)),
          });
          return (
            <tr key={index}>
              <td className={CS.pb1} style={{ verticalAlign: "bottom" }}>
                {!swapKeyAndValue ? keyInput : valueInput}
              </td>
              <td
                className={cx(CS.pb1, CS.px1)}
                style={{ verticalAlign: "middle" }}
              >
                {divider}
              </td>
              <td className={CS.pb1} style={{ verticalAlign: "bottom" }}>
                {!swapKeyAndValue ? valueInput : keyInput}
              </td>
              {canDelete && (
                <td className={CS.pb1} style={{ verticalAlign: "bottom" }}>
                  <Button
                    leftSection={<Icon name="close" />}
                    variant="subtle"
                    onClick={() => handleChange(removeEntry(entries, index))}
                    color={"text"}
                    data-testid="remove-mapping"
                  />
                </td>
              )}
            </tr>
          );
        })}
        {_.every(entries, (entry) => entry.value !== "" && entry.key !== "") &&
          canAdd && (
            <tr>
              <td colSpan={2}>
                <Button
                  leftSection={<Icon name="add" />}
                  variant="subtle"
                  onClick={() => handleChange(addEntry(entries))}
                  {...addButtonProps}
                >
                  {addText}
                </Button>
              </td>
            </tr>
          )}
      </tbody>
    </table>
  );
};

const addEntry = (entries: Entry[]) => {
  return [...entries, { key: "", value: "" }];
};

const removeEntry = (entries: Entry[], index: number) => {
  const entriesCopy = [...entries];
  entriesCopy.splice(index, 1);
  return entriesCopy;
};

const replaceEntryValue = (
  entries: Entry[],
  index: number,
  newValue: MappingValue,
) => {
  const newEntries = [...entries];
  newEntries[index].value = newValue;
  return newEntries;
};

const replaceEntryKey = (entries: Entry[], index: number, newKey: string) => {
  const newEntries = [...entries];
  newEntries[index].key = newKey;
  return newEntries;
};
