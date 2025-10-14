import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Trash2, UserCheck, UserX, Users, Activity, Database, Plus, X } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<{ message: string; users: User[] }>('/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (username: string, currentActive: boolean) => {
    const newActive = !currentActive;
    try {
      await axios.post('/update', { username, is_active: newActive });
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error al actualizar estado del usuario');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Usuario y contraseña son requeridos');
      return;
    }

    try {
      await axios.post('/register', { username: newUsername, password: newPassword });
      setNewUsername('');
      setNewPassword('');
      setShowCreateUser(false);
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Error al crear usuario'
        : 'Error al crear usuario';
      setError(errorMsg);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) {
      return;
    }

    try {
      await axios.post('/delete', { username });
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Error al eliminar usuario'
        : 'Error al eliminar usuario';
      setError(errorMsg);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">Gestiona usuarios y configuraciones del sistema</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <X className="h-4 w-4" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users Management - Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usuarios del Sistema
                  </CardTitle>
                  <CardDescription>
                    Gestiona los usuarios registrados en el sistema
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowCreateUser(!showCreateUser)}
                  variant={showCreateUser ? "outline" : "default"}
                  size="sm"
                >
                  {showCreateUser ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Create User Form */}
              {showCreateUser && (
                <Card className="bg-muted/50 border-muted">
                  <CardContent className="pt-6">
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="username">Usuario</Label>
                          <Input
                            id="username"
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Nombre de usuario"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        <Plus className="h-4 w-4" />
                        Crear Usuario
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Users List */}
              <div className="space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p>Cargando usuarios...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mb-4 opacity-50" />
                    <p>No hay usuarios registrados</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.map((user, index) => (
                      <div key={user.id}>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium leading-none mb-1">{user.username}</p>
                              <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {user.role === 'admin' ? (
                              <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                Administrador
                              </div>
                            ) : (
                              <>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.is_active
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                  {user.is_active ? 'Activo' : 'Inactivo'}
                                </div>
                                <Button
                                  size="sm"
                                  variant={user.is_active ? "outline" : "default"}
                                  onClick={() => handleToggleActive(user.username, user.is_active)}
                                  className="gap-1"
                                >
                                  {user.is_active ? (
                                    <>
                                      <UserX className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Desactivar</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Activar</span>
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.username)}
                                  className="gap-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Eliminar</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {index < users.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* System Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total usuarios:</span>
                  <span className="font-bold text-2xl">{users.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Activos:</span>
                  <span className="font-bold text-xl text-green-600 dark:text-green-400">
                    {users.filter(u => u.is_active).length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Inactivos:</span>
                  <span className="font-bold text-xl text-red-600 dark:text-red-400">
                    {users.filter(u => !u.is_active).length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Admins:</span>
                  <span className="font-bold text-xl text-purple-600 dark:text-purple-400">
                    {users.filter(u => u.role === 'admin').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Servidor:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">En línea</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base de datos:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Conectado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
