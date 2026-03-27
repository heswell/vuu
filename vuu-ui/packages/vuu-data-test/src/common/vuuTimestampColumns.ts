import { SchemaColumn } from "@vuu-ui/vuu-data-types";

export const VUU_TIMESTAMP_COLUMNS: SchemaColumn[] = [
  { name: "vuuCreatedTimestamp", serverDataType: "epochtimestamp" },
  { name: "vuuUpdatedTimestamp", serverDataType: "epochtimestamp" },
];
