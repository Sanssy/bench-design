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

## Environnement navigateur canonique

L'image Playwright est épinglée par version et digest dans `ci/Containerfile`.
Elle installe aussi les versions exactes de Node et pnpm. Sur macOS, transférer
le Containerfile à la VM évite le montage partagé du contexte de construction :

```sh
podman machine ssh 'task_context=$(mktemp -d); cat > "$task_context/Containerfile"; podman build -t bench-design-verify "$task_context"; result=$?; rm -rf "$task_context"; exit "$result"' < ci/Containerfile
git archive HEAD | podman run --rm -i --init --shm-size=1g bench-design-verify \
  sh -c 'tar -xf - -C /workspace && pnpm install --frozen-lockfile && pnpm verify'
```

Cette commande teste uniquement le commit HEAD : committer les changements à
vérifier avant de la lancer. Aucun checkout, corpus ou node_modules hôte n'est
monté ; installation et résultats restent dans le conteneur temporaire.
Les résultats sont affichés dans le terminal. La CI utilise la même image.
Le runner isolé et parallèle avec rapports persistants `verify:local` sera livré
à B3 ; il n'est pas encore disponible. Une sélection vide ou un test non exécuté
ne vaut jamais succès. Aucune baseline visuelle n'existe à B1.

## Compatibilité et portée

La toolchain de développement et CI reste Node 24.21.0, pnpm 12.8.1 et
React/React DOM 19.3.0 exactement. Le package accepte React/React DOM `^19.3.0`
et Node `>=24.21.0`. Le consommateur isolé teste explicitement les bornes basses ;
les versions futures admises par ces plages ne sont pas présentées comme testées.
`pnpm verify` annonce ses contrôles techniques B1. Son succès ne clôt pas la
revue indépendante et ne valide pas le socle complet : B2/B3 restent à livrer.

## Règles de contribution

- Garder code métier, règles produit et contenus hors du package.
- Encapsuler React Aria sans exposer toutes ses props par passthrough.
- Utiliser les tokens et primitives partagés lorsqu'ils seront livrés à B2.
- Tester le comportement observable et le package distribué.
- Ne pas modifier du code généré manuellement ni approuver une baseline soi-même.
- Décrire l'impact consommateur de chaque changement de contrat public.

Les plans, skills et preuves privés restent dans l'écosystème local.
Les commandes produit et la CI fonctionnent depuis un clone sans ces liens.
