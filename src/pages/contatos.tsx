import React from 'react';

const Contatos = () => {
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
        <h1 style={{ color: '#555' }}>Entre em Contato</h1>
        <p>
          Se você tem alguma dúvida, sugestão ou quer saber mais sobre nossos serviços,
          entre em contato conosco através das informações abaixo.
        </p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>Endereço:</strong> [Seu Endereço Completo]</li>
          <li><strong>Telefone:</strong> [Seu Número de Telefone]</li>
          <li><strong>Email:</strong> <a href="mailto:seuemail@exemplo.com" style={{ color: '#007BFF', textDecoration: 'none' }}>seuemail@exemplo.com</a></li>
          <li><strong>Horário de Funcionamento:</strong> Segunda a Sexta, das 9h às 18h</li>
        </ul>
        <h2 style={{ color: '#555' }}>Formulário de Contato</h2>
        <p>
          [Você pode integrar um formulário de contato aqui. Plataformas como o Google Forms ou serviços de terceiros podem ser utilizados para isso.]
        </p>
      </div>
    </div>
  );
};

export default Contatos;
