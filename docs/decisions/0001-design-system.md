# 0001 — Un Design System React externe

Statut : décisions acquises. Le bootstrap et les composants restent à livrer.

## Contexte et décision

Trame, Bibliothèque + Atelier et Decision Engine partagent une identité visuelle
et des composants génériques. Trame constitue un produit distinct ; Bibliothèque
et Atelier sont regroupés. `bench-design` possède son propre dépôt et distribue
initialement un seul package, sans logique métier de ces produits.

React et TypeScript constituent la couche de composants. React Aria Components
fournit les interactions accessibles ; le DS encapsule son API et conserve la
responsabilité des noms accessibles, du focus, des styles et de leur vérification.
Les consommateurs utilisent les exports du DS. Storybook présente les composants
réels et leurs états, sans réimplémentation parallèle.

Les fondations CSS et tokens sont indépendantes de React : primitifs, sémantiques,
puis tokens de composants seulement lorsqu'un besoin le justifie. Les compositions
restent génériques. Les règles, permissions et contenus métier appartiennent aux
produits. DDD, Tell Don't Ask et la loi de Demeter guident les frontières pertinentes.

## Distribution et maintenance

Package ESM avec déclarations TypeScript ; CSS et tokens importés explicitement.
React et React DOM sont des peers, React Aria Components une dépendance runtime.
Les polices sont distribuées localement avec leurs licences. Un consommateur
isolé installé depuis `pnpm pack` doit prouver les exports, types, CSS et assets.

Node utilise la dernière LTS disponible lors du bootstrap ; les autres outils
utilisent les dernières versions stables compatibles. Les versions retenues sont
exactes et le lockfile est suivi. Les images de test sont épinglées par digest.

Première ligne de version : 0.1.x. Avant 1.0, une incompatibilité augmente MINOR,
une correction compatible PATCH. À partir de 1.0, SemVer s'applique normalement.
L'API inclut exports, props, tokens et comportements documentés. Les retraits sont
annoncés avec remplacement et version de retrait ; les migrations sont documentées.
Le registre et la première publication restent à décider.

## Vérification

Tests UI : render/interact/assert. Given/When/Then concerne les comportements de
domaine. Les tests d'accessibilité combinent contrôles automatiques et parcours
clavier. Les captures canoniques sont prises dans un environnement Linux épinglé.
Une baseline nouvelle ou modifiée exige une validation humaine ; aucun remplacement
automatique des images attendues n'est permis.

Les commandes et la CI vivent dans le dépôt produit et ne dépendent pas du corpus
privé. Skills, plans, matrices de livraison, audits et preuves d'exécution restent
dans l'écosystème privé et sont référencés localement, sans duplication dans Git
produit. Ce document conserve les décisions de maintenance lisibles dans un clone neuf.

## Storybook et définition de livré

Une fondation ou un composant est livré lorsque ses stories couvrent variantes
et états en clair et sombre. Sans stories, la tranche reste ouverte et la revue
est refusée. Les composants ont leurs stories adjacentes (`src/**/*.stories.tsx`) ;
`tests/fixtures/` reste un harnais technique. Les pages Fondations documentent
couleurs, typographie, espacements, géométrie et thèmes. Storybook charge le CSS
distribué et propose clair, sombre et système ; ses scripts construisent le package.

`pnpm check` contrôle les exports de `src/index.ts`, suit barrels et alias et exige
une story adjacente pour les fonctions, classes et wrappers exportés en PascalCase
(et les exports par défaut). Zéro composant produit un rapport explicite.
Ce contrôle de présence ne prouve pas la couverture des variantes et états :
les stories servent de base aux tests navigateur et aux futures captures visuelles.
