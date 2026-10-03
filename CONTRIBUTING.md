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
épinglée). Le workflow qui y produira les captures candidates arrive avec la
première story stylée (Button S4) ; aucune capture de référence n'existe encore.
Une capture ne sera commitée qu'après approbation humaine, jamais par mise à
jour automatique.

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
