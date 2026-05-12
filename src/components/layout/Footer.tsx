import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-slate-900 text-xl font-bold mb-4">Le'Kiray</h3>
          <p className="max-w-sm mb-6 text-sm">
            Connecting vehicle rental agents with consumers and contractors through a unified subscription-based platform.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-widest mb-2">Legal Disclaimer</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Le'Kiray is a software-as-a-service platform and is NOT a vehicle rental operator, broker, agent, employer, or contractor. 
              We are not a party to any rental contract concluded between users. Heavy equipment rentals are concluded 
              directly with agents off-platform. We are not responsible for vehicle condition or performance.
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="text-slate-900 font-bold mb-4">Equipment</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/marketplace?category=EXCAVATOR" className="hover:text-indigo-600 transition-colors">Excavators</Link></li>
            <li><Link to="/marketplace?category=DOZER" className="hover:text-indigo-600 transition-colors">Bulldozers</Link></li>
            <li><Link to="/marketplace?category=CRANE" className="hover:text-indigo-600 transition-colors">Cranes & Lifting</Link></li>
            <li><Link to="/marketplace?category=LOADER" className="hover:text-indigo-600 transition-colors">Loaders & Grading</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            <li><Link to="/" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/signup?role=AGENT" className="hover:text-indigo-600 transition-colors">Agent Subscriptions</Link></li>
            <li><a href="mailto:support@lekiray.com" className="hover:text-indigo-600 transition-colors">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-12 pt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        &copy; {new Date().getFullYear()} Le'Kiray Marketplace. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
