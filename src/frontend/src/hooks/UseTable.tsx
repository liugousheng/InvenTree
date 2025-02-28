import { randomId, useLocalStorage } from '@mantine/hooks';
import { useCallback, useMemo, useState } from 'react';

import { TableFilter } from '../tables/Filter';

/*
 * Type definition for representing the state of a table:
 *
 * tableKey: A unique key for the table. When this key changes, the table will be refreshed.
 * refreshTable: A callback function to externally refresh the table.
 * activeFilters: An array of active filters (saved to local storage)
 * selectedRecords: An array of selected records (rows) in the table
 * hiddenColumns: An array of hidden column names
 * searchTerm: The current search term for the table
 */
export type TableState = {
  tableKey: string;
  refreshTable: () => void;
  activeFilters: TableFilter[];
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setActiveFilters: (filters: TableFilter[]) => void;
  clearActiveFilters: () => void;
  expandedRecords: any[];
  setExpandedRecords: (records: any[]) => void;
  isRowExpanded: (pk: number) => boolean;
  selectedRecords: any[];
  selectedIds: number[];
  hasSelectedRecords: boolean;
  setSelectedRecords: (records: any[]) => void;
  clearSelectedRecords: () => void;
  hiddenColumns: string[];
  setHiddenColumns: (columns: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  recordCount: number;
  setRecordCount: (count: number) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  records: any[];
  setRecords: (records: any[]) => void;
  updateRecord: (record: any) => void;
  editable: boolean;
  setEditable: (value: boolean) => void;
};

/**
 * A custom hook for managing the state of an <InvenTreeTable> component.
 *
 * Refer to the TableState type definition for more information.
 */

export function useTable(tableName: string): TableState {
  // Function to generate a new ID (to refresh the table)
  function generateTableName() {
    return `${tableName.replaceAll('-', '')}-${randomId()}`;
  }

  const [tableKey, setTableKey] = useState<string>(generateTableName());

  // Callback used to refresh (reload) the table
  const refreshTable = useCallback(() => {
    setTableKey(generateTableName());
  }, [generateTableName]);

  // Array of active filters (saved to local storage)
  const [activeFilters, setActiveFilters] = useLocalStorage<TableFilter[]>({
    key: `inventree-table-filters-${tableName}`,
    defaultValue: [],
    getInitialValueInEffect: false
  });

  // Callback to clear all active filters from the table
  const clearActiveFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Array of expanded records
  const [expandedRecords, setExpandedRecords] = useState<any[]>([]);

  // Function to determine if a record is expanded
  const isRowExpanded = useCallback(
    (pk: number) => {
      return expandedRecords.includes(pk);
    },
    [expandedRecords]
  );

  // Array of selected records
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

  // Array of selected primary key values
  const selectedIds = useMemo(
    () => selectedRecords.map((r) => r.pk ?? r.id),
    [selectedRecords]
  );

  const clearSelectedRecords = useCallback(() => {
    setSelectedRecords([]);
  }, []);

  const hasSelectedRecords = useMemo(() => {
    return selectedRecords.length > 0;
  }, [selectedRecords]);

  // Total record count
  const [recordCount, setRecordCount] = useState<number>(0);

  // Pagination data
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // A list of hidden columns, saved to local storage
  const [hiddenColumns, setHiddenColumns] = useLocalStorage<string[]>({
    key: `inventree-hidden-table-columns-${tableName}`,
    defaultValue: []
  });

  // Search term
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Table records
  const [records, setRecords] = useState<any[]>([]);

  // Update a single record in the table, by primary key value
  const updateRecord = useCallback(
    (record: any) => {
      let _records = [...records];

      // Find the matching record in the table
      const index = _records.findIndex((r) => r.pk === record.pk);

      if (index >= 0) {
        _records[index] = record;
      } else {
        _records.push(record);
      }

      setRecords(_records);
    },
    [records]
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [editable, setEditable] = useState<boolean>(false);

  return {
    tableKey,
    refreshTable,
    isLoading,
    setIsLoading,
    activeFilters,
    setActiveFilters,
    clearActiveFilters,
    expandedRecords,
    setExpandedRecords,
    isRowExpanded,
    selectedRecords,
    selectedIds,
    setSelectedRecords,
    clearSelectedRecords,
    hasSelectedRecords,
    hiddenColumns,
    setHiddenColumns,
    searchTerm,
    setSearchTerm,
    recordCount,
    setRecordCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    records,
    setRecords,
    updateRecord,
    editable,
    setEditable
  };
}
