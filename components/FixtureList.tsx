import React, { useEffect, useRef } from 'react';
import { Fixture } from '../types';
import FixtureCard from './FixtureCard';

interface FixtureListProps {
  fixtures: Fixture[];
  isLoading: boolean;
}

const FixtureList: React.FC<FixtureListProps> = ({ fixtures, isLoading }) => {
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (!isLoading && fixtures.length > 0 && !hasScrolledRef.current) {
      const firstUpcoming = fixtures.find(f => f.status === 'upcoming');
      if (firstUpcoming) {
        const element = document.getElementById(`fixture-${firstUpcoming.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hasScrolledRef.current = true;
        }
      }
    }
  }, [isLoading, fixtures]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400 min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-[#FFD102] border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="font-heading uppercase text-sm font-bold tracking-widest text-[#26241E]">Loading Season Data...</p>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500 font-bold text-xl">No scheduled matches found.</p>
      </div>
    );
  }

  // Group fixtures by Month
  const groupedFixtures = fixtures.reduce((groups, fixture) => {
    const monthYear = fixture.date.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(fixture);
    return groups;
  }, {} as Record<string, Fixture[]>);

  return (
    <div className="pb-12 space-y-12">
      {(Object.entries(groupedFixtures) as [string, Fixture[]][]).map(([month, monthFixtures]) => (
        <div key={month} className="animate-fadeIn">
          {/* Month Header */}
          <div className="flex items-center gap-4 mb-6">
             <div className="h-8 w-2 bg-[#FFD102]"></div>
             <h2 className="font-black text-3xl text-[#26241E] uppercase tracking-tighter">
              {month}
             </h2>
             <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          
          {/* Grid of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {monthFixtures.map((fixture) => (
              <FixtureCard 
                key={fixture.id} 
                id={`fixture-${fixture.id}`} 
                fixture={fixture} 
              />
            ))}
          </div>
        </div>
      ))}
      
      <div className="text-center pt-12 border-t border-gray-200 mt-12">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">End of Season Schedule</p>
      </div>
    </div>
  );
};

export default FixtureList;