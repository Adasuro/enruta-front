import React from 'react';
import { Bus, Route as RouteIcon, TrendingUp, Users } from 'lucide-react';
import { Card } from '../../../../components/ui';

interface B2BTransportDashboardProps {
  businessName: string;
}

export const B2BTransportDashboard: React.FC<B2BTransportDashboardProps> = ({ businessName }) => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--color-gray-900)' }}>
          Monitor de Operaciones
        </h1>
        <p style={{ color: 'var(--color-gray-600)', margin: 0, fontSize: '1.125rem' }}>
          Vista general para <strong>{businessName}</strong>
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card bordered padding="lg" elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bus size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem', fontWeight: 600 }}>Flota Operativa</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>--</h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-success)', fontWeight: 600 }}>Vehículos en ruta hoy</p>
        </Card>

        <Card bordered padding="lg" elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RouteIcon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem', fontWeight: 600 }}>Rutas Activas</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>--</h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>Circuitos operando</p>
        </Card>

        <Card bordered padding="lg" elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem', fontWeight: 600 }}>Incidentes Reportados</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>0</h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>En las últimas 24 hrs</p>
        </Card>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)', padding: '2rem', textAlign: 'center' }}>
        <Users size={48} color="var(--color-gray-300)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Próximamente: Analítica Avanzada</h3>
        <p style={{ color: 'var(--color-gray-500)', maxWidth: '500px', margin: '0 auto' }}>
          Estamos construyendo métricas detalladas para que puedas ver el rendimiento de tu flota, los ingresos estimados y las horas pico de demanda.
        </p>
      </div>
    </div>
  );
};
