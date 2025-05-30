import { ThemeSwitch } from "@vuu-ui/vuu-shell";
import { ThemeMode } from "@vuu-ui/vuu-utils";
import { useCallback, useState } from "react";

export const DefaultThemeSwitch = () => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const handleChange = useCallback((mode: ThemeMode) => {
    setMode(mode);
  }, []);
  return (
    <div
      className="vuuToggleButtonExample"
      style={{
        display: "flex",
        height: 150,
        flexDirection: "column",
        justifyContent: "space-between",
        margin: "0 auto",
        width: "fit-content",
      }}
    >
      <ThemeSwitch mode={mode} onChange={handleChange} />
    </div>
  );
};
