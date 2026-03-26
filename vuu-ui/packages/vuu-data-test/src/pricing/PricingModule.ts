import {
  RpcMenuService,
  RpcService,
  ServiceHandler,
  VuuModule,
} from "../core/module/VuuModule";
import { buildDataColumnMap, Table } from "../Table";
import tableContainer from "../core/table/TableContainer";
import { TableSchema } from "@vuu-ui/vuu-data-types";
import contributions from "./data/contributions";
import clientPivotedContributions from "./data/clientPivotedContributions";
import { buildClientColumns } from "./schemas/schema-utils";

export type PricingTableName = "contributions" | "client_pivot_contributions";

const undefinedTables = {
  contributions: undefined,
  client_pivot_contributions: undefined,
};

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

  omitAllDeltasForClientSeries: ServiceHandler = async (rpcRequest) => {
    if (rpcRequest.context.type === "VIEWPORT_CONTEXT") {
      const { viewPortId } = rpcRequest.context;
      const { client, data, key } = rpcRequest.params;

      const { dataSource } = this.getSubscriptionByViewport(viewPortId);
      if (dataSource.table) {
        const targetTable =
          this.tables[dataSource.table.table as PricingTableName];
        if (targetTable) {
          console.log(`update table`);

          targetTable.update(
            key as string,
            `${client}_delta_minus_10_edited`,
            data,
          );
          targetTable.update(
            key as string,
            `${client}_delta_minus_25_edited`,
            data,
          );
          targetTable.update(key as string, `${client}_delta_50_edited`, data);
          targetTable.update(
            key as string,
            `${client}_delta_plus_25_edited`,
            data,
          );
          targetTable.update(
            key as string,
            `${client}_delta_plus_10_edited`,
            data,
          );
        }
      }

      console.log(
        `omitAllDeltasForClientSeries viewport ${viewPortId} ${client} ${key}`,
      );
      return {
        type: "SUCCESS_RESULT",
        data: undefined,
      };
    }

    return {
      type: "ERROR_RESULT",
      errorMessage: "didn't work",
    };
  };

  get menus() {
    return undefined;
  }
  get services():
    | Record<PricingTableName, RpcService[] | undefined>
    | undefined {
    return {
      ...undefinedTables,
      client_pivot_contributions: [
        {
          rpcName: "omitAllDeltas",
          service: this.omitAllDeltasForClientSeries,
        },
      ],
    };
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
