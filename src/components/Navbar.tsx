
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, FileCheck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link to="/about" className="text-gray-700 hover:text-insurance-secondary story-link font-medium">
              Sobre
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-insurance-secondary story-link font-medium">
              Contato
            </Link>
            <Link to="/dashboard">
              <Button className="bg-insurance-primary hover:bg-insurance-dark text-white">
                Área do Cliente
              </Button>
            </Link>
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
                to="/about" 
                className="text-gray-700 hover:text-insurance-secondary px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-insurance-secondary px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <Link 
                to="/dashboard" 
                className="bg-insurance-primary text-white px-4 py-2 rounded-md text-base font-medium inline-block text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Área do Cliente
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
