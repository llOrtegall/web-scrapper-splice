import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle } from 'lucide-react';

/**
 * Hook para manejar mensajes de error de navegación
 */
export function useNavigationError() {
  const location = useLocation();
  const state = location.state as { error?: string; requiredRole?: string } | null;

  useEffect(() => {
    if (state?.error) {
      // Limpiar el estado después de mostrarlo
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  return state?.error || null;
}

interface UnauthorizedAccessProps {
  message?: string;
}

/**
 * Componente para mostrar cuando un usuario no tiene permisos
 */
export function UnauthorizedAccess({ message = 'No tienes permisos para acceder a esta página' }: UnauthorizedAccessProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
          </div>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
