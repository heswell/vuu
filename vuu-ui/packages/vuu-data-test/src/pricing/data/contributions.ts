import contributions from "./contributions.json";
import { Clock } from "@vuu-ui/vuu-utils";
import firms from "./clients.json";
import { Table } from "../../Table";
import { VuuDataRow, VuuRowDataItemType } from "@vuu-ui/vuu-protocol-types";
import clients from "./clients.json";
import { random } from "../../data-utils";

export function loadInitialContributions(contributionsTable: Table) {
  const clock = new Clock({ year: 2026, month: 4, day: 1, hours: 9 });

  const timestamp = clock.now;

  for (const firm of firms) {
    for (const [
      _,
      product,
      series,
      neg10,
      neg25,
      delta50,
      pos25,
      pos10,
    ] of contributions) {
      contributionsTable.insert([
        `${firm}_${product}_${series}`,
        firm,
        product,
        series,
        neg10,
        neg25,
        delta50,
        pos25,
        pos10,
        timestamp,
        timestamp,
      ]);
    }
  }
}

export function addContributionToPivotTable(
  pivotTable: Table,
  row: VuuDataRow,
) {
  const [_key, _firm, product, series] = row;
  const key = `${product}_${series}`;
  const pivotRow = pivotTable.findByKey(key);
  if (pivotRow) {
    updatePivotRow(pivotTable, row);
  } else {
    insertPivotRow(pivotTable, row);
  }
}

type DeltaValues = [number, number, number, number, number];
type NullDeltaValues = ["", "", "", "", ""];
const NullEntries: NullDeltaValues = ["", "", "", "", ""];

function valuesPerFirm(
  [neg10, neg25, delta50, pos25, pos10]: DeltaValues | NullDeltaValues,
  includeEditCol = false,
) {
  const values: VuuDataRow = [];
  if (includeEditCol) {
    clients.forEach(() => {
      values.push(
        neg10,
        false,
        neg25,
        false,
        delta50,
        false,
        pos25,
        false,
        pos10,
        false,
      );
    });
  } else {
    clients.forEach(() => {
      values.push(neg10, neg25, delta50, pos25, pos10);
    });
  }
  return values;
}

function initializePivotRow(
  pivotTable: Table,
  product: VuuRowDataItemType,
  series: VuuRowDataItemType,
) {
  const pivotKey = `${product}_${series}`;
  const pivotRow = [
    pivotKey,
    product,
    series,
    ...valuesPerFirm([0, 0, 0, 0, 0], true),
    // previous days values
    ...valuesPerFirm(NullEntries),
    // next values
    ...valuesPerFirm(NullEntries),
  ];
  pivotTable.insert(pivotRow);
}

function insertPivotRow(pivotTable: Table, contribution: VuuDataRow) {
  const [_, _firm, product, series] = contribution;
  initializePivotRow(pivotTable, product, series);
  updatePivotRow(pivotTable, contribution);
}

function updatePivotRow(pivotTable: Table, contribution: VuuDataRow) {
  const [_, firm, product, series, neg10, neg25, delta50, pos25, pos10] =
    contribution;
  const dataMap = pivotTable.map;
  const pivotKey = `${product}_${series}`;
  const pivotRow = pivotTable.findByKey(pivotKey);

  pivotRow[dataMap[`${firm}_delta_minus_10`]] = neg10;
  pivotRow[dataMap[`${firm}_delta_minus_25`]] = neg25;
  pivotRow[dataMap[`${firm}_delta_50`]] = delta50;
  pivotRow[dataMap[`${firm}_delta_plus_25`]] = pos25;
  pivotRow[dataMap[`${firm}_delta_plus_10`]] = pos10;

  const [neg10_prev, neg25_prev, delta50_prev, pos25_prev, pos10_prev] =
    previousDayValues(
      neg10 as number,
      neg25 as number,
      delta50 as number,
      pos25 as number,
      pos10 as number,
    );

  pivotRow[dataMap[`${firm}_delta_minus_10_prev`]] = neg10_prev;
  pivotRow[dataMap[`${firm}_delta_minus_25_prev`]] = neg25_prev;
  pivotRow[dataMap[`${firm}_delta_50_prev`]] = delta50_prev;
  pivotRow[dataMap[`${firm}_delta_plus_25_prev`]] = pos25_prev;
  pivotRow[dataMap[`${firm}_delta_plus_10_prev`]] = pos10_prev;

  pivotTable.updateRow(pivotRow);
}

function previousDayValues(
  neg10: number,
  neg25: number,
  delta50: number,
  pos25: number,
  pos10: number,
) {
  const rando = random(0, 10);
  if (rando < 6) {
    // values unchanged
    return [neg10, neg25, delta50, pos25, pos10];
  } else if (rando < 8) {
    return increaseValues(neg10, neg25, delta50, pos25, pos10);
  } else {
    return decreaseValues(neg10, neg25, delta50, pos25, pos10);
  }
}

function increaseValues(
  neg10: number,
  neg25: number,
  delta50: number,
  pos25: number,
  pos10: number,
) {
  const increment = random(0.01, 0.03);
  return [
    neg10 + increment,
    neg25 + increment,
    delta50 + increment,
    pos25 + increment,
    pos10 + increment,
  ];
}
function decreaseValues(
  neg10: number,
  neg25: number,
  delta50: number,
  pos25: number,
  pos10: number,
) {
  const increment = random(0.01, 0.03);
  return [
    neg10 - increment,
    neg25 - increment,
    delta50 - increment,
    pos25 - increment,
    pos10 - increment,
  ];
}
