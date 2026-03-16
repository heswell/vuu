import { RpcMenuService, VuuModule } from "../core/module/VuuModule";
import { buildDataColumnMap, Table } from "../Table";
import tableContainer from "../core/table/TableContainer";
import { TableSchema } from "@vuu-ui/vuu-data-types";

import contributions from "./data/contributions";
import clientPivotedContributions from "./data/clientPivotedContributions";

import { buildClientColumns } from "./schemas/schema-utils";

export type PricingTableName = "contributions" | "client_pivot_contributions";

const MODULE = "PRICING";

class PricingModule extends VuuModule<PricingTableName> {
  #schemas: Readonly<Record<PricingTableName, Readonly<TableSchema>>> = {
    contributions: {
      columns: [
        { name: "id", serverDataType: "string" },
        { name: "firmId", serverDataType: "string" },
        { name: "productCode", serverDataType: "string" },
        { name: "series", serverDataType: "string" },
        { name: "delta_minus_10", serverDataType: "double" },
        { name: "delta_minus_25", serverDataType: "double" },
        { name: "delta_50", serverDataType: "double" },
        { name: "delta_plus_25", serverDataType: "double" },
        { name: "delta_plus_10", serverDataType: "double" },
      ],
      key: "id",
      table: { module: MODULE, table: "contributions" },
    },
    client_pivot_contributions: {
      columns: [
        { name: "id", serverDataType: "string" },
        { name: "productCode", serverDataType: "string" },
        { name: "series", serverDataType: "string" },
        ...buildClientColumns([
          { name: "delta_minus_10", serverDataType: "double" },
          { name: "delta_minus_25", serverDataType: "double" },
          { name: "delta_50", serverDataType: "double" },
          { name: "delta_plus_25", serverDataType: "double" },
          { name: "delta_plus_10", serverDataType: "double" },
        ]),
      ],
      key: "id",
      table: { module: MODULE, table: "client_pivot_contributions" },
    },
  };

  #tables: Record<PricingTableName, Table> = {
    contributions: tableContainer.createTable(
      this.#schemas.contributions,
      contributions,
      buildDataColumnMap(this.#schemas, "contributions"),
    ),
    client_pivot_contributions: tableContainer.createTable(
      this.#schemas.client_pivot_contributions,
      clientPivotedContributions,
      buildDataColumnMap(this.#schemas, "client_pivot_contributions"),
    ),
  };
  constructor() {
    super(MODULE);
  }

  get menus() {
    return undefined;
  }
  get services() {
    return undefined;
  }

  get menuServices():
    | Record<PricingTableName, RpcMenuService[] | undefined>
    | undefined {
    return undefined;
  }

  get schemas() {
    return this.#schemas;
  }

  get tables() {
    return this.#tables;
  }
  get visualLinks() {
    return undefined;
  }
}

export const pricingModule = new PricingModule();
