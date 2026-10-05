import { useContext } from "react";
import { ComboBoxStateContext } from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Button } from "../button/Button.js";

export function ClearChoices() {
  const { messages: m } = useBenchMessages();
  const state = useContext(ComboBoxStateContext);
  return (
    <div className="bd-list-footer">
      <Button
        variant="secondary"
        onPress={() => state?.setValue([])}
        isDisabled={!Array.isArray(state?.value) || state.value.length === 0}
      >
        {m.clearAll}
      </Button>
    </div>
  );
}
