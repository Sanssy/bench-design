import { useState } from "react";
import { ActionCard } from "../action-card/ActionCard.js";
import { AppHeader } from "../app-header/AppHeader.js";
import { AppShell } from "../app-shell/AppShell.js";
import { Badge } from "../badge/Badge.js";
import { ConnectedList } from "../connected-list/ConnectedList.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { Grid } from "../grid/Grid.js";
import { Heading } from "../heading/Heading.js";
import { Icon } from "../icon/Icon.js";
import { IconTile } from "../icon-tile/IconTile.js";
import { Link } from "../link/Link.js";
import { MetaList } from "../meta-list/MetaList.js";
import { SegmentedControl } from "../segmented-control/SegmentedControl.js";
import { Stack } from "../stack/Stack.js";
import { Surface } from "../surface/Surface.js";
import { Text } from "../text/Text.js";
import { Timeline } from "../timeline/Timeline.js";
import { TopNav } from "../top-nav/TopNav.js";
import { Value } from "../value/Value.js";

/** A fictitious overview recipe; applications own data, routes and interpretation. */
export function Overview() {
  const [domain, setDomain] = useState("housing");
  const housing = domain === "housing";
  return (
    <AppShell
      header={
        <AppHeader
          brand={<Text variant="label">Sample collection</Text>}
          navigation={
            <TopNav
              label="Main navigation"
              currentId="overview"
              items={[
                { id: "library", label: "Library", href: "#library", count: 6 },
                { id: "overview", label: "Overview", href: "#overview" },
                { id: "help", label: "Help", href: "#help" },
              ]}
            />
          }
          meta={<Text variant="mono">Fictitious records</Text>}
        />
      }
      footer={<Text size="meta">Sample data · amounts are illustrative.</Text>}
    >
      <Stack gap={32}>
        <Stack gap={12}>
          <Text variant="mono">02 / Take a step back</Text>
          <Heading level={1}>
            What you <em>own.</em>
          </Heading>
          <Text size="lead" tone="muted">
            A few records, a wider perspective.
          </Text>
        </Stack>
        <SegmentedControl
          label="Domains"
          layout="wrap"
          value={domain}
          onChange={setDomain}
          options={[
            { id: "housing", label: "Housing", count: 4 },
            { id: "vehicle", label: "Vehicle", count: 2 },
            { id: "work", label: "Work", count: 0 },
          ]}
        />
        {domain === "work" ? (
          <EmptyState
            variant="editorial"
            icon="briefcase"
            level={2}
            title="No records yet"
          >
            Add a record to begin exploring this part of your collection.
          </EmptyState>
        ) : (
          <Stack gap={24}>
            <Heading level={2} size="heading">
              {housing
                ? "One home, several connections."
                : "A vehicle and its records."}
            </Heading>
            <ActionCard
              title={housing ? "Garden apartment" : "City bicycle"}
              href={housing ? "#housing-record" : "#vehicle-record"}
              eyebrow={housing ? "Rental home" : "Personal transport"}
              description={
                housing
                  ? "Lease, cover and bills refer to the same home."
                  : "Purchase and service records describe the same bicycle."
              }
              trailingIcon={<Icon name="chevron-right" />}
              media={<IconTile icon={housing ? "home" : "bike"} tone="green" />}
            />
            <MetaList
              label="Record summary"
              items={[
                {
                  term: "Records",
                  details: housing ? "4 sources" : "2 sources",
                },
                { term: "Collection", details: "Personal archive" },
              ]}
            />
            <ConnectedList
              label="Related records"
              items={[
                {
                  id: "agreement",
                  title: (
                    <Link href="#agreement">
                      {housing ? "Rental agreement" : "Purchase receipt"}
                    </Link>
                  ),
                  meta: <Badge variant="tag">Recorded</Badge>,
                },
                {
                  id: "cover",
                  title: (
                    <Link href="#cover">
                      {housing ? "Home cover" : "Service record"}
                    </Link>
                  ),
                  meta: <Badge variant="tag">Related</Badge>,
                },
              ]}
            />
            <Stack gap={16}>
              <Heading level={2} size="lead">
                Associated amounts
              </Heading>
              <Grid columns={2} gap={24}>
                <MetaList
                  items={[
                    {
                      term: housing ? "Rent and charges" : "Purchase",
                      details: (
                        <Value
                          value={housing ? 840 : 420}
                          unit={housing ? "EUR / month" : "EUR"}
                        />
                      ),
                    },
                  ]}
                />
                <MetaList
                  items={[
                    {
                      term: housing ? "Cover" : "Service",
                      details: (
                        <Value
                          value={housing ? 186 : 65}
                          unit={housing ? "EUR / year" : "EUR"}
                        />
                      ),
                    },
                  ]}
                />
              </Grid>
              <Text tone="muted">
                Different periods and incomplete records do not describe a total
                budget.
              </Text>
            </Stack>
            <Surface tone="inverse" padding={24} as="aside">
              <Stack gap={16}>
                <Text variant="mono">What changed</Text>
                <Heading level={2} size="lead">
                  {housing
                    ? "New cover takes over."
                    : "A recent service is recorded."}
                </Heading>
                <Text>
                  Compare the supporting records to understand the transition.
                </Text>
                <Link href="#changes" trailingIcon="chevron-right">
                  Understand the change
                </Link>
              </Stack>
            </Surface>
            <Stack gap={16}>
              <Heading level={2} size="lead">
                Milestones
              </Heading>
              <Timeline
                label="Record milestones"
                items={[
                  {
                    id: "start",
                    marker: "September 2024",
                    title: housing ? "Lease starts" : "Bicycle purchased",
                    children: (
                      <Link href="#first-source">Read the first record</Link>
                    ),
                  },
                  {
                    id: "update",
                    marker: "September 2026",
                    title: housing ? "New cover begins" : "Service completed",
                    children: (
                      <Link href="#latest-source">Read the latest record</Link>
                    ),
                  },
                ]}
              />
            </Stack>
          </Stack>
        )}
      </Stack>
    </AppShell>
  );
}
