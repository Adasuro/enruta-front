import React from 'react';
import { Edit2, Trash2, Settings2 } from 'lucide-react';

interface ActionGroupProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  isDeleting?: boolean;
  className?: string;
}

export const ActionGroup: React.FC<ActionGroupProps> = ({ 
  onEdit, 
  onDelete, 
  onSettings,
  isDeleting = false,
  className = ''
}) => {
  return (
    <div className={`flex gap-1 bg-gray-50/80 rounded-lg p-1 shrink-0 border border-gray-200/60 shadow-sm ${className}`}>
      {onSettings && (
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onSettings(); }}
          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-white rounded-md transition-colors hover:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          title="Configurar"
        >
          <Settings2 size={16} strokeWidth={2.5} />
        </button>
      )}
      
      {onEdit && (
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white rounded-md transition-colors hover:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          title="Editar"
        >
          <Edit2 size={16} strokeWidth={2.5} />
        </button>
      )}
      
      {onDelete && (
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isDeleting}
          className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-white rounded-md transition-colors hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-danger-500"
          title="Eliminar"
        >
          <Trash2 size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
