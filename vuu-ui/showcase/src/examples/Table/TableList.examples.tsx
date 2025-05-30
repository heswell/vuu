import { Table } from "@vuu-ui/vuu-table";
import { ArrayDataSource } from "@vuu-ui/vuu-data-local";
import { useMemo } from "react";
import { ColumnDescriptor } from "@vuu-ui/vuu-table-types";

export const DefaultTableList = () => {
  const [columns, dataSource] = useMemo(() => {
    const columns: ColumnDescriptor[] = [
      { name: "subscribed", label: "", width: 30 },
      { name: "column", label: "Column Subscription", width: 150 },
      { name: "visible", label: "Visibility", width: 40 },
    ];
    return [
      columns,
      new ArrayDataSource({
        columnDescriptors: columns,
        data: [
          [1, "item 1", "true"],
          [1, "item 2", "true"],
          [1, "item 3", "true"],
          [1, "item 4", "true"],
          [1, "item 5", "true"],
          [1, "item 6", "true"],
          [1, "item 7", "true"],
          [1, "item 8", "true"],
          [1, "item 9", "true"],
          [1, "item 10", "true"],
          [1, "item 11", "true"],
        ],
        rangeChangeRowset: "full",
      }),
    ];
  }, []);

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Table
        config={{
          columns,
        }}
        dataSource={dataSource}
        height={440}
        renderBufferSize={100}
        rowHeight={32}
        width={240}
      />
    </div>
  );
};
