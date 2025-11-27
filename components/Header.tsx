
import React from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Badge } from './Badge';

interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  showWeekdays: boolean;
  onToggleWeekdays: () => void;
  hiddenEventCount: number;
}

const Header: React.FC<HeaderProps> = ({ 
    currentDate, 
    onPrevMonth, 
    onNextMonth, 
    onToday, 
    showWeekdays, 
    onToggleWeekdays, 
    hiddenEventCount 
}) => {
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 sm:mb-6 p-4 sm:p-6 bg-theme-light/30 backdrop-blur-xl border border-theme-light rounded-2xl shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 drop-shadow-lg">
                <Badge />
            </div>
            <div className="flex-grow md:flex-grow-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-3xl font-black text-theme-gold tracking-tight uppercase whitespace-nowrap">
                        {monthName} <span className="text-white font-medium">{year}</span>
                    </h2>
                    
                    {/* Weekday Toggle moved inline with Title */}
                    <button 
                        onClick={onToggleWeekdays}
                        title={showWeekdays ? "Hide Weekdays" : "Show Full Week"}
                        className={`
                            relative p-1.5 rounded-lg transition-all flex items-center justify-center
                            ${showWeekdays 
                                ? 'bg-theme-gold text-theme-base hover:bg-theme-gold-dim' 
                                : 'bg-theme-light/30 text-theme-muted hover:text-theme-text hover:bg-theme-light/50 border border-theme-light/30'
                            }
                        `}
                    >
                        {showWeekdays ? <EyeOff size={18} /> : <Eye size={18} />}
                        
                        {!showWeekdays && hiddenEventCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-theme-gold rounded-full border-2 border-[#1D1B17]"></span>
                        )}
                    </button>
                </div>
                <p className="text-[10px] sm:text-xs text-theme-muted uppercase tracking-widest font-bold">Titans Fixture Calendar</p>
            </div>
        </div>

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
        </div>
    </div>
  );
};

export default Header;
