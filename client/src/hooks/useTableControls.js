import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

function stringifyCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return value.name || value.code || value.title || '';
  }
  return String(value);
}

/**
 * Client-side search, status filter and pagination over an already-fetched
 * array.
 *
 * The API returns whole collections with no query parameters (see
 * server/src/controllers/crudControllerFactory.js), so filtering here adds a
 * UI capability without changing any request the app makes. If server-side
 * paging is added later, this hook is the only place that has to change.
 */
export default function useTableControls(records, columns, { pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const statusOptions = useMemo(() => {
    const seen = new Set();
    for (const record of records) {
      if (record?.status) seen.add(record.status);
    }
    return Array.from(seen).sort();
  }, [records]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      if (statusFilter && record.status !== statusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      // Search the columns the table actually shows, so a hit is always
      // visible in the row it matched.
      return columns.some((column) => stringifyCell(record[column.key]).toLowerCase().includes(term));
    });
  }, [records, columns, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Narrowing the results can strand the viewer past the last page.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    statusOptions,
    page,
    setPage,
    pageCount,
    pageSize,
    filteredCount: filtered.length,
    totalCount: records.length,
    isFiltered: Boolean(search.trim() || statusFilter),
    rows: paginated,
  };
}
