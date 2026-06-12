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
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              width: '100%',
              maxWidth: '450px',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Añadir Vehículo</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>Registra una nueva unidad en tu flota</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                style={{ background: 'none', border: 'none', color: 'var(--color-gray-400)', cursor: 'pointer', padding: '0.25rem' }}
                className="hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Input
                label="Número de Placa"
                placeholder="Ej. ABC-123"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                maxLength={10}
                required
                style={{ textTransform: 'uppercase' }}
              />

              <div className="ui-input-wrapper">
                <label className="ui-input-label">Tipo de Vehículo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {(['bus', 'minibus', 'van', 'car'] as const).map(t => (
                    <div 
                      key={t}
                      onClick={() => setType(t)}
                      style={{ 
                        padding: '0.75rem', 
                        border: `2px solid ${type === t ? 'var(--brand-primary)' : 'var(--color-gray-200)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: type === t ? 'var(--brand-primary-light)' : 'white',
                        color: type === t ? 'var(--brand-primary)' : 'var(--color-gray-600)',
                        fontWeight: type === t ? 700 : 500,
                        transition: 'all 0.2s'
                      }}
                    >
                      {t === 'bus' ? 'Bus' : t === 'minibus' ? 'Coaster' : t === 'van' ? 'Minivan' : 'Auto/Colectivo'}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
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
