import { ActionCard } from "../action-card/ActionCard.js";
import { AppHeader } from "../app-header/AppHeader.js";
import { Avatar } from "../avatar/Avatar.js";
import { Badge } from "../badge/Badge.js";
import { ConnectedList } from "../connected-list/ConnectedList.js";
import { Divider } from "../divider/Divider.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { Heading } from "../heading/Heading.js";
import { Icon } from "../icon/Icon.js";
import { IconTile } from "../icon-tile/IconTile.js";
import { Inline } from "../inline/Inline.js";
import { Link } from "../link/Link.js";
import { Notice } from "../notice/Notice.js";
import { Page } from "../page/Page.js";
import { Stack } from "../stack/Stack.js";
import { Surface } from "../surface/Surface.js";
import { Tabs } from "../tabs/Tabs.js";
import { Text } from "../text/Text.js";
import { Timeline } from "../timeline/Timeline.js";
import { TopNav } from "../top-nav/TopNav.js";
import { Value } from "../value/Value.js";

/** A fictitious overview recipe; applications own data, routes and interpretation. */
export function Overview() {
  return (
    <Page
      header={
        <AppHeader
          navigationAlign="center"
          brand={<Text variant="label">Sample collection</Text>}
          navigation={
            <TopNav
              rail={false}
              label="Main navigation"
              currentId="overview"
              items={[
                { id: "library", label: "Library", href: "#library", count: 6 },
                { id: "overview", label: "Overview", href: "#overview" },
                { id: "help", label: "Help", href: "#help" },
              ]}
            />
          }
          meta={
            <Inline gap={12}>
              <Text variant="mono">Demo space</Text>
              <Avatar name="Alex Morgan" tone="accent" />
            </Inline>
          }
        />
      }
      footer={
        <Inline justify="space-between" gap={24}>
          <Stack gap={8}>
            <Text variant="label">Sample collection</Text>
            <Text tone="muted">Records in perspective.</Text>
          </Stack>
          <Text variant="mono">Sample data · illustrative amounts</Text>
        </Inline>
      }
    >
      <Stack gap={48}>
        <Stack gap={12}>
          <Text variant="mono">02 / Take a step back</Text>
          <Heading level={1}>
            What you <em>own.</em>
          </Heading>
          <Text tone="muted">A few records, a wider perspective.</Text>
        </Stack>
        <Stack gap={16}>
          <Divider />
          <Inline justify="space-between" gap={24}>
            <Inline gap={16} align="center" wrap={false}>
              <Avatar name="Alex Morgan" tone="accent" size={40} isDecorative />
              <Stack gap={4}>
                <Text variant="label">Alex Morgan</Text>
                <Text tone="muted">The person connected to these records.</Text>
              </Stack>
              <Link href="#person-records" aria-label="Read person sources">
                <Icon name="link" />
              </Link>
            </Inline>
            <Text variant="mono">Fictitious collection / 6 sources</Text>
          </Inline>
          <Divider />
        </Stack>
        <Tabs
          label="Domains"
          orientation="vertical"
          listWidth="sidebar-width"
          stickyList
          variant="cards"
          listHeader={<Text variant="mono">In your life</Text>}
          listFooter={
            <Stack gap={16}>
              <Divider />
              <Icon name="link" />
              <Text>Each connection leads back to its supporting records.</Text>
              <Stack gap={4}>
                <Text size="meta" tone="muted">
                  Stated in a record
                </Text>
                <Text size="meta" tone="muted">
                  Connected across records
                </Text>
                <Text size="meta" tone="muted">
                  Calculated from amounts
                </Text>
              </Stack>
            </Stack>
          }
          items={[
            {
              id: "housing",
              title: "Housing",
              icon: "home",
              description: "Home and cover",
              content: <DomainOverview housing />,
            },
            {
              id: "vehicle",
              title: "Vehicle",
              icon: "bike",
              description: "Purchase and service",
              content: <DomainOverview housing={false} />,
            },
            {
              id: "work",
              title: "Work",
              icon: "briefcase",
              description: "Professional records",
              content: <EmptyDomain icon="briefcase" />,
            },
            {
              id: "health",
              title: "Health",
              icon: "heart",
              description: "Care and appointments",
              content: <EmptyDomain icon="heart" />,
            },
            {
              id: "finance",
              title: "Finance",
              icon: "wallet",
              description: "Accounts and savings",
              content: <EmptyDomain icon="wallet" />,
            },
          ]}
        />
      </Stack>
    </Page>
  );
}

function EmptyDomain({ icon }: { icon: "briefcase" | "heart" | "wallet" }) {
  return (
    <EmptyState
      variant="editorial"
      icon={icon}
      level={2}
      title="No records yet"
    >
      Add a record to begin exploring this part of your collection.
    </EmptyState>
  );
}

function DomainOverview({ housing }: { housing: boolean }) {
  const relations = housing
    ? [
        {
          id: "agreement",
          role: "Agreement",
          name: "Rental agreement",
          detail: "The recorded terms for this home.",
        },
        {
          id: "cover",
          role: "Protection",
          name: "Home cover",
          detail: "Cover refers to the same address.",
        },
        {
          id: "bills",
          role: "Utilities",
          name: "Energy statement",
          detail: "A statement linked to this home.",
        },
      ]
    : [
        {
          id: "agreement",
          role: "Ownership",
          name: "Purchase receipt",
          detail: "The original purchase is recorded.",
        },
        {
          id: "cover",
          role: "Maintenance",
          name: "Service record",
          detail: "The most recent service is recorded.",
        },
        {
          id: "details",
          role: "Identification",
          name: "Bicycle details",
          detail: "Details shared by the two sources.",
        },
      ];
  return (
    <Stack gap={32}>
      <Stack gap={12}>
        <Text variant="mono">{housing ? "01 / Housing" : "02 / Vehicle"}</Text>
        <Heading level={2} size="heading">
          {housing
            ? "One home, several connections."
            : "A vehicle and its records."}
        </Heading>
      </Stack>
      <ActionCard
        variant="editorial"
        tone="green"
        supportingText={housing ? "4 source records" : "2 source records"}
        title={housing ? "Garden apartment" : "City bicycle"}
        href={housing ? "#housing-record" : "#vehicle-record"}
        eyebrow={housing ? "Rental home" : "Personal transport"}
        description={
          housing
            ? "Lease, cover and bills refer to the same home."
            : "Purchase and service records describe the same bicycle."
        }
        media={
          <IconTile icon={housing ? "home" : "bike"} tone="green" size="sm" />
        }
      />
      <ConnectedList
        label="Related records"
        items={relations.map((relation) => ({
          id: relation.id,
          title: (
            <Stack gap={8}>
              <Text tone="muted">{relation.role}</Text>
              <Text variant="label">{relation.name}</Text>
            </Stack>
          ),
          meta: (
            <Stack gap={12}>
              <Text>{relation.detail}</Text>
              <Link
                href={`#${relation.id}`}
                icon="link"
                trailingIcon="arrow-up-right"
                variant="meta"
                aria-label={`${housing && relation.id === "bills" ? "2 source records" : "1 source record"} — ${relation.name}`}
              >
                {housing && relation.id === "bills"
                  ? "2 source records"
                  : "1 source record"}
              </Link>
            </Stack>
          ),
        }))}
      />
      <Stack gap={16}>
        <Heading level={3} size="lead">
          Associated amounts
        </Heading>
        {[
          {
            label: housing ? "Rent and charges" : "Purchase",
            amount: housing ? 840 : 420,
            unit: housing ? "EUR / month" : "EUR",
            note: housing
              ? "Monthly amount stated in the agreement."
              : "Amount stated on the receipt.",
            period: housing ? "Monthly" : "One-off",
            source: "agreement",
          },
          {
            label: housing ? "Cover" : "Service",
            amount: housing ? 186 : 65,
            unit: housing ? "EUR / year" : "EUR",
            note: housing
              ? "Annual premium stated in the cover record."
              : "Amount stated in the service record.",
            period: housing ? "Annual" : "One-off",
            source: "cover",
          },
          ...(housing
            ? [
                {
                  label: "Energy · latest known period",
                  amount: 64.8,
                  unit: "EUR / August",
                  note: "71.20 EUR in May: 6.40 EUR less between these two records.",
                  period: "Calculated",
                  source: "bills",
                },
              ]
            : []),
        ].map((expense) => (
          <Stack gap={16} key={expense.source}>
            <Divider />
            <Inline justify="space-between" align="start" gap={24}>
              <Stack gap={8}>
                <Text variant="label">{expense.label}</Text>
                <Value
                  mode="editorial"
                  value={expense.amount}
                  unit={expense.unit}
                />
                <Text tone="muted">{expense.note}</Text>
              </Stack>
              <Stack gap={12} align="end" mobileDirection="row">
                <Badge variant="outline">{expense.period}</Badge>
                <Link
                  href={`#${expense.source}`}
                  variant="meta"
                  icon="link"
                  trailingIcon="arrow-up-right"
                >
                  {expense.source === "bills"
                    ? "2 source records"
                    : "1 source record"}
                </Link>
              </Stack>
            </Inline>
          </Stack>
        ))}
        <Divider />
        <Text tone="muted">
          Different periods and incomplete records do not describe a total
          budget.
        </Text>
      </Stack>
      <Surface tone="inverse" padding={24} as="aside">
        <Stack gap={16}>
          <Text variant="mono">What changed</Text>
          <Heading level={3} size="lead">
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
          <Text size="meta">
            Source: {housing ? "Home cover" : "Service record"}
          </Text>
        </Stack>
      </Surface>
      <Stack gap={16}>
        <Heading level={3} size="lead">
          Milestones
        </Heading>
        <Text tone="muted">A sequence drawn from the available records.</Text>
        <Timeline
          label="Record milestones"
          layout="columns"
          items={[
            {
              id: "start",
              marker: "September 2024",
              title: housing ? "Lease starts" : "Bicycle purchased",
              href: "#first-source",
            },
            ...(housing
              ? [
                  {
                    id: "previous",
                    marker: "September 2025",
                    title: "Previous cover begins",
                    href: "#previous-source",
                  },
                ]
              : []),
            {
              id: "update",
              marker: "September 2026",
              title: housing ? "New cover begins" : "Service completed",
              href: "#latest-source",
            },
            ...(housing
              ? [
                  {
                    id: "end",
                    marker: "August 2027",
                    title: "Recorded cover ends",
                    href: "#latest-source",
                  },
                ]
              : []),
          ]}
        />
      </Stack>
      <Stack gap={16}>
        <Divider />
        <Notice tone="neutral" title="What these records do not say">
          These sources describe recorded events, not a complete inventory or a
          current valuation.
        </Notice>
      </Stack>
    </Stack>
  );
}
