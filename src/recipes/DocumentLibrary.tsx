import { useState } from "react";
import { AppHeader } from "../app-header/AppHeader.js";
import { AppShell } from "../app-shell/AppShell.js";
import { Avatar } from "../avatar/Avatar.js";
import { Badge } from "../badge/Badge.js";
import { CategoryLabel } from "../category-label/CategoryLabel.js";
import { CollectionView } from "../collection-view/CollectionView.js";
import { Dialog } from "../dialog/Dialog.js";
import { DropZone } from "../drop-zone/DropZone.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { GridList } from "../grid-list/GridList.js";
import { Heading } from "../heading/Heading.js";
import { Link } from "../link/Link.js";
import { MetaList } from "../meta-list/MetaList.js";
import { Paper } from "../paper/Paper.js";
import { ReferenceList } from "../reference-list/ReferenceList.js";
import { SearchField } from "../search-field/SearchField.js";
import { SegmentedControl } from "../segmented-control/SegmentedControl.js";
import { Stack } from "../stack/Stack.js";
import { Surface } from "../surface/Surface.js";
import { Text } from "../text/Text.js";
import { Timeline } from "../timeline/Timeline.js";
import { TopNav } from "../top-nav/TopNav.js";

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
];

/** Browse fictional documents and open a reading sheet; data and search policy belong to the caller. */
export function DocumentLibrary() {
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState("All");
  const [opened, setOpened] = useState<string>();
  const [imports, setImports] = useState<string[]>([]);
  const shown = archive.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) &&
      (facet === "All" || item.kind === facet),
  );
  const selected = archive.find((item) => item.id === opened);
  return (
    <AppShell
      header={
        <AppHeader
          brand={<Link href="#">Document space</Link>}
          navigation={
            <TopNav
              label="Main navigation"
              currentId="library"
              items={[
                {
                  id: "library",
                  label: "Library",
                  href: "#",
                  count: archive.length,
                },
                {
                  id: "overview",
                  label: "Overview",
                  href: "#overview",
                  count: 3,
                },
              ]}
            />
          }
          actions={<Avatar name="Alex Morgan" tone="accent" />}
        />
      }
    >
      <Surface padding={24}>
        <Stack gap={32}>
          <Heading level={1} size="display">
            Your documents. <em>A clearer view.</em>
          </Heading>
          <DropZone
            variant="editorial"
            label="From paper to clarity"
            eyebrow="01 / IMPORT"
            icon="file-text"
            description="Choose local documents; preview only, no upload."
            acceptedFileTypes={[".pdf", ".txt"]}
            maxSize={20_000_000}
            allowsMultiple
            onDrop={(files) => setImports(files.map((file) => file.name))}
          />
          <Text as="span">
            <span role="status">
              {imports.length
                ? `Files selected: ${imports.join(", ")}. Preview only; nothing is uploaded.`
                : "Sample archive · 4 documents"}
            </span>
          </Text>
          <CollectionView
            label="Document library"
            count={archive.length}
            countVariant="outlined"
            isEmpty={shown.length === 0}
            toolbar={
              <Stack gap={16}>
                <SearchField
                  label="Search documents"
                  hideLabel
                  variant="underlined"
                  value={query}
                  onChange={setQuery}
                />
                <SegmentedControl
                  label="Document type"
                  hideLabel
                  layout="wrap"
                  value={facet}
                  onChange={setFacet}
                  options={["All", "Invoices", "Contracts", "Certificates"].map(
                    (kind) => ({
                      id: kind,
                      label: kind,
                      count:
                        kind === "All"
                          ? archive.length
                          : archive.filter((item) => item.kind === kind).length,
                    }),
                  )}
                />
              </Stack>
            }
            footer={`${shown.length} of ${archive.length} documents shown`}
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
              columns={4}
              getItemLabel={(item) => item.title}
              onAction={setOpened}
              renderItem={(item) => (
                <Stack gap={16}>
                  <Surface tone="subtle" padding={16}>
                    <Paper>
                      <Text>
                        This sample records the document details.{" "}
                        <mark>{item.passage}</mark> Keep this copy for your
                        records.
                      </Text>
                    </Paper>
                  </Surface>
                  <Stack gap={12}>
                    <CategoryLabel
                      category="violet"
                      variant="plain"
                      icon="file-text"
                    >
                      {item.kind}
                    </CategoryLabel>
                    <Heading level={3} size="ui">
                      {item.title}
                    </Heading>
                    <Text size="meta" tone="muted">
                      {item.date}
                    </Text>
                    <Badge variant="tag" icon="check">
                      Sample document
                    </Badge>
                  </Stack>
                </Stack>
              )}
            />
          </CollectionView>
          <section id="overview" aria-label="Archive overview">
            <Text>3 document types · fictional data for illustration.</Text>
          </section>
        </Stack>
      </Surface>
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
    </AppShell>
  );
}
