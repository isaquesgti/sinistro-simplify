import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, FileCheck, Home, LogIn, LogOut } from 'lucide-react';
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
          <div className="hidden md:flex items-center space-x-4">
            {auth.isAuthenticated ? (
              <>
                {auth.role === 'client' ? (
                  <Link to="/dashboard">
                    <Button className="bg-insurance-primary hover:bg-insurance-dark text-white">
                      Área do Cliente
                    </Button>
                  </Link>
                ) : auth.role === 'insurer' ? (
                  <Link to="/insurer">
                    <Button className="bg-insurance-primary hover:bg-insurance-dark text-white">
                      Área da Seguradora
                    </Button>
                  </Link>
                ) : auth.role === 'admin' ? (
                  <Link to="/admin">
                    <Button className="bg-insurance-primary hover:bg-insurance-dark text-white">
                      Área Administrativa
                    </Button>
                  </Link>
                ) : null}
                <Button 
                  variant="outline" 
                  onClick={() => auth.signOut()}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </Button>
              </>
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
              {auth.isAuthenticated ? (
                <>
                  {auth.role === 'client' ? (
                    <Link 
                      to="/dashboard" 
                      className="bg-insurance-primary text-white px-4 py-2 rounded-md text-base font-medium inline-block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Área do Cliente
                    </Link>
                  ) : auth.role === 'insurer' ? (
                    <Link 
                      to="/insurer" 
                      className="bg-insurance-primary text-white px-4 py-2 rounded-md text-base font-medium inline-block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Área da Seguradora
                    </Link>
                  ) : auth.role === 'admin' ? (
                    <Link 
                      to="/admin" 
                      className="bg-insurance-primary text-white px-4 py-2 rounded-md text-base font-medium inline-block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Área Administrativa
                    </Link>
                  ) : null}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      auth.signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </Button>
                </>
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
