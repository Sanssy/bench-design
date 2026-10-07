import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ActionCard } from "../action-card/ActionCard.js";
import { ActionList } from "../action-list/ActionList.js";
import { AppHeader } from "../app-header/AppHeader.js";
import { Avatar } from "../avatar/Avatar.js";
import { Badge } from "../badge/Badge.js";
import { Composer } from "../composer/Composer.js";
import { Dialog } from "../dialog/Dialog.js";
import { Grid } from "../grid/Grid.js";
import { Heading } from "../heading/Heading.js";
import { Icon } from "../icon/Icon.js";
import { IconTile } from "../icon-tile/IconTile.js";
import { Inline } from "../inline/Inline.js";
import { Link } from "../link/Link.js";
import { Page } from "../page/Page.js";
import { ReferenceList } from "../reference-list/ReferenceList.js";
import { Stack } from "../stack/Stack.js";
import { Text } from "../text/Text.js";
import { TopNav } from "../top-nav/TopNav.js";
import { type RecordDocument, RecordView } from "./RecordView.js";

const suggestions = [
  "What should I prepare?",
  "Where can I find the schedule?",
  "What happens after the workshop?",
];
const reserves = [
  "The checklist does not specify any additional materials.",
  "The guide does not specify session times.",
  "The guide does not specify when the summary will arrive.",
];
const sources: RecordDocument[] = [
  {
    id: "guide",
    title: "Workshop guide",
    kind: "Workshop",
    date: "7 October 2026",
    summary: "A shared session followed by a summary.",
    pages: 2,
    fields: [
      {
        id: "session",
        label: "Session",
        value: "Shared reading",
        page: 1,
        passage: "The session starts with a shared reading.",
      },
      {
        id: "follow-up",
        label: "Follow-up",
        value: "Summary",
        page: 2,
        passage: "A summary follows afterwards.",
      },
    ],
  },
  {
    id: "preparation",
    title: "Preparation checklist",
    kind: "Workshop",
    date: "6 October 2026",
    summary: "Notes and a question for the discussion.",
    pages: 2,
    fields: [
      {
        id: "notes",
        label: "Preparation",
        value: "Notes and a question",
        page: 2,
        passage: "Bring your notes and a question to discuss.",
      },
    ],
  },
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
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<
    { id: number; question: string; sourced: boolean }[]
  >([]);
  const [citation, setCitation] = useState<{
    document: RecordDocument;
    fieldId: string;
  } | null>(null);
  const openCitation = (documentId: string) => {
    const source = sources.find((item) => item.id === documentId);
    const field = source?.fields[0];
    if (source && field) setCitation({ document: source, fieldId: field.id });
  };
  const newestTurn = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  const send = (value: string) => {
    if (state === "pending") return;
    setQuestion(value);
    setDraft("");
    setState("pending");
  };
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollPaddingBlockEnd;
    const card = composer.current;
    if (!card || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      root.style.scrollPaddingBlockEnd = `calc(${card.getBoundingClientRect().height}px + var(--bd-space-32))`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    measure();
    return () => {
      observer.disconnect();
      root.style.scrollPaddingBlockEnd = previous;
    };
  }, []);
  useEffect(() => {
    if (state !== "pending") return;
    const timer = setTimeout(() => {
      setTurns((previous) => [
        ...previous,
        {
          id: previous.length + 1,
          question,
          sourced: suggestions.some(
            (suggestion) =>
              suggestion.toLowerCase() === question.trim().toLowerCase(),
          ),
        },
      ]);
      setState("answered");
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, question]);
  useEffect(() => {
    if (turns.length) newestTurn.current?.scrollIntoView?.({ block: "start" });
  }, [turns.length]);
  return (
    <Page
      width="narrow"
      header={
        <AppHeader
          navigationAlign="center"
          brand={<Link href="#ask-example">Sample archive</Link>}
          navigation={
            <TopNav
              rail={false}
              label="Example pages"
              currentId="ask"
              items={[
                { id: "library", label: "Library", href: "#library", count: 2 },
                { id: "overview", label: "Overview", href: "#overview" },
                { id: "ask", label: "Ask", href: "#ask-example" },
              ]}
            />
          }
          meta="Demo space"
          actions={<Avatar name="Demo reader" tone="accent" />}
        />
      }
      footer={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: mobile ? "var(--bd-space-8)" : "var(--bd-space-16)",
          }}
        >
          <Heading level={2} size="ui">
            <span style={{ overflowWrap: "normal" }}>Sample archive</span>
          </Heading>
          <Text tone="muted" size="meta">
            <span style={{ overflowWrap: "normal" }}>
              Less searching. More understanding.
            </span>
          </Text>
          <Text variant="mono" size="meta">
            <span style={{ overflowWrap: "normal" }}>Local demonstration</span>
          </Text>
        </div>
      }
    >
      <div id="ask-example">
        <Stack gap={32}>
          <div
            style={{
              display: "flex",
              flexDirection: mobile ? "column" : "row",
              alignItems: mobile ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: "var(--bd-space-12)",
            }}
          >
            <Text variant="mono">03 / Ask a question</Text>
            <Badge variant="tag" icon="layers">
              2 documents ready
            </Badge>
          </div>
          <Stack gap={16} align="center">
            <IconTile icon="asterisk" tone="accent" size="sm" />
            <Heading level={1} size="display" align="center">
              Less searching.
              <br />
              <em>More understanding.</em>
            </Heading>
            <Text tone="muted" align="center">
              Ask a question and read the sources behind a sample answer.
            </Text>
          </Stack>
          {mobile ? (
            <ActionList
              label="Suggested questions"
              numbered
              variant="outlined"
              items={suggestions.map((title) => ({
                id: title,
                title,
                trailingIcon: "arrow-up-right",
                onPress: () => send(title),
              }))}
            />
          ) : (
            <Grid columns={3} gap={12}>
              {suggestions.map((title, index) => (
                <ActionCard
                  key={title}
                  title={title}
                  layout="stacked"
                  eyebrow={`0${index + 1}`}
                  onPress={() => send(title)}
                  isDisabled={state === "pending"}
                  trailingIcon={<Icon name="arrow-up-right" />}
                />
              ))}
            </Grid>
          )}
          <section
            hidden={turns.length === 0 && state !== "pending"}
            aria-label="Answer"
            aria-live="polite"
            aria-relevant="additions"
          >
            {turns.map((turn, index) => (
              <Stack key={turn.id} gap={24}>
                <div ref={index === turns.length - 1 ? newestTurn : undefined}>
                  <Inline gap={12}>
                    <Avatar name="Demo reader" tone="accent" />
                    <Text>
                      <strong>{turn.question}</strong>
                    </Text>
                  </Inline>
                </div>
                <div
                  style={{
                    borderInlineStart:
                      "var(--bd-hair) solid var(--bd-border-strong)",
                    paddingInlineStart: "var(--bd-space-24)",
                  }}
                >
                  <Stack gap={16}>
                    {turn.sourced ? (
                      <>
                        <Text tone="muted">Sample answer ready.</Text>
                        <Heading level={2} size="ui">
                          Sample answer
                        </Heading>
                      </>
                    ) : (
                      <Text variant="mono">Answer unavailable</Text>
                    )}
                    {turn.sourced ? (
                      <>
                        <Text variant="mono">Archive / sourced answer</Text>
                        <Text>
                          This fictional workshop includes preparation, a shared
                          session and a follow-up. Open a citation for the
                          original wording.
                        </Text>
                        <Text variant="mono">The supporting passages</Text>
                        <ReferenceList
                          label="Answer sources"
                          marker="accent"
                          items={[
                            {
                              id: "guide",
                              title: "Workshop guide",
                              onAction: () => openCitation("guide"),
                              description:
                                "The session starts with a shared reading.",
                              meta: "p. 1",
                            },
                            {
                              id: "checklist",
                              title: "Preparation checklist",
                              onAction: () => openCitation("preparation"),
                              description:
                                "Bring your notes and a question to discuss.",
                              meta: "p. 2",
                            },
                          ]}
                        />
                        <Text size="meta" tone="muted">
                          {
                            reserves[
                              suggestions.findIndex(
                                (suggestion) =>
                                  suggestion.toLowerCase() ===
                                  turn.question.trim().toLowerCase(),
                              )
                            ]
                          }
                        </Text>
                      </>
                    ) : (
                      <Text>
                        Try a suggested question to explore the sample records.
                      </Text>
                    )}
                  </Stack>
                </div>
              </Stack>
            ))}
            {state === "pending" && (
              <Stack gap={16}>
                <Inline gap={12}>
                  <Avatar name="Demo reader" tone="accent" />
                  <Text>
                    <strong>{question}</strong>
                  </Text>
                </Inline>
                <Text tone="muted">Reading your documents…</Text>
              </Stack>
            )}
          </section>
          {citation && (
            <Dialog
              isOpen
              onOpenChange={(open) => {
                if (!open) setCitation(null);
              }}
              placement="end"
              size="wide"
              title={citation.document.title}
            >
              <RecordView
                key={`${citation.document.id}-${citation.fieldId}`}
                document={citation.document}
                initialFieldId={citation.fieldId}
              />
            </Dialog>
          )}
          <div
            ref={composer}
            style={{
              position: turns.length ? "sticky" : "static",
              bottom: "var(--bd-space-16)",
              zIndex: 1,
            }}
          >
            <Composer
              variant="card"
              hideLabel
              label="Your question"
              value={draft}
              onChange={setDraft}
              onSubmit={send}
              isPending={state === "pending"}
              placeholder="What would you like to know?"
            />
          </div>
          <Text size="meta" tone="muted" align="center">
            Fictional answer and sources. No request leaves this page.
          </Text>
        </Stack>
      </div>
    </Page>
  );
}
