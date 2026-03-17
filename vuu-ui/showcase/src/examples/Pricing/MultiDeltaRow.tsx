import { RowProps } from "@vuu-ui/vuu-table-types";
import { metadataKeys } from "@vuu-ui/vuu-utils";

import "./MultiDeltaRow.css";

const { COUNT, DEPTH, IDX, IS_EXPANDED, IS_LEAF, SELECTED } = metadataKeys;

export const MultiDeltaRow = ({
  "aria-rowindex": ariaRowIndex,
  row,
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
