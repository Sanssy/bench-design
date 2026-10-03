import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import tokens from "../src/tokens.json" with { type: "json" };

const guide = `# bench-design — intégration

Fondations disponibles : tokens, CSS, polices locales et thèmes. Button expose son API S1 (activation et types natifs), sans styles finaux.
Manifeste components.json et serveur MCP non livrés. Package privé ;
aucune publication npm disponible.

## Imports autorisés

- Choisir bench-design/styles.css (tokens et polices) ou bench-design/tokens.css.
- Button et ButtonProps : import depuis bench-design ; children obligatoire,
  onPress pour les actions, type button par défaut, submit/reset natifs.
  API : isDisabled, variant primary/secondary (secondary par défaut), ref DOM,
  aria-label et aria-labelledby. Aucun passthrough HTML général.
- Catalogue : bench-design/tokens.json ; sous Node, utiliser with { type: "json" }.
  Les bundlers n’exigent pas cet attribut.
- Servir bench-design/theme-init.js depuis l’origine de l’application : script
  classique bloquant dans head avant CSS et React, sans async ni defer.
- Servir les ressources fonts/ relatives aux styles, licences comprises.
- Ne pas importer src/, les fichiers internes ou des composants non exportés.

## Règles

Utiliser les rôles sémantiques --bd-* ; jamais les palettes --bd-color-* dans
les composants, ni de valeur visuelle en dur. Les usages ci-dessous viennent de
tokens.json et sont régénérés à chaque build. Les règles métier restent dans
l’application ; les corrections visuelles partagées appartiennent aux primitives.

${Object.entries(tokens)
  .filter(([name]) => ["base", "light", "dark"].includes(name))
  .map(
    ([name, group]) =>
      `### ${name}\n\n${Object.entries(group)
        .map(([role, token]) => {
          const value = token as {
            $extensions: { "org.bench-design": { usage: string } };
          };
          return `- --bd-${role} : ${value.$extensions["org.bench-design"].usage}`;
        })
        .join("\n")}`,
  )
  .join("\n\n")}

## Thèmes et accessibilité

Sur html, data-theme="light" ou "dark" fixe le thème ; sans attribut, le système
choisit. theme-init.js lit localStorage["bench-design-theme"] et préserve un
attribut serveur existant. Choix système, absent ou invalide et stockage
inaccessible : aucun attribut ajouté. Pour changer le choix ensuite, modifier
l’attribut (le retirer pour system) et persister le choix si possible.

Conserver HTML sémantique, noms accessibles, clavier et focus visible. Vérifier
l’ordre du focus, le contraste du texte courant (4,5:1), des contours nécessaires
aux contrôles et du focus (3:1), dans le contexte réel. Button encapsule React Aria ; focus, noms explicites, disabled et styles
restent à valider dans les tranches suivantes.
Séparateur décoratif sombre, rôle d’erreur et thème impression sont différés :
ne pas inventer ces valeurs. Attendre document.fonts.ready avant les captures.
`;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/AGENTS.md", guide);
copyFileSync("src/tokens.json", "dist/tokens.json");
const site = process.argv.find((arg) => arg.startsWith("--site="))?.slice(7);
if (site) {
  mkdirSync(site, { recursive: true });
  const pages = [
    ["Démarrer", "documentation-démarrer--page"],
    ["Principes", "documentation-principes--page"],
    ["Thèmes", "documentation-thèmes--page"],
  ] as const;
  writeFileSync(
    `${site}/llms.txt`,
    `# bench-design\n\n> Design system React : fondations, tokens DTCG, polices locales et thèmes.\n\nPackage privé : API Button S1 disponible, styles finaux et publication npm différés.\n\n## Documentation\n\n${pages.map(([label, id]) => `- [${label}](./?path=/story/${encodeURIComponent(id)})`).join("\n")}\n- [Tokens DTCG](./tokens.json): valeurs, descriptions et règles d’usage.\n`,
  );
  copyFileSync("src/tokens.json", `${site}/tokens.json`);
}
