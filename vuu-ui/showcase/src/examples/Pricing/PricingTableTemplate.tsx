import { ContextMenuProvider } from "@vuu-ui/vuu-context-menu";
import { useVuuMenuActions } from "@vuu-ui/vuu-data-react";
import { pricingSchemas, PricingTableName } from "@vuu-ui/vuu-data-test";
import { Table, TableProps } from "@vuu-ui/vuu-table";
import {
  ColumnDescriptor,
  ColumnLayout,
  DefaultColumnConfiguration,
  TableContextMenuDef,
} from "@vuu-ui/vuu-table-types";
import {
  applyDefaultColumnConfig,
  toColumnName,
  useData,
} from "@vuu-ui/vuu-utils";
import { useCallback, useMemo } from "react";
import { DemoTableContainer } from "../Table/DemoTableContainer";
import { DataSourceStats } from "@vuu-ui/vuu-table-extras";

export type PricingTableProps = Partial<TableProps> & {
  columnLayout?: ColumnLayout;
  columns?: ColumnDescriptor[];
  getDefaultColumnConfig?: DefaultColumnConfiguration;
  rowClassNameGenerators?: string[];
  tableContextMenuHook?: () => TableContextMenuDef;
  tableName?: PricingTableName;
};

export const PricingTable = ({
  EmptyDisplay,
  columnLayout,
  columns: columnsProp,
  dataSource: dataSourceProp,
  getDefaultColumnConfig,
  height,
  renderBufferSize = 10,
  rowClassNameGenerators,
  tableContextMenuHook,
  tableName = "contributions",
  ...props
}: PricingTableProps) => {
  const { VuuDataSource } = useData();

  const useContextMenu = tableContextMenuHook ?? useVuuMenuActions;

  const tableSchema = pricingSchemas[tableName];

  const tableContainerStyle = { flex: "1 1 auto" };
  const footerContainerStyle = { flex: "0 0 32px" };

  const tableProps = useMemo<Pick<TableProps, "config" | "dataSource">>(
    () => ({
      config: {
        columnDefaultWidth: 150,
        columnLayout,
        columns:
          columnsProp ??
          applyDefaultColumnConfig(tableSchema, getDefaultColumnConfig, true),
        rowClassNameGenerators,
        rowSeparators: true,
        zebraStripes: true,
      },
      dataSource:
        dataSourceProp ??
        new VuuDataSource({
          columns: tableSchema.columns.map(toColumnName),
          table: tableSchema.table,
        }),
    }),
    [
      columnLayout,
      columnsProp,
      tableSchema,
      getDefaultColumnConfig,
      rowClassNameGenerators,
      dataSourceProp,
      VuuDataSource,
    ],
  );

  const handleConfigChange = useCallback(() => {
    // console.log(JSON.stringify(config, null, 2));
  }, []);

  const { menuBuilder, menuActionHandler } = useContextMenu({
    dataSource: tableProps.dataSource,
  });

  return (
    <>
      <ContextMenuProvider
        menuActionHandler={menuActionHandler}
        menuBuilder={menuBuilder}
      >
        <DemoTableContainer>
          <div className="DemoTableContainer-table" style={tableContainerStyle}>
            <Table
              {...tableProps}
              EmptyDisplay={EmptyDisplay}
              height={height}
              onConfigChange={handleConfigChange}
              renderBufferSize={renderBufferSize}
              {...props}
            />
          </div>
          <div
            className="DemoTableContainer-footer"
            style={footerContainerStyle}
          >
            <DataSourceStats dataSource={tableProps.dataSource} />
          </div>
        </DemoTableContainer>
      </ContextMenuProvider>
    </>
  );
};
