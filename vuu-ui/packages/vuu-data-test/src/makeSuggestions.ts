import { DataItem } from "@vuu-ui/vuu-utils";
import { Table } from "./Table";

const cachedValues = new Map<Table, Map<string, DataItem[]>>();

const checkPattern = (value: string, pattern: string) => {
  return new RegExp(`^${pattern}`, "i").test(value);
};

const getUniqueValues = (table: Table, column: string, pattern = "") => {
  let uniqueValues;
  const cachedEntry = cachedValues.get(table);
  if (cachedEntry && cachedEntry.has(column)) {
    uniqueValues = cachedEntry.get(column) as DataItem[];
  } else {
    const { data, map } = table;
    const key = map[column];
    if (key === undefined) {
      throw Error(`table ${table.schema.table.table} has no column ${column}`);
    }
    uniqueValues = [];
    const set = new Set();
    for (const row of data) {
      const value = row[key];
      if (!set.has(value)) {
        set.add(value);
        uniqueValues.push(value);
      }
    }
    uniqueValues.sort();
    if (cachedEntry) {
      cachedEntry.set(column, uniqueValues);
    } else {
      cachedValues.set(table, new Map([[column, uniqueValues]]));
    }
  }
  return pattern
    ? uniqueValues
        // case insentitive regex
        // .filter((value) => value.toString().startsWith(pattern))
        .filter((value) => checkPattern(value.toString(), pattern))
        .slice(0, 10)
    : uniqueValues.slice(0, 10);
};

// export const makeSuggestions = (
//   table: Table,
//   column: string,
//   pattern?: string
// ) => {
//   const uniqueValues = getUniqueValues(table, column, pattern);
//   if (uniqueValues.length > 20) {
//     return uniqueValues?.slice(0, 20).map((v) => v.toString());
//   } else {
//     return uniqueValues.map((v) => v.toString());
//   }
// };
export const makeSuggestions = (
  table: Table,
  column: string,
  pattern?: string,
): Promise<string[]> =>
  new Promise((resolve) => {
    const uniqueValues = getUniqueValues(table, column, pattern);
    const result =
      uniqueValues.length > 20
        ? uniqueValues?.slice(0, 20).map((v) => v.toString())
        : uniqueValues.map((v) => v.toString());
    setTimeout(() => resolve(result), 100);
  });
