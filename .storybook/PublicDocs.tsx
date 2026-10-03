import type { ReactNode } from "react";
import tokens from "../src/tokens.json";

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="foundation documentation">
      <header>
        <p className="eyebrow">Documentation</p>
        <h1>{title}</h1>
      </header>
      {children}
    </main>
  );
}

export function GettingStarted() {
  return (
    <Page title="Démarrer">
      <section>
        <h2>Ce qui est livré</h2>
        <p>
          Tokens, styles, polices locales et initialisation des thèmes. Aucun
          composant React public pour le moment ; l’entrée JavaScript est vide.
          Le package est privé et aucune publication npm n’est disponible.
        </p>
      </section>
      <section>
        <h2>Charger les fondations</h2>
        <p>
          Dans une application disposant du package local, importer les styles
          une fois :
        </p>
        <pre>
          <code>
            {
              'import "bench-design/styles.css";\n// Ou les tokens seuls, sans les polices :\nimport "bench-design/tokens.css";\n// Catalogue DTCG pour les outils :\nimport tokens from "bench-design/tokens.json";'
            }
          </code>
        </pre>
        <p>
          Sous Node, l’import JSON exige with {' { type: "json" }'} ; les
          bundlers n’en ont pas besoin. Choisir styles.css ou tokens.css selon
          le besoin. Servir styles.css avec ses ressources relatives fonts/, qui
          contiennent les polices et leurs licences OFL. Aucun CDN requis.
        </p>
      </section>
      <section>
        <h2>Travailler dans le dépôt</h2>
        <p>Runtime pinné : Node 24.21.0 et pnpm 12.8.1.</p>
        <pre>
          <code>
            {
              "pnpm install --frozen-lockfile\npnpm check\npnpm test\npnpm build\npnpm build-storybook"
            }
          </code>
        </pre>
        <p>
          check contrôle notamment la divergence entre tokens.json et
          tokens.css. Après modification du catalogue, pnpm tokens:generate
          régénère le CSS. Les tests navigateur requièrent l’environnement Linux
          pinné décrit dans CONTRIBUTING.md.
        </p>
      </section>
    </Page>
  );
}

export function Principles() {
  return (
    <Page title="Principes">
      <section>
        <h2>Structure et voix</h2>
        <p>
          Structure Swiss, voix éditoriale expressive et engagement brutaliste.
          Les composants utilisent les rôles sémantiques --bd-* ; les valeurs
          visuelles appartiennent aux tokens et primitives partagés. Les
          contenus et règles métier restent dans les applications.
        </p>
      </section>
      <section>
        <h2>Typographie</h2>
        <p>
          {
            tokens.base["weight-editorial"].$extensions["org.bench-design"]
              .usage
          }
        </p>
        <p>
          Manrope sert l’interface et la lecture ; IBM Plex Mono sert les
          métadonnées et le texte monospace. Les polices locales utilisent
          font-display: swap et des piles de repli système.
        </p>
      </section>
      <section>
        <h2>Contrastes et rôles</h2>
        <ul>
          {(["border", "divider", "accent", "focus"] as const).map((role) => (
            <li key={role}>
              <code>--bd-{role}</code> :{" "}
              {tokens.light[role].$extensions["org.bench-design"].usage}
            </li>
          ))}
        </ul>
        <p>
          Le texte courant exige un contraste de 4,5:1 ; les contours
          nécessaires à l’identification des contrôles et le focus exigent 3:1.
          Vérifier les associations dans le contexte réel : les contrastes du
          nuancier ne certifient pas l’accessibilité d’une application.
        </p>
      </section>
      <section>
        <h2>Accessibilité de l’intégration</h2>
        <p>
          Conserver les éléments HTML sémantiques, des noms accessibles et un
          focus visible. Vérifier l’ordre du focus et l’utilisation au clavier.
          React Aria est encapsulé par le DS pour les futurs contrôles ; aucun
          composant livré ne permet encore de démontrer ces interactions. Les
          tests UI suivent render/interact/assert.
        </p>
      </section>
    </Page>
  );
}

export function Themes() {
  return (
    <Page title="Thèmes">
      <section>
        <h2>Clair, sombre et système</h2>
        <p>
          Poser data-theme="light" ou data-theme="dark" sur html. Sans attribut,
          prefers-color-scheme choisit le thème et suit les changements du
          système. Les styles déclarent color-scheme. Le sélecteur Storybook
          permet de consulter chaque page dans ces trois modes.
        </p>
      </section>
      <section>
        <h2>Avant le premier rendu</h2>
        <p>
          Servir bench-design/theme-init.js depuis votre propre origine. Charger
          ce script classique bloquant dans head, avant les styles et React,
          sans async ni defer. Le chemin ci-dessous est un exemple de copie
          servie par l’application :
        </p>
        <pre>
          <code>
            {
              '<head>\n  <script src="/assets/theme-init.js"></script>\n  <!-- Styles de l’application après le script -->\n</head>'
            }
          </code>
        </pre>
        <p>
          Le script lit localStorage["bench-design-theme"]. light et dark posent
          l’attribut ; system, une entrée absente ou invalide et un stockage
          inaccessible le laissent absent. Un attribut déjà fourni par le
          serveur est conservé. L’entrée ESM ne modifie pas le thème ; le script
          tolère un import sans document en SSR.
        </p>
      </section>
      <section>
        <h2>Changer le choix ensuite</h2>
        <p>
          Pour un choix explicite, poser l’attribut sur document.documentElement
          ; pour le système, le retirer. Persister le même choix si le stockage
          est disponible :
        </p>
        <pre>
          <code>
            {
              '// theme : "light" | "dark" | "system"\nif (theme === "system") {\n  document.documentElement.removeAttribute("data-theme");\n} else {\n  document.documentElement.setAttribute("data-theme", theme);\n}\ntry {\n  localStorage.setItem("bench-design-theme", theme);\n} catch { /* Le choix reste actif sans stockage. */ }'
            }
          </code>
        </pre>
      </section>
      <section>
        <h2>Limites actuelles</h2>
        <p>
          Le séparateur décoratif sombre et le thème impression sont différés.
          Le rôle d’erreur est également différé. Ne pas inventer de valeurs
          pour ces rôles. Attendre document.fonts.ready avant les captures.
        </p>
      </section>
    </Page>
  );
}
