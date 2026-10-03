# Contribuer à bench-design

Le dépôt est en préparation : aucune toolchain, commande ci-dessous ou composant
n'est encore exécutable. Voir les [décisions du socle](docs/decisions/0001-design-system.md).

## Commandes à fournir au bootstrap

| Commande prévue | Responsabilité |
| --- | --- |
| `pnpm check` | Formatage, types et frontières de dépendances |
| `pnpm test` | Tests unitaires et interactions des composants |
| `pnpm build` | Package ESM, types et assets |
| `pnpm build-storybook` | Documentation des composants réels |
| `pnpm test:browser` | Comportement navigateur et accessibilité |
| `pnpm verify:local` | Playwright isolé par run dans Podman, avec parallélisme |
| `pnpm verify` | Tous les contrôles CI applicables et test de distribution |

Ces noms sont un contrat de commandes, pas des scripts déjà présents. Chaque
commande sera documentée avec ses options et son résultat réel lors de sa livraison.
Les tests et la CI doivent fonctionner depuis un clone neuf sans liens privés.
Une sélection vide, une infrastructure absente ou un test non exécuté ne vaut
jamais succès. Les baselines approuvées appartiennent au dépôt ; traces et captures
de run sont des résultats temporaires attribuables à leur invocation.

## Règles de contribution

- Utiliser les tokens sémantiques et primitives partagés pour les besoins génériques.
- Encapsuler React Aria sans exposer toutes ses props par simple passthrough.
- Garder code métier, règles produit et contenus hors du package.
- Tester le comportement observable et le package distribué, pas seulement Storybook.
- Ne pas modifier du code généré manuellement ni approuver une baseline soi-même.
- Décrire l'impact consommateur de chaque changement de contrat public.

Le workflow local des agents est décrit dans leurs instructions privées.
Les commandes produit et la CI fonctionnent indépendamment de cet environnement.
