import { useEffect, useState, useSyncExternalStore } from "react";
import { ActionCard } from "../action-card/ActionCard.js";
import { ActionList } from "../action-list/ActionList.js";
import { AppHeader } from "../app-header/AppHeader.js";
import { AppShell } from "../app-shell/AppShell.js";
import { Composer } from "../composer/Composer.js";
import { Grid } from "../grid/Grid.js";
import { Heading } from "../heading/Heading.js";
import { Link } from "../link/Link.js";
import { Paper } from "../paper/Paper.js";
import { ReferenceList } from "../reference-list/ReferenceList.js";
import { Stack } from "../stack/Stack.js";
import { Text } from "../text/Text.js";
import { TopNav } from "../top-nav/TopNav.js";

const suggestions = [
  "What should I prepare?",
  "Where can I find the schedule?",
  "What happens after the workshop?",
];
function subscribe(listener: () => void) {
  const query = window.matchMedia("(width < 640px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const isMobile = () => window.matchMedia("(width < 640px)").matches;

/** Local, fictional recipe only. Applications own answers, source resolution and delivery. */
export function AskWithSourcesRecipe() {
  const mobile = useSyncExternalStore(subscribe, isMobile, () => false);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "answered">("idle");
  useEffect(() => {
    if (state !== "pending") return;
    const timer = setTimeout(() => setState("answered"), 1000);
    return () => clearTimeout(timer);
  }, [state]);
  return (
    <AppShell
      header={
        <AppHeader
          brand={<Link href="#ask-example">Sample archive</Link>}
          navigation={
            <TopNav
              label="Example pages"
              currentId="ask"
              items={[{ id: "ask", label: "Ask", href: "#ask-example" }]}
            />
          }
          meta="Local demonstration"
        />
      }
    >
      <div
        id="ask-example"
        style={{ maxInlineSize: "var(--bd-measure)", marginInline: "auto" }}
      >
        <Stack gap={32}>
          <Text variant="mono">03 / Ask a question</Text>
          <Heading level={1} size="display">
            Less searching. More understanding.
          </Heading>
          <Text size="lead" tone="muted">
            Ask a question and read the sources behind a sample answer.
          </Text>
          {state === "idle" &&
            (mobile ? (
              <ActionList
                label="Suggested questions"
                numbered
                items={suggestions.map((title) => ({
                  id: title,
                  title,
                  onPress: () => setDraft(title),
                }))}
              />
            ) : (
              <Grid columns={3} gap={16}>
                {suggestions.map((title, index) => (
                  <ActionCard
                    key={title}
                    title={title}
                    eyebrow={`0${index + 1}`}
                    onPress={() => setDraft(title)}
                  />
                ))}
              </Grid>
            ))}
          <section aria-label="Answer" aria-live="polite" aria-atomic="true">
            {state === "answered" && (
              <Stack gap={24}>
                <Text tone="muted">Sample answer ready.</Text>
                <Heading level={2}>Sample answer</Heading>
                <Text>
                  This fictional workshop includes preparation, a shared session
                  and a follow-up. Check the sample excerpt for the original
                  wording.
                </Text>
                <Heading level={3}>Sources</Heading>
                <ReferenceList
                  label="Answer sources"
                  items={[
                    {
                      id: "guide",
                      title: "Workshop guide",
                      href: "#sample-excerpt",
                      description: "Sample archive · page 1",
                    },
                    {
                      id: "checklist",
                      title: "Preparation checklist",
                      href: "#sample-excerpt",
                      description: "Sample archive · page 2",
                    },
                  ]}
                />
                <Paper>
                  <div
                    id="sample-excerpt"
                    tabIndex={-1}
                    style={{ scrollMarginBlock: "var(--bd-space-32)" }}
                  >
                    <Heading level={3}>Source excerpt</Heading>
                    <Text>
                      Before the workshop:{" "}
                      <mark>Bring your notes and a question to discuss.</mark>{" "}
                      The session starts with a shared reading. A summary
                      follows afterwards.
                    </Text>
                  </div>
                </Paper>
              </Stack>
            )}
          </section>
          <div
            style={{
              position: "sticky",
              bottom: 0,
              background: "var(--bd-surface)",
              paddingBlock: "var(--bd-space-16)",
              marginBlockEnd: "var(--bd-space-32)",
            }}
          >
            <Composer
              label="Your question"
              value={draft}
              onChange={setDraft}
              onSubmit={() => setState("pending")}
              isPending={state === "pending"}
              placeholder="What would you like to know?"
            />
            <Text size="meta" tone="muted">
              Fictional answer and sources. No request leaves this page.
            </Text>
          </div>
        </Stack>
      </div>
    </AppShell>
  );
}
