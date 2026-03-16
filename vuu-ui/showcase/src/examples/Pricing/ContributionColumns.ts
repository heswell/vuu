import {
  ColumnDescriptor,
  DataValueTypeDescriptor,
} from "@vuu-ui/vuu-table-types";

const clients = ["ABC", "DEF", "GHK", "IJK", "LMN", "OPQ", "RST", "UVW", "XYZ"];

const valueType: DataValueTypeDescriptor = {
  formatting: {
    alignOnDecimals: true,
  },
  name: "number",
  renderer: { name: "example.contribution-value" },
};

const baseColumns: Record<string, ColumnDescriptor> = {
  series: { name: "series", serverDataType: "string" },
  productCode: { name: "productCode", serverDataType: "string", width: 100 },
  neg10: {
    name: "delta_minus_10",
    serverDataType: "double",
    width: 100,
    type: valueType,
  },
  neg25: {
    name: "delta_minus_25",
    serverDataType: "double",
    width: 100,
    type: valueType,
  },
  delta50: {
    name: "delta_50",
    serverDataType: "double",
    width: 100,
    type: valueType,
  },
  pos25: {
    name: "delta_plus_25",
    serverDataType: "double",
    width: 100,
    type: valueType,
  },
  pos10: {
    name: "delta_plus_10",
    serverDataType: "double",
    width: 100,
    type: valueType,
  },
};

export const neg10Columns = clients.reduce<ColumnDescriptor[]>(
  (columns, client) => {
    const { name, ...rest } = baseColumns.neg10;
    columns.push({
      name: `${client}_${name}`,
      label: client,
      ...rest,
    });
    return columns;
  },
  [baseColumns.series],
);
export const neg25Columns = clients.reduce<ColumnDescriptor[]>(
  (columns, client) => {
    const { name, ...rest } = baseColumns.neg25;
    columns.push({
      name: `${client}_${name}`,
      label: client,
      ...rest,
    });
    return columns;
  },
  [baseColumns.series],
);
export const delta50Columns = clients.reduce<ColumnDescriptor[]>(
  (columns, client) => {
    const { name, ...rest } = baseColumns.delta50;
    columns.push({
      name: `${client}_${name}`,
      label: client,
      ...rest,
    });
    return columns;
  },
  [baseColumns.series],
);
export const pos25Columns = clients.reduce<ColumnDescriptor[]>(
  (columns, client) => {
    const { name, ...rest } = baseColumns.pos25;
    columns.push({
      name: `${client}_${name}`,
      label: client,
      ...rest,
    });
    return columns;
  },
  [baseColumns.series],
);
export const pos10Columns = clients.reduce<ColumnDescriptor[]>(
  (columns, client) => {
    const { name, ...rest } = baseColumns.pos10;
    columns.push({
      name: `${client}_${name}`,
      label: client,
      ...rest,
    });
    return columns;
  },
  [baseColumns.series],
);
