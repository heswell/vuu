import { RowProps } from "@vuu-ui/vuu-table-types";
import { Row } from "@vuu-ui/vuu-table/src/Row";

import "./MultiDeltaRow.css";

const classBase = "MultiDeltaRow";

export const MultiDeltaRow = ({
  "aria-rowindex": ariaRowIndex,
  columns,
  dataRow,
  offset,
  virtualColSpan = 0,
}: RowProps & { "aria-rowindex"?: number }) => {
  //   console.log({ row, offset, virtualColSpan });
  return (
    <div
      aria-rowindex={ariaRowIndex}
      className={`vuuTableRow ${classBase}`}
      role="row"
      style={{ top: offset }}
    >
      <Row columns={columns} dataRow={dataRow} offset={0} searchPattern="" />
    </div>
  );
};
