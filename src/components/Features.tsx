
import React from 'react';
import { Activity, MessageSquare, Clock, Shield, FileCheck, Users } from 'lucide-react';

const features = [
  {
    title: "Envio de documentos",
    description: "Faça o upload dos documentos necessários diretamente pela plataforma, sem burocracia.",
    icon: FileCheck,
  },
  {
    title: "Comunicação integrada",
    description: "Chat direto com a seguradora para tirar dúvidas e acompanhar seu processo.",
    icon: MessageSquare,
  },
  {
    title: "Status em tempo real",
    description: "Acompanhe o andamento do seu sinistro com atualizações em tempo real.",
    icon: Activity,
  },
  {
    title: "Atendimento rápido",
    description: "Processos otimizados para garantir um atendimento ágil e eficiente.",
    icon: Clock,
  },
  {
    title: "Dados seguros",
    description: "Toda comunicação e documentos são protegidos com criptografia avançada.",
    icon: Shield,
  },
  {
    title: "Multiusuários",
    description: "Acesso para corretores, clientes e seguradoras em uma única plataforma.",
    icon: Users,
  }
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-insurance-primary mb-4">
            Recursos que facilitam sua vida
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma foi desenhada para tornar o processo de sinistro mais simples, 
            transparente e rápido para todas as partes envolvidas.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-insurance-light rounded-lg p-6 hover-scale border border-gray-100 shadow-sm"
            >
              <div className="bg-insurance-secondary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-insurance-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-insurance-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
