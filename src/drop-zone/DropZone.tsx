import { useState } from "react";
import { DropZone as AriaDropZone } from "react-aria-components";
import { Button } from "../button/Button.js";
import { FileTrigger } from "../file-trigger/FileTrigger.js";
/** A rejected file and the applicable refusal reason. */
export interface FileRejection {
  file: File;
  reason: "type" | "size";
}
/** Accessible local file import. maxSize is in bytes. */
export interface DropZoneProps {
  label: string;
  description?: string;
  acceptedFileTypes?: string[];
  maxSize?: number;
  allowsMultiple?: boolean;
  onDrop: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  isDisabled?: boolean;
  buttonLabel?: string;
}
function matches(file: File, types: string[]) {
  return (
    types.length === 0 ||
    types.some((type) => {
      const pattern = type.toLowerCase(),
        mime = file.type.toLowerCase();
      return pattern.startsWith(".")
        ? file.name.toLowerCase().endsWith(pattern)
        : pattern.endsWith("/*")
          ? mime.startsWith(pattern.slice(0, -1))
          : mime === pattern;
    })
  );
}
/** "application/pdf" → "PDF", ".heic" → "HEIC", "image/*" → "Images". */
function typeLabel(type: string) {
  if (type.startsWith(".")) return type.slice(1).toUpperCase();
  const [kind = "", subtype = ""] = type.split("/");
  if (subtype === "*")
    return `${kind[0]?.toUpperCase() ?? ""}${kind.slice(1)}s`;
  return (subtype === "jpeg" ? "jpg" : subtype).toUpperCase();
}
/** Decimal units, as file managers show them. */
function sizeLabel(bytes: number) {
  const units = ["bytes", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${units[unit]}`;
}
/** Validate picker and dragged files with the same acceptance policy. */
export function DropZone({
  label,
  description,
  acceptedFileTypes = [],
  maxSize,
  allowsMultiple = false,
  onDrop,
  onReject,
  isDisabled = false,
  buttonLabel = "Add files",
}: DropZoneProps) {
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  function receive(files: File[]) {
    if (isDisabled) return;
    const rejected: FileRejection[] = [],
      accepted: File[] = [];
    for (const file of files) {
      const reason = !matches(file, acceptedFileTypes)
        ? "type"
        : maxSize !== undefined && file.size > maxSize
          ? "size"
          : undefined;
      if (reason) rejected.push({ file, reason });
      else accepted.push(file);
    }
    setRejections(rejected);
    if (rejected.length) onReject?.(rejected);
    if (accepted.length)
      onDrop(allowsMultiple ? accepted : accepted.slice(0, 1));
  }
  return (
    <AriaDropZone
      className="bd-drop-zone"
      aria-label={label}
      isDisabled={isDisabled}
      data-rejected={rejections.length > 0 || undefined}
      onDrop={async (event) => {
        const files = await Promise.all(
          event.items
            .filter((item) => item.kind === "file")
            .map((item) => item.getFile()),
        );
        receive(files);
      }}
    >
      <strong className="bd-drop-zone__title">{label}</strong>
      {description && <p className="bd-drop-zone__help">{description}</p>}
      <FileTrigger
        acceptedFileTypes={acceptedFileTypes}
        allowsMultiple={allowsMultiple}
        onSelect={receive}
      >
        <Button variant="primary" isDisabled={isDisabled}>
          {buttonLabel}
        </Button>
      </FileTrigger>
      {(acceptedFileTypes.length > 0 || maxSize !== undefined) && (
        <p className="bd-drop-zone__meta">
          {acceptedFileTypes.map(typeLabel).join(", ")}
          {maxSize !== undefined &&
            `${acceptedFileTypes.length > 0 ? " · " : ""}${sizeLabel(maxSize)} max.`}
        </p>
      )}
      {rejections.length > 0 && (
        <ul role="alert" className="bd-drop-zone__errors">
          {rejections.map(({ file, reason }) => (
            <li key={file.name}>
              ✕ {file.name}:{" "}
              {reason === "type"
                ? `this format is not accepted.${acceptedFileTypes.length > 0 ? ` Use ${acceptedFileTypes.map(typeLabel).join(", ")}.` : ""}`
                : `this file is larger than ${sizeLabel(maxSize ?? 0)}.`}
            </li>
          ))}
        </ul>
      )}
    </AriaDropZone>
  );
}
