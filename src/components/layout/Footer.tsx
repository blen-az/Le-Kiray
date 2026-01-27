
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-white text-xl font-bold mb-4">Le'Kiray</h3>
          <p className="max-w-sm mb-6">
            Connecting vehicle rental agents with consumers and contractors through a unified subscription-based platform.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2">Legal Disclaimer</h4>
            <p className="text-xs leading-relaxed">
              Le'Kiray is a software-as-a-service platform and is NOT a vehicle rental operator, broker, agent, employer, or contractor. 
              We are not a party to any rental contract concluded between users. Earth-moving equipment contracts are concluded 
              directly with agents off-platform. We are not responsible for vehicle condition or performance.
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Marketplace</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Compact Cars</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Family SUVs</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Heavy Equipment</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Construction Vans</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Agent Subscriptions</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-xs">
        &copy; {new Date().getFullYear()} Le'Kiray Marketplace. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
