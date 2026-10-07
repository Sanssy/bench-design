import { useState } from "react";
import { ActionCard } from "../action-card/ActionCard.js";
import { AppHeader } from "../app-header/AppHeader.js";
import { Avatar } from "../avatar/Avatar.js";
import { Badge } from "../badge/Badge.js";
import { CitationGroup } from "../citation-group/CitationGroup.js";
import { ConnectedList } from "../connected-list/ConnectedList.js";
import { Dialog } from "../dialog/Dialog.js";
import { Divider } from "../divider/Divider.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { Heading } from "../heading/Heading.js";
import { Icon } from "../icon/Icon.js";
import { IconButton } from "../icon-button/IconButton.js";
import { IconTile } from "../icon-tile/IconTile.js";
import { Inline } from "../inline/Inline.js";
import { Notice } from "../notice/Notice.js";
import { Page } from "../page/Page.js";
import { Stack } from "../stack/Stack.js";
import { Surface } from "../surface/Surface.js";
import { Tabs } from "../tabs/Tabs.js";
import { Text } from "../text/Text.js";
import { TextButton } from "../text-button/TextButton.js";
import { Timeline } from "../timeline/Timeline.js";
import { TopNav } from "../top-nav/TopNav.js";
import { Value } from "../value/Value.js";

import { type RecordDocument, RecordView } from "./RecordView.js";

/** A fictitious overview recipe; applications own data, routes and interpretation. */
export function Overview() {
  const [fact, setFact] = useState<Fact | null>(null);
  const [record, setRecord] = useState<SourceRecord | null>(null);
  const openEvidence = (selection: Fact) => {
    setRecord(null);
    setFact(selection);
  };
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
              <IconButton
                icon="link"
                label="Read person sources"
                onPress={() =>
                  openEvidence({
                    title: "Alex Morgan",
                    origin: "Connected",
                    description:
                      "The same person is named across these records.",
                    records: sourceRecords,
                  })
                }
              />
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
              content: <DomainOverview housing onEvidence={openEvidence} />,
            },
            {
              id: "vehicle",
              title: "Vehicle",
              icon: "bike",
              description: "Purchase and service",
              content: (
                <DomainOverview housing={false} onEvidence={openEvidence} />
              ),
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
      <Dialog
        placement="end"
        size="wide"
        isOpen={fact !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setFact(null);
        }}
        eyebrow={record ? record.kind : "From information to evidence"}
        title={record?.title ?? fact?.title ?? "Information"}
        meta={
          !record && fact ? (
            <Badge variant="outline">{fact.origin}</Badge>
          ) : undefined
        }
        description={!record ? fact?.description : undefined}
        {...(record
          ? {
              backLabel: "Back to the information and its sources",
              onBack: () => setRecord(null),
            }
          : {})}
      >
        {record ? (
          <RecordView
            key={record.id}
            document={record}
            initialFieldId={record.citedFieldId}
          />
        ) : fact ? (
          <Stack gap={24}>
            <Notice tone="neutral" title="Why these records are connected">
              {reasons[fact.origin]}
            </Notice>
            <Heading level={3} size="lead">
              Supporting records
            </Heading>
            {fact.records.map((source) => (
              <CitationGroup
                key={source.title}
                headingLevel={4}
                title={source.title}
                meta={source.meta}
                citations={[
                  {
                    id: source.title,
                    label: "Recorded passage",
                    locator: "Page 1",
                    quote:
                      source.fields.find(
                        (field) => field.id === source.citedFieldId,
                      )?.passage ?? "",
                    actionLabel: "Read this passage in the record",
                    onAction: () => setRecord(source),
                  },
                ]}
              />
            ))}
            <Text size="meta" tone="muted">
              Sample records and connections for demonstration.
            </Text>
          </Stack>
        ) : null}
      </Dialog>
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

const reasons: Record<Fact["origin"], string> = {
  Stated: "This value is written in the record below; nothing is inferred.",
  Connected:
    "These records name the same person, place or item, so they are read together. A shared name alone is not proof of identity.",
  Calculated:
    "This figure is calculated from the amounts recorded below; no single record states it.",
};
type SourceRecord = RecordDocument & {
  meta: string;
  citedFieldId: string;
};
type Fact = {
  title: string;
  origin: "Stated" | "Connected" | "Calculated";
  description: string;
  records: SourceRecord[];
};
const sourceRecords: SourceRecord[] = [
  {
    id: "rental",
    title: "Rental agreement",
    kind: "Agreement",
    date: "September 2024",
    meta: "Garden lettings · September 2024",
    summary:
      "Alex Morgan rents the Garden apartment from September 2024. Rent and charges: 840 EUR per month.",
    pages: 1,
    citedFieldId: "amount",
    fields: [
      {
        id: "person",
        label: "Tenant",
        value: "Alex Morgan",
        page: 1,
        passage: "The tenant is Alex Morgan.",
      },
      {
        id: "subject",
        label: "Home",
        value: "Garden apartment",
        page: 1,
        passage: "The rented home is the Garden apartment.",
      },
      {
        id: "amount",
        label: "Rent and charges",
        value: "840 EUR / month",
        page: 1,
        passage:
          "Alex Morgan rents the Garden apartment from September 2024. Rent and charges: 840 EUR per month.",
      },
    ],
  },
  {
    id: "cover",
    title: "Home cover",
    kind: "Cover record",
    date: "September 2026",
    meta: "Meadow cover · September 2026",
    summary:
      "Alex Morgan — Garden apartment. New cover begins September 2026, replacing cover begun September 2025, and ends August 2027. Annual premium: 186 EUR.",
    pages: 1,
    citedFieldId: "amount",
    fields: [
      {
        id: "person",
        label: "Policyholder",
        value: "Alex Morgan",
        page: 1,
        passage: "The policyholder is Alex Morgan.",
      },
      {
        id: "subject",
        label: "Cover period",
        value: "September 2026 – August 2027",
        page: 1,
        passage: "Cover runs from September 2026 to August 2027.",
      },
      {
        id: "amount",
        label: "Annual premium",
        value: "186 EUR / year",
        page: 1,
        passage:
          "Alex Morgan — Garden apartment. New cover begins September 2026, replacing cover begun September 2025, and ends August 2027. Annual premium: 186 EUR.",
      },
    ],
  },
  {
    id: "may-energy",
    title: "May energy statement",
    kind: "Energy statement",
    date: "May 2026",
    meta: "Garden energy · May 2026",
    summary:
      "Alex Morgan — Garden apartment. Energy charges for May: 71.20 EUR.",
    pages: 1,
    citedFieldId: "amount",
    fields: [
      {
        id: "person",
        label: "Customer",
        value: "Alex Morgan",
        page: 1,
        passage: "The customer is Alex Morgan.",
      },
      {
        id: "subject",
        label: "Billing period",
        value: "May 2026",
        page: 1,
        passage: "This statement covers May 2026.",
      },
      {
        id: "amount",
        label: "Energy charges",
        value: "71.20 EUR",
        page: 1,
        passage:
          "Alex Morgan — Garden apartment. Energy charges for May: 71.20 EUR.",
      },
    ],
  },
  {
    id: "august-energy",
    title: "August energy statement",
    kind: "Energy statement",
    date: "August 2026",
    meta: "Garden energy · August 2026",
    summary:
      "Alex Morgan — Garden apartment. Energy charges for August: 64.80 EUR.",
    pages: 1,
    citedFieldId: "amount",
    fields: [
      {
        id: "person",
        label: "Customer",
        value: "Alex Morgan",
        page: 1,
        passage: "The customer is Alex Morgan.",
      },
      {
        id: "subject",
        label: "Billing period",
        value: "August 2026",
        page: 1,
        passage: "This statement covers August 2026.",
      },
      {
        id: "amount",
        label: "Energy charges",
        value: "64.80 EUR",
        page: 1,
        passage:
          "Alex Morgan — Garden apartment. Energy charges for August: 64.80 EUR.",
      },
    ],
  },
  {
    id: "purchase",
    title: "Purchase receipt",
    kind: "Receipt",
    date: "September 2024",
    meta: "City cycles · September 2024",
    summary:
      "Alex Morgan purchased the City bicycle, reference CB-24, in September 2024 for 420 EUR.",
    pages: 1,
    citedFieldId: "amount",
    fields: [
      {
        id: "person",
        label: "Buyer",
        value: "Alex Morgan",
        page: 1,
        passage: "The buyer is Alex Morgan.",
      },
      {
        id: "subject",
        label: "Bicycle reference",
        value: "CB-24",
        page: 1,
        passage: "The City bicycle has reference CB-24.",
      },
      {
        id: "amount",
        label: "Purchase amount",
        value: "420 EUR",
        page: 1,
        passage:
          "Alex Morgan purchased the City bicycle, reference CB-24, in September 2024 for 420 EUR.",
      },
    ],
  },
  {
    id: "service",
    title: "Service record",
    kind: "Service record",
    date: "September 2026",
    meta: "City cycles · September 2026",
    summary:
      "Alex Morgan — City bicycle, reference CB-24. Service completed September 2026. Amount: 65 EUR.",
    pages: 1,
    citedFieldId: "amount",
    fields: [
      {
        id: "person",
        label: "Owner",
        value: "Alex Morgan",
        page: 1,
        passage: "The owner is Alex Morgan.",
      },
      {
        id: "subject",
        label: "Bicycle reference",
        value: "CB-24",
        page: 1,
        passage: "The serviced City bicycle has reference CB-24.",
      },
      {
        id: "amount",
        label: "Service amount",
        value: "65 EUR",
        page: 1,
        passage:
          "Alex Morgan — City bicycle, reference CB-24. Service completed September 2026. Amount: 65 EUR.",
      },
    ],
  },
];

function DomainOverview({
  housing,
  onEvidence,
}: {
  housing: boolean;
  onEvidence: (fact: Fact) => void;
}) {
  const records = sourceRecords.filter((_, index) =>
    housing ? index < 4 : index >= 4,
  );
  const sources = (id: string) =>
    id === "agreement"
      ? records.slice(0, 1)
      : id === "cover"
        ? records.slice(1, 2)
        : id === "bills"
          ? records.slice(2)
          : records;
  const show = (
    title: string,
    origin: Fact["origin"],
    description: string,
    selected = records,
  ) => onEvidence({ title, origin, description, records: selected });
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
        onPress={() =>
          show(
            housing ? "Garden apartment" : "City bicycle",
            "Connected",
            housing
              ? "Lease, cover and bills refer to the same home."
              : "Purchase and service records describe the same bicycle.",
          )
        }
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
              <TextButton
                onPress={() =>
                  show(
                    relation.name,
                    relation.id === "details" ? "Connected" : "Stated",
                    relation.detail,
                    sources(relation.id),
                  )
                }
                icon="link"
                trailingIcon="arrow-up-right"
                variant="meta"
                aria-label={`${sources(relation.id).length} source record${sources(relation.id).length > 1 ? "s" : ""} — ${relation.name}`}
              >
                {sources(relation.id).length} source record
                {sources(relation.id).length > 1 ? "s" : ""}
              </TextButton>
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
                <TextButton
                  onPress={() =>
                    show(
                      expense.label,
                      expense.source === "bills" ? "Calculated" : "Stated",
                      expense.note,
                      sources(expense.source),
                    )
                  }
                  aria-label={`${expense.source === "bills" ? "2 source records" : "1 source record"} — ${expense.label}`}
                  icon="link"
                  trailingIcon="arrow-up-right"
                  variant="meta"
                >
                  {expense.source === "bills"
                    ? "2 source records"
                    : "1 source record"}
                </TextButton>
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
          <TextButton
            onPress={() =>
              show(
                housing
                  ? "New cover takes over."
                  : "A recent service is recorded.",
                "Connected",
                "Compare the supporting records to understand the transition.",
                sources("cover"),
              )
            }
            trailingIcon="chevron-right"
          >
            Understand the change
          </TextButton>
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
            },
            ...(housing
              ? [
                  {
                    id: "previous",
                    marker: "September 2025",
                    title: "Previous cover begins",
                  },
                ]
              : []),
            {
              id: "update",
              marker: "September 2026",
              title: housing ? "New cover begins" : "Service completed",
            },
            ...(housing
              ? [
                  {
                    id: "end",
                    marker: "August 2027",
                    title: "Recorded cover ends",
                  },
                ]
              : []),
          ].map((event) => ({
            ...event,
            title: (
              <TextButton
                onPress={() =>
                  show(
                    event.title,
                    "Stated",
                    `${event.marker}: ${event.title}.`,
                    sources(event.id === "start" ? "agreement" : "cover"),
                  )
                }
                trailingIcon="arrow-up-right"
              >
                {event.title}
              </TextButton>
            ),
          }))}
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
