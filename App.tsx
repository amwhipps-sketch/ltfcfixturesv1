import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import EventModal from './components/EventModal';
import EmbedModal from './components/EmbedModal';
import { getFixtures } from './services/fixtureService';
import { Fixture } from './types';
import { RefreshCw, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWeekdays, setShowWeekdays] = useState(false);
  
  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<Fixture | null>(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFixtures();
      setFixtures(data);
    } catch (error) {
      console.error("Failed to fetch fixtures", error);
      setError("Unable to connect to the match schedule service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-resize logic for iframe embedding
  useEffect(() => {
    const sendHeight = () => {
      // Calculate total height of the document
      const height = document.documentElement.scrollHeight; 
      // Send message to parent window (if embedded)
      window.parent.postMessage({ type: 'titans-calendar-resize', height }, '*');
    };

    // Use ResizeObserver to detect any layout changes (content loading, expanding, toggling)
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    observer.observe(document.documentElement);
    
    // Also attach to window events
    window.addEventListener('load', sendHeight);
    window.addEventListener('resize', sendHeight);
    
    // Initial send
    sendHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener('load', sendHeight);
      window.removeEventListener('resize', sendHeight);
    };
  }, [fixtures, showWeekdays, currentDate, selectedEvent, showEmbedModal, isLoading, error]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate hidden weekday events for the current month to display in Header
  const getHiddenEventCount = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Filter fixtures for current month and weekdays
      return fixtures.filter(f => {
          const d = new Date(f.date);
          const isSameMonth = d.getMonth() === month && d.getFullYear() === year;
          const day = d.getDay(); // 0 is Sunday, 6 is Saturday
          const isWeekday = day >= 1 && day <= 5;
          return isSameMonth && isWeekday;
      }).length;
  };

  return (
    <div className="max-w-6xl mx-auto" id="app">
        {/* Header with Navigation */}
        <Header 
          currentDate={currentDate} 
          onPrevMonth={() => changeMonth(-1)}
          onNextMonth={() => changeMonth(1)}
          onToday={goToToday}
          onEmbed={() => setShowEmbedModal(true)}
          showWeekdays={showWeekdays}
          onToggleWeekdays={() => setShowWeekdays(!showWeekdays)}
          hiddenEventCount={getHiddenEventCount()}
        />

        {/* Loading State */}
        {isLoading && (
            <div className="w-full h-96 flex items-center justify-center border border-theme-light rounded-2xl bg-theme-light/20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-theme-muted text-sm">Syncing Calendar...</p>
                </div>
            </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
             <div className="w-full h-96 flex flex-col items-center justify-center border border-theme-light rounded-2xl bg-theme-light/10 text-center p-6">
                <div className="bg-red-500/10 text-red-500 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-theme-text font-bold text-xl mb-2">Connection Issue</h3>
                <p className="text-theme-muted mb-6 max-w-md text-sm">{error}</p>
                <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-6 py-3 bg-theme-gold text-theme-base rounded-lg hover:bg-theme-gold-dim transition-all font-bold uppercase tracking-wider shadow-lg"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry Connection
                </button>
            </div>
        )}

        {/* Calendar Grid */}
        {!isLoading && !error && (
            <CalendarGrid 
                currentDate={currentDate} 
                fixtures={fixtures} 
                onEventClick={setSelectedEvent} 
                showWeekdays={showWeekdays}
            />
        )}

        {/* Modals */}
        {selectedEvent && (
            <EventModal 
                fixture={selectedEvent} 
                onClose={() => setSelectedEvent(null)} 
            />
        )}

        {showEmbedModal && (
            <EmbedModal onClose={() => setShowEmbedModal(false)} />
        )}
    </div>
  );
};

export default App;