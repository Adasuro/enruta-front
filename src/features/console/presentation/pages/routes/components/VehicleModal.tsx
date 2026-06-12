import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  Plus, Hash, Tag, 
  Calendar, ShieldCheck, Camera, 
  Upload, Navigation, X
} from 'lucide-react';
import { Button, Input, Modal } from '../../../../../../components/ui';
import { vehicleService } from '../../../../services/vehicleService';
import type { CreateVehicleDTO } from '../../../../services/vehicleService';
import { useNotification } from '../../../../../../hooks/useNotification';
import api from '../../../../../../config/api';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, businessId }) => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotification();
  
  const [formData, setFormData] = useState({
    plate_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    status: 'active' as const,
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

  const createMutation = useMutation({
    mutationFn: async (data: CreateVehicleDTO) => {
      return vehicleService.createVehicle(data);
    },
    onSuccess: () => {
      success('La unidad ha sido integrada a tu flota operativa.', 'Vehículo Registrado');
      queryClient.invalidateQueries({ queryKey: ['vehicles', businessId] });
      handleClose();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Hubo un problema al registrar la unidad.', 'Error de Registro');
    }
  });

  // Limpiar URLs creadas para previews
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleClose = () => {
    setFormData({
      plate_number: '',
      brand: '',
      model: '',
      year: new Date().getFullYear().toString(),
      status: 'active',
      soat: '',
      fleet_id: ''
    });
    setPhotos({ front: null, side: null, sign: null });
    Object.values(previews).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setPreviews({ front: null, side: null, sign: null });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plate_number) return;
    
    createMutation.mutate({
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
        if (prev[key]) URL.revokeObjectURL(prev[key]!);
        return { ...prev, [key]: url };
      });
    }
  };

  const removePhoto = (key: 'front' | 'side' | 'sign', e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => {
      if (prev[key]) URL.revokeObjectURL(prev[key]!);
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
            <button 
              type="button"
              onClick={(e) => removePhoto(key, e)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
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
      title="Registrar Vehículo"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            isLoading={createMutation.isPending}
            disabled={!formData.plate_number || formData.plate_number.length < 6}
            leftIcon={<Plus size={18} />}
          >
            Guardar Vehículo
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

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Flota (Opcional)</label>
                    <select 
                      value={formData.fleet_id}
                      onChange={(e) => setFormData({...formData, fleet_id: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none hover:border-primary-300 focus:border-primary-500"
                    >
                      <option value="">-- Sin flota asignada --</option>
                      {fleets.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                </div>
            </section>
          </div>

          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-primary-600">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <ShieldCheck size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest m-0">3. Legal</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-5">
                    <Input 
                        label="Nro de SOAT"
                        placeholder="Ej. 123456789"
                        value={formData.soat}
                        onChange={(e) => setFormData({...formData, soat: e.target.value})}
                        leftIcon={<ShieldCheck size={16} />}
                    />
                </div>
            </section>

            <section className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-primary-600">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Camera size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest m-0">4. Registro Visual (Opcional)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {renderPhotoUpload('front', 'Frontal', 'Placa visible', frontInputRef)}
                    {renderPhotoUpload('side', 'Lateral', 'Perfil unidad', sideInputRef)}
                    {renderPhotoUpload('sign', 'Letrero', 'Cartel ruta', signInputRef)}
                </div>
            </section>
          </div>
        </div>

      </form>
    </Modal>
  );
};