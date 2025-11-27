
import React from 'react';
import { Fixture } from '../types';
import { MapPin, Clock, Trophy } from 'lucide-react';

interface FixtureCardProps {
  fixture: Fixture;
  id?: string;
}

const FixtureCard: React.FC<FixtureCardProps> = ({ fixture, id }) => {
  const dayName = fixture.date.toLocaleDateString('en-GB', { weekday: 'long' });
  const fullDate = fixture.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = fixture.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const displayTime = timeStr === '00:00' ? 'TBC' : timeStr;

  // Determine styles based on Home/Away and Status
  const isHome = fixture.isHome;
  const isCompleted = fixture.status === 'completed';
  
  const titansName = fixture.teamName;
  
  // Strict Order: Top = Home, Bottom = Away
  const topTeam = isHome ? titansName : fixture.opponent;
  const bottomTeam = isHome ? fixture.opponent : titansName;
  
  const isTopTitans = isHome;
  const isBottomTitans = !isHome;
  
  // Derby Detection
  const isDerby = fixture.opponent.toLowerCase().includes('titan');

  const getTeamStyle = (isTitans: boolean) => {
     if (isTitans) return 'text-[#FFD102]';
     return 'text-gray-500';
  };

  const derbyBadgeClass = 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse';
  
  return (
    <div id={id} className={`group relative flex flex-col h-full bg-white border-b-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isCompleted ? 'border-gray-300 opacity-70 grayscale-[0.5]' : 'border-[#FFD102]'}`}>
        
        {/* Header Strip */}
        <div className={`px-4 py-2 flex justify-between items-center text-xs font-black uppercase tracking-wider ${isHome ? 'bg-[#26241E] text-[#FFD102]' : 'bg-gray-200 text-gray-600'}`}>
            <span>{isDerby ? 'DERBY MATCH' : (isHome ? 'Home Match' : 'Away Match')}</span>
            <span className="flex items-center gap-1">
                <Trophy size={12} />
                {fixture.competition}
            </span>
        </div>

        {/* Date Section */}
        <div className="px-5 pt-5 pb-2 text-center border-b border-dashed border-gray-200">
            <div className="text-[#FFD102] font-black text-sm uppercase tracking-widest mb-1">{dayName}</div>
            <div className="text-[#26241E] font-black text-2xl uppercase">{fullDate}</div>
        </div>

        {/* Teams Section */}
        <div className="flex-grow p-5 flex flex-col items-center justify-center gap-2">
            <div className={`text-2xl sm:text-3xl font-black uppercase text-center leading-tight ${getTeamStyle(isTopTitans)}`}>
                {topTeam}
            </div>
            <div className="bg-[#FFD102] text-[#26241E] font-bold text-xs px-2 py-1 rounded skew-x-[-10deg]">
                <span className="skew-x-[10deg] block">VS</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-black uppercase text-center leading-tight ${getTeamStyle(isBottomTitans)}`}>
                {bottomTeam}
            </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 p-4 flex flex-col gap-2 border-t border-gray-100">
             <div className="flex items-center justify-center gap-2 text-[#26241E] font-bold">
                <Clock size={16} className="text-[#FFD102]" />
                <span className={`
                    rounded-[2px] px-1 py-[1px] text-[10px] font-black uppercase tracking-wider leading-none min-w-[14px] text-center
                    ${isDerby ? derbyBadgeClass : (isHome ? 'bg-[#FFD102] text-[#26241E]' : 'bg-gray-600 text-white')}
                `}>
                    {isDerby ? 'DERBY' : (isHome ? 'H' : 'A')}
                </span>
                <span className="text-lg">{displayTime}</span>
             </div>
             
             <div className="flex items-center justify-center gap-1 text-gray-500 text-xs text-center uppercase font-medium">
                <MapPin size={12} />
                <span className="truncate max-w-[200px]">{fixture.location}</span>
             </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#FFD102] pointer-events-none transition-colors duration-300"></div>
    </div>
  );
};

export default FixtureCard;
