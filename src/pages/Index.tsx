
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <section className="py-16 md:py-24 bg-insurance-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-insurance-primary mb-6">
            Pronto para simplificar a gestão de sinistros?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Junte-se a milhares de usuários que já estão utilizando nossa plataforma para 
            agilizar processos e melhorar a experiência com sinistros.
          </p>
          <a 
            href="/dashboard" 
            className="inline-block bg-insurance-primary hover:bg-insurance-dark text-white py-3 px-8 rounded-md font-medium transition-colors"
          >
            Experimente agora
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
