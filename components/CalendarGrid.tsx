
import React from 'react';
import { Fixture } from '../types';
import { Trophy } from 'lucide-react';
import { WEEKDAY_BG_IMAGE } from '../constants';

interface CalendarGridProps {
  currentDate: Date;
  fixtures: Fixture[];
  onEventClick: (fixture: Fixture) => void;
  showWeekdays: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, fixtures, onEventClick, showWeekdays }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayStandard = new Date(year, month, 1).getDay();
  // Convert Sunday (0) -> 6, Monday (1) -> 0, etc.
  const firstDay = (firstDayStandard - 1 + 7) % 7;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells = [];
  
  // Prev Month Padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrent: false });
  }
  
  // Current Month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), isCurrent: true });
  }
  
  // Dynamic Next Month Padding: Only fill to the end of the current week row
  const totalCellsSoFar = cells.length;
  const totalCellsNeeded = Math.ceil(totalCellsSoFar / 7) * 7;
  const remaining = totalCellsNeeded - totalCellsSoFar;
  
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: new Date(year, month + 1, i), isCurrent: false });
  }

  // Helper to determine special styling theme
  const getCompetitionTheme = (fixture: Fixture) => {
      const text = (fixture.competition + ' ' + (fixture.competitionTag || '')).toUpperCase();
      
      if (text.includes('PLATE')) return 'silver';
      if (text.includes('SHIELD') || text.includes('QUARTER-FINAL')) return 'bronze';
      if (text.includes('CUP') || text.includes('TROPHY')) return 'gold';
      
      return null;
  };

  return (
    <div className="flex flex-col gap-4">
        <div className="w-full bg-theme-dark border border-theme-light rounded-2xl overflow-hidden shadow-2xl shadow-black relative min-h-[400px]">
            <div 
                className="absolute inset-0 z-0 opacity-30 pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("${WEEKDAY_BG_IMAGE}")`,
                    backgroundSize: '60%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            <div className={`grid border-b border-theme-light bg-theme-light/10 relative z-10 ${showWeekdays ? 'grid-cols-[0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_2.5fr_2.5fr]' : 'grid-cols-2'}`}>
                {showWeekdays && (
                    <>
                        <div className="py-2 text-center text-[10px] font-black text-theme-muted uppercase">M</div>
                        <div className="py-2 text-center text-[10px] font-black text-theme-muted uppercase">T</div>
                        <div className="py-2 text-center text-[10px] font-black text-theme-muted uppercase">W</div>
                        <div className="py-2 text-center text-[10px] font-black text-theme-muted uppercase">T</div>
                        <div className="py-2 text-center text-[10px] font-black text-theme-muted uppercase">F</div>
                    </>
                )}
                <div className="py-2 sm:py-3 text-center text-xs sm:text-sm font-black text-theme-gold uppercase tracking-[0.2em]">Saturday</div>
                <div className="py-2 sm:py-3 text-center text-xs sm:text-sm font-black text-theme-gold uppercase tracking-[0.2em]">Sunday</div>
            </div>

            <div className={`grid bg-transparent relative z-10 ${showWeekdays ? 'grid-cols-[0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_2.5fr_2.5fr]' : 'grid-cols-2'}`}>
                {cells.map((cell, idx) => {
                    // Identify next month padding cells
                    const isNextMonth = !cell.isCurrent && cell.date.getDate() < 15;

                    const dayOfWeek = (cell.date.getDay() + 6) % 7;
                    const isWeekend = dayOfWeek >= 5;

                    if (!showWeekdays && !isWeekend) return null;

                    // If it is next month's padding, render an empty placeholder to maintain grid shape
                    // without showing details.
                    if (isNextMonth) {
                         return (
                            <div 
                                key={idx} 
                                className={`
                                    min-h-[60px] sm:min-h-[90px] border-b border-r border-theme-light/10 p-1 sm:p-2 relative
                                    ${isWeekend && showWeekdays ? 'bg-theme-base/30' : 'bg-transparent'}
                                `}
                            ></div>
                         );
                    }

                    const isToday = cell.date.toDateString() === today.toDateString();
                    
                    const daysEvents = fixtures.filter(e => {
                        const eDate = new Date(e.date);
                        return eDate.getDate() === cell.date.getDate() &&
                               eDate.getMonth() === cell.date.getMonth() &&
                               eDate.getFullYear() === cell.date.getFullYear();
                    });

                    return (
                        <div 
                            key={idx} 
                            className={`
                                min-h-[60px] sm:min-h-[90px] border-b border-r border-theme-light/30 p-1 sm:p-2 transition-colors relative group min-w-0 flex flex-col
                                ${!cell.isCurrent ? 'opacity-30' : ''}
                                ${isWeekend ? (showWeekdays ? 'bg-theme-base' : 'bg-theme-base/75') : 'bg-transparent'}
                                ${!isWeekend && showWeekdays ? 'hover:bg-theme-light/10' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`
                                    w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold
                                    ${isToday ? 'bg-theme-gold text-theme-base shadow-[0_0_10px_rgba(255,209,2,0.4)]' : 'text-theme-muted group-hover:text-theme-text'}
                                `}>
                                    {cell.date.getDate()}
                                </span>
                            </div>

                            <div className="flex-grow flex flex-col gap-1 sm:gap-1.5 overflow-hidden">
                                {daysEvents.map(event => {
                                    const timeStr = new Date(event.date).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});
                                    const displayTime = timeStr === '00:00' ? 'TBC' : timeStr;
                                    const isCompleted = event.status === 'completed';
                                    const hasOpponent = !!event.opponent;
                                    const titansName = event.teamName === "Titans" ? "Titans" : event.teamName;
                                    const topTeam = event.isHome ? titansName : event.opponent;
                                    const bottomTeam = event.isHome ? event.opponent : titansName;
                                    const isTopTitans = event.isHome;
                                    const isBottomTitans = !event.isHome;
                                    
                                    // Derby Detection
                                    const isDerby = event.opponent.toLowerCase().includes('titan');

                                    const theme = getCompetitionTheme(event);
                                    const isSpecialCompetition = !!theme && !isCompleted;

                                    let cardBgClass = isWeekend ? 'bg-white/5 hover:bg-white/10' : 'hover:bg-theme-gold/20';
                                    
                                    // BORDER LOGIC: We now use a background color for the left bar div
                                    let barBgClass = isCompleted ? 'bg-transparent' : 'bg-theme-gold'; // Default Home
                                    
                                    let cardShadowClass = '';
                                    let badgeClass = 'bg-theme-light text-theme-gold border-theme-gold/30';
                                    let timeColorClass = isCompleted ? 'text-theme-muted' : 'text-white';
                                    let titansColorClass = 'text-theme-gold';
                                    let opponentColorClass = isCompleted ? 'text-theme-muted' : 'text-white';
                                    
                                    // Home Badge: Yellow to Black Gradient
                                    let haBadgeHomeClass = 'bg-gradient-to-r from-[#FFD102] to-[#26241E] text-white';
                                    
                                    // Away Badge: pink/blue gradient
                                    let haBadgeAwayClass = 'bg-gradient-to-r from-[#f5abb9] to-[#5bcffa] text-white';
                                    
                                    // Derby Badge: flashy gradient
                                    const derbyBadgeClass = 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse';

                                    // HOME MATCH GRADIENT BORDER (Default)
                                    if (event.isHome && !isSpecialCompetition && !isCompleted && isWeekend && !isDerby) {
                                        barBgClass = 'bg-gradient-to-b from-[#FFD102] to-[#26241E]';
                                    }

                                    // AWAY MATCH PINK BORDER
                                    if (!event.isHome && !isSpecialCompetition && !isCompleted && isWeekend && !isDerby) {
                                        barBgClass = 'bg-[#f5abb9]';
                                    }

                                    // Result colors
                                    let resultText = '';
                                    let resultBg = 'bg-theme-gold';

                                    if (isCompleted && event.result) {
                                        if (event.result === 'W') { 
                                            barBgClass = 'bg-green-500'; 
                                            resultText = 'W';
                                            resultBg = 'bg-green-500';
                                        } else if (event.result === 'L') { 
                                            barBgClass = 'bg-red-500'; 
                                            resultText = 'L'; 
                                            resultBg = 'bg-red-500';
                                        } else { 
                                            barBgClass = 'bg-blue-500'; 
                                            resultText = 'D'; 
                                            resultBg = 'bg-blue-500';
                                        }
                                    }

                                    if (isSpecialCompetition && isWeekend) {
                                        if (theme === 'gold') {
                                            cardBgClass = 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500';
                                            barBgClass = 'bg-yellow-600';
                                            cardShadowClass = 'shadow-[0_0_15px_rgba(250,204,21,0.6)]';
                                            badgeClass = 'bg-yellow-900/20 text-yellow-900 border-yellow-900/20';
                                            timeColorClass = 'text-yellow-900 font-bold';
                                            titansColorClass = 'text-yellow-900';
                                            opponentColorClass = 'text-yellow-900/80';
                                            haBadgeHomeClass = 'bg-yellow-900 text-yellow-100';
                                            haBadgeAwayClass = 'bg-yellow-800 text-yellow-100';
                                        } else if (theme === 'silver') {
                                            cardBgClass = 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400';
                                            barBgClass = 'bg-slate-500';
                                            cardShadowClass = 'shadow-[0_0_15px_rgba(203,213,225,0.6)]';
                                            badgeClass = 'bg-slate-900/20 text-slate-900 border-slate-900/20';
                                            timeColorClass = 'text-slate-900 font-bold';
                                            titansColorClass = 'text-slate-900';
                                            opponentColorClass = 'text-slate-900/80';
                                            haBadgeHomeClass = 'bg-slate-900 text-slate-100';
                                            haBadgeAwayClass = 'bg-slate-700 text-slate-100';
                                        } else if (theme === 'bronze') {
                                            cardBgClass = 'bg-gradient-to-r from-[#cd7f32] via-[#E09F70] to-[#8c5626]';
                                            barBgClass = 'bg-[#5c3a1e]';
                                            cardShadowClass = 'shadow-[0_0_15px_rgba(205,127,50,0.6)]';
                                            badgeClass = 'bg-black/20 text-white border-white/30';
                                            timeColorClass = 'text-white font-bold';
                                            titansColorClass = 'text-white';
                                            opponentColorClass = 'text-white/90';
                                            haBadgeHomeClass = 'bg-white text-[#8c5626]';
                                            haBadgeAwayClass = 'bg-black/40 text-white';
                                        }
                                    }

                                    // Derby styling override for grid background
                                    if (isDerby && isWeekend && !isCompleted) {
                                        cardBgClass = 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500';
                                        barBgClass = 'bg-purple-400';
                                        cardShadowClass = 'shadow-[0_0_15px_rgba(236,72,153,0.6)]';
                                        badgeClass = 'bg-black/20 text-white border-white/30';
                                        timeColorClass = 'text-white font-bold';
                                        titansColorClass = 'text-white';
                                        opponentColorClass = 'text-white';
                                    }

                                    const getTeamStyle = (isTitans: boolean) => {
                                        if (isDerby && !isCompleted) return 'text-white font-black';
                                        if (isSpecialCompetition) {
                                            return isTitans ? `${titansColorClass} font-black` : `${opponentColorClass} font-black`;
                                        }
                                        if (isTitans) return 'text-theme-gold';
                                        return isCompleted ? 'text-theme-muted' : 'text-white';
                                    };

                                    return (
                                        <button 
                                            key={event.id}
                                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                            className={`
                                                w-full rounded-md transition-all relative overflow-hidden
                                                ${!isWeekend ? 'p-1 hover:bg-theme-gold/20 flex items-center justify-center' : 'text-left pl-2 p-1.5 sm:p-2'}
                                                ${isWeekend ? cardBgClass : ''}
                                                ${isCompleted ? 'opacity-60 hover:opacity-100' : 'hover:translate-x-1 hover:shadow-lg'}
                                                ${isWeekend ? cardShadowClass : ''}
                                            `}
                                        >
                                            {/* LEFT BORDER BAR */}
                                            {isWeekend && (
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${barBgClass}`}></div>
                                            )}

                                            {!isWeekend && (
                                                <>
                                                    {/* Mobile View: Dot */}
                                                    <div className="block sm:hidden w-1.5 h-1.5 bg-theme-gold rounded-full shadow-[0_0_4px_rgba(255,209,2,0.6)] flex-shrink-0"></div>
                                                    
                                                    {/* Desktop View: Text */}
                                                    <span className="hidden sm:block text-[9px] font-bold uppercase text-theme-gold leading-tight break-words line-clamp-2 text-center w-full">
                                                        {event.teamName}
                                                    </span>
                                                </>
                                            )}

                                            {isWeekend && (
                                                <div className="flex flex-col gap-1 relative z-10 w-full">
                                                    
                                                    <div className="flex items-center gap-1.5 opacity-90 flex-wrap relative z-10">
                                                        {hasOpponent && (
                                                            <span className={`
                                                                rounded-[2px] px-1 py-[1px] text-[8px] font-black uppercase tracking-wider leading-none min-w-[12px] text-center shadow-sm
                                                                ${isDerby ? derbyBadgeClass : (event.isHome ? haBadgeHomeClass : haBadgeAwayClass)}
                                                            `}>
                                                                {isDerby ? 'DERBY' : (event.isHome ? 'H' : 'A')}
                                                            </span>
                                                        )}
                                                        <span className={`text-[9px] font-sans whitespace-nowrap ${timeColorClass}`}>
                                                            {displayTime}
                                                        </span>
                                                        
                                                        {event.competitionTag && (
                                                            <span className={`ml-auto rounded-[2px] px-1 py-[1px] text-[8px] font-black uppercase border flex items-center gap-1 shadow-sm ${badgeClass}`}>
                                                                {isSpecialCompetition && <Trophy size={8} />}
                                                                {event.competitionTag}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-start justify-between gap-2 w-full relative z-10">
                                                        <div className="flex flex-col leading-tight min-w-0 flex-grow">
                                                            {hasOpponent ? (
                                                                <>
                                                                    <span className={`text-xs sm:text-sm font-black uppercase truncate font-sans ${getTeamStyle(isTopTitans)}`}>
                                                                        {topTeam}
                                                                    </span>
                                                                    <span className={`text-xs sm:text-sm font-black uppercase truncate font-sans ${getTeamStyle(isBottomTitans)}`}>
                                                                        {bottomTeam}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className={`text-xs sm:text-sm font-black uppercase truncate font-sans ${isSpecialCompetition || isDerby ? titansColorClass : 'text-theme-gold'}`}>
                                                                    {event.teamName}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {resultText && (
                                                            <span className={`flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded ${resultBg} text-white`}>
                                                                {resultText} {event.score && <span className="ml-1 opacity-90 border-l border-white/30 pl-1">{event.score}</span>}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default CalendarGrid;
