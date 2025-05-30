import {
  ColumnDescriptor,
  TableConfig,
  ColumnTypeFormatting,
  ColumnSettingsProps,
} from "@vuu-ui/vuu-table-types";

import {
  CellRendererDescriptor,
  ColumnRenderPropsChangeHandler,
  getFieldName,
  getRegisteredCellRenderers,
  isValidColumnAlignment,
  isValidPinLocation,
  setCalculatedColumnName,
  updateColumnRenderProps,
  updateColumnFormatting,
  updateColumnType,
  queryClosest,
} from "@vuu-ui/vuu-utils";
import { VuuColumnDataType } from "@vuu-ui/vuu-protocol-types";
import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DataValueTypeSimple } from "@vuu-ui/vuu-data-types";

const integerCellRenderers: CellRendererDescriptor[] = [
  {
    description: "Default formatter for columns with data type integer",
    label: "Default Renderer (int, long)",
    name: "default-int",
  },
];
const doubleCellRenderers: CellRendererDescriptor[] = [
  {
    description: "Default formatter for columns with data type double",
    label: "Default Renderer (double)",
    name: "default-double",
  },
];

const stringCellRenderers: CellRendererDescriptor[] = [
  {
    description: "Default formatter for columns with data type string",
    label: "Default Renderer (string)",
    name: "default-string",
  },
];

const booleanCellRenderers: CellRendererDescriptor[] = [];

const getAvailableCellRenderers = (
  column: ColumnDescriptor,
): CellRendererDescriptor[] => {
  switch (column.serverDataType) {
    case "char":
    case "string":
      return stringCellRenderers.concat(getRegisteredCellRenderers("string"));
    case "int":
    case "long":
      return integerCellRenderers.concat(getRegisteredCellRenderers("int"));
    case "double":
      return doubleCellRenderers.concat(getRegisteredCellRenderers("double"));
    case "boolean":
      return booleanCellRenderers.concat(getRegisteredCellRenderers("boolean"));
    default:
      return stringCellRenderers;
  }
};

const getColumn = (columns: ColumnDescriptor[], column: ColumnDescriptor) => {
  if (column.name === "::") {
    // this is a new calculated column
    return column;
  } else {
    const col = columns.find((col) => col.name === column.name);
    if (col) {
      return col;
    }
    throw Error(`columns does not contain column ${name}`);
  }
};

const replaceColumn = (
  tableConfig: TableConfig,
  column: ColumnDescriptor,
): TableConfig => ({
  ...tableConfig,
  columns: tableConfig.columns.map((col) =>
    col.name === column.name ? column : col,
  ),
});

export const useColumnSettings = ({
  column: columnProp,
  onCancelCreateColumn,
  onConfigChange,
  onCreateCalculatedColumn,
  tableConfig,
}: Omit<ColumnSettingsProps, "vuuTable">) => {
  const [column, setColumn] = useState<ColumnDescriptor>(
    getColumn(tableConfig.columns, columnProp),
  );
  const columnRef = useRef<ColumnDescriptor>(column);
  const [inEditMode, setEditMode] = useState(column.name === "::");

  const handleEditCalculatedcolumn = useCallback(() => {
    columnRef.current = column;
    setEditMode(true);
  }, [column]);

  useEffect(() => {
    setColumn(columnProp);
    setEditMode(columnProp.name === "::");
  }, [columnProp]);

  const availableRenderers = useMemo(() => {
    return getAvailableCellRenderers(column);
  }, [column]);

  const handleInputCommit = useCallback(() => {
    onConfigChange(replaceColumn(tableConfig, column));
  }, [column, onConfigChange, tableConfig]);

  const handleChangeToggleButton = useCallback<FormEventHandler>(
    (evt) => {
      const button = queryClosest<HTMLButtonElement>(evt.target, "button");
      if (button) {
        const fieldName = getFieldName(button);
        const { value } = button;
        switch (fieldName) {
          case "column-alignment":
            if (isValidColumnAlignment(value)) {
              const newColumn: ColumnDescriptor = {
                ...column,
                align: value || undefined,
              };
              setColumn(newColumn);
              onConfigChange(replaceColumn(tableConfig, newColumn));
            }
            break;
          case "column-pin":
            if (isValidPinLocation(value)) {
              const newColumn: ColumnDescriptor = {
                ...column,
                pin: value || undefined,
              };
              setColumn(newColumn);
              onConfigChange(replaceColumn(tableConfig, newColumn));

              break;
            }
        }
      }
    },
    [column, onConfigChange, tableConfig],
  );

  const handleChange = useCallback<FormEventHandler>((evt) => {
    const input = evt.target as HTMLInputElement;
    const fieldName = getFieldName(input);
    const { value } = input;
    switch (fieldName) {
      case "column-label":
        setColumn((state) => ({ ...state, label: value }));
        break;
      case "column-name":
        setColumn((state) => setCalculatedColumnName(state, value));
        break;
      case "column-width":
        setColumn((state) => ({ ...state, width: parseInt(value) }));
        break;
    }
  }, []);

  const handleChangeCalculatedColumnName = useCallback((name: string) => {
    setColumn((state) => ({ ...state, name }));
  }, []);

  const handleChangeFormatting = useCallback(
    (formatting: ColumnTypeFormatting) => {
      const newColumn = updateColumnFormatting(column, formatting);
      setColumn(newColumn);
      onConfigChange(replaceColumn(tableConfig, newColumn));
    },
    [column, onConfigChange, tableConfig],
  );

  const handleChangeType = useCallback(
    (type: DataValueTypeSimple) => {
      const updatedColumn = updateColumnType(column, type);
      setColumn(updatedColumn);
      onConfigChange(replaceColumn(tableConfig, updatedColumn));
    },
    [column, onConfigChange, tableConfig],
  );

  // Changing the server data type applies only to calculated columns
  const handleChangeServerDataType = useCallback(
    (serverDataType: VuuColumnDataType) => {
      setColumn((col) => ({ ...col, serverDataType }));
    },
    [],
  );

  const handleChangeRendering = useCallback<ColumnRenderPropsChangeHandler>(
    (renderProps) => {
      if (renderProps) {
        const newColumn: ColumnDescriptor = updateColumnRenderProps(
          column,
          renderProps,
        );
        setColumn(newColumn);
        onConfigChange(replaceColumn(tableConfig, newColumn));
      }
    },
    [column, onConfigChange, tableConfig],
  );

  const navigateColumn = useCallback(
    ({ moveBy }: { moveBy: number }) => {
      const { columns } = tableConfig;
      const index = columns.indexOf(column) + moveBy;
      const newColumn = columns[index];
      if (newColumn) {
        setColumn(newColumn);
      }
    },
    [column, tableConfig],
  );
  const navigateNextColumn = useCallback(() => {
    navigateColumn({ moveBy: 1 });
  }, [navigateColumn]);

  const navigatePrevColumn = useCallback(() => {
    navigateColumn({ moveBy: -1 });
  }, [navigateColumn]);

  const handleSaveCalculatedColumn = useCallback(() => {
    // TODO validate expression, unique name
    onCreateCalculatedColumn(column);
  }, [column, onCreateCalculatedColumn]);

  const handleCancelEdit = useCallback(() => {
    if (columnProp.name === "::") {
      onCancelCreateColumn();
    } else {
      if (columnRef.current !== undefined && columnRef.current !== column) {
        setColumn(columnRef.current);
      }
      setEditMode(false);
    }
  }, [column, columnProp.name, onCancelCreateColumn]);

  return {
    availableRenderers,
    editCalculatedColumn: inEditMode,
    column,
    navigateNextColumn,
    navigatePrevColumn,
    onCancel: handleCancelEdit,
    onChange: handleChange,
    onChangeCalculatedColumnName: handleChangeCalculatedColumnName,
    onChangeFormatting: handleChangeFormatting,
    onChangeRendering: handleChangeRendering,
    onChangeServerDataType: handleChangeServerDataType,
    onChangeToggleButton: handleChangeToggleButton,
    onChangeType: handleChangeType,
    onEditCalculatedColumn: handleEditCalculatedcolumn,
    onInputCommit: handleInputCommit,
    onSave: handleSaveCalculatedColumn,
  };
};
