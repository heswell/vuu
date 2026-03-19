import { RowProps } from "@vuu-ui/vuu-table-types";

import "./MultiDeltaRow.css";

export const MultiDeltaRow = ({
  "aria-rowindex": ariaRowIndex,
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
    ></div>
  );
};
