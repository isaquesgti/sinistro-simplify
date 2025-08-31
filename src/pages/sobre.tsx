import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-insurance-primary mb-6 text-center">
            Sobre a Nossa Solução
          </h1>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-insurance-primary mt-8 mb-4">
              Nossa Missão
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Na complexa dinâmica do mercado de seguros, a comunicação e a agilidade são essenciais para uma experiência de alta qualidade. Nossa missão é atuar como uma <strong className="font-semibold text-insurance-secondary">ponte digital</strong> entre Seguradoras, Empresas Associadas e Clientes. Através de uma plataforma unificada e intuitiva, buscamos agilizar e automatizar processos, garantindo transparência, eficiência e excelência no gerenciamento de sinistros e serviços.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-insurance-primary mt-8 mb-4">
              O Que Oferecemos
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Desenvolvemos uma solução robusta, composta por um <strong className="font-semibold text-insurance-secondary">BackOffice web</strong> e um <strong className="font-semibold text-insurance-secondary">aplicativo móvel</strong>, pensada para atender às necessidades específicas de cada usuário. As Seguradoras e seus Parceiros obtêm uma ferramenta poderosa para a gestão de ocorrências, orçamentos e apólices, centralizando todas as operações. Ao mesmo tempo, o Cliente tem o poder de acessar seus seguros de forma simples, acompanhar solicitações e se conectar diretamente com as seguradoras, tudo a partir de um único login.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-insurance-primary mt-8 mb-4">
              Nossa Visão
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Acreditamos que a tecnologia deve servir para simplificar a vida. Com a nossa plataforma, transformamos os desafios da gestão de sinistros em processos ágeis e assertivos, otimizando o tempo e os recursos de todos os envolvidos. Estamos empenhados em construir um ecossistema colaborativo que fortalece as relações e eleva o padrão de serviço no setor de seguros.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sobre;
