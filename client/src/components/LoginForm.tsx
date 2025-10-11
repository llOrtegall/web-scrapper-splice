import { useAuth } from '../context/auth/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    axios.post('/login', {
      username,
      password
    })
      .then(response => {
        if (response.status === 200 && response.data) {
          const { id, username, role } = response.data;
          login(id, username, role);
        }          
      })
      .catch(error => {
        console.error(error);
        if(error.response.status === 401) {
          toast.error(error.response.data.error);
        }
      })
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <header className="text-center my-6">
            <h1 className="text-3xl font-semibold tracking-tight">Splice Downloader</h1>
            <p className="text-sm text-gray-400 mt-2">Descarga samples de Splice fácilmente</p>
          </header>
          <div className="p-6 md:space-y-6 sm:p-8">
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre Usuario</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Andrek52" required />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
              </div>

              <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 cursor-pointer">Iniciar sesión</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm