export interface MessageContext {
  number(value: number): string;
  plural(value: number): Intl.LDMLPluralRule;
}
/** Internal copy overrides. Functions receive locale-aware number and plural helpers. */
export interface BenchMessages {
  optional: string;
  close: string;
  noResults: string;
  loading: string;
  loadingResults: string;
  loadError: string;
  retry: string;
  clearAll: string;
  selectedChoices: string;
  clear: string;
  apply: string;
  filters: string;
  clearFilters: string;
  addFiles: string;
  externalLink: string;
  noValue: string;
  valueTotal(value: string, total: string): string;
  results(count: number, context: MessageContext): string;
  loaded(count: number, context: MessageContext): string;
  moreSelected(count: number, context: MessageContext): string;
  showResults(results: string): string;
  more(count: number, context: MessageContext): string;
  rejectedType(types: string): string;
  rejectedSize(size: string): string;
  maximumSize(size: string): string;
  fileKind(kind: string): string;
  fileSize(value: string, unit: number): string;
}
export const en: BenchMessages = {
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
  valueTotal: (value, total) => `${value} of ${total}`,
  results: (count, c) =>
    `${c.number(count)} ${c.plural(count) === "one" ? "result" : "results"}`,
  loaded: (count, c) => `${c.number(count)} loaded`,
  moreSelected: (count, c) => `${c.number(count)} more selected choices`,
  showResults: (results) => `Show ${results}`,
  more: (count, c) => `+${c.number(count)}`,
  rejectedType: (types) =>
    `this format is not accepted.${types ? ` Use ${types}.` : ""}`,
  rejectedSize: (size) => `this file is larger than ${size}.`,
  maximumSize: (size) => `${size} max.`,
  fileKind: (kind) => `${kind[0]?.toUpperCase() ?? ""}${kind.slice(1)}s`,
  fileSize: (value, unit) => `${value} ${["bytes", "KB", "MB", "GB"][unit]}`,
};
export const fr: BenchMessages = {
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
  valueTotal: (value, total) => `${value} sur ${total}`,
  results: (count, c) =>
    `${c.number(count)} ${c.plural(count) === "one" ? "résultat" : "résultats"}`,
  loaded: (count, c) =>
    `${c.number(count)} ${c.plural(count) === "one" ? "chargé" : "chargés"}`,
  moreSelected: (count, c) =>
    `${c.number(count)} ${c.plural(count) === "one" ? "choix sélectionné supplémentaire" : "choix sélectionnés supplémentaires"}`,
  showResults: (results) => `Afficher ${results}`,
  more: (count, c) => `+${c.number(count)}`,
  rejectedType: (types) =>
    `ce format n’est pas accepté.${types ? ` Utilisez ${types}.` : ""}`,
  rejectedSize: (size) => `ce fichier dépasse ${size}.`,
  maximumSize: (size) => `${size} max.`,
  fileKind: (kind) =>
    ({
      image: "Images",
      audio: "Audio",
      video: "Vidéos",
      text: "Texte",
      application: "Applications",
    })[kind] ?? kind,
  fileSize: (value, unit) => `${value} ${["octets", "ko", "Mo", "Go"][unit]}`,
};
