import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, FileCheck, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './AccessControl';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = useAuth();

  return (
    <nav className="bg-white shadow-sm py-3 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <FileCheck className="w-8 h-8 text-insurance-primary" />
            <span className="text-xl font-bold text-insurance-primary">SinistroSimplify</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-insurance-secondary story-link font-medium">
              Início
            </Link>
            {/* Link para a página Sobre */}
            <Link to="/sobre" className="text-gray-700 hover:text-insurance-secondary story-link font-medium">
              Sobre
            </Link>
            {/* Link para a página Contato */}
            <Link to="/contatos" className="text-gray-700 hover:text-insurance-secondary story-link font-medium">
              Contato
            </Link>
            
            {auth.isAuthenticated ? (
              auth.role === 'client' ? (
                <Link to="/dashboard">
                  <Button className="bg-insurance-primary hover:bg-insurance-dark text-white">
                    Área do Cliente
                  </Button>
                </Link>
              ) : (
                <Link to="/insurer">
                  <Button className="bg-insurance-primary hover:bg-insurance-dark text-white">
                    Área da Seguradora
                  </Button>
                </Link>
              )
            ) : (
              <Link to="/login">
                <Button className="bg-insurance-primary hover:bg-insurance-dark text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 animate-fade-in">
            <div className="flex flex-col space-y-4 pt-2 pb-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-insurance-secondary px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/sobre" 
                className="text-gray-700 hover:text-insurance-secondary px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                to="/contatos" 
                className="text-gray-700 hover:text-insurance-secondary px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              
              {auth.isAuthenticated ? (
                auth.role === 'client' ? (
                  <Link 
                    to="/dashboard" 
                    className="bg-insurance-primary text-white px-4 py-2 rounded-md text-base font-medium inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Área do Cliente
                  </Link>
                ) : (
                  <Link 
                    to="/insurer" 
                    className="bg-insurance-primary text-white px-4 py-2 rounded-md text-base font-medium inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Área da Seguradora
                  </Link>
                )
              ) : (
                <Link 
                  to="/login" 
                  className="bg-insurance-primary text-white px-4 py-2 rounded-md text-base font-medium inline-block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center justify-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
