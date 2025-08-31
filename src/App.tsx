import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight">
              Simplifique todo o processo de resolução de <span className="text-blue-600">sinistros</span>
            </h1>
            <p className="mt-4 md:text-lg text-slate-600 max-w-2xl mx-auto">
              Conectamos seguradoras e clientes em uma plataforma única, agilizando todo o fluxo de atendimento e resolução de sinistros.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300">
                Acessar plataforma
              </a>
              <a href="#" className="border border-blue-600 text-blue-600 font-bold py-3 px-6 rounded-full transition-colors duration-300 hover:bg-blue-50">
                Fale conosco
              </a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Processo simplificado
              </h2>
              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-blue-500 mr-3 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </span>
                  <div>
                    <strong className="block text-slate-800">Resposta rápida</strong>
                    Acompanhe em tempo real o status da sua solicitação.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-blue-500 mr-3 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.61 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </span>
                  <div>
                    <strong className="block text-slate-800">Segurança garantida</strong>
                    Seus dados e documentos protegidos com alta segurança.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
