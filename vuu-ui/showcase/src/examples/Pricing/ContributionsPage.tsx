import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { pricingSchemas } from "@vuu-ui/vuu-data-test";
import { Table } from "@vuu-ui/vuu-table";
import {
  ColumnDescriptor,
  RowProps,
  TableConfig,
} from "@vuu-ui/vuu-table-types";
import { registerComponent, toColumnName, useData } from "@vuu-ui/vuu-utils";
import { FC, SyntheticEvent, useCallback, useMemo, useState } from "react";
import {
  delta50Columns,
  neg10Columns,
  neg25Columns,
  pos10Columns,
  pos25Columns,
} from "./ContributionColumns";
import { ContributionValueCell } from "./ContributionValueCell";
import { MultiDeltaRow } from "./MultiDeltaRow";

import "./ContributionsPage.css";

const classBase = "ContributionsPage";

type DeltaValue = "-10" | "-25" | "50" | "+25" | "+10" | "all";

registerComponent(
  "example.contribution-value",
  ContributionValueCell,
  "cell-renderer",
);

const deltaColumns: Record<DeltaValue, ColumnDescriptor[]> = {
  "-10": neg10Columns,
  "-25": neg25Columns,
  "50": delta50Columns,
  "+25": pos25Columns,
  "+10": pos10Columns,
  all: delta50Columns,
};

export const ContributionsPage = () => {
  const { VuuDataSource } = useData();

  const [delta, setDelta] = useState<DeltaValue>("50");
  const [product, setProduct] = useState<string>("CA");
  const [rowHeight, setRowHeight] = useState(36);
  const [CustomRow, setCustomRow] = useState<FC<RowProps> | undefined>(
    undefined,
  );
  const onChangeDelta = useCallback(
    (evt: SyntheticEvent<HTMLButtonElement>) => {
      const toggleButton = evt.target as HTMLButtonElement;
      const deltaValue = toggleButton.value as DeltaValue;
      setDelta(deltaValue);
      if (deltaValue === "all") {
        setCustomRow(() => MultiDeltaRow);
        setRowHeight(222);
      } else {
        setCustomRow(undefined);
        setRowHeight(36);
      }
    },
    [],
  );
  const onChangeProduct = useCallback(
    (evt: SyntheticEvent<HTMLButtonElement>) => {
      const toggleButton = evt.target as HTMLButtonElement;
      setProduct(toggleButton.value);
    },
    [],
  );

  const dataSource = useMemo(() => {
    const schema = pricingSchemas.client_pivot_contributions;
    const ds = new VuuDataSource({
      columns: schema.columns.map(toColumnName),
      filterSpec: { filter: 'productCode = "CA"' },
      table: schema.table,
    });
    return ds;
  }, [VuuDataSource]);

  useMemo(() => {
    const filter = `productCode = "${product}"`;
    if (dataSource.filter.filter !== filter) {
      dataSource.filter = { filter };
    }
  }, [dataSource, product]);

  const config = useMemo<TableConfig>(() => {
    const columns = deltaColumns[delta];

    return {
      columns: columns,
    };
  }, [delta]);

  return (
    <div className={classBase}>
      <div className={`${classBase}-toolbar`}>
        <ToggleButtonGroup value={product} onChange={onChangeProduct}>
          <ToggleButton value="AA">AA</ToggleButton>
          <ToggleButton value="AH">AH</ToggleButton>
          <ToggleButton value="CA">CA</ToggleButton>
          <ToggleButton value="NA">NA</ToggleButton>
          <ToggleButton value="NI">NI</ToggleButton>
          <ToggleButton value="PB">PB</ToggleButton>
          <ToggleButton value="SN">SN</ToggleButton>
          <ToggleButton value="ZS">ZS</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup value={delta} onChange={onChangeDelta}>
          <ToggleButton value="-10">-10</ToggleButton>
          <ToggleButton value="-25">-25</ToggleButton>
          <ToggleButton value="50">50</ToggleButton>
          <ToggleButton value="+25">+25</ToggleButton>
          <ToggleButton value="+10">+10</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className={`${classBase}-tableContainer`}>
        <Table
          Row={CustomRow}
          config={config}
          dataSource={dataSource}
          rowHeight={rowHeight}
          selectionModel="none"
        />
      </div>
      <div className={`${classBase}-tableFooter`}></div>
    </div>
  );
};
