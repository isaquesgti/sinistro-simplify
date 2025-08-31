import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileCheck, Shield, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-insurance-light to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-insurance-primary mb-6 leading-tight">
              Simplifique todo o processo de resolução de sinistros
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Conectamos seguradoras e clientes em uma plataforma única, agilizando todo o fluxo de atendimento e resolução de sinistros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button className="bg-insurance-primary hover:bg-insurance-dark text-white px-6 py-3 font-medium text-base w-full sm:w-auto">
                  Acessar plataforma
                </Button>
              </Link>
              {/* Adicionado o link para a página de contato */}
              <Link to="/contatos">
                <Button variant="outline" className="border-insurance-primary text-insurance-primary hover:bg-insurance-primary/10 px-6 py-3 font-medium text-base w-full sm:w-auto">
                  Fale conosco
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <FileCheck className="w-8 h-8 text-insurance-secondary mr-3" />
                <h2 className="text-2xl font-semibold text-insurance-primary">Processo simplificado</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-insurance-secondary/10 p-2 rounded-full mr-4 mt-1">
                    <Clock className="w-5 h-5 text-insurance-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-insurance-primary">Resposta rápida</h3>
                    <p className="text-gray-600">Acompanhe em tempo real o status da sua solicitação.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-insurance-secondary/10 p-2 rounded-full mr-4 mt-1">
                    <Shield className="w-5 h-5 text-insurance-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-insurance-primary">Segurança garantida</h3>
                    <p className="text-gray-600">Seus dados e documentos protegidos com alta segurança.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
