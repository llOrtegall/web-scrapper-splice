import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/context/auth/AuthContext';
import { useRef } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

/**
 * Componente para proteger rutas según autenticación y rol de usuario
 * @param children - Componente a renderizar si el usuario tiene acceso
 * @param requiredRole - Rol requerido para acceder a la ruta (opcional)
 * @param redirectTo - Ruta a la que redirigir si no tiene acceso
 */
export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirigir si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user.rol !== requiredRole) {
    // Mostrar notificación de acceso denegado solo una vez
    if (!hasShownToast.current) {
      hasShownToast.current = true;
      toast.error('Acceso Denegado', {
        description: `Solo los ${requiredRole === 'admin' ? 'administradores' : 'usuarios'} pueden acceder a esta página.`,
        duration: 4000,
      });
    }

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Componente especializado para rutas que solo pueden acceder administradores
 * Redirige a la página principal si el usuario no es admin y muestra una notificación
 * 
 * @example
 * ```tsx
 * // En tus rutas
 * {
 *   path: '/admin-panel',
 *   element: (
 *     <AdminRoute>
 *       <AdminPanel />
 *     </AdminRoute>
 *   )
 * }
 * ```
 */
export function AdminRoute({ children }: AdminRouteProps) {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/">
      {children}
    </ProtectedRoute>
  );
}
