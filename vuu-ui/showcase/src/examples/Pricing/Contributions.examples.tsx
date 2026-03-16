import { ColumnDescriptor } from "@vuu-ui/vuu-table-types";
import { PricingTable, type PricingTableProps } from "./PricingTableTemplate";
import { ContributionsPage } from "./ContributionsPage";

const getDefaultColumnConfig = (
  tableName: string,
  columnName: string,
): Partial<ColumnDescriptor> | undefined => {
  console.log(`getDefaultColumnConfig for ${tableName}, ${columnName}`);
  switch (columnName) {
    case "id":
      return {
        label: "ID",
        width: 120,
      };
    case "firmId":
      return {
        label: "Firm Id",
      };
    case "productCode":
      return {
        label: "Product Code",
        width: 120,
      };
  }
  return undefined;
};
/** tags=data-consumer */
export const ContributionsTable = (
  props: Omit<PricingTableProps, "tableName">,
) => (
  <PricingTable {...props} getDefaultColumnConfig={getDefaultColumnConfig} />
);

/** tags=data-consumer */
export const ClientPivotContributionsTable = (
  props: Omit<PricingTableProps, "tableName">,
) => (
  <PricingTable
    {...props}
    getDefaultColumnConfig={getDefaultColumnConfig}
    tableName="client_pivot_contributions"
  />
);

/** tags=data-consumer */
export const DefaultContributionsPage = () => <ContributionsPage />;
