import React from 'react';
import { FileText } from 'lucide-react';

function Navbar() {
  return (
    <header class="bg-pink-200 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <FileText class="h-6 w-6 text-blue-700" />
            <span class="font-bold text-xl text-gray-800">PDF Generator</span>
          </div>
          <nav>
            <ul class="flex space-x-6">
              <li>
                <a 
                  href="#" 
                  class="text-gray-600 hover:text-blue-700 transition-colors"
                >
                  
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  class="text-gray-600 hover:text-blue-700 transition-colors"
                >
                  
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  class="text-gray-600 hover:text-blue-700 transition-colors"
                >
                  
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;