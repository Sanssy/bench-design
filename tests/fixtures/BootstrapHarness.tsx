import { useState } from "react";

export function BootstrapHarness() {
  const [interactions, setInteractions] = useState(0);
  return (
    <main>
      <button
        type="button"
        onClick={() => setInteractions((count) => count + 1)}
      >
        Exercise harness
      </button>
      <p role="status">Interactions: {interactions}</p>
    </main>
  );
}
