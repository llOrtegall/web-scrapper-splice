import { useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { useDailyMetrics, useMonthlyMetrics, useUserMetrics } from "@/hooks/useMetrics";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Activity, 
  Download, 
  PlayCircle, 
  TrendingUp, 
  Calendar,
  Award,
  BarChart3,
  RefreshCw,
  Users,
  User,
  ChevronDown,
  X
} from "lucide-react";

type Period = "day" | "week" | "month";

export const MetricsComponent = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const [selectedUsername, setSelectedUsername] = useState<string>("");

  // Obtener lista de usuarios
  const { users, loading: usersLoading } = useUsers();

  // Métricas globales (todos los usuarios)
  const { 
    data: dailyData, 
    loading: dailyLoading, 
    error: dailyError,
    refetch: refetchDaily 
  } = useDailyMetrics();

  const { 
    data: monthlyData, 
    loading: monthlyLoading, 
    error: monthlyError,
    refetch: refetchMonthly 
  } = useMonthlyMetrics();

  // Métricas de usuario específico (cuando se selecciona uno)
  const { 
    data: userData, 
    loading: userLoading, 
    error: userError,
    refetch: refetchUser 
  } = useUserMetrics(selectedUsername, period);

  const handleRefresh = () => {
    refetchDaily();
    refetchMonthly();
    if (selectedUsername) {
      refetchUser();
    }
  };

  const handleSelectUser = (username: string) => {
    setSelectedUsername(username);
  };

  const handleClearUser = () => {
    setSelectedUsername("");
  };

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Panel de Métricas
          </h1>
          <p className="text-muted-foreground mt-1">
            Vista completa de la actividad de todos los usuarios
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Búsqueda de Usuario Específico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Filtrar por Usuario
          </CardTitle>
          <CardDescription>
            Selecciona un usuario para ver sus métricas individuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="user-select">Usuario</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    disabled={usersLoading}
                  >
                    {selectedUsername || "Selecciona un usuario..."}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[400px] max-h-[300px] overflow-y-auto">
                  <DropdownMenuLabel>Usuarios disponibles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {usersLoading ? (
                    <div className="p-2">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No hay usuarios disponibles
                    </div>
                  ) : (
                    users.map((usr) => (
                      <DropdownMenuItem
                        key={usr.id}
                        onClick={() => handleSelectUser(usr.username)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{usr.username}</span>
                          <Badge variant={usr.rol === "admin" ? "default" : "secondary"}>
                            {usr.rol}
                          </Badge>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {selectedUsername && (
              <Button variant="outline" onClick={handleClearUser} size="icon">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {selectedUsername && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Mostrando métricas de: <strong className="ml-1">{selectedUsername}</strong>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selector de Período para usuario específico */}
      {selectedUsername && (
        <div className="flex gap-2 items-center">
          <Label className="text-sm text-muted-foreground">Período:</Label>
          <Button
            variant={period === "day" ? "default" : "outline"}
            onClick={() => setPeriod("day")}
            size="sm"
          >
            Día
          </Button>
          <Button
            variant={period === "week" ? "default" : "outline"}
            onClick={() => setPeriod("week")}
            size="sm"
          >
            Semana
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            onClick={() => setPeriod("month")}
            size="sm"
          >
            Mes
          </Button>
        </div>
      )}

      {/* Métricas del Usuario Específico */}
      {selectedUsername && (
        <>
          <UserMetricsCards 
            data={userData} 
            loading={userLoading} 
            error={userError}
          />
          
          <UserActivityTable 
            data={userData?.dailyActivity || []} 
            loading={userLoading}
          />
        </>
      )}

      {/* Métricas Globales - Diarias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad Diaria Global
            <Badge variant="outline" className="ml-auto">
              <Users className="h-3 w-3 mr-1" />
              Todos los usuarios
            </Badge>
          </CardTitle>
          <CardDescription>
            Actividad consolidada de todos los usuarios (últimos 30 días)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyLoading ? (
            <MetricsTableSkeleton />
          ) : dailyError ? (
            <ErrorMessage message={dailyError} />
          ) : dailyData.length === 0 ? (
            <EmptyState message="No hay datos de actividad diaria" />
          ) : (
            <DailyMetricsTable data={dailyData} />
          )}
        </CardContent>
      </Card>

      {/* Métricas Globales - Mensuales */}
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
    </div>
  );
};

// Componente de cards con métricas del usuario
interface UserMetricsCardsProps {
  data: any;
  loading: boolean;
  error: string | null;
}

const UserMetricsCards = ({ data, loading, error }: UserMetricsCardsProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <ErrorMessage message={error || "No hay datos disponibles"} />;
  }

  const cards = [
    {
      title: "Total Descargas",
      value: data.totals.downloads,
      icon: Download,
      description: `${data.averages.downloadsPerDay.toFixed(1)} por día`,
      color: "text-blue-500"
    },
    {
      title: "Total Reproducciones",
      value: data.totals.plays,
      icon: PlayCircle,
      description: `${data.averages.playsPerDay.toFixed(1)} por día`,
      color: "text-green-500"
    },
    {
      title: "Total Procesos",
      value: data.totals.processes,
      icon: Activity,
      description: `${data.averages.processesPerDay.toFixed(1)} por día`,
      color: "text-purple-500"
    },
    {
      title: "Ranking",
      value: `#${data.ranking.position}`,
      icon: Award,
      description: `De ${data.ranking.totalUsers} usuarios`,
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Tabla de actividad del usuario
interface UserActivityTableProps {
  data: any[];
  loading: boolean;
}

const UserActivityTable = ({ data, loading }: UserActivityTableProps) => {
  if (loading) {
    return <MetricsTableSkeleton />;
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Actividad Detallada
        </CardTitle>
        <CardDescription>
          Desglose de tu actividad día a día
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Fecha</th>
                <th className="p-4 text-right font-medium">Reproducciones</th>
                <th className="p-4 text-right font-medium">Descargas</th>
                <th className="p-4 text-right font-medium">Procesos</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((day, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    {new Date(day.dateSave).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <Badge variant="secondary">{day.countPlay}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Badge variant="secondary">{day.countDownload}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Badge variant="secondary">{day.countProcess}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Tabla de métricas diarias
const DailyMetricsTable = ({ data }: { data: any[] }) => {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left font-medium">Fecha</th>
            <th className="p-4 text-right font-medium">
              <div className="flex items-center justify-end gap-1">
                <PlayCircle className="h-4 w-4" />
                Plays
              </div>
            </th>
            <th className="p-4 text-right font-medium">
              <div className="flex items-center justify-end gap-1">
                <Download className="h-4 w-4" />
                Descargas
              </div>
            </th>
            <th className="p-4 text-right font-medium">
              <div className="flex items-center justify-end gap-1">
                <Activity className="h-4 w-4" />
                Procesos
              </div>
            </th>
            <th className="p-4 text-right font-medium">Usuarios</th>
          </tr>
        </thead>
        <tbody>
          {data.map((day, index) => (
            <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
              <td className="p-4 font-medium">
                {new Date(day.date).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short'
                })}
              </td>
              <td className="p-4 text-right">
                <Badge variant="outline" className="text-green-600">
                  {day.plays}
                </Badge>
              </td>
              <td className="p-4 text-right">
                <Badge variant="outline" className="text-blue-600">
                  {day.downloads}
                </Badge>
              </td>
              <td className="p-4 text-right">
                <Badge variant="outline" className="text-purple-600">
                  {day.processes}
                </Badge>
              </td>
              <td className="p-4 text-right">
                <Badge variant="secondary">{day.activeUsers}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/50 font-medium">
            <td className="p-4">Total</td>
            <td className="p-4 text-right">
              {data.reduce((sum, d) => sum + d.plays, 0)}
            </td>
            <td className="p-4 text-right">
              {data.reduce((sum, d) => sum + d.downloads, 0)}
            </td>
            <td className="p-4 text-right">
              {data.reduce((sum, d) => sum + d.processes, 0)}
            </td>
            <td className="p-4 text-right">-</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// Tabla de métricas mensuales
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