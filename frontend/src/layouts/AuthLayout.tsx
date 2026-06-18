import { Outlet } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: `radial-gradient(circle at 80% 20%, rgba(108, 99, 255, 0.08), transparent 50%),
                   radial-gradient(circle at 20% 80%, rgba(29, 158, 117, 0.05), transparent 50%),
                   var(--tf-bg)`
    }}>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
        <Outlet />
      </div>
    </div>
  );
}
