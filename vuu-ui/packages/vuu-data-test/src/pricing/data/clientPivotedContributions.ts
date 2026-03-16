import contributions from "./contributions.json";
import clients from "./clients.json";
import { VuuDataRow } from "@vuu-ui/vuu-protocol-types";

const valuesPerFirm = (
  neg10: number,
  neg25: number,
  delta50: number,
  pos25: number,
  pos10: number,
) => {
  const values: VuuDataRow = [];
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
  return values;
};

// To start with, we're faking this data, just using the single client input as a template
const data: VuuDataRow[] = [];

for (const [
  ,
  product,
  series,
  neg10,
  neg25,
  delta50,
  pos25,
  pos10,
] of contributions) {
  data.push([
    `${product}_${series}`,
    product,
    series,
    ...valuesPerFirm(
      neg10 as number,
      neg25 as number,
      delta50 as number,
      pos25 as number,
      pos10 as number,
    ),
  ]);
}

export default data;
