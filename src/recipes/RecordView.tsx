import { useEffect, useState } from "react";
import { ActionList } from "../action-list/ActionList.js";
import { Grid } from "../grid/Grid.js";
import { GridList } from "../grid-list/GridList.js";
import { Heading } from "../heading/Heading.js";
import { Inline } from "../inline/Inline.js";
import { Link } from "../link/Link.js";
import { Paper } from "../paper/Paper.js";
import { Stack } from "../stack/Stack.js";
import { Status } from "../status/Status.js";
import { Text } from "../text/Text.js";
import { TextButton } from "../text-button/TextButton.js";

export type RecordDocument = {
  id: string;
  title: string;
  kind: string;
  date: string;
  summary: string;
  pages: number;
  fields: {
    id: string;
    label: string;
    value: string;
    page: number;
    passage: string;
  }[];
};
export function RecordView({
  document,
  related = [],
  initialFieldId,
  onOpen,
  onFile,
}: {
  document: RecordDocument;
  related?: readonly RecordDocument[];
  /** Field whose passage is shown first, for example a cited passage. */
  initialFieldId?: string;
  onOpen?: (id: string) => void;
  onFile?: (kind: string) => void;
}) {
  const fields = document.fields;
  const [selectedId, setSelectedId] = useState(initialFieldId ?? fields[0]?.id);
  const selected = fields.find((field) => field.id === selectedId) ?? fields[0];
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 960px)");
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (!selected) return null;
  const content = (
    <>
      <Stack gap={16}>
        <Inline gap={16} justify="space-between">
          <Text variant="mono">Source passage</Text>
          <Text variant="mono">
            Page {selected.page} / {document.pages}
          </Text>
        </Inline>
        <Paper>
          <Stack gap={24}>
            {fields
              .filter((field) => field.page === selected.page)
              .map((field) => (
                <Stack key={field.id} gap={8}>
                  <Text variant="mono" size="meta">
                    PAGE {field.page} · {field.label.toUpperCase()}
                  </Text>
                  <Text>
                    {field.id === selected.id ? (
                      <mark>{field.passage}</mark>
                    ) : (
                      field.passage
                    )}
                  </Text>
                  {field.id === selected.id && (
                    <Text variant="mono" size="meta">
                      Selected passage
                    </Text>
                  )}
                </Stack>
              ))}
          </Stack>
        </Paper>
      </Stack>
      <Stack gap={24}>
        <Status tone="success" label="Document understood" />
        <Heading level={2}>The essentials.</Heading>
        <Text tone="muted">{document.summary}</Text>
        <GridList
          label="Document fields"
          items={fields}
          layout="list"
          itemVariant="ruled"
          selectionMode="single"
          selectedKeys={[selected.id]}
          onSelectionChange={(keys) => {
            if (keys[0]) setSelectedId(keys[0]);
          }}
          getItemLabel={(field) => field.label}
          renderItem={(field) => (
            <Stack gap={8}>
              <Text tone="muted" size="meta">
                {field.label}
              </Text>
              <Text>
                <strong>{field.value}</strong>
              </Text>
              <Text variant="mono" size="meta">
                View source · p. {field.page}
              </Text>
            </Stack>
          )}
        />
        {onFile && (
          <>
            <Text variant="mono">Filed in</Text>
            <TextButton onPress={() => onFile(document.kind)}>
              {document.kind}
            </TextButton>
          </>
        )}
        {related.length > 0 && onOpen && (
          <Stack gap={8}>
            <ActionList
              label="Related documents"
              items={related.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.date,
                trailingIcon: "arrow-right",
                onPress: () => onOpen?.(item.id),
              }))}
            />
          </Stack>
        )}
        <Link href="#ask" trailingIcon="arrow-up-right">
          Ask a question
        </Link>
      </Stack>
    </>
  );
  return wide ? (
    <Grid columns={2} gap={24}>
      {content}
    </Grid>
  ) : (
    <Stack gap={32}>{content}</Stack>
  );
}
