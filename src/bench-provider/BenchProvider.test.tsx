import { render, screen } from "@testing-library/react";
import { I18nProvider } from "react-aria-components";
import { expect, test, vi } from "vitest";
import { FieldLabel } from "../forms/FieldContent";
import { Link } from "../link/Link";

test("internal messages follow the React Aria locale", () => {
  render(
    <I18nProvider locale="fr-FR">
      <FieldLabel label="Nom" />
      <Link href="/guide" external>
        Guide
      </Link>
    </I18nProvider>,
  );
  expect(screen.getByText(/facultatif/)).toBeInTheDocument();
  expect(screen.getByRole("link")).toHaveAccessibleName(
    "Guide (s’ouvre dans un nouvel onglet)",
  );
});

import { BenchProvider, useBenchMessages } from "./BenchProvider";

function Copy() {
  const { messages: m, context: c } = useBenchMessages();
  return (
    <output>
      {JSON.stringify({
        optional: m.optional,
        close: m.close,
        noResults: m.noResults,
        loading: m.loading,
        loadingResults: m.loadingResults,
        loadError: m.loadError,
        retry: m.retry,
        clearAll: m.clearAll,
        selectedChoices: m.selectedChoices,
        clear: m.clear,
        apply: m.apply,
        filters: m.filters,
        clearFilters: m.clearFilters,
        addFiles: m.addFiles,
        externalLink: m.externalLink,
        noValue: m.noValue,
        valueTotal: m.valueTotal("7", "10"),
        results: [0, 1, 2, 1234].map((n) => m.results(n, c)),
        loaded: [1, 2].map((n) => m.loaded(n, c)),
        moreSelected: [1, 2].map((n) => m.moreSelected(n, c)),
        showResults: m.showResults(m.results(2, c)),
        more: m.more(1234, c),
        rejectedType: [m.rejectedType(""), m.rejectedType("PDF")],
        rejectedSize: m.rejectedSize("5 MB"),
        maximumSize: m.maximumSize("5 MB"),
        fileKind: [
          "image",
          "audio",
          "video",
          "text",
          "application",
          "custom",
        ].map(m.fileKind),
        fileSize: [0, 1, 2, 3].map((unit) => m.fileSize("5", unit)),
      })}
    </output>
  );
}
const english = {
  optional: "(optional)",
  close: "Close",
  noResults: "No results. Try a different search.",
  loading: "Loading…",
  loadingResults: "Loading results…",
  loadError: "Could not load results.",
  retry: "Try again",
  clearAll: "Clear all",
  selectedChoices: "Selected choices",
  clear: "Clear",
  apply: "Apply",
  filters: "Filters",
  clearFilters: "Clear filters",
  addFiles: "Add files",
  externalLink: "(opens in a new tab)",
  noValue: "No value",
  valueTotal: "7 of 10",
  results: ["0 results", "1 result", "2 results", "1,234 results"],
  loaded: ["1 loaded", "2 loaded"],
  moreSelected: ["1 more selected choices", "2 more selected choices"],
  showResults: "Show 2 results",
  more: "+1,234",
  rejectedType: [
    "this format is not accepted.",
    "this format is not accepted. Use PDF.",
  ],
  rejectedSize: "this file is larger than 5 MB.",
  maximumSize: "5 MB max.",
  fileKind: ["Images", "Audios", "Videos", "Texts", "Applications", "Customs"],
  fileSize: ["5 bytes", "5 KB", "5 MB", "5 GB"],
};
const french = {
  optional: "(facultatif)",
  close: "Fermer",
  noResults: "Aucun résultat. Essayez une autre recherche.",
  loading: "Chargement…",
  loadingResults: "Chargement des résultats…",
  loadError: "Impossible de charger les résultats.",
  retry: "Réessayer",
  clearAll: "Tout effacer",
  selectedChoices: "Choix sélectionnés",
  clear: "Effacer",
  apply: "Appliquer",
  filters: "Filtres",
  clearFilters: "Effacer les filtres",
  addFiles: "Ajouter des fichiers",
  externalLink: "(s’ouvre dans un nouvel onglet)",
  noValue: "Aucune valeur",
  valueTotal: "7 sur 10",
  results: ["0 résultat", "1 résultat", "2 résultats", "1\u202f234 résultats"],
  loaded: ["1 chargé", "2 chargés"],
  moreSelected: [
    "1 choix sélectionné supplémentaire",
    "2 choix sélectionnés supplémentaires",
  ],
  showResults: "Afficher 2 résultats",
  more: "+1\u202f234",
  rejectedType: [
    "ce format n’est pas accepté.",
    "ce format n’est pas accepté. Utilisez PDF.",
  ],
  rejectedSize: "ce fichier dépasse 5 MB.",
  maximumSize: "5 MB max.",
  fileKind: ["Images", "Audio", "Vidéos", "Texte", "Applications", "custom"],
  fileSize: ["5 octets", "5 ko", "5 Mo", "5 Go"],
};
test.each([
  ["en-US", english],
  ["fr-FR", french],
])("every internal message in %s", (locale, expected) => {
  render(
    <BenchProvider locale={locale}>
      <Copy />
    </BenchProvider>,
  );
  expect(JSON.parse(screen.getByRole("status").textContent ?? "")).toEqual(
    expected,
  );
});
test("partial overrides inherit copy and locale through nested providers", () => {
  render(
    <BenchProvider
      locale="fr-FR"
      messages={{
        close: "Fermer la fenêtre",
        results: (n, c) => `${c.number(n)} éléments`,
      }}
    >
      <BenchProvider messages={{ retry: "Reprendre" }}>
        <Copy />
      </BenchProvider>
    </BenchProvider>,
  );
  const copy = JSON.parse(screen.getByRole("status").textContent ?? "");
  expect(copy.close).toBe("Fermer la fenêtre");
  expect(copy.retry).toBe("Reprendre");
  expect(copy.optional).toBe("(facultatif)");
  expect(copy.results).toEqual([
    "0 éléments",
    "1 éléments",
    "2 éléments",
    "1\u202f234 éléments",
  ]);
});
test("unsupported language uses English copy and its own number format", () => {
  render(
    <BenchProvider locale="de-DE">
      <Copy />
    </BenchProvider>,
  );
  const copy = JSON.parse(screen.getByRole("status").textContent ?? "");
  expect(copy.optional).toBe("(optional)");
  expect(copy.results[3]).toBe("1.234 results");
});
test("default locale preserves English copy without BenchProvider", () => {
  render(<Copy />);
  expect(JSON.parse(screen.getByRole("status").textContent ?? "")).toEqual(
    english,
  );
});
test("copy updates when the configured locale changes", () => {
  const { rerender } = render(
    <BenchProvider locale="en-US">
      <Copy />
    </BenchProvider>,
  );
  rerender(
    <BenchProvider locale="fr-FR">
      <Copy />
    </BenchProvider>,
  );
  expect(JSON.parse(screen.getByRole("status").textContent ?? "")).toEqual(
    french,
  );
});

import { fireEvent } from "@testing-library/react";
import { Checkbox } from "../checkbox/Checkbox";
import { DropZone } from "../drop-zone/DropZone";

test("French checkbox and file refusals use internal copy", () => {
  const { container } = render(
    <BenchProvider locale="fr-FR">
      <Checkbox label="Recevoir les nouvelles" />
      <DropZone
        label="Documents"
        acceptedFileTypes={["application/pdf"]}
        maxSize={4}
        onDrop={() => {}}
      />
    </BenchProvider>,
  );
  expect(screen.getByRole("checkbox")).toHaveAccessibleName(
    "Recevoir les nouvelles(facultatif)",
  );
  expect(
    screen.getByRole("button", { name: "Ajouter des fichiers" }),
  ).toBeInTheDocument();
  const input = container.querySelector("input[type=file]");
  if (!input) throw new Error("Missing file input");
  fireEvent.change(input, {
    target: {
      files: [
        new File(["x"], "notes.txt"),
        new File(["12345"], "large.pdf", { type: "application/pdf" }),
      ],
    },
  });
  expect(screen.getByRole("alert")).toHaveTextContent(
    "ce format n’est pas accepté. Utilisez PDF.",
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "ce fichier dépasse 4 octets.",
  );
});

function clickLink(options: MouseEventInit = {}) {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  fireEvent(screen.getByRole("link"), event);
  return event;
}

test("client navigation intercepts an ordinary Link click", () => {
  const navigate = vi.fn();
  render(
    <BenchProvider navigate={navigate}>
      <Link href="/guide">Guide</Link>
    </BenchProvider>,
  );
  expect(clickLink().defaultPrevented).toBe(true);
  expect(navigate).toHaveBeenCalledWith("/guide", undefined);
});

test("useHref resolves the anchor while navigate receives the original route", () => {
  const navigate = vi.fn();
  render(
    <BenchProvider navigate={navigate} useHref={(href) => `/base${href}`}>
      <Link href="/guide">Guide</Link>
    </BenchProvider>,
  );
  expect(screen.getByRole("link")).toHaveAttribute("href", "/base/guide");
  clickLink();
  expect(navigate).toHaveBeenCalledWith("/guide", undefined);
});

test.each([{ ctrlKey: true }, { metaKey: true }])(
  "modified clicks retain native navigation: %j",
  (modifier) => {
    const navigate = vi.fn();
    render(
      <BenchProvider navigate={navigate}>
        <Link href="#guide">Guide</Link>
      </BenchProvider>,
    );
    expect(clickLink(modifier).defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  },
);

test.each([false, true])(
  "native anchors work without router configuration (provider: %s)",
  (provider) => {
    const link = <Link href="#guide">Guide</Link>;
    render(provider ? <BenchProvider>{link}</BenchProvider> : link);
    expect(screen.getByRole("link").tagName).toBe("A");
    expect(screen.getByRole("link")).toHaveAttribute("href", "#guide");
    expect(clickLink().defaultPrevented).toBe(false);
  },
);

test("copy-only nested providers inherit client routing and locale", () => {
  const navigate = vi.fn();
  render(
    <BenchProvider locale="fr-FR" navigate={navigate}>
      <BenchProvider messages={{ optional: "Option" }}>
        <Link href="/guide">Guide</Link>
        <FieldLabel label="Nom" />
      </BenchProvider>
    </BenchProvider>,
  );
  clickLink();
  expect(navigate).toHaveBeenCalledWith("/guide", undefined);
  expect(screen.getByText("Option")).toBeInTheDocument();
});

test("external new-tab links keep native navigation with a client router", () => {
  const navigate = vi.fn();
  render(
    <BenchProvider navigate={navigate}>
      <Link href="https://example.com" external>
        Guide
      </Link>
    </BenchProvider>,
  );
  expect(clickLink().defaultPrevented).toBe(false);
  expect(navigate).not.toHaveBeenCalled();
});
