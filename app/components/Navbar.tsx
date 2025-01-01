import Link from 'next/link';
import { BiSpreadsheet, BiHeadphone, BiBarChartAlt2, BiData, BiCheckSquare, BiTrendingUp, BiSupport, BiPieChartAlt } from 'react-icons/bi';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <BiHeadphone className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-800">Call Center</span>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <NavItem icon={<BiSpreadsheet />} text="Scorecard" />
            <NavItem icon={<BiHeadphone />} text="Interactions" />
            <NavItem icon={<BiBarChartAlt2 />} text="Leaderboard" />
            <NavItem icon={<BiData />} text="Analyze" isActive />
            <NavItem icon={<BiCheckSquare />} text="Data Enrichment" />
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
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, text, isActive = false }) => {
  return (
    <Link 
      href="#"
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