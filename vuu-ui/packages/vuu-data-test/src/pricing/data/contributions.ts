import { VuuDataRow } from "@vuu-ui/vuu-protocol-types";
import contributions from "./contributions.json";

const data: VuuDataRow[] = [];

for (const [
  firm,
  product,
  series,
  neg10,
  neg25,
  delta50,
  pos25,
  pos10,
] of contributions) {
  data.push([
    `${firm}_${product}_${series}`,
    firm,
    product,
    series,
    neg10,
    neg25,
    delta50,
    pos25,
    pos10,
  ]);
}

export default data;
