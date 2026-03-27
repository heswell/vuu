import {
  RpcMenuService,
  RpcService,
  ServiceHandler,
  VuuModule,
} from "../core/module/VuuModule";
import { buildDataColumnMap, Table } from "../Table";
import tableContainer from "../core/table/TableContainer";
import { TableSchema } from "@vuu-ui/vuu-data-types";
import { buildClientColumns } from "./schemas/schema-utils";
import { VUU_TIMESTAMP_COLUMNS } from "../common/vuuTimestampColumns";
import {
  addContributionToPivotTable,
  loadInitialContributions,
} from "./data/contributions";

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
        ...VUU_TIMESTAMP_COLUMNS,
      ],
      key: "id",
      table: { module: MODULE, table: "contributions" },
    },
    client_pivot_contributions: {
      columns: [
        { name: "id", serverDataType: "string" },
        { name: "productCode", serverDataType: "string" },
        { name: "series", serverDataType: "string" },
        ...buildClientColumns(
          [
            { name: "delta_minus_10", serverDataType: "double" },
            { name: "delta_minus_25", serverDataType: "double" },
            { name: "delta_50", serverDataType: "double" },
            { name: "delta_plus_25", serverDataType: "double" },
            { name: "delta_plus_10", serverDataType: "double" },
          ],
          true,
        ),
        // Previous days values
        ...buildClientColumns([
          { name: "delta_minus_10_prev", serverDataType: "double" },
          { name: "delta_minus_25_prev", serverDataType: "double" },
          { name: "delta_50_prev", serverDataType: "double" },
          { name: "delta_plus_25_prev", serverDataType: "double" },
          { name: "delta_plus_10_prev", serverDataType: "double" },
        ]),
        // candidate entries, subsequent submissions, not yet accepted
        ...buildClientColumns([
          { name: "delta_minus_10_next", serverDataType: "double" },
          { name: "delta_minus_25_next", serverDataType: "double" },
          { name: "delta_50_next", serverDataType: "double" },
          { name: "delta_plus_25_next", serverDataType: "double" },
          { name: "delta_plus_10_next", serverDataType: "double" },
        ]),
      ],
      key: "id",
      table: { module: MODULE, table: "client_pivot_contributions" },
    },
  };

  #tables: Record<PricingTableName, Table> = {
    contributions: tableContainer.createTable(
      this.#schemas.contributions,
      [],
      buildDataColumnMap(this.#schemas, "contributions"),
    ),
    client_pivot_contributions: tableContainer.createTable(
      this.#schemas.client_pivot_contributions,
      [],
      buildDataColumnMap(this.#schemas, "client_pivot_contributions"),
    ),
  };
  constructor() {
    super(MODULE);

    const {
      contributions: contributionsTable,
      client_pivot_contributions: pivotTable,
    } = this.tables;
    contributionsTable.on("insert", (row) => {
      addContributionToPivotTable(pivotTable, row);
    });

    loadInitialContributions(contributionsTable);
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
