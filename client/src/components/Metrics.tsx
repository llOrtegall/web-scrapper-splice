import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDailyMetrics, useMonthlyMetrics, useUserMetrics } from "@/hooks/useMetrics";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Activity, 
  Download, 
  PlayCircle, 
  BarChart3,
  Users,
} from "lucide-react";

type Period = "day" | "week" | "month";

export const MetricsComponent = () => {
  const { user } = useAuth();
  const [period, _setPeriod] = useState<Period>("month");
  const [selectedUsername, _setSelectedUsername] = useState<string>("");

  const { 
    data: monthlyData, 
    loading: monthlyLoading, 
    error: monthlyError,
  } = useMonthlyMetrics();

  // Verificar que el usuario sea admin
  if (!user || user.rol !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acceso Denegado</CardTitle>
          <CardDescription>
            Solo los administradores pueden acceder a las métricas
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumen Mensual Global
            <Badge variant="outline" className="ml-auto">
              <Users className="h-3 w-3 mr-1" />
              Todos los usuarios
            </Badge>
          </CardTitle>
          <CardDescription>
            Consolidado mensual de toda la actividad en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyLoading ? (
            <MetricsTableSkeleton />
          ) : monthlyError ? (
            <ErrorMessage message={monthlyError} />
          ) : monthlyData.length === 0 ? (
            <EmptyState message="No hay datos mensuales" />
          ) : (
            <MonthlyMetricsTable data={monthlyData} />
          )}
        </CardContent>
      </Card>
  );
};

const MonthlyMetricsTable = ({ data }: { data: any[] }) => {
  return (
    <div className="space-y-4">
      {data.map((month, index) => {
        const total = month.plays + month.downloads + month.processes;
        const date = new Date(month.monthStart);
        
        return (
          <div key={index} className="rounded-lg border p-4 hover:bg-muted/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {date.toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {month.activeUsers} usuarios activos
                </p>
              </div>
              <Badge variant="outline" className="text-lg">
                {total} total
              </Badge>
            </div>
            
            <Separator className="my-3" />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PlayCircle className="h-4 w-4 text-green-500" />
                  Reproducciones
                </div>
                <p className="text-2xl font-bold">{month.plays}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="h-4 w-4 text-blue-500" />
                  Descargas
                </div>
                <p className="text-2xl font-bold">{month.downloads}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4 text-purple-500" />
                  Procesos
                </div>
                <p className="text-2xl font-bold">{month.processes}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente de skeleton para tablas
const MetricsTableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

// Componente de error
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
    <p className="text-sm text-destructive">{message}</p>
  </div>
);

// Componente de estado vacío
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);