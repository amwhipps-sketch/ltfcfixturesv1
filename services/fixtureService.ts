
import { Fixture } from '../types';
import { CALENDAR_ID } from '../constants';

// Define proxy types to handle different response formats
type ProxyConfig = {
    urlGenerator: (url: string) => string;
    responseType: 'text' | 'json';
};

// List of CORS proxies to try in order. 
const PROXIES: ProxyConfig[] = [
  // Option 1: CORS Proxy IO (Fast, Raw Text, usually most compatible with Google)
  {
    urlGenerator: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    responseType: 'text'
  },
  // Option 2: AllOrigins JSON (Reliable alternative)
  {
    urlGenerator: (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    responseType: 'json'
  },
  // Option 3: CodeTabs (Often very reliable for raw text)
  {
    urlGenerator: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    responseType: 'text'
  },
  // Option 4: AllOrigins Raw (Backup for text)
  {
    urlGenerator: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    responseType: 'text'
  }
];

const getIcsUrl = (calendarId: string) => 
  `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;

/**
 * Parses a standard ICS date string (e.g., 20231025T143000Z) into a JS Date object.
 */
const parseIcsDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Handle format: YYYYMMDDTHHMMSSZ (UTC) or YYYYMMDDTHHMMSS (Local)
  const match = dateStr.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) {
    // Fallback for simple date: YYYYMMDD (All day events)
    const simpleMatch = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
    if (simpleMatch) {
      return new Date(
        parseInt(simpleMatch[1]),
        parseInt(simpleMatch[2]) - 1,
        parseInt(simpleMatch[3])
      );
    }
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  
  // We parse as UTC to ensure consistency across timezones for the feed
  return new Date(Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  ));
};

/**
 * Unfolds ICS lines (lines starting with space are continuations of previous line)
 */
const unfoldLines = (lines: string[]): string[] => {
  const unfolded: string[] = [];
  lines.forEach(line => {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.trim();
      }
    } else {
      unfolded.push(line);
    }
  });
  return unfolded;
};

/**
 * Parses raw ICS text into Fixture objects
 */
const parseICS = (icsData: string): Fixture[] => {
  // Check for valid ICS header
  if (!icsData.includes("BEGIN:VCALENDAR")) {
      console.warn("Invalid ICS data received. content-snippet:", icsData.substring(0, 100));
      throw new Error("Received data is not a valid ICS calendar file");
  }

  const lines = unfoldLines(icsData.split(/\r\n|\n|\r/));
  const fixtures: Fixture[] = [];
  
  let currentEvent: Partial<Record<string, string>> | null = null;
  let inEvent = false;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
      continue;
    }
    
    if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent && currentEvent['DTSTART'] && currentEvent['SUMMARY']) {
        const date = parseIcsDate(currentEvent['DTSTART']);
        if (date) {
           fixtures.push(mapEventToFixture(currentEvent as any, date));
        }
      }
      currentEvent = null;
      continue;
    }

    if (inEvent && currentEvent) {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex > -1) {
        const key = line.substring(0, separatorIndex).split(';')[0]; // Ignore params like ;TZID=...
        const value = line.substring(separatorIndex + 1);
        currentEvent[key] = value;
      }
    }
  }

  return fixtures;
};

/**
 * Intelligent mapping of calendar event to Fixture model.
 */
const mapEventToFixture = (event: { UID: string, SUMMARY: string, LOCATION?: string, DESCRIPTION?: string }, date: Date): Fixture => {
  let summary = event.SUMMARY || 'Match';
  summary = summary.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\[nN]/g, ' ').replace(/\\\\/g, '\\').replace(/\u00A0/g, ' ').trim();
  
  let location = event.LOCATION || 'TBC';
  location = location.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\[nN]/g, ' ').replace(/\u00A0/g, ' ');

  let description = event.DESCRIPTION || '';
  description = description.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\[nN]/g, ' ').replace(/\\\\/g, '\\');

  // Default assumption
  let isHome = true;
  let opponent = "";
  let competition = 'Fixture';
  let competitionTag: string | undefined = undefined;
  let teamName = "Titans";
  let score: string | undefined = undefined;
  let result: 'W' | 'L' | 'D' | undefined = undefined;

  const summaryLower = summary.toLowerCase();
  
  // PRIORITY 1: Check for "Training" explicitly
  if (summaryLower.includes('training')) {
      teamName = summary.replace(/^(London )?Titans\s+/i, '').trim();
      if (!teamName) teamName = summary;
      opponent = ""; // Single entity event
      competition = 'Training';
  }
  else {
      // PRIORITY 2: Check for Match Separators (VS, -, etc.)
      const vsMatch = summary.match(/^(.*?)(\s+(?:v|vs|V|VS|Vs|against)\.?\s+|\s+[-–—]\s+)(.*)$/);
      
      if (vsMatch) {
        const [, teamA, separator, teamB] = vsMatch;
        
        if (teamA.trim() && teamB.trim()) {
            const tALower = teamA.toLowerCase();
            const tBLower = teamB.toLowerCase();

            // Heuristic: If Titans are listed second, it's usually Away.
            if (tBLower.includes('titan')) {
                isHome = false;
                opponent = teamA.trim();
                teamName = teamB.trim();
            } else if (tALower.includes('titan')) {
                isHome = true;
                opponent = teamB.trim();
                teamName = teamA.trim();
            } else {
                opponent = teamB.trim();
                if (teamA.length < 30) {
                   teamName = teamA.trim(); 
                }
            }
        }
      } else {
        // PRIORITY 3: Fallback
        const day = date.getDay();
        const isWeekday = day >= 1 && day <= 5;
        
        if (isWeekday) {
             teamName = summary.replace(/^(London )?Titans\s+/i, '').trim();
             if (!teamName) teamName = summary;
             opponent = "";
             isHome = true;
        } else {
            opponent = summary;
            if (opponent.toLowerCase() === 'titans' || opponent.toLowerCase() === 'london titans') {
                opponent = 'Internal Match / Event';
            } else if (opponent.toLowerCase().includes('titan')) {
                teamName = opponent;
                opponent = "Club Event";
            }
        }
      }
  }

  // FAILSAFE: Ensure Team and Opponent are not identical
  if (opponent && teamName.toLowerCase().trim() === opponent.toLowerCase().trim()) {
      opponent = "Club Event";
  }

  // Attempt to extract score
  const scoreRegex = /\b(\d+)\s*[-–—]\s*(\d+)\b/; 
  let scoreMatch = description.match(scoreRegex);
  const scoreInSummary = summary.match(scoreRegex);
  
  if (!scoreMatch) {
      scoreMatch = scoreInSummary;
  }

  if (scoreMatch) {
    score = scoreMatch[0].replace(/\s+/g, '').replace(/[-–—]/, '-');
    
    const score1 = parseInt(scoreMatch[1]);
    const score2 = parseInt(scoreMatch[2]);
    
    let titansScore = 0;
    let oppScore = 0;

    if (isHome) {
        titansScore = score1;
        oppScore = score2;
    } else {
        titansScore = score2;
        oppScore = score1;
    }

    if (titansScore > oppScore) result = 'W';
    else if (titansScore < oppScore) result = 'L';
    else result = 'D';
  }

  // Remove "London" prefix
  if (teamName.startsWith("London Titans")) {
      teamName = teamName.replace("London Titans", "Titans").trim();
  }

  // Clean up score from names if necessary
  if (scoreInSummary && scoreMatch && opponent) {
    const rawScore = scoreMatch[0]; 
    opponent = opponent.replace(rawScore, '').replace(/^-| -$/, '').trim();
    teamName = teamName.replace(rawScore, '').replace(/^-| -$/, '').trim();
  }

  // Competition & Tag detection
  const descLower = description.toLowerCase();
  const summaryLowerClean = summary.toLowerCase();

  // Tags Priority: Cups/Shields first, then Leagues
  if (descLower.includes('gfsn shield') || summaryLowerClean.includes('gfsn shield')) {
      competitionTag = 'GFSN SHIELD';
      competition = 'GFSN Shield';
  } else if (descLower.includes('gfsn development') || summaryLowerClean.includes('gfsn development')) {
      competitionTag = 'GFSN DEV';
      competition = 'GFSN Development League';
  } else if (descLower.includes('lul cup') || summaryLowerClean.includes('lul cup')) {
      competitionTag = 'LUL CUP';
      competition = 'LUL Cup';
  } else if (descLower.includes('london dev league') || summaryLowerClean.includes('london dev league')) {
      competitionTag = 'LDL';
      competition = 'London Dev League';
  } else if (descLower.includes('gfsn matchweek') || descLower.includes('gfsn') || summaryLowerClean.includes('gfsn')) {
      competitionTag = 'GFSN';
  } else if (descLower.includes('lul matchweek') || descLower.includes('lul') || summaryLowerClean.includes('lul')) {
      competitionTag = 'LUL';
  }

  // Standard Competition overrides if not specific
  if (competition === 'Fixture') {
      if (descLower.includes('league') || summaryLowerClean.includes('league')) competition = 'League Match';
      else if (descLower.includes('cup') || summaryLowerClean.includes('cup')) competition = 'Cup Match';
      else if (descLower.includes('friendly') || summaryLowerClean.includes('friendly')) competition = 'Friendly';
      else if (!opponent) competition = 'Club Event';
  }

  // Add suffix for rounds/types to Competition Name if found (for Styling)
  if (descLower.includes('quarter-final') || descLower.includes('quarter final')) {
     if (!competition.toLowerCase().includes('quarter')) competition += ' Quarter-Final';
  } else if (descLower.includes('semi-final') || descLower.includes('semi final')) {
     if (!competition.toLowerCase().includes('semi')) competition += ' Semi-Final';
  } else if (descLower.includes('final') && !descLower.includes('semi')) {
     if (!competition.toLowerCase().includes('final')) competition += ' Final';
  }
  
  if (descLower.includes('plate') && !competition.toLowerCase().includes('plate')) {
      competition += ' Plate';
  }
  if (descLower.includes('trophy') && !competition.toLowerCase().includes('trophy')) {
      competition += ' Trophy';
  }
  
  const now = new Date();
  const status = date < now ? 'completed' : 'upcoming';

  return {
    id: event.UID || Math.random().toString(),
    opponent: opponent,
    isHome: isHome,
    date: date,
    location: location,
    competition: competition,
    competitionTag: competitionTag,
    status: status,
    teamName: teamName,
    score: score,
    result: result
  };
};

const fetchWithTimeout = async (url: string, timeout = 25000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e: any) {
      clearTimeout(id);
      if (e.name === 'AbortError' || e.message?.includes('aborted')) {
          throw new Error(`Request timed out after ${timeout}ms. Proxy may be slow.`);
      }
      throw e;
    }
};

export const getFixtures = async (): Promise<Fixture[]> => {
  const icsUrl = getIcsUrl(CALENDAR_ID);
  const targetUrl = icsUrl; 
  let lastError: any = null;

  for (let i = 0; i < PROXIES.length; i++) {
      const proxy = PROXIES[i];
      try {
          const proxyUrl = proxy.urlGenerator(targetUrl);
          console.log(`Attempting fetch via proxy ${i + 1} (${proxy.responseType})...`); 
          const response = await fetchWithTimeout(proxyUrl);
          
          if (!response.ok) {
              console.warn(`Proxy ${i + 1} failed with status: ${response.status}`);
              continue;
          }

          let icsData = "";

          if (proxy.responseType === 'json') {
             const json = await response.json();
             if (json.contents) {
                 icsData = json.contents;
             } else {
                 throw new Error("JSON response missing 'contents' field");
             }
          } else {
             icsData = await response.text();
          }

          if (icsData && icsData.startsWith('data:')) {
            try {
                const base64Marker = ';base64,';
                const base64Index = icsData.indexOf(base64Marker);
                if (base64Index !== -1) {
                    const base64 = icsData.substring(base64Index + base64Marker.length);
                    const binaryString = atob(base64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let b = 0; b < binaryString.length; b++) {
                        bytes[b] = binaryString.charCodeAt(b);
                    }
                    icsData = new TextDecoder().decode(bytes);
                }
            } catch (e) {
                console.warn("Failed to decode Data URI from proxy:", e);
            }
          }
          
          if (!icsData || icsData.length < 50) {
             throw new Error("Empty or invalid response from proxy");
          }

          if (icsData.trim().startsWith("<!DOCTYPE") || icsData.trim().startsWith("<html")) {
              throw new Error("Proxy returned HTML error page instead of ICS data");
          }

          const allFixtures = parseICS(icsData);
          console.log(`Successfully fetched ${allFixtures.length} fixtures via proxy ${i + 1}`);
          return allFixtures.sort((a, b) => a.date.getTime() - b.date.getTime());

      } catch (error) {
          console.warn(`Proxy ${i + 1} error:`, error);
          lastError = error;
          continue;
      }
  }

  console.error("All proxies failed. Last error:", lastError);
  throw lastError || new Error("Failed to load calendar data. Please check your internet connection or try again later.");
};
