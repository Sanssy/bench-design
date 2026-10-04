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
          {acceptedFileTypes.join(", ")}
          {maxSize !== undefined && ` · ${maxSize} bytes maximum`}
        </p>
      )}
      {rejections.length > 0 && (
        <div role="alert">
          {rejections
            .map(
              ({ file, reason }) =>
                `✕ ${file.name}: ${reason === "type" ? "File type not accepted" : "File exceeds maximum size"}`,
            )
            .join("\n")}
        </div>
      )}
    </AriaDropZone>
  );
}
