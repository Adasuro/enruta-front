import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { businessService } from '../../services/businessService';
import api from '../../../../config/api';
import { BusFront, Store, Map as MapIcon, Loader2, ArrowRight } from 'lucide-react';
import '../../../auth/presentation/pages/LoginPage.css'; // Reuse the login background

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
    <div className="login-container" style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <img src="/logo.webp" alt="EnRuta" style={{ height: '48px', marginBottom: '1.5rem', borderRadius: '8px', filter: 'brightness(0) invert(1)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Bienvenido a la Consola de EnRuta
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.125rem', marginTop: '0.5rem' }}>
            Para empezar, necesitamos registrar tu primer negocio. Podrás crear más después.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-gray-900)' }}>1. ¿Qué tipo de negocio deseas digitalizar?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {businessTypes.map((type) => (
                <div 
                  key={type.id}
                  onClick={() => !type.disabled && setFormData(prev => ({ ...prev, type: type.id }))}
                  style={{
                    padding: '1.5rem',
                    border: `2px solid ${formData.type === type.id ? 'var(--brand-primary)' : 'var(--color-gray-200)'}`,
                    borderRadius: '0.75rem',
                    cursor: type.disabled ? 'not-allowed' : 'pointer',
                    opacity: type.disabled ? 0.6 : 1,
                    position: 'relative',
                    transition: 'all 0.2s',
                    backgroundColor: formData.type === type.id ? 'var(--color-primary-50)' : 'white'
                  }}
                >
                  <div style={{ color: formData.type === type.id ? 'var(--brand-primary)' : 'var(--color-gray-500)', marginBottom: '1rem' }}>
                    {type.icon}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-gray-900)' }}>{type.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>{type.description}</p>
                  
                  {type.disabled && (
                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--color-gray-200)', color: 'var(--color-gray-600)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                      Próximamente
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-gray-900)' }}>2. Datos del Negocio</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>Nombre de la Empresa *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Transportes El Rápido S.A."
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-gray-300)', width: '100%', color: 'var(--color-gray-900)', backgroundColor: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>RUC (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="11 dígitos"
                    maxLength={11}
                    value={formData.ruc}
                    onChange={e => setFormData(prev => ({ ...prev, ruc: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-gray-300)', width: '100%', color: 'var(--color-gray-900)', backgroundColor: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>Ciudad de Operación *</label>
                <select 
                  required
                  value={formData.city_id}
                  onChange={e => setFormData(prev => ({ ...prev, city_id: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-gray-300)', width: '100%', backgroundColor: 'white', color: 'var(--color-gray-900)' }}
                >
                  <option value="" disabled>Selecciona una ciudad</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}, {city.region}</option>
                  ))}
                </select>
                {cities.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--color-orange-600)' }}>Atención: No hay ciudades activas en la base de datos.</p>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={loading || !formData.name || !formData.city_id}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.875rem 2rem', 
                    backgroundColor: 'var(--brand-primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0.5rem', 
                    fontWeight: 700, 
                    cursor: (loading || !formData.name || !formData.city_id) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !formData.name || !formData.city_id) ? 0.7 : 1
                  }}
                >
                  {loading ? <Loader2 className="spin" size={20} /> : 'Crear Negocio e Iniciar'}
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
