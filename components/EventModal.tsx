
import React from 'react';
import { Fixture } from '../types';
import { X, Clock, MapPin, Trophy } from 'lucide-react';
import { Badge } from './Badge';

interface EventModalProps {
  fixture: Fixture;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ fixture, onClose }) => {
  const dayName = fixture.date.toLocaleDateString('en-GB', { weekday: 'long' });
  const fullDate = fixture.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = fixture.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const displayTime = timeStr === '00:00' ? 'TBC' : timeStr;
  
  const isHome = fixture.isHome;
  const isCompleted = fixture.status === 'completed';

  const titansName = fixture.teamName;
  const hasOpponent = !!fixture.opponent;
  const topTeam = isHome ? titansName : fixture.opponent;
  const bottomTeam = isHome ? fixture.opponent : titansName;
  const isTopTitans = isHome;
  const isBottomTitans = !isHome;

  // Derby Detection
  const isDerby = fixture.opponent.toLowerCase().includes('titan');

  const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
  };

  const getResultBg = (result?: 'W' | 'L' | 'D') => {
    switch (result) {
      case 'W': return 'bg-green-600 text-white';
      case 'L': return 'bg-red-600 text-white';
      case 'D': return 'bg-blue-600 text-white';
      default: return 'bg-theme-gold text-theme-base';
    }
  };
  
  const getResultTextColor = (result?: 'W' | 'L' | 'D') => {
      switch(result) {
          case 'W': return 'text-green-500';
          case 'L': return 'text-red-500';
          case 'D': return 'text-blue-500';
          default: return 'text-theme-gold';
      }
  };

  const getResultLabel = (result?: 'W' | 'L' | 'D') => {
      switch(result) {
          case 'W': return 'WIN';
          case 'L': return 'LOSS';
          case 'D': return 'DRAW';
          default: return '';
      }
  };

  const getModalTeamStyle = (isTitans: boolean) => {
      return isTitans ? 'text-theme-gold' : 'text-white';
  };

  // Determine Styling Theme
  const getCompetitionTheme = () => {
      const text = (fixture.competition + ' ' + (fixture.competitionTag || '')).toUpperCase();
      if (text.includes('PLATE')) return 'silver';
      if (text.includes('SHIELD') || text.includes('QUARTER-FINAL')) return 'bronze';
      if (text.includes('CUP') || text.includes('TROPHY')) return 'gold';
      return null;
  };

  const theme = getCompetitionTheme();
  
  // Specific Hex Codes for Away Gradient & Home Gradient
  // Home: Yellow to Black, White Text
  // Away: Pink to Blue, White Text
  let headerBgClass = isHome 
    ? 'bg-gradient-to-r from-[#FFD102] to-[#26241E] text-white' 
    : 'bg-gradient-to-r from-[#f5abb9] to-[#5bcffa] text-white';
  
  // Border logic for main container
  let borderColorClass = isHome ? 'border-theme-gold' : 'border-[#f5abb9]';

  if (theme === 'gold') {
      headerBgClass = 'bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 text-yellow-900';
      borderColorClass = 'border-yellow-500';
  } else if (theme === 'silver') {
      headerBgClass = 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-900';
      borderColorClass = 'border-slate-300';
  } else if (theme === 'bronze') {
      headerBgClass = 'bg-gradient-to-r from-[#cd7f32] via-[#E09F70] to-[#8c5626] text-white';
      borderColorClass = 'border-[#cd7f32]';
  }

  // Derby Styling Override (High Priority)
  if (isDerby) {
      headerBgClass = 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white';
      borderColorClass = 'border-purple-500';
  }

  const isSpecialCompetition = !!theme;

  const derbyBadgeClass = 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse';
  
  const haBadgeHomeClass = 'bg-gradient-to-r from-[#FFD102] to-[#26241E] text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm fade-in" onClick={handleOverlayClick}>
        <div className={`w-full max-w-md overflow-hidden zoom-in relative shadow-2xl rounded-xl border-2 ${borderColorClass} bg-theme-base`}>
            
            <button 
                onClick={onClose} 
                className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {hasOpponent ? (
                <div className={`px-6 py-3 flex justify-between items-center text-xs font-black uppercase tracking-wider ${headerBgClass}`}>
                    <span>{isDerby ? 'Derby Match' : (isHome ? 'Home Match' : 'Away Match')}</span>
                    <span className="flex items-center gap-1">
                        {isSpecialCompetition ? <Trophy size={14} /> : <Trophy size={14} className="opacity-0" />} 
                        {fixture.competition}
                        {fixture.competitionTag && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-sm border ${isSpecialCompetition ? 'bg-black/10 border-black/20' : 'bg-black/10 border-black/20'}`}>
                                {fixture.competitionTag}
                            </span>
                        )}
                    </span>
                </div>
            ) : (
                <div className="px-6 py-3 flex justify-between items-center text-xs font-black uppercase tracking-wider bg-theme-gold text-theme-base">
                    <span>Club Event</span>
                    <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {displayTime}
                    </span>
                </div>
            )}

            <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-theme-base relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none w-64 h-64 grayscale">
                    <Badge />
                </div>

                <div className={`${theme === 'gold' ? 'text-yellow-400' : (theme === 'silver' ? 'text-slate-300' : (theme === 'bronze' ? 'text-[#cd7f32]' : 'text-theme-gold'))} font-black text-sm uppercase tracking-[0.2em] mb-2`}>{dayName}</div>
                <div className="text-white font-black text-2xl uppercase mb-8">{fullDate}</div>

                <div className="w-full flex flex-col items-center gap-4 relative z-10">
                    {hasOpponent ? (
                        <>
                            <div className={`text-3xl sm:text-4xl font-black uppercase text-center leading-none drop-shadow-lg ${getModalTeamStyle(isTopTitans)}`}>
                                {topTeam}
                            </div>
                            
                            {isCompleted && fixture.score ? (
                                <div className={`${getResultBg(fixture.result)} font-black text-xl px-4 py-2 rounded-sm shadow-lg transform -skew-x-12 min-w-[80px] text-center`}>
                                    {fixture.score}
                                </div>
                            ) : (
                                <div className="bg-theme-gold text-theme-base font-black text-sm px-3 py-1 -skew-x-12 transform">
                                    VS
                                </div>
                            )}
        
                            <div className={`text-2xl sm:text-3xl font-black uppercase text-center leading-none drop-shadow-lg ${getModalTeamStyle(isBottomTitans)}`}>
                                {bottomTeam}
                            </div>
                        </>
                    ) : (
                        <div className="text-3xl sm:text-4xl font-black uppercase text-center leading-none drop-shadow-lg text-theme-gold">
                            {fixture.teamName}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-theme-light p-6 border-t border-theme-light/50">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-theme-text">
                        <Clock className="w-5 h-5 text-theme-gold" />
                        <div className="flex items-center gap-2">
                            <div>
                                <span className="block text-xs text-theme-muted uppercase font-bold tracking-wider">{hasOpponent ? 'Kick Off' : 'Time'}</span>
                                <div className="flex items-center gap-2">
                                    {hasOpponent && (
                                        <span className={`
                                            rounded-[2px] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider leading-none min-w-[14px] text-center shadow-sm
                                            ${isDerby ? derbyBadgeClass : (isHome ? haBadgeHomeClass : 'bg-gradient-to-r from-[#f5abb9] to-[#5bcffa] text-white')}
                                        `}>
                                            {isDerby ? 'DERBY' : (isHome ? 'H' : 'A')}
                                        </span>
                                    )}
                                    <span className="font-bold text-lg">{displayTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-theme-text">
                        <MapPin className="w-5 h-5 text-theme-gold" />
                        <div>
                            <span className="block text-xs text-theme-muted uppercase font-bold tracking-wider">Location</span>
                            <span className="font-medium text-sm sm:text-base">{fixture.location}</span>
                        </div>
                    </div>

                    {hasOpponent && isCompleted && fixture.result && (
                        <div className="flex items-center gap-3 text-theme-text border-t border-theme-light/30 pt-4 mt-2">
                            <div className={`w-5 h-5 rounded-full border-4 ${getResultTextColor(fixture.result).replace('text-', 'border-')} opacity-80`}></div>
                            <div>
                                <span className="block text-xs text-theme-muted uppercase font-bold tracking-wider">Result</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-black text-xl uppercase tracking-widest ${getResultTextColor(fixture.result)}`}>
                                        {getResultLabel(fixture.result)}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${getResultTextColor(fixture.result).replace('text-', 'bg-')}`}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default EventModal;
