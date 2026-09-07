import { useParams } from 'react-router-dom';
import WorkflowList from '../components/workflow/WorkflowList';

export default function ModuleListPage() {
  const { moduleKey } = useParams();
  return <WorkflowList moduleKey={moduleKey} />;
}
