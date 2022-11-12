import React from "react";
import ReactDOM from "react-dom";
import { AppRoutes } from "./AppRoutes";
import * as stories from "./examples";

ReactDOM.render(
  <AppRoutes stories={stories} />,
  document.getElementById("root")
);
