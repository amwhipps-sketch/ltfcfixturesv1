import React from 'react';
import { ChevronLeft, ChevronRight, Code, Eye, EyeOff } from 'lucide-react';
import { Badge } from './Badge';

interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onEmbed: () => void;
  showWeekdays: boolean;
  onToggleWeekdays: () => void;
  hiddenEventCount: number;
}

const Header: React.FC<HeaderProps> = ({ 
    currentDate, 
    onPrevMonth, 
    onNextMonth, 
    onToday, 
    onEmbed, 
    showWeekdays, 
    onToggleWeekdays, 
    hiddenEventCount 
}) => {
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 sm:mb-6 p-4 sm:p-6 bg-theme-light/30 backdrop-blur-xl border border-theme-light rounded-2xl shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 drop-shadow-lg">
                <Badge />
            </div>
            <div>
                <h2 className="text-xl sm:text-3xl font-black text-theme-gold tracking-tight uppercase">
                    {monthName} <span className="text-white font-medium">{year}</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-theme-muted uppercase tracking-widest font-bold">Titans Fixture Calendar</p>
            </div>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <button 
                onClick={onToggleWeekdays}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    hiddenEventCount > 0 && !showWeekdays
                    ? 'bg-theme-light/50 text-theme-gold animate-pulse hover:bg-theme-gold hover:text-theme-base border border-theme-gold/50' 
                    : 'bg-transparent text-theme-muted hover:text-theme-text border border-theme-light/30'
                }`}
             >
                {showWeekdays ? <EyeOff size={12} /> : <Eye size={12} />}
                {showWeekdays ? 'Hide Weekdays' : (hiddenEventCount > 0 ? `Show ${hiddenEventCount} Midweek Fixture${hiddenEventCount !== 1 ? 's' : ''}` : 'Show Full Week')}
             </button>

            <div className="flex items-center justify-between w-full md:w-auto gap-2">
                <button onClick={onPrevMonth} className="p-1.5 sm:p-2 text-theme-muted hover:text-theme-gold hover:bg-theme-light/20 rounded-lg transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button onClick={onToday} className="bg-theme-light hover:bg-theme-light/80 text-theme-text border border-theme-light/50 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all">
                    Today
                </button>

                <button onClick={onNextMonth} className="p-1.5 sm:p-2 text-theme-muted hover:text-theme-gold hover:bg-theme-light/20 rounded-lg transition-all">
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div className="flex items-center ml-auto md:ml-0 pl-2 border-l border-theme-light/30">
                    <button onClick={onEmbed} className="p-1.5 sm:p-2 text-theme-muted hover:text-theme-gold hover:bg-theme-light/20 rounded-lg transition-all" title="Get Embed Code">
                    <Code className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Header;