import { ProgressBar as AriaProgressBar, Label } from "react-aria-components";
/** Accessible progress display. */
export interface ProgressBarProps {
  /** Current controlled value; defaults to zero. */
  value?: number;
  /** Lower bound; defaults to zero. */
  minValue?: number;
  /** Upper bound; defaults to 100. */
  maxValue?: number;
  /** Custom visible and accessible value text. */
  valueLabel?: string;
  /** Show unmeasured progress without a numeric ARIA value. */
  isIndeterminate?: boolean;
  /** Accessible name, visible by default. */
  label: string;
  /** Visually hide the label while preserving its accessible name. */
  hideLabel?: boolean;
}
/** Displays application-controlled progress. */
export function ProgressBar({
  label,
  hideLabel = false,
  ...progress
}: ProgressBarProps) {
  return (
    <AriaProgressBar
      {...progress}
      className="bd-progress-bar"
      data-indeterminate={progress.isIndeterminate || undefined}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className="bd-progress-heading">
            <Label
              className={
                hideLabel ? "bd-field-hidden-label" : "bd-progress-label"
              }
            >
              {label}
            </Label>
            {!isIndeterminate && (
              <span className="bd-progress-value">{valueText}</span>
            )}
          </div>
          <div className="bd-progress-track">
            <div
              className="bd-progress-fill"
              style={{ width: isIndeterminate ? undefined : `${percentage}%` }}
            />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}
