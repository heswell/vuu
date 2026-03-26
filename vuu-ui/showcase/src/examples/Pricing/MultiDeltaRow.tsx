import { useTableContext } from "@vuu-ui/vuu-table-extras";
import {
  DataRow,
  RowProps,
  TableCellRendererProps,
} from "@vuu-ui/vuu-table-types";
import { Row } from "@vuu-ui/vuu-table/src/Row";
import { Icon } from "@vuu-ui/vuu-ui-controls";
import cx from "clsx";
import { MouseEventHandler, useCallback, useMemo } from "react";
import { ContributionValueCell } from "./ContributionValueCell";

import "./MultiDeltaRow.css";

const classBase = "MultiDeltaRow";

const allDeltasOmitted = (client: string, dataRow: DataRow) => {
  return (
    dataRow[`${client}_delta_minus_10_edited`] &&
    dataRow[`${client}_delta_minus_25_edited`] &&
    dataRow[`${client}_delta_50_edited`] &&
    dataRow[`${client}_delta_plus_25_edited`] &&
    dataRow[`${client}_delta_plus_10_edited`]
  );
};

const DeltaHeaderCell = ({ column, dataRow }: TableCellRendererProps) => {
  const { dataSource } = useTableContext();

  const client = column.name.slice(0, 3);
  const isOmitted = allDeltasOmitted(client, dataRow);

  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>(async () => {
    console.log(`[DeltaHeaderCell] click ${dataRow.key} ${column.name}`);
    const rpcResponse = await dataSource.rpcRequest?.({
      type: "RPC_REQUEST",
      rpcName: "omitAllDeltas",
      params: {
        client,
        data: !isOmitted,
        key: dataRow.key,
      },
    });
    console.log({ rpcResponse });
  }, [client, column.name, dataRow.key, dataSource, isOmitted]);

  return (
    <div
      className={cx("DeltaHeader", {
        [`DeltaHeader-omit`]: isOmitted,
      })}
      onClick={onClick}
    >
      <Icon name="cross-circle" />
      <span>All</span>
    </div>
  );
};
const DeltaLabel = () => {
  return (
    <div className="MultiDeltaLebels">
      <div className="MultiDeltaLabel">-10</div>
      <div className="MultiDeltaLabel">-25</div>
      <div className="MultiDeltaLabel">50</div>
      <div className="MultiDeltaLabel">+25</div>
      <div className="MultiDeltaLabel">+10</div>
    </div>
  );
};
const DeltaCell = ({ column, dataRow }: TableCellRendererProps) => {
  const client = column.name.slice(0, 3);

  // prettier-ignore
  return (
    <div className="MultiDeltaCells">
      <ContributionValueCell className="MultiDeltaCell" column={{...column, name: `${client}_delta_minus_10`}} dataRow={dataRow}/>
      <ContributionValueCell className="MultiDeltaCell" column={{...column, name: `${client}_delta_minus_25`}} dataRow={dataRow}/>
      <ContributionValueCell className="MultiDeltaCell" column={column} dataRow={dataRow}/>
      <ContributionValueCell className="MultiDeltaCell" column={{...column, name: `${client}_delta_plus_25`}} dataRow={dataRow}/>
      <ContributionValueCell className="MultiDeltaCell" column={{...column, name: `${client}_delta_plus_10`}} dataRow={dataRow}/>
    </div>
  );
};

export const MultiDeltaRow = ({
  "aria-rowindex": ariaRowIndex,
  columns,
  dataRow,
  offset,
  virtualColSpan = 0,
}: RowProps & { "aria-rowindex"?: number }) => {
  //   console.log({ row, offset, virtualColSpan });

  const headerRowColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      className: col.name === "series" ? undefined : "StaticTextCell",
      CellRenderer: col.name === "series" ? undefined : DeltaHeaderCell,
    }));
  }, [columns]);

  const deltaColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      CellRenderer: col.name === "series" ? DeltaLabel : DeltaCell,
    }));
  }, [columns]);

  return (
    <div
      aria-rowindex={ariaRowIndex}
      className={`vuuTableRow ${classBase}`}
      role="row"
      style={{ top: offset }}
    >
      <Row
        className="MultiDeltaHeader"
        columns={headerRowColumns}
        dataRow={dataRow}
        offset={0}
        searchPattern=""
      />
      <Row
        className="MultiDeltaData"
        columns={deltaColumns}
        dataRow={dataRow}
        offset={32}
        searchPattern=""
      />
    </div>
  );
};
