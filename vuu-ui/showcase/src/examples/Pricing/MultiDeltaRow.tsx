import { RowProps } from "@vuu-ui/vuu-table-types";

import "./MultiDeltaRow.css";
import { Row } from "@vuu-ui/vuu-table/src/Row";

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
      className="vuuTableRow MultiDeltaRow"
      role="row"
      style={{ top: offset }}
    >
      <Row columns={columns} dataRow={dataRow} offset={0} />
    </div>
  );
};
