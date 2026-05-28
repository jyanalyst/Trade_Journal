'use client';

import { useIdeas } from '../lib/IdeasContext';
import EditPanel from './EditPanel';

export default function EditPanelWrapper() {
  const { editing, setEditing, saveIdea, executeIdea, cancelIdea, deleteIdea } = useIdeas();
  if (!editing) return null;
  return (
    <EditPanel
      idea={editing}
      onSave={saveIdea}
      onClose={() => setEditing(null)}
      onExecute={executeIdea}
      onCancel={cancelIdea}
      onDelete={deleteIdea}
    />
  );
}
