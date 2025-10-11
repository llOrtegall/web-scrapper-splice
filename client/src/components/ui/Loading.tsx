import { Loader2 } from 'lucide-react';

export default function LoadingComponent() {
  return (
    <>
      <style>{`
        @keyframes loading-progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
        
        .loading-bar {
          animation: loading-progress 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
        <div className='relative bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-sm w-full mx-4'>
          {/* Gradiente decorativo */}
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl' />
          
          {/* Contenido */}
          <div className='relative flex flex-col items-center justify-center gap-6'>
            {/* Spinner mejorado */}
            <div className='relative'>
              <div className='w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin' />
              <div className='absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animate-reverse' />
              <Loader2 className='absolute inset-0 w-8 h-8 m-4 text-blue-600 animate-spin' />
            </div>
            
            {/* Texto */}
            <div className='text-center'>
              <h3 className='text-xl font-semibold text-gray-800 mb-2'>Cargando...</h3>
              <p className='text-sm text-gray-600'>Por favor espere mientras procesamos su solicitud</p>
            </div>
            
            {/* Barra de progreso animada */}
            <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
              <div className='h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse loading-bar' />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}