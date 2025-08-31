import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Sobre = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-insurance-primary mb-4">Sobre Nós</h1>
        <p className="text-lg text-gray-700">
          SinistroSimplify nasceu da necessidade de simplificar a interação entre seguradoras e seus clientes.
          Acreditamos que o processo de sinistro não precisa ser complicado. Nossa plataforma oferece uma solução
          intuitiva e eficiente, focada em transparência e agilidade para ambas as partes.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default Sobre;
