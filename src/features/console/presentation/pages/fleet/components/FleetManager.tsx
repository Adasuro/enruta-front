import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { Button, Input, Card, Modal } from '../../../../../../components/ui';
import { fleetService } from '../../../../services/fleetService';
import type { Fleet } from '../../../../services/fleetService';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { useNotification } from '../../../../../../hooks/useNotification';

export const FleetManager: React.FC = () => {
  const { activeBusinessId } = useAuth();
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color_code: '#3B82F6',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const { data: fleets = [], isLoading } = useQuery<Fleet[]>({
    queryKey: ['fleets', activeBusinessId],
    queryFn: async () => {
      if (!activeBusinessId) return [];
      return fleetService.getFleets(activeBusinessId);
    },
    enabled: !!activeBusinessId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Parameters<typeof fleetService.createFleet>[0]) => {
      return fleetService.createFleet(data);
    },
    onSuccess: () => {
      success('Flota creada exitosamente.', 'Operación Exitosa');
      queryClient.invalidateQueries({ queryKey: ['fleets', activeBusinessId] });
      handleClose();
    },
    onError: () => error('Error al crear la flota.', 'Error')
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string, payload: Parameters<typeof fleetService.updateFleet>[1] }) => {
      return fleetService.updateFleet(data.id, data.payload);
    },
    onSuccess: () => {
      success('Flota actualizada exitosamente.', 'Operación Exitosa');
      queryClient.invalidateQueries({ queryKey: ['fleets', activeBusinessId] });
      handleClose();
    },
    onError: () => error('Error al actualizar la flota.', 'Error')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fleetService.deleteFleet(id);
    },
    onSuccess: () => {
      success('Flota eliminada exitosamente.', 'Operación Exitosa');
      queryClient.invalidateQueries({ queryKey: ['fleets', activeBusinessId] });
    },
    onError: () => error('Error al eliminar la flota. Verifique si tiene vehículos asignados.', 'Error')
  });

  const handleClose = () => {
    setEditingFleet(null);
    setFormData({ name: '', color_code: '#3B82F6', status: 'ACTIVE' });
    setIsModalOpen(false);
  };

  const handleEdit = (fleet: Fleet) => {
    setEditingFleet(fleet);
    setFormData({
      name: fleet.name,
      color_code: fleet.color_code || '#3B82F6',
      status: fleet.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta flota? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusinessId) return;

    if (editingFleet) {
      updateMutation.mutate({
        id: editingFleet.id,
        payload: formData
      });
    } else {
      createMutation.mutate({
        business_id: activeBusinessId,
        ...formData
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="font-semibold">Cargando flotas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 m-0">Gestión de Flotas</h2>
          <p className="text-sm text-gray-500 m-0">Administra los grupos operativos de tus vehículos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
          Nueva Flota
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {fleets.map(fleet => (
          <Card key={fleet.id} bordered className="flex flex-col justify-between" style={{ borderTop: `4px solid ${fleet.color_code || '#cbd5e1'}` }}>
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 m-0">{fleet.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${fleet.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {fleet.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-sm text-gray-500 m-0 mt-2 flex items-center gap-1 font-medium">
                <ShieldAlert size={14}/> {fleet.vehicles_count || 0} vehículos asignados
              </p>
            </div>
            
            <div className="flex gap-2 border-t border-gray-100 pt-4 mt-auto">
              <Button variant="outline" size="sm" onClick={() => handleEdit(fleet)} className="flex-1">
                <Edit2 size={16} className="mr-2" /> Editar
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(fleet.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}

        {fleets.length === 0 && (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 font-medium">Aún no has creado ninguna flota.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleClose} 
        title={editingFleet ? 'Editar Flota' : 'Nueva Flota'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              isLoading={createMutation.isPending || updateMutation.isPending}
              disabled={!formData.name}
            >
              Guardar Flota
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input 
            label="Nombre de la Flota"
            placeholder="Ej. Flota Norte"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">Color Identificador</label>
            <input 
              type="color" 
              value={formData.color_code}
              onChange={(e) => setFormData({...formData, color_code: e.target.value})}
              className="w-full h-10 p-1 rounded-lg border border-gray-200 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">Estado</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
              className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-primary-500"
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};