import React, { useState } from 'react';
import { Bus, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '../../../../../../components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '../../../../services/vehicleService';
import type { CreateVehicleDTO } from '../../../../services/vehicleService';
import { useNotification } from '../../../../../../hooks/useNotification';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, businessId }) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState<'bus' | 'minibus' | 'van' | 'car'>('bus');
  const { success, error } = useNotification();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateVehicleDTO) => {
      return vehicleService.createVehicle(data);
    },
    onSuccess: () => {
      success('El vehículo se ha registrado correctamente en tu flota.', 'Vehículo Añadido');
      queryClient.invalidateQueries({ queryKey: ['vehicles', businessId] });
      handleClose();
    },
    onError: (err: any) => {
      console.error(err);
      error(err.response?.data?.message || 'Revisa que la placa no esté duplicada.', 'Error al registrar');
    }
  });

  const handleClose = () => {
    setPlateNumber('');
    setType('bus');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;
    
    createMutation.mutate({
      business_id: businessId,
      plate_number: plateNumber.toUpperCase().trim(),
      type,
      status: 'active' // Por defecto entra activo
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-[450px] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
                  <Bus size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-xl font-bold text-gray-900 tracking-tight">Añadir Vehículo</h3>
                  <p className="m-0 text-sm font-medium text-gray-500">Registra una nueva unidad en tu flota</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="bg-transparent border-none text-gray-400 cursor-pointer p-1 rounded-full transition-colors hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 bg-white">
              <Input
                label="Número de Placa"
                placeholder="Ej. ABC-123"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                maxLength={10}
                required
                className="uppercase"
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[0.875rem] font-bold text-gray-700 tracking-[0.01em]">Tipo de Vehículo</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['bus', 'minibus', 'van', 'car'] as const).map(t => (
                    <div 
                      key={t}
                      onClick={() => setType(t)}
                      className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 ${
                        type === t 
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-bold' 
                          : 'border-gray-200 bg-white text-gray-600 font-medium hover:border-primary-300'
                      }`}
                    >
                      {t === 'bus' ? 'Bus' : t === 'minibus' ? 'Coaster' : t === 'van' ? 'Minivan' : 'Auto/Colectivo'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <Button type="button" variant="outline" fullWidth onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth leftIcon={<Plus size={18} />} isLoading={createMutation.isPending}>
                  Registrar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
