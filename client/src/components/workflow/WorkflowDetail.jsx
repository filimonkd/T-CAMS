import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/axios';
import { moduleConfig } from '../../config/moduleConfig';
import StatusBadge from './StatusBadge';
import ApprovalAction from './ApprovalAction';

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'object') {
    if (value.name || value.code || value.title) {
      return value.name || value.code || value.title;
    }
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Generic detail view for any module/entity - fetches the record plus its
 * complete AuditLog history from GET /api/audit/:entityType/:entityId
 * (added in Phase 8), renders every field generically, and exposes whatever
 * workflow actions the module declares.
 */
export default function WorkflowDetail({ moduleKey }) {
  const { id } = useParams();
  const config = moduleConfig[moduleKey];
  const [record, setRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!config) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const [recordRes, historyRes] = await Promise.all([
        api.get(`${config.endpoint}/${id}`),
        api.get(`/audit/${config.entityType}/${id}`).catch(() => ({ data: { history: [] } })),
      ]);
      setRecord(recordRes.data);
      setHistory(historyRes.data.history || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [config, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!config) {
    return <p className="text-sm text-red-600">Unknown module: {moduleKey}</p>;
  }
  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }
  if (error) {
    return <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }
  if (!record) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          {config.label} - {record.code || record._id}
        </h1>
        <StatusBadge status={record.status} />
      </div>

      <div className="rounded border border-slate-200 bg-white p-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(record)
            .filter(([key]) => !['__v', '_id'].includes(key))
            .map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{key}</dt>
                <dd className="text-sm text-slate-800">{formatValue(value)}</dd>
              </div>
            ))}
        </dl>
      </div>

      {config.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {config.actions.map((action) => (
            <ApprovalAction key={action.key} action={action} recordId={id} onDone={load} />
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Approval History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No recorded history yet.</p>
        ) : (
          <ol className="space-y-2 border-l-2 border-slate-200 pl-4">
            {history.map((entry) => (
              <li key={entry._id}>
                <p className="text-sm font-medium text-slate-800">
                  {entry.fromStatus} &rarr; {entry.toStatus}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(entry.occurredAt).toLocaleString()}
                  {entry.isoClause ? ` · ISO ${entry.isoClause}` : ''}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
