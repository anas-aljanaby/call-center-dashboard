"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiSpreadsheet, BiHeadphone, BiBarChartAlt2, BiData, BiCheckSquare, BiTrendingUp, BiSupport, BiPieChartAlt } from 'react-icons/bi';
import { supabase } from '../lib/supabase';
import { BrainCircuit } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  href?: string;
  isActive?: boolean;
}

const Navbar = () => {
  const pathname = usePathname();
  
  // Set analyze as active if we're on the analyze page or root
  const isAnalyzeActive = pathname === '/analyze' || pathname === '/';

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <BrainCircuit size={24} className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-800">Call Center</span>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <NavItem icon={<BiBarChartAlt2 />} text="Leaderboard" />
            <NavItem icon={<BiHeadphone />} text="Knowledge AI" /> 
            <NavItem 
              icon={<BiData />} 
              text="Analyze"  
              href="/analyze"
              isActive={isAnalyzeActive} 
            />
            <NavItem 
              icon={<BiCheckSquare />} 
              text="Audio Library" 
              href="/audio-library" 
              isActive={pathname === '/audio-library'} 
            />
            <NavItem icon={<BiTrendingUp />} text="Evaluations" />
            <NavItem icon={<BiSupport />} text="Coaching" />
            <NavItem icon={<BiPieChartAlt />} text="Reporting" />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <BiSpreadsheet className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <BiCheckSquare className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, text, href = "#", isActive = false }: NavItemProps) => {
  return (
    <Link 
      href={href}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
};

export default Navbar; 