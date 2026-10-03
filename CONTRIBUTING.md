# Contribuer à bench-design

## Socle B1

Node 24.21.0 et pnpm 12.8.1 sont épinglés. Installer avec
`pnpm install --frozen-lockfile`. Le point d'entrée public est vide ; le harnais
natif de Storybook sert uniquement à vérifier l'outillage.

| Commande disponible | Responsabilité |
| --- | --- |
| `pnpm check` | Formatage, types stricts et frontières des imports |
| `pnpm test` | Rendu, interaction et contrôles de frontières |
| `pnpm build` | Package ESM et déclarations TypeScript |
| `pnpm build-storybook` | Construction de la story technique |
| `pnpm test:package` | Tarball importé et typé depuis un consommateur isolé |
| `pnpm test:browser` | Chromium, Firefox, WebKit et axe sur le harnais |
| `pnpm verify` | Tous les contrôles B1 ci-dessus |

## Vérifier ses changements

Au quotidien, tout tourne sur la machine de développement. Node est épinglé
dans `.nvmrc` (`nvm install` puis `nvm use`), les navigateurs Playwright
s'installent une fois avec `pnpm exec playwright install`.

```sh
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify` enchaîne check, test, build, contrôle des valeurs visuelles,
Storybook, test du package et tests navigateur (Chromium, Firefox, WebKit).
Une sélection vide ou un test non exécuté ne vaut jamais succès.

`pnpm verify` est obligatoire avant chaque push : c'est la seule exécution
dans les trois navigateurs. La CI d'une PR ne lance que Chromium
(`BD_BROWSERS=chromium`) et ne relance rien sur `main` après le merge.
Elle répartit le travail en deux jobs parallèles :
- `static`, sans conteneur : check, tests unitaires, build et package ;
- `browser` : tests navigateur et captures, dans une image Chromium légère
  (`ci/Containerfile.chromium`). Cette image est reconstruite et publiée sur
  GHCR seulement quand sa recette change.

## Vérification Linux facultative

`pnpm verify:local` rejoue les mêmes contrôles dans l'image Playwright épinglée
par version et digest (`ci/Containerfile`), avec Podman et une VM active. Il
vérifie un instantané du checkout courant, fichiers non commités compris ; le
checkout, `.git` et `node_modules` ne sont jamais montés.

```sh
pnpm verify:local -- --help
pnpm verify:local -- --target button --theme dark --workers 2
```

Filtres : `--target` (bootstrap, fonts, foundations, themes, button), `--theme`
(light, dark, system), `--viewport` (desktop, short ; mobile n'a pas encore de
scénario), `--workers`. Ils se combinent par intersection ; une option
invalide ou une sélection vide est refusée avant tout démarrage. Les rapports
restent dans `.verification/runs/<uuid>/` avec un `manifest.json` (instantané,
sélection, commandes, résultat, nettoyage). Codes de sortie : 0 succès,
1 assertion échouée, 2 infrastructure, 130 interruption (Ctrl+C). Le nettoyage
ne touche que les ressources du run.

## Captures de référence

L'environnement canonique des captures est la CI GitHub (Linux x64, même image
épinglée). Le job `visual` du workflow `CI` compare les vingt scénarios
Button (deux variantes, cinq états, deux thèmes) dans Chromium seulement ;
Firefox et WebKit sont couverts par les tests de styles calculés.
La commande est `pnpm exec playwright test --config playwright.visual.config.ts`
après `pnpm build-storybook`, dans l'image `ci/Containerfile.chromium` (Ubuntu 24.04 épinglée, Chromium de
Playwright 1.63.0, Node et pnpm via `ci/install-toolchain.sh`), en Linux x64.
Les références sont dans `tests/visual/baselines/chromium/`.

Le viewport est 400 × 160, DPR 1 ; les polices locales sont attendues via
`document.fonts.ready`, les animations désactivées. `threshold: 0` et
`maxDiffPixels: 0` imposent une égalité exacte dans cet environnement fixé.
Une référence absente ou un écart fait échouer le job. `updateSnapshots: none`
interdit la création ou le remplacement automatique des références. L'artefact
`button-visual-<run>-<attempt>` conserve candidates, diffs, traces et rapport
pendant 14 jours, même si la comparaison échoue.

Pour approuver : télécharger l'artefact du SHA candidat depuis la CI, examiner
chaque candidate (variante, état, thème et navigateur) et les diffs éventuels,
puis obtenir l'approbation explicite du responsable visuel. Après cet accord,
copier manuellement les seuls fichiers `candidate-<variante>-<état>-<thème>.png`
approuvés vers le répertoire du navigateur, en retirant le préfixe `candidate-`.
Inclure le SHA et le lien du run approuvé dans la PR, puis relancer la CI pour
vérifier ces références. Aucun `--update-snapshots` ni remplacement destiné
uniquement à masquer un échec. Aucune référence n'est encore approuvée.

## Compatibilité et portée

La toolchain de développement et CI reste Node 24.21.0, pnpm 12.8.1 et
React/React DOM 19.3.0 exactement. Le package accepte React/React DOM `^19.3.0`
et Node `>=24.21.0`. Le consommateur isolé teste explicitement les bornes basses ;
les versions futures admises par ces plages ne sont pas présentées comme testées.

## Règles de contribution

- Garder code métier, règles produit et contenus hors du package.
- Encapsuler React Aria sans exposer toutes ses props par passthrough.
- Utiliser les tokens et primitives partagés lorsqu'ils seront livrés à B2.
- Tester le comportement observable et le package distribué.
- Ne pas modifier du code généré manuellement ni approuver une baseline soi-même.
- Décrire l'impact consommateur de chaque changement de contrat public.

Les plans, skills et preuves privés restent dans l'écosystème local.
Les commandes produit et la CI fonctionnent depuis un clone sans ces liens.
