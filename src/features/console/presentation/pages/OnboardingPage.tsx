import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { businessService } from '../../services/businessService';
import api from '../../../../config/api';
import { BusFront, Store, Map as MapIcon, Loader2, ArrowRight } from 'lucide-react';

interface City {
  id: string;
  name: string;
  region: string;
}

export const OnboardingPage: React.FC = () => {
  const { getUser } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'transport',
    city_id: '',
    ruc: '',
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get('/cities');
        setCities(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, city_id: response.data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city_id) return;
    
    setLoading(true);
    try {
      await businessService.createBusiness(formData);
      await getUser(); // Refetch user to get the new business
      navigate('/console');
    } catch (error) {
      console.error('Error creating business:', error);
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    {
      id: 'transport',
      title: 'Transporte',
      description: 'Gestiona rutas, flota y tarifas para buses y combis.',
      icon: <BusFront size={24} />,
      disabled: false,
    },
    {
      id: 'local_commerce',
      title: 'Comercio Local',
      description: 'Atrae clientes en tránsito cerca a tu local.',
      icon: <Store size={24} />,
      disabled: true,
    },
    {
      id: 'tourism_agency',
      title: 'Agencia Turística',
      description: 'Publica tours y servicios para visitantes.',
      icon: <MapIcon size={24} />,
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-800 p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        
        <header className="mb-12 text-center flex flex-col items-center">
          <img src="/logo.webp" alt="EnRuta" className="h-12 mb-6 rounded-lg brightness-0 invert" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white shadow-sm tracking-tight">
            Bienvenido a la Consola de EnRuta
          </h1>
          <p className="text-white/90 text-lg mt-2 font-medium">
            Para empezar, necesitamos registrar tu primer negocio. Podrás crear más después.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">1. ¿Qué tipo de negocio deseas digitalizar?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {businessTypes.map((type) => (
                <div 
                  key={type.id}
                  onClick={() => !type.disabled && setFormData(prev => ({ ...prev, type: type.id }))}
                  className={`p-6 border-2 rounded-xl relative transition-all duration-200 ${
                    type.disabled 
                      ? 'border-gray-200 opacity-60 cursor-not-allowed bg-gray-50' 
                      : formData.type === type.id 
                        ? 'border-primary-500 bg-primary-50 cursor-pointer shadow-sm ring-1 ring-primary-500/20' 
                        : 'border-gray-200 bg-white cursor-pointer hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`mb-4 ${formData.type === type.id ? 'text-primary-600' : 'text-gray-500'}`}>
                    {type.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2 text-gray-900">{type.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{type.description}</p>
                  
                  {type.disabled && (
                    <span className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                      Próximamente
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">2. Datos del Negocio</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Nombre de la Empresa *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Transportes El Rápido S.A."
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="p-3 rounded-lg border border-gray-300 w-full text-gray-900 bg-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">RUC (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="11 dígitos"
                    maxLength={11}
                    value={formData.ruc}
                    onChange={e => setFormData(prev => ({ ...prev, ruc: e.target.value }))}
                    className="p-3 rounded-lg border border-gray-300 w-full text-gray-900 bg-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Ciudad de Operación *</label>
                <select 
                  required
                  value={formData.city_id}
                  onChange={e => setFormData(prev => ({ ...prev, city_id: e.target.value }))}
                  className="p-3 rounded-lg border border-gray-300 w-full bg-white text-gray-900 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                >
                  <option value="" disabled>Selecciona una ciudad</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}, {city.region}</option>
                  ))}
                </select>
                {cities.length === 0 && <p className="text-xs text-orange-600 mt-1 font-medium">Atención: No hay ciudades activas en la base de datos.</p>}
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  type="submit" 
                  disabled={loading || !formData.name || !formData.city_id}
                  className={`flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white border-none rounded-lg font-bold transition-all shadow-sm ${
                    (loading || !formData.name || !formData.city_id) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Crear Negocio e Iniciar'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
