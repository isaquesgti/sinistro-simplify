import React from 'react';

const Sobre = () => {
  return (
    <div style={{
      fontFamily: 'sans-serif',
      lineHeight: 1.6,
      padding: '20px',
      backgroundColor: '#f4f4f4',
      color: '#333'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: 'auto',
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#555' }}>Sobre a Nossa Empresa</h1>
        <p>
          Bem-vindo à nossa página "Sobre"! Nós somos uma empresa dedicada a...
          [Insira aqui uma breve descrição da sua empresa, sua missão, visão e valores.]
        </p>
        <p>
          Nossa jornada começou em [Ano], com a visão de...
          [Conte a história da empresa, como ela começou e o que a motivou.]
        </p>
        <h2 style={{ color: '#555' }}>Nossa Equipe</h2>
        <p>
          Acreditamos que o sucesso é construído por pessoas. Nossa equipe é composta por
          profissionais talentosos e apaixonados que trabalham incansavelmente para...
          [Descreva sua equipe ou o espírito da sua equipe.]
        </p>
      </div>
    </div>
  );
};

export default Sobre;
