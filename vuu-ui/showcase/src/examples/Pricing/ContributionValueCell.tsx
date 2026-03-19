import { TableCellProps } from "@vuu-ui/vuu-table-types";
import cx from "clsx";

import "./ContributionValueCell.css";
import { Icon } from "@vuu-ui/vuu-ui-controls";
import { MouseEventHandler, useCallback } from "react";
import { useTableContext } from "@vuu-ui/vuu-table-extras";

const classBase = "ContributionValueCell";

export const ContributionValueCell = ({ column, dataRow }: TableCellProps) => {
  const { name, valueFormatter } = column;
  const value = dataRow[name];
  const isOmitted = dataRow[`${name}_edited`];
  const className = cx(classBase, {});

  const { dataSource } = useTableContext();

  const onClick = useCallback<MouseEventHandler<HTMLDivElement>>(async () => {
    const rpcResponse = await dataSource.rpcRequest?.({
      type: "RPC_REQUEST",
      rpcName: "editCell",
      params: {
        column: `${column.name}_edited`,
        data: !isOmitted,
        key: dataRow.key,
      },
    });
    console.log({ rpcResponse });
  }, [dataSource, column.name, isOmitted, dataRow.key]);

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
