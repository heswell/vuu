import clients from "../data/clients.json";
import { SchemaColumn } from "@vuu-ui/vuu-data-types";

export const buildClientColumns = (
  repeatedColumns: readonly SchemaColumn[],
  addEditColumn = false,
): SchemaColumn[] => {
  const columns: SchemaColumn[] = [];
  for (const client of clients) {
    for (const { name, serverDataType } of repeatedColumns) {
      columns.push({
        name: `${client}_${name}`,
        serverDataType,
      });
      if (addEditColumn) {
        columns.push({
          name: `${client}_${name}_edited`,
          serverDataType: "boolean",
        });
      }
    }
  }

  return columns;
};
