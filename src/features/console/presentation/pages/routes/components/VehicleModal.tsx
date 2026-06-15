import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  Plus, Hash, Tag, 
  Calendar, Camera, 
  Upload, Navigation, X, Edit2
} from 'lucide-react';
import { Button, Input, Modal, Select } from '../../../../../../components/ui';
import { vehicleService } from '../../../../services/vehicleService';
import type { CreateVehicleDTO, Vehicle } from '../../../../services/vehicleService';
import { useNotification } from '../../../../../../hooks/useNotification';
import api from '../../../../../../config/api';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  editingVehicle?: Vehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, businessId, editingVehicle }) => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotification();
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';
  
  const [formData, setFormData] = useState({
    plate_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    status: 'active' as Vehicle['status'],
    soat: '',
    fleet_id: ''
  });

  const [photos, setPhotos] = useState<{
    front: File | null;
    side: File | null;
    sign: File | null;
  }>({
    front: null,
    side: null,
    sign: null
  });

  const [previews, setPreviews] = useState<{
    front: string | null;
    side: string | null;
    sign: string | null;
  }>({
    front: null,
    side: null,
    sign: null
  });

  // Populate data when editing
  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        plate_number: editingVehicle.plate_number,
        brand: editingVehicle.brand || '',
        model: editingVehicle.model_name || '',
        year: editingVehicle.year?.toString() || new Date().getFullYear().toString(),
        status: editingVehicle.status,
        soat: editingVehicle.soat || '',
        fleet_id: editingVehicle.fleet_id || ''
      });
      setPreviews({
        front: editingVehicle.photo_front ? `${STORAGE_URL}/${editingVehicle.photo_front}` : null,
        side: editingVehicle.photo_side ? `${STORAGE_URL}/${editingVehicle.photo_side}` : null,
        sign: editingVehicle.photo_sign ? `${STORAGE_URL}/${editingVehicle.photo_sign}` : null,
      });
    } else {
      setFormData({
        plate_number: '',
        brand: '',
        model: '',
        year: new Date().getFullYear().toString(),
        status: 'active',
        soat: '',
        fleet_id: ''
      });
      setPreviews({ front: null, side: null, sign: null });
    }
    setPhotos({ front: null, side: null, sign: null });
  }, [editingVehicle, isOpen, STORAGE_URL]);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);

  // Cargar flotas
  const { data: fleets = [] } = useQuery({
    queryKey: ['fleets', businessId],
    queryFn: async () => {
      const res = await api.get(`/v1/fleets?business_id=${businessId}`);
      return res.data;
    },
    enabled: isOpen && !!businessId
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateVehicleDTO) => {
      if (editingVehicle) {
        return vehicleService.updateVehicle(editingVehicle.id, data);
      }
      return vehicleService.createVehicle(data);
    },
    onSuccess: () => {
      success(
        editingVehicle ? 'Los datos de la unidad han sido actualizados.' : 'La unidad ha sido integrada a tu flota operativa.', 
        editingVehicle ? 'Vehículo Actualizado' : 'Vehículo Registrado'
      );
      queryClient.invalidateQueries({ queryKey: ['vehicles', businessId] });
      handleClose();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Hubo un problema al procesar la unidad.', 'Error de Operación');
    }
  });

  // Limpiar URLs creadas para previews (solo las que son de archivos nuevos)
  useEffect(() => {
    return () => {
      Object.entries(previews).forEach(([key, url]) => {
        // Solo revocar si el url empieza con blob: (es un archivo local nuevo)
        if (url?.startsWith('blob:') && !photos[key as keyof typeof photos]) {
           // wait, if it has a photo object it means it IS a blob we want to keep until close
        }
      });
    };
  }, [previews, photos]);

  const handleClose = () => {
    // Revoke local blobs
    Object.values(previews).forEach(url => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plate_number) return;
    
    mutation.mutate({
      business_id: businessId,
      plate_number: formData.plate_number.toUpperCase().trim(),
      brand: formData.brand || undefined,
      model_name: formData.model || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      status: formData.status,
      soat: formData.soat || undefined,
      fleet_id: formData.fleet_id || undefined,
      photo_front: photos.front || undefined,
      photo_side: photos.side || undefined,
      photo_sign: photos.sign || undefined
    });
  };

  const handlePhotoChange = (key: 'front' | 'side' | 'sign', file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => {
        if (prev[key]?.startsWith('blob:')) URL.revokeObjectURL(prev[key]!);
        return { ...prev, [key]: url };
      });
    }
  };

  const removePhoto = (key: 'front' | 'side' | 'sign', e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => {
      if (prev[key]?.startsWith('blob:')) URL.revokeObjectURL(prev[key]!);
      return { ...prev, [key]: null };
    });
    // Reset the input value
    if (key === 'front' && frontInputRef.current) frontInputRef.current.value = '';
    if (key === 'side' && sideInputRef.current) sideInputRef.current.value = '';
    if (key === 'sign' && signInputRef.current) signInputRef.current.value = '';
  };

  const renderPhotoUpload = (key: 'front' | 'side' | 'sign', label: string, desc: string, ref: React.RefObject<HTMLInputElement | null>) => {
    return (
      <div 
        onClick={() => ref.current?.click()}
        className={`group relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center h-32 overflow-hidden
          ${previews[key] ? 'border-primary-500 bg-white' : 'border-gray-200 hover:border-primary-400 bg-gray-50/50 hover:bg-primary-50/30'}
        `}
      >
        <input 
          type="file" 
          ref={ref as React.RefObject<HTMLInputElement>} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handlePhotoChange(key, e.target.files?.[0] || null)}
        />
        
        {previews[key] ? (
          <>
            <img src={previews[key]!} alt={label} className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload size={24} className="text-white" />
            </div>
            <button 
              type="button"
              onClick={(e) => removePhoto(key, e)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-white group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center text-gray-400 transition-all shadow-sm z-10">
                <Upload size={18} />
            </div>
            <div className="z-10">
                <span className="block text-[10px] font-black text-gray-700 uppercase">{label}</span>
                <span className="block text-[9px] text-gray-400 font-medium">{desc}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={editingVehicle ? "Editar Vehículo" : "Registrar Vehículo"}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            isLoading={mutation.isPending}
            disabled={!formData.plate_number || formData.plate_number.length < 6}
            leftIcon={editingVehicle ? <Edit2 size={18} /> : <Plus size={18} />}
          >
            {editingVehicle ? "Actualizar Cambios" : "Guardar Vehículo"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-primary-600">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Hash size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest m-0">1. Identidad Física</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-5">
                    <Input 
                        label="Placa de Rodaje"
                        placeholder="Ej. ABC-123"
                        value={formData.plate_number}
                        onChange={(e) => setFormData({...formData, plate_number: e.target.value.toUpperCase()})}
                        maxLength={7}
                        required
                        className="font-mono text-lg uppercase"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Input 
                        label="Marca"
                        placeholder="Ej. Toyota"
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        leftIcon={<Tag size={16} />}
                    />
                    <Input 
                        label="Modelo"
                        placeholder="Ej. Hiace"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                    />
                    <Input 
                        label="Año Fab."
                        type="number"
                        placeholder="2024"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        leftIcon={<Calendar size={16} />}
                    />
                </div>
            </section>

            <section className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-primary-600">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Navigation size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest m-0">2. Asignación a Flota</h3>
                </div>

                <Select 
                  label="Flota (Opcional)"
                  value={formData.fleet_id}
                  onChange={(e) => setFormData({...formData, fleet_id: e.target.value})}
                  options={[
                    { value: '', label: '-- Sin flota asignada --' },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...fleets.map((f: any) => ({ value: f.id, label: f.name }))
                  ]}
                />
            </section>
          </div>

          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-primary-600">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Camera size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest m-0">4. Registro Visual (Fachada)</h3>
                </div>
                <p className="text-xs text-gray-500 -mt-3">Sube las fotos reales de la unidad. El <strong>Letrero</strong> es vital para que el pasajero lo identifique en el mapa.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderPhotoUpload('front', 'Foto Frontal', 'Vehículo completo', frontInputRef)}
                    {renderPhotoUpload('sign', 'Foto del Letrero', 'Cartel o placa visible', signInputRef)}
                </div>
            </section>
          </div>
        </div>

      </form>
    </Modal>
  );
};