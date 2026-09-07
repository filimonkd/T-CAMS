import { useParams } from 'react-router-dom';
import WorkflowDetail from '../components/workflow/WorkflowDetail';

export default function ModuleDetailPage() {
  const { moduleKey } = useParams();
  return <WorkflowDetail moduleKey={moduleKey} />;
}
