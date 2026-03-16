import { TableCellProps } from "@vuu-ui/vuu-table-types";
import cx from "clsx";

import "./ContributionValueCell.css";
import { Icon } from "@vuu-ui/vuu-ui-controls";
import { MouseEventHandler, useCallback } from "react";
import { useTableContext } from "@vuu-ui/vuu-table-extras";

const classBase = "ContributionValueCell";

export const ContributionValueCell = ({
  column,
  columnMap,
  row,
}: TableCellProps) => {
  const { name, valueFormatter } = column;
  const value = row[columnMap[name]];
  const isOmitted = row[columnMap[`${name}_edited`]];
  const className = cx(classBase, {});

  const { dataSource } = useTableContext();

  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>(async () => {
    const rpcResponse = await dataSource.rpcRequest?.({
      type: "RPC_REQUEST",
      rpcName: "editCell",
      params: {
        column: `${column.name}_edited`,
        data: !isOmitted,
        key: row[6],
      },
    });
    console.log({ rpcResponse });
  }, [column.name, dataSource, row]);

  return (
    <div
      className={cx(className, {
        [`${classBase}-omit`]: isOmitted,
      })}
      onClick={onClick}
      tabIndex={-1}
    >
      <Icon name="cross-circle" />
      <span>{valueFormatter(value)}</span>
    </div>
  );
};
