import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/axios';
import { moduleConfig } from '../../config/moduleConfig';
import useTableControls from '../../hooks/useTableControls';
import cn from '../../utils/cn';
import StatusBadge from './StatusBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input, { Textarea } from '../ui/Input';
import Select from '../ui/Select';
import EmptyState from '../ui/EmptyState';
import Pagination from '../ui/Pagination';
import { SkeletonTable } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { Table, TableContainer, TBody, TD, TH, THead, TR } from '../ui/Table';
import {
  IconAlertCircle,
  IconArrowRight,
  IconInbox,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconX,
} from '../ui/icons';

function renderCellValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'object') {
    return value.name || value.code || value.title || value._id || JSON.stringify(value);
  }
  return String(value);
}

/**
 * Generic data table for any module/entity in moduleConfig.js - fetches
 * config.endpoint, renders config.listColumns, and (when the module has
 * formFields) a create form built from the same config, so no entity needs
 * its own bespoke list page.
 *
 * Search, status filter and pagination are applied client-side over the
 * fetched array (see hooks/useTableControls.js): the API exposes no query
 * parameters, so this adds UI capability without altering any request.
 */
export default function WorkflowList({ moduleKey }) {
  const config = moduleConfig[moduleKey];
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!config) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.get(config.endpoint);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Hooks must run before the early return below, so this tolerates a missing config.
  const controls = useTableControls(records, config?.listColumns || []);

  if (!config) {
    return (
      <Card>
        <EmptyState
          icon={IconAlertCircle}
          title="Unknown module"
          description={`No configuration exists for "${moduleKey}".`}
          action={
            <Button as="a" variant="outline" onClick={() => window.history.back()}>
              Go back
            </Button>
          }
        />
      </Card>
    );
  }

  async function handleCreate(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post(config.endpoint, formValues);
      setFormValues({});
      setShowCreateForm(false);
      toast.success(`${config.label} record created.`);
      await loadRecords();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const columnCount = config.listColumns.length + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            {config.label}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isLoading
              ? 'Loading records…'
              : `${controls.totalCount} record${controls.totalCount === 1 ? '' : 's'}`}
            {controls.isFiltered && !isLoading && ` · ${controls.filteredCount} matching`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="md"
            leadingIcon={IconRefresh}
            onClick={loadRecords}
            disabled={isLoading}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          {config.formFields.length > 0 && (
            <Button
              variant="primary"
              size="md"
              leadingIcon={showCreateForm ? IconX : IconPlus}
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm ? 'Cancel' : 'New record'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="min-w-0 break-words">{error}</p>
        </div>
      )}

      {showCreateForm && (
        <Card className="animate-scale-in">
          <form onSubmit={handleCreate}>
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                New {config.label.replace(/s$/, '')}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Fields marked with an asterisk are required.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {config.formFields.map((field) =>
                field.type === 'textarea' ? (
                  <Textarea
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    className="sm:col-span-2"
                    value={formValues[field.key] || ''}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                  />
                ) : (
                  <Input
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    type={field.type === 'ref' ? 'text' : field.type || 'text'}
                    hint={field.type === 'ref' ? 'Enter the referenced record ID.' : undefined}
                    value={formValues[field.key] || ''}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                  />
                ),
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save record'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {/* Filters sit in one row above the table. */}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={controls.search}
              onChange={(event) => controls.setSearch(event.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}…`}
              aria-label={`Search ${config.label}`}
              className="h-9 w-full rounded-control border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-subtle transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500"
            />
          </div>

          {controls.statusOptions.length > 0 && (
            <Select
              aria-label="Filter by status"
              value={controls.statusFilter}
              onChange={(event) => controls.setStatusFilter(event.target.value)}
              className="sm:w-48"
            >
              <option value="">All statuses</option>
              {controls.statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          )}

          {controls.isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={IconX}
              onClick={() => {
                controls.setSearch('');
                controls.setStatusFilter('');
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {isLoading ? (
          <SkeletonTable rows={6} columns={Math.min(columnCount, 5)} />
        ) : controls.rows.length === 0 ? (
          <EmptyState
            icon={controls.isFiltered ? IconSearch : IconInbox}
            title={controls.isFiltered ? 'No matching records' : 'No records yet'}
            description={
              controls.isFiltered
                ? 'Try a different search term or clear the status filter.'
                : `Nothing has been recorded for ${config.label.toLowerCase()} yet.`
            }
            action={
              controls.isFiltered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    controls.setSearch('');
                    controls.setStatusFilter('');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                config.formFields.length > 0 && (
                  <Button variant="primary" leadingIcon={IconPlus} onClick={() => setShowCreateForm(true)}>
                    Create the first one
                  </Button>
                )
              )
            }
          />
        ) : (
          <>
            {/*
              Below `sm` the table becomes a stacked list. Three-plus columns
              of enterprise data cannot be shrunk into a phone width and stay
              readable, so each record gets its own card with the columns as
              labelled pairs - an adaptation rather than a scaled-down table.
            */}
            <ul className="divide-y divide-slate-100 sm:hidden dark:divide-slate-800">
              {controls.rows.map((record) => {
                const [primaryColumn, ...restColumns] = config.listColumns;
                return (
                  <li key={record._id}>
                    <Link
                      to={`/modules/${moduleKey}/${record._id}`}
                      className="block px-5 py-4 transition-colors duration-200 active:bg-slate-50 dark:active:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 break-words text-sm font-medium text-slate-900 dark:text-white">
                          {primaryColumn ? renderCellValue(record[primaryColumn.key]) : record._id}
                        </p>
                        {record.status && <StatusBadge status={record.status} size="sm" />}
                      </div>

                      <dl className="mt-2.5 space-y-1.5">
                        {restColumns
                          .filter((col) => col.key !== 'status')
                          .map((col) => (
                            <div key={col.key} className="flex items-baseline gap-2 text-xs">
                              <dt className="shrink-0 text-slate-400 dark:text-slate-500">{col.label}</dt>
                              <dd className="min-w-0 break-words text-slate-600 dark:text-slate-300">
                                {renderCellValue(record[col.key])}
                              </dd>
                            </div>
                          ))}
                      </dl>

                      <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                        View details
                        <IconArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <TableContainer className="hidden sm:block">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent dark:hover:bg-transparent">
                    {config.listColumns.map((col) => (
                      <TH key={col.key}>{col.label}</TH>
                    ))}
                    <TH align="right">
                      <span className="sr-only">Actions</span>
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {controls.rows.map((record) => (
                    <TR key={record._id} className="group">
                      {config.listColumns.map((col, colIndex) => (
                        <TD
                          key={col.key}
                          className={cn(
                            colIndex === 0 && 'font-medium text-slate-900 dark:text-white',
                          )}
                        >
                          {col.key === 'status' ? (
                            <StatusBadge status={record[col.key]} />
                          ) : (
                            renderCellValue(record[col.key])
                          )}
                        </TD>
                      ))}
                      <TD align="right">
                        <Link
                          to={`/modules/${moduleKey}/${record._id}`}
                          className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-sm font-medium text-brand-600 transition-colors duration-200 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                        >
                          View
                          <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableContainer>

            <Pagination
              page={controls.page}
              pageCount={controls.pageCount}
              total={controls.filteredCount}
              pageSize={controls.pageSize}
              onPageChange={controls.setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
