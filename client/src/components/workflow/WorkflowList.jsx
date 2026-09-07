import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/axios';
import { moduleConfig } from '../../config/moduleConfig';
import StatusBadge from './StatusBadge';

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
 * formFields) a togglable create form built from the same config, so no
 * entity needs its own bespoke list page.
 */
export default function WorkflowList({ moduleKey }) {
  const config = moduleConfig[moduleKey];
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

  if (!config) {
    return <p className="text-sm text-red-600">Unknown module: {moduleKey}</p>;
  }

  async function handleCreate(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post(config.endpoint, formValues);
      setFormValues({});
      setShowCreateForm(false);
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{config.label}</h1>
        {config.formFields.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            {showCreateForm ? 'Cancel' : 'New'}
          </button>
        )}
      </div>

      {error && <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 grid grid-cols-1 gap-3 rounded border border-slate-200 bg-white p-4 sm:grid-cols-2"
        >
          {config.formFields.map((field) => (
            <label key={field.key} className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  value={formValues[field.key] || ''}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  required={field.required}
                  className="rounded border border-slate-300 px-2 py-1"
                  rows={3}
                />
              ) : (
                <input
                  type={field.type === 'ref' ? 'text' : field.type || 'text'}
                  value={formValues[field.key] || ''}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  required={field.required}
                  className="rounded border border-slate-300 px-2 py-1"
                />
              )}
            </label>
          ))}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {config.listColumns.map((col) => (
                  <th key={col.key} className="px-3 py-2 text-left font-medium text-slate-600">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 && (
                <tr>
                  <td colSpan={config.listColumns.length + 1} className="px-3 py-4 text-center text-slate-400">
                    No records.
                  </td>
                </tr>
              )}
              {records.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50">
                  {config.listColumns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-slate-700">
                      {col.key === 'status' ? <StatusBadge status={record[col.key]} /> : renderCellValue(record[col.key])}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <Link to={`/modules/${moduleKey}/${record._id}`} className="text-sm font-medium text-sky-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
