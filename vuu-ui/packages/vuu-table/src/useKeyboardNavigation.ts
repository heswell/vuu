import { VuuRange } from "@finos/vuu-protocol-types";
import { PageKey, queryClosest } from "@finos/vuu-utils";
import { useControlled } from "@salt-ds/core";
import {
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { TableNavigationStyle } from "./Table";
import {
  NavigationKey,
  cellDropdownShowing,
  closestRowIndex,
  getTableCellPos,
  getNextCellPos,
} from "./table-dom-utils";
import { ScrollRequestHandler } from "./useTableScroll";
import { FocusCell } from "./useCellFocus";
import { CellFocusState, CellPos } from "@finos/vuu-table-types";

const rowNavigationKeys = new Set<NavigationKey>([
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "ArrowDown",
  "ArrowUp",
]);

const cellNavigationKeys = new Set(rowNavigationKeys);
cellNavigationKeys.add("ArrowLeft");
cellNavigationKeys.add("ArrowRight");

export const isNavigationKey = (
  key: string,
  navigationStyle: TableNavigationStyle,
): key is NavigationKey => {
  switch (navigationStyle) {
    case "cell":
      return cellNavigationKeys.has(key as NavigationKey);
    case "row":
      return rowNavigationKeys.has(key as NavigationKey);
    default:
      return false;
  }
};

const PageKeys = ["Home", "End", "PageUp", "PageDown"];
export const isPagingKey = (key: string): key is PageKey =>
  PageKeys.includes(key);

export interface NavigationHookProps {
  cellFocusStateRef: MutableRefObject<CellFocusState>;
  containerRef: RefObject<HTMLElement>;
  columnCount?: number;
  defaultHighlightedIndex?: number;
  disableFocus?: boolean;
  disableHighlightOnFocus?: boolean;
  focusCell: FocusCell;
  highlightedIndex?: number;
  label?: string;
  navigationStyle: TableNavigationStyle;
  viewportRange: VuuRange;
  onHighlight?: (idx: number) => void;
  requestScroll?: ScrollRequestHandler;
  restoreLastFocus?: boolean;
  rowCount?: number;
  selected?: unknown;
  viewportRowCount: number;
}

export const useKeyboardNavigation = ({
  cellFocusStateRef,
  columnCount = 0,
  containerRef,
  defaultHighlightedIndex,
  disableHighlightOnFocus,
  focusCell,
  highlightedIndex: highlightedIndexProp,
  navigationStyle,
  requestScroll,
  onHighlight,
  rowCount = 0,
  viewportRowCount,
}: NavigationHookProps) => {
  const focusedCellPos = useRef<CellPos>([-1, -1]);
  const activeCellPos = useRef<CellPos>([-1, 0]);
  // Keep this in sync with state value. This can be used by functions that need
  // to reference highlightedIndex at call time but do not need to be regenerated
  // every time it changes (i.e keep highlightedIndex out of their dependency
  // arrays, as it can update frequently)
  const highlightedIndexRef = useRef<number | undefined>();

  const [highlightedIndex, setHighlightedIdx] = useControlled({
    controlled: highlightedIndexProp,
    default: defaultHighlightedIndex,
    name: "UseKeyboardNavigation",
  });
  highlightedIndexRef.current = highlightedIndex;
  const setHighlightedIndex = useCallback(
    (idx: number) => {
      onHighlight?.(idx);
      setHighlightedIdx(idx);
    },
    [onHighlight, setHighlightedIdx],
  );

  const getFocusedCell = (element: HTMLElement | Element | null) =>
    element?.closest(
      "[role='columnHeader'],[role='cell']",
    ) as HTMLDivElement | null;

  const setActiveCell = useCallback(
    (rowIdx: number, colIdx: number, fromKeyboard = false) => {
      const pos: CellPos = [rowIdx, colIdx];
      // TODO do we still need this when we have cellFocusStateRef ?
      activeCellPos.current = pos;
      if (navigationStyle === "row") {
        setHighlightedIdx(rowIdx);
      } else {
        focusCell(pos, fromKeyboard);
      }
      if (fromKeyboard) {
        focusedCellPos.current = pos;
      }
    },
    [focusCell, navigationStyle, setHighlightedIdx],
  );

  const nextPageItemIdx = useCallback(
    (
      key: "PageDown" | "PageUp" | "Home" | "End",
      [rowIdx, colIdx]: CellPos,
    ): Promise<CellPos> =>
      new Promise((resolve) => {
        let newRowIdx = rowIdx;
        const { current: focusState } = cellFocusStateRef;
        switch (key) {
          case "PageDown": {
            newRowIdx = Math.min(rowCount - 1, rowIdx + viewportRowCount);
            if (newRowIdx !== rowIdx) {
              focusState.cellPos = [newRowIdx, colIdx];
              requestScroll?.({ type: "scroll-page", direction: "down" });
            }
            break;
          }
          case "PageUp": {
            newRowIdx = Math.max(0, rowIdx - viewportRowCount);
            if (newRowIdx !== rowIdx) {
              focusState.cellPos = [newRowIdx, colIdx];
              requestScroll?.({ type: "scroll-page", direction: "up" });
            }
            break;
          }
          case "Home": {
            newRowIdx = 0;
            if (newRowIdx !== rowIdx) {
              focusState.cellPos = [0, colIdx];
              requestScroll?.({ type: "scroll-end", direction: "home" });
            }
            break;
          }
          case "End": {
            newRowIdx = rowCount - 1;
            if (newRowIdx !== rowIdx) {
              focusState.cellPos = [newRowIdx, colIdx];
              requestScroll?.({ type: "scroll-end", direction: "end" });
            }
            break;
          }
        }
        // Introduce a delay to allow the scroll operation to complete,
        // which will trigger a range reset and rerender of rows. We
        // might need to tweak how this works. If we introduce too big
        // a delay, we risk seeing the newly rendered rows, with the focus
        // still on the old cell, which will be apparent as a brief flash
        // of the old cell focus before switching to correct cell. If we were
        // to change the way re assign keys such that we can guarantee that
        // when we page down, rows in same position get same keys, then same
        // cell would be focussed in new page as previous and issue would not
        // arise.
        setTimeout(() => {
          resolve([newRowIdx, colIdx]);
        }, 35);
      }),
    [requestScroll, rowCount, viewportRowCount],
  );

  const handleFocus = useCallback(() => {
    if (disableHighlightOnFocus !== true) {
      if (containerRef.current?.contains(document.activeElement)) {
        // IF focus arrives via keyboard, a cell will have received focus,
        // we handle that here. If focus arrives via click on a cell with
        // no tabindex (i.e all cells except one) we leave that to the
        // click handler.
        const focusedCell = getFocusedCell(document.activeElement);
        if (focusedCell) {
          focusedCellPos.current = getTableCellPos(focusedCell);
          if (navigationStyle === "row") {
            setHighlightedIdx(focusedCellPos.current[0]);
          }
        }
      }
    }
  }, [
    disableHighlightOnFocus,
    containerRef,
    navigationStyle,
    setHighlightedIdx,
  ]);

  const navigateChildItems = useCallback(
    async (key: NavigationKey) => {
      const [nextRowIdx, nextColIdx] = isPagingKey(key)
        ? await nextPageItemIdx(key, activeCellPos.current)
        : getNextCellPos(key, activeCellPos.current, columnCount, rowCount);
      const [rowIdx, colIdx] = activeCellPos.current;
      if (nextRowIdx !== rowIdx || nextColIdx !== colIdx) {
        setActiveCell(nextRowIdx, nextColIdx, true);
      }
    },
    [columnCount, nextPageItemIdx, rowCount, setActiveCell],
  );

  const scrollRowIntoViewIfNecessary = useCallback(
    (rowIndex: number) => {
      requestScroll?.({ type: "scroll-row", rowIndex });
    },
    [requestScroll],
  );

  const moveHighlightedRow = useCallback(
    async (key: NavigationKey) => {
      const { current: highlighted } = highlightedIndexRef;
      const [nextRowIdx] = isPagingKey(key)
        ? await nextPageItemIdx(key, [highlighted ?? -1, 0])
        : getNextCellPos(key, [highlighted ?? -1, 0], columnCount, rowCount);
      if (nextRowIdx !== highlighted) {
        setHighlightedIndex(nextRowIdx);
        // TO(DO make this a scroll request)
        scrollRowIntoViewIfNecessary(nextRowIdx);
      }
    },
    [
      columnCount,
      nextPageItemIdx,
      rowCount,
      scrollRowIntoViewIfNecessary,
      setHighlightedIndex,
    ],
  );

  useEffect(() => {
    if (highlightedIndexProp !== undefined && highlightedIndexProp !== -1) {
      requestAnimationFrame(() => {
        // deferred call, ensuring table has fully rendered
        scrollRowIntoViewIfNecessary(highlightedIndexProp);
      });
    }
  }, [highlightedIndexProp, scrollRowIntoViewIfNecessary]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const cell = queryClosest<HTMLDivElement>(e.target, ".vuuTableCell");
      if (cellDropdownShowing(cell)) {
        return;
      }
      if (rowCount > 0 && isNavigationKey(e.key, navigationStyle)) {
        e.preventDefault();
        e.stopPropagation();
        if (navigationStyle === "row") {
          moveHighlightedRow(e.key);
        } else {
          void navigateChildItems(e.key);
        }
      }
    },
    [rowCount, navigationStyle, moveHighlightedRow, navigateChildItems],
  );

  const handleClick = useCallback(
    // Might not be a cell e.g the Settings button
    (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      const focusedCell = getFocusedCell(target);
      if (focusedCell) {
        const [rowIdx, colIdx] = getTableCellPos(focusedCell);
        setActiveCell(rowIdx, colIdx);
      }
    },
    [setActiveCell],
  );

  const handleMouseLeave = useCallback(() => {
    setHighlightedIndex(-1);
  }, [setHighlightedIndex]);

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      const idx = closestRowIndex(evt.target as HTMLElement);
      if (idx !== -1 && idx !== highlightedIndexRef.current) {
        setHighlightedIndex(idx);
      }
    },
    [setHighlightedIndex],
  );

  const navigate = useCallback(() => {
    navigateChildItems("ArrowDown");
  }, [navigateChildItems]);

  return {
    highlightedIndexRef,
    navigate,
    onClick: handleClick,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    onMouseLeave: navigationStyle === "row" ? handleMouseLeave : undefined,
    onMouseMove: navigationStyle === "row" ? handleMouseMove : undefined,
  };
};
