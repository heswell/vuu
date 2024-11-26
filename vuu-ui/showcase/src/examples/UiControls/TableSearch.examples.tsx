import { getSchema, LocalDataSourceProvider } from "@finos/vuu-data-test";
import { Flexbox } from "@finos/vuu-layout";
import {
  DragDropProvider,
  TableSearch,
  useDragDropProvider,
} from "@finos/vuu-ui-controls";
import type { DataSourceRow, TableSchema } from "@finos/vuu-data-types";
import type { GlobalDropHandler } from "@finos/vuu-ui-controls";
import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDataSource } from "@finos/vuu-utils";
import { VuuDataSourceProvider } from "@finos/vuu-data-react";
import { Table, TableProps } from "@finos/vuu-table";
import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
} from "@salt-ds/core";
import { TableConfig } from "@finos/vuu-table-types";

let displaySequence = 1;

const TableSearchTemplate = ({
  schema,
  TableProps = {
    config: {
      columns: [
        {
          name: "description",
          width: 200,
          type: {
            name: "string",
            renderer: {
              name: "search-cell",
            },
          },
        },
      ],
    },
  },
}: {
  schema: TableSchema;
  TableProps?: Omit<TableProps, "dataSource">;
}) => {
  const { VuuDataSource } = useDataSource();
  const dataSource = useMemo(() => {
    const { table } = schema;
    const dataSource = new VuuDataSource({
      columns: schema.columns.map((c) => c.name),
      table,
    });
    return dataSource;
  }, [VuuDataSource, schema]);

  return (
    <TableSearch
      TableProps={{ ...TableProps, dataSource }}
      autoFocus
      searchColumns={["description"]}
      style={{ height: 400, width: 250 }}
    />
  );
};

export const DefaultInstrumentSearch = () => {
  const schema = getSchema("instruments");
  return (
    <LocalDataSourceProvider modules={["SIMUL"]}>
      <TableSearchTemplate schema={schema} />
    </LocalDataSourceProvider>
  );
};

DefaultInstrumentSearch.displaySequence = displaySequence++;

export const InstrumentSearchVuuInstruments = () => {
  const schema = getSchema("instruments");
  return (
    <VuuDataSourceProvider>
      <TableSearchTemplate schema={schema} />;
    </VuuDataSourceProvider>
  );
};

InstrumentSearchVuuInstruments.displaySequence = displaySequence++;

type DropTargetProps = HTMLAttributes<HTMLDivElement>;
const DropTarget = ({ id, ...htmlAttributes }: DropTargetProps) => {
  const [instrument, setInstrument] = useState<DataSourceRow>();
  const { isDragSource, isDropTarget, register } = useDragDropProvider(id);

  console.log(
    `DropTarget isDragSource ${isDragSource} isDropTarget ${isDropTarget}`,
  );

  const acceptDrop = useCallback<GlobalDropHandler>((dragState) => {
    console.log({ payload: dragState.payload });
    setInstrument(dragState.payload as DataSourceRow);
  }, []);

  useEffect(() => {
    if (id && (isDragSource || isDropTarget)) {
      register(id, false, acceptDrop);
    }
  }, [acceptDrop, id, isDragSource, isDropTarget, register]);

  return (
    <div {...htmlAttributes} id={id} style={{ background: "yellow", flex: 1 }}>
      {instrument ? (
        <>
          <span>{instrument[8]}</span>
          <span> - </span>
          <span>{instrument[10]}</span>
        </>
      ) : null}
    </div>
  );
};

export const InstrumentSearchDragDrop = () => {
  const schema = getSchema("instruments");

  const dragSource = useMemo(
    () => ({
      "source-table": { dropTargets: "drop-target" },
    }),
    [],
  );

  const handleDragStart = useCallback(() => {
    console.log("DragStart");
  }, []);

  return (
    <LocalDataSourceProvider modules={["SIMUL"]}>
      <DragDropProvider dragSources={dragSource}>
        <Flexbox>
          <TableSearchTemplate
            schema={schema}
            TableProps={{
              allowDragDrop: "drag-copy",
              id: "source-table",
              onDragStart: handleDragStart,
            }}
          />
          <DropTarget id="drop-target" />
        </Flexbox>
      </DragDropProvider>
    </LocalDataSourceProvider>
  );
};

InstrumentSearchDragDrop.displaySequence = displaySequence++;

const EnhancedInstrumentSearch = () => {
  const { VuuDataSource } = useDataSource();
  const schema = getSchema("instruments");
  const pinnedConfig = useMemo<TableConfig>(
    () => ({
      columns: [{ name: "description", serverDataType: "string" }],
    }),
    [],
  );
  const pinnedDataSource = useMemo(
    () => new VuuDataSource({ table: schema.table }),
    [VuuDataSource, schema.table],
  );

  const searchTableProps = useMemo<Partial<TableProps>>(
    () => ({
      config: {
        columns: [
          { name: "description" },
          { name: "pinned", serverDataType: "boolean", width: 60 },
        ],
        columnLayout: "fit",
      },
    }),
    [],
  );
  return (
    <AccordionGroup>
      <Accordion
        className={"accordion"}
        defaultExpanded
        value={"mountains-and-hills"}
        id="1"
      >
        <AccordionHeader>Pinned Instruments</AccordionHeader>
        <AccordionPanel>
          <Table
            config={pinnedConfig}
            dataSource={pinnedDataSource}
            maxViewportRowLimit={10}
            showColumnHeaders={false}
          />
        </AccordionPanel>
      </Accordion>
      <Accordion
        className={"accordion"}
        defaultExpanded
        value={"mountains-and-hills"}
        id="1"
      >
        <AccordionHeader>Instrument Search</AccordionHeader>
        <AccordionPanel>
          <TableSearchTemplate schema={schema} TableProps={searchTableProps} />
        </AccordionPanel>
      </Accordion>
    </AccordionGroup>
  );
};

export const InstrumentSearchFavourites = () => {
  return (
    <LocalDataSourceProvider modules={["SIMUL"]}>
      <EnhancedInstrumentSearch />
    </LocalDataSourceProvider>
  );
};

InstrumentSearchFavourites.displaySequence = displaySequence++;
