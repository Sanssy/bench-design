import type { ReactElement } from "react";
import { FileTrigger as AriaFileTrigger } from "react-aria-components";
import type { ButtonProps } from "../button/Button.js";
/** Open the native picker from one Button. File sizes are expressed in bytes. */
export interface FileTriggerProps {
  acceptedFileTypes?: string[];
  allowsMultiple?: boolean;
  onSelect: (files: File[]) => void;
  children: ReactElement<ButtonProps>;
}
/** Select local files without exposing React Aria types to consumers. */
export function FileTrigger({ onSelect, ...props }: FileTriggerProps) {
  return (
    <AriaFileTrigger
      {...props}
      onSelect={(files) => {
        if (files) onSelect(Array.from(files));
      }}
    />
  );
}
