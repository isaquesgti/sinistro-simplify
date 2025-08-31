import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-bold text-insurance-primary mb-6">
            Sobre a Nossa Empresa
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Bem-vindo à nossa página "Sobre"! Nós somos uma empresa dedicada a...
            [Insira aqui uma breve descrição da sua empresa, sua missão, visão e valores.]
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Nossa jornada começou em [Ano], com a visão de...
            [Conte a história da empresa, como ela começou e o que a motivou.]
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-insurance-primary mb-4">
            Nossa Equipe
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Acreditamos que o sucesso é construído por pessoas. Nossa equipe é composta por
            profissionais talentosos e apaixonados que trabalham incansavelmente para...
            [Descreva sua equipe ou o espírito da sua equipe.]
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sobre;
