import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contatos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-bold text-insurance-primary mb-6">
            Entre em Contato
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Se você tem alguma dúvida, sugestão ou quer saber mais sobre nossos serviços,
            entre em contato conosco através das informações abaixo.
          </p>
          <ul className="text-lg text-gray-600 space-y-4 mb-8">
            <li><strong>Endereço:</strong> [Seu Endereço Completo]</li>
            <li><strong>Telefone:</strong> [Seu Número de Telefone]</li>
            <li><strong>Email:</strong> <a href="mailto:seuemail@exemplo.com" className="text-insurance-primary hover:underline">seuemail@exemplo.com</a></li>
            <li><strong>Horário de Funcionamento:</strong> Segunda a Sexta, das 9h às 18h</li>
          </ul>
          <h2 className="text-2xl md:text-3xl font-bold text-insurance-primary mb-4">
            Formulário de Contato
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            [Você pode integrar um formulário de contato aqui.]
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contatos;
