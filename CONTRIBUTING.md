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
Elle installe aussi les versions exactes de Node et pnpm. Docker est utilisé en
CI ; Podman peut exécuter les mêmes commandes localement :

```sh
podman build -f ci/Containerfile -t bench-design-verify ci
podman run --rm --init --shm-size=1g -v "$PWD:/workspace" bench-design-verify \
  sh -c 'pnpm install --frozen-lockfile && pnpm verify'
```

Utiliser un checkout propre et dédié : le conteneur écrit ses dépendances et
résultats dans le répertoire monté. Le runner isolé et parallèle `verify:local`
sera livré à B3 ; il n'est pas encore disponible. Une sélection vide ou un test
non exécuté ne vaut jamais succès. Aucune baseline visuelle n'existe à B1.

## Règles de contribution

- Garder code métier, règles produit et contenus hors du package.
- Encapsuler React Aria sans exposer toutes ses props par passthrough.
- Utiliser les tokens et primitives partagés lorsqu'ils seront livrés à B2.
- Tester le comportement observable et le package distribué.
- Ne pas modifier du code généré manuellement ni approuver une baseline soi-même.
- Décrire l'impact consommateur de chaque changement de contrat public.

Les plans, skills et preuves privés restent dans l'écosystème local.
Les commandes produit et la CI fonctionnent depuis un clone sans ces liens.
