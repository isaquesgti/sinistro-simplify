import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

const Contatos = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-insurance-primary mb-8">Entre em Contato</h1>
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-4">
            <Mail className="w-8 h-8 text-insurance-primary" />
            <a href="mailto:contato@sinistrosimplify.com" className="text-lg text-gray-700 hover:text-insurance-secondary">
              contato@sinistrosimplify.com
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="w-8 h-8 text-insurance-primary" />
            <span className="text-lg text-gray-700">(11) 4567-8900</span>
          </div>
          <div className="flex items-start justify-center text-center">
            <MapPin className="w-8 h-8 text-insurance-primary mr-4" />
            <span className="text-lg text-gray-700 max-w-sm">
              Av. Paulista, 1000 - Bela Vista, São Paulo - SP
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contatos;
