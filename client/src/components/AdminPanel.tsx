import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface AdminPanelProps {
  className?: string;
}

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

export default function AdminPanel({ className = '' }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const handleAdminClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowCreateUser(false);
    setNewUsername('');
    setNewPassword('');
    setError(null);
  };

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
    <>
      <button
        className={`bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition cursor-pointer ${className}`}
        onClick={handleAdminClick}
        title="Panel de Administración"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4" onClick={handleClose}>
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Panel de Administración</h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mensajes de error */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Gestión de usuarios */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Usuarios del Sistema</h3>
                <button
                  onClick={() => setShowCreateUser(!showCreateUser)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                  {showCreateUser ? 'Cancelar' : '+ Crear Usuario'}
                </button>
              </div>

              {/* Formulario crear usuario */}
              {showCreateUser && (
                <form onSubmit={handleCreateUser} className="bg-slate-700/50 p-4 rounded-lg mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Usuario</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Nombre de usuario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Contraseña"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Crear Usuario
                  </button>
                </form>
              )}

              {/* Lista de usuarios */}
              <div className="bg-slate-700/50 rounded-lg overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando usuarios...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No hay usuarios registrados
                  </div>
                ) : (
                  <div className="divide-y divide-slate-600">
                    {users.map((user) => (
                      <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-xs text-slate-400">ID: {user.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                              Administrador
                            </span>
                          ) : (
                            <>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.is_active
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {user.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                              <button
                                onClick={() => handleToggleActive(user.username, user.is_active)}
                                className={`${
                                  user.is_active 
                                    ? 'bg-orange-600 hover:bg-orange-700' 
                                    : 'bg-green-600 hover:bg-green-700'
                                } text-white px-3 py-1 rounded-lg text-sm transition`}
                                title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                {user.is_active ? 'Desactivar' : 'Activar'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition"
                                title="Eliminar usuario"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 text-sm">Sistema</h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Total usuarios:</span>
                    <span className="font-semibold text-white">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuarios activos:</span>
                    <span className="font-semibold text-green-400">{users.filter(u => u.is_active).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuarios inactivos:</span>
                    <span className="font-semibold text-red-400">{users.filter(u => !u.is_active).length}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 text-sm">Estado</h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Servidor:</span>
                    <span className="text-green-400 font-semibold">En línea</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base de datos:</span>
                    <span className="text-green-400 font-semibold">Conectado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
