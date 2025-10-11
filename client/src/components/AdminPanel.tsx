import { useState } from 'react';

interface AdminPanelProps {
  className?: string;
}

export default function AdminPanel({ className = '' }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdminClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Panel de Administración</h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2">Estado del Sistema</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Servidor:</span>
                    <span className="text-green-400">En línea</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base de datos:</span>
                    <span className="text-green-400">Conectado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuarios activos:</span>
                    <span>1</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2">Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Descargas hoy:</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total descargas:</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                Ver Logs
              </button>
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition">
                Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
