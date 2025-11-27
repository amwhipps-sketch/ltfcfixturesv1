
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export interface Fixture {
  id: string;
  opponent: string;
  isHome: boolean;
  date: Date;
  location: string;
  competition: string;
  competitionTag?: string; // e.g. "LDL", "GFSN", "LUL CUP"
  status: 'upcoming' | 'completed' | 'live';
  teamName: string;
  score?: string;
  result?: 'W' | 'L' | 'D'; // Win, Loss, Draw
}

export enum FilterType {
  ALL = 'ALL',
  HOME = 'HOME',
  AWAY = 'AWAY'
}