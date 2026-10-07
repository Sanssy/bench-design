import { useEffect, useRef, useState } from "react";
import { ActionList } from "../action-list/ActionList.js";
import { AppHeader } from "../app-header/AppHeader.js";
import { Avatar } from "../avatar/Avatar.js";
import { Badge } from "../badge/Badge.js";
import { CategoryLabel } from "../category-label/CategoryLabel.js";
import { CollectionView } from "../collection-view/CollectionView.js";
import { Dialog } from "../dialog/Dialog.js";
import { Divider } from "../divider/Divider.js";
import type { FileRejection } from "../drop-zone/DropZone.js";
import { DropZone } from "../drop-zone/DropZone.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { Grid } from "../grid/Grid.js";
import { GridList } from "../grid-list/GridList.js";
import { Heading } from "../heading/Heading.js";
import { Icon } from "../icon/Icon.js";
import { Inline } from "../inline/Inline.js";
import { Link } from "../link/Link.js";
import { MetaList } from "../meta-list/MetaList.js";
import { Notice } from "../notice/Notice.js";
import { Page } from "../page/Page.js";
import { Paper } from "../paper/Paper.js";
import { ReferenceList } from "../reference-list/ReferenceList.js";
import { SearchField } from "../search-field/SearchField.js";
import { SegmentedControl } from "../segmented-control/SegmentedControl.js";
import { Stack } from "../stack/Stack.js";
import { Surface } from "../surface/Surface.js";
import { Text } from "../text/Text.js";
import { Timeline } from "../timeline/Timeline.js";
import { TopNav } from "../top-nav/TopNav.js";
import { UploadQueue } from "../upload-queue/UploadQueue.js";

const categories = {
  Invoices: "green",
  Contracts: "orange",
  Certificates: "violet",
  Records: "magenta",
  Letters: "teal",
} as const;

const archive = [
  {
    id: "energy",
    title: "Energy invoice",
    kind: "Invoices",
    date: "31 August 2026",
    passage: "Total payable: 64.80 EUR.",
    pages: 2,
  },
  {
    id: "service",
    title: "Service contract",
    kind: "Contracts",
    date: "18 August 2026",
    passage: "Service period: September 2026 to August 2027.",
    pages: 3,
  },
  {
    id: "purchase",
    title: "Equipment invoice",
    kind: "Invoices",
    date: "20 June 2026",
    passage: "Item: office equipment. Total: 120.00 EUR.",
    pages: 1,
  },
  {
    id: "insurance",
    title: "Insurance certificate",
    kind: "Certificates",
    date: "1 May 2026",
    passage: "Coverage valid until 30 April 2027.",
    pages: 2,
  },
  {
    id: "employment",
    title: "Employment agreement",
    kind: "Contracts",
    date: "12 April 2026",
    passage: "Terms reviewed and agreed.",
    pages: 3,
  },
  {
    id: "membership",
    title: "Membership certificate",
    kind: "Certificates",
    date: "8 April 2026",
    passage: "Membership valid for one year.",
    pages: 2,
  },
  {
    id: "appointment",
    title: "Appointment record",
    kind: "Records",
    date: "24 March 2026",
    passage: "Next appointment confirmed.",
    pages: 1,
  },
  {
    id: "review",
    title: "Annual review",
    kind: "Records",
    date: "15 March 2026",
    passage: "Summary of the annual review.",
    pages: 2,
  },
  {
    id: "welcome",
    title: "Welcome letter",
    kind: "Letters",
    date: "3 February 2026",
    passage: "Welcome to your new space.",
    pages: 1,
  },
  {
    id: "confirmation",
    title: "Booking confirmation",
    kind: "Letters",
    date: "18 January 2026",
    passage: "Your reservation is confirmed.",
    pages: 2,
  },
];

/** Browse fictional documents and open a reading sheet; data and search policy belong to the caller. */
export function DocumentLibrary() {
  const [layout, setLayout] = useState("grid");
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState("All");
  const [opened, setOpened] = useState<string>();
  const [documents, setDocuments] = useState(archive);
  const [adding, setAdding] = useState(false);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [pending, setPending] = useState<
    ((typeof archive)[number] & { progress: number })[]
  >([]);
  const nextId = useRef(0);
  const reduced = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = media.matches;
      if (media.matches)
        setPending((items) =>
          items.map((item) => ({ ...item, progress: 100 })),
        );
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const uploading = pending.some((item) => item.progress < 100);
  useEffect(() => {
    if (!uploading) return;
    const timer = window.setInterval(() => {
      setPending((items) =>
        items.map((item) => ({
          ...item,
          progress: Math.min(100, item.progress + 25),
        })),
      );
    }, 500);
    return () => window.clearInterval(timer);
  }, [uploading]);
  useEffect(() => {
    const complete = pending.filter((item) => item.progress === 100);
    if (complete.length)
      setDocuments((items) => [
        ...items,
        ...complete.filter(
          (item) => !items.some((existing) => existing.id === item.id),
        ),
      ]);
  }, [pending]);
  function receive(files: File[]) {
    setAdding(true);
    setPending((items) => [
      ...items,
      ...files.map((file) => ({
        id: `import-${nextId.current++}`,
        title: file.name,
        kind: "Invoices",
        date: "7 October 2026",
        passage: "Water bill total: 42.00 EUR.",
        pages: 1,
        progress: reduced.current ? 100 : 0,
      })),
    ]);
  }
  const shown = documents.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) &&
      (facet === "All" || item.kind === facet),
  );
  const selected = documents.find((item) => item.id === opened);
  return (
    <Page
      header={
        <AppHeader
          navigationAlign="center"
          brand={<Link href="#">Document space</Link>}
          navigation={
            <TopNav
              label="Main navigation"
              rail={false}
              currentId="library"
              items={[
                {
                  id: "library",
                  label: "Library",
                  href: "#",
                  count: documents.length,
                },
                {
                  id: "overview",
                  label: "Overview",
                  href: "#overview",
                  count: 3,
                },
                { id: "ask", label: "Ask", href: "#ask", count: 0 },
              ]}
            />
          }
          actions={
            <Inline gap={12}>
              <Text variant="mono">Personal space</Text>
              <Avatar name="Alex Morgan" tone="accent" />
            </Inline>
          }
        />
      }
      footer={
        <Inline gap={24} justify="space-between">
          <Text variant="mono">Document space</Text>
          <Text tone="muted">Keep the details. See the bigger picture.</Text>
          <Text variant="mono">Fictional collection / demonstration</Text>
        </Inline>
      }
    >
      <Stack gap={48}>
        <Grid columns={2} template="hero" gap={96}>
          <Stack gap={16}>
            <Text variant="mono">Your personal archive</Text>
            <Heading level={1} size="display">
              Your documents.
              <br /> <em>A clearer view.</em>
            </Heading>
            <Text tone="muted">All your papers, one clearer picture.</Text>
          </Stack>
          <DropZone
            variant="editorial"
            align="start"
            label="Add your documents"
            eyebrow="01 / IMPORT"
            icon="scan"
            buttonIcon="plus"
            buttonLabel="Add documents"
            description="Local preview only; no upload."
            acceptedFileTypes={[".pdf", ".txt"]}
            maxSize={20_000_000}
            allowsMultiple
            onDrop={receive}
            onBrowse={() => {
              setRejections([]);
              setAdding(true);
            }}
            onReject={(items) => {
              setRejections(items);
              setAdding(true);
            }}
          />
        </Grid>
        <Stack gap={16} as="section">
          <Divider />
          <Inline gap={24} justify="space-between">
            <Text variant="mono">At a glance</Text>
            <Text>
              <strong>{documents.length} documents</strong>
            </Text>
            <Text tone="muted">5 document types</Text>
            <Link href="#overview" trailingIcon="arrow-right">
              Explore the overview
            </Link>
          </Inline>
          <Divider />
        </Stack>
        <CollectionView
          label="Document library"
          count={documents.length}
          countVariant="outlined"
          isEmpty={shown.length === 0}
          stickyToolbar={false}
          actions={
            <SearchField
              label="Search documents"
              hideLabel
              variant="underlined"
              value={query}
              onChange={setQuery}
            />
          }
          toolbar={
            <Inline gap={16} justify="space-between">
              <SegmentedControl
                label="Document type"
                hideLabel
                layout="wrap"
                value={facet}
                onChange={setFacet}
                options={["All", ...Object.keys(categories)].map((kind) => ({
                  id: kind,
                  label: kind,
                  count:
                    kind === "All"
                      ? documents.length
                      : documents.filter((item) => item.kind === kind).length,
                }))}
              />
              <SegmentedControl
                label="Document view"
                hideLabel
                value={layout}
                onChange={setLayout}
                options={[
                  { id: "grid", label: "Grid view", icon: "layout-grid" },
                  { id: "list", label: "List view", icon: "list" },
                ]}
              />
            </Inline>
          }
          footer={`${shown.length} of ${documents.length} documents shown`}
          emptyState={
            <EmptyState
              variant="editorial"
              icon="search"
              title="No matching documents"
            >
              Change your search or choose another document type.
            </EmptyState>
          }
        >
          <GridList
            label="Documents"
            items={shown}
            layout={layout === "list" ? "list" : "grid"}
            columns={4}
            itemPadding="none"
            itemVariant={layout === "list" ? "ruled" : "outlined"}
            getItemLabel={(item) => item.title}
            onAction={setOpened}
            renderPreview={(item) => (
              <Surface
                category={categories[item.kind as keyof typeof categories]}
                padding={16}
              >
                <Paper size="compact">
                  <Text size="meta">
                    Noted: <mark>{item.passage}</mark>
                  </Text>
                </Paper>
              </Surface>
            )}
            renderFooter={(item) => (
              <Surface padding={16}>
                <Inline gap={8} justify="space-between">
                  <Text variant="mono" size="meta" tone="muted">
                    {item.date}
                  </Text>
                  <Icon name="arrow-up-right" size={16} />
                </Inline>
              </Surface>
            )}
            renderItem={(item) => (
              <Surface padding={16}>
                <Stack gap={12}>
                  <Inline gap={8} justify="space-between">
                    <CategoryLabel
                      category={
                        categories[item.kind as keyof typeof categories]
                      }
                      variant="plain"
                      icon="file-text"
                    >
                      {item.kind}
                    </CategoryLabel>
                    <Text variant="mono" size="meta">
                      {item.pages} p.
                    </Text>
                  </Inline>
                  <Heading level={3} size="ui">
                    {item.title}
                  </Heading>
                  {item.id === "energy" && (
                    <Badge variant="tag" icon="check">
                      Current version
                    </Badge>
                  )}
                </Stack>
              </Surface>
            )}
          />
        </CollectionView>
        <Surface tone="inverse" padding={24} as="section">
          <Inline gap={24} justify="space-between">
            <Stack gap={8}>
              <Text variant="mono">Your documents have answers</Text>
              <Heading level={2} size="ui">
                Ask. Find a clearer perspective.
              </Heading>
            </Stack>
            <Link href="#ask" trailingIcon="arrow-up-right">
              Ask a question
            </Link>
          </Inline>
        </Surface>
      </Stack>
      <Dialog
        title={
          <>
            Add <em>your documents</em>
          </>
        }
        isOpen={adding}
        onOpenChange={setAdding}
      >
        <Stack gap={24}>
          <DropZone
            label="Drop your files here"
            buttonLabel="Choose files"
            acceptedFileTypes={[".pdf", ".txt"]}
            maxSize={20_000_000}
            allowsMultiple
            onDrop={receive}
            onReject={setRejections}
          />
          <ActionList
            label="Sample document"
            items={[
              {
                id: "water",
                title: "Try with a sample water bill",
                icon: "file-text",
                trailingIcon: "arrow-right",
                onPress: () =>
                  receive([
                    new File(["Fictional water bill"], "Water bill.pdf", {
                      type: "application/pdf",
                    }),
                  ]),
              },
            ]}
          />
          <Text tone="muted" size="meta">
            Demonstration only. Progress and recognition are simulated locally;
            no files are uploaded or read.
          </Text>
          {rejections.length > 0 && (
            <Notice tone="danger" title="Some files could not be added">
              <Stack gap={8}>
                {rejections.map(({ file, reason }) => (
                  <Text
                    key={`${file.name}-${file.size}-${file.lastModified}-${reason}`}
                    size="meta"
                  >
                    {file.name}:{" "}
                    {reason === "type"
                      ? "Unsupported type. Choose PDF or TXT."
                      : "File exceeds 20 MB."}
                  </Text>
                ))}
              </Stack>
            </Notice>
          )}
          {pending.length > 0 && (
            <UploadQueue
              label="Document imports"
              items={pending.map((item) => ({
                id: item.id,
                name: item.title,
                status: item.progress === 100 ? "complete" : "uploading",
                progress: item.progress,
                description:
                  item.progress === 100
                    ? "Bill recognised · Housing"
                    : "Reading document…",
                action: {
                  label: "View document",
                  onAction: () => {
                    setAdding(false);
                    setOpened(item.id);
                  },
                },
              }))}
            />
          )}
        </Stack>
      </Dialog>
      <Dialog
        placement="end"
        size="wide"
        title={selected?.title ?? "Document"}
        eyebrow="DOCUMENT / SAMPLE"
        isOpen={selected !== undefined}
        onOpenChange={(open) => {
          if (!open) setOpened(undefined);
        }}
      >
        {selected && (
          <Stack gap={24}>
            <Paper>
              <Stack gap={16}>
                <Heading level={3}>{selected.kind}</Heading>
                <Text>{selected.date}</Text>
                <Text>
                  This sample records the document details.{" "}
                  <mark>{selected.passage}</mark> Keep this copy for your
                  records.
                </Text>
              </Stack>
            </Paper>
            <MetaList
              items={[
                { term: "Type", details: selected.kind },
                { term: "Date", details: selected.date },
                { term: "Pages", details: selected.pages },
              ]}
            />
            <ReferenceList
              label="Document references"
              items={[
                {
                  id: "source",
                  title: "Source excerpt",
                  description: "Page 1 · highlighted passage above",
                },
              ]}
            />
            <Timeline
              label="Document history"
              items={[
                {
                  id: "added",
                  marker: selected.date,
                  title: "Added to sample archive",
                  children:
                    "Fictional event; no processing or extraction is performed.",
                },
              ]}
            />
          </Stack>
        )}
      </Dialog>
    </Page>
  );
}
