
import { ShortLink, ClickData } from '../types';

const STORAGE_KEY = 'linksmart_data_v1';

export const getLinks = (): ShortLink[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load links", e);
    return [];
  }
};

export const saveLink = (link: ShortLink): void => {
  const links = getLinks();
  const existingIndex = links.findIndex(l => l.id === link.id);
  
  let updatedLinks;
  if (existingIndex >= 0) {
    // Update existing
    links[existingIndex] = link;
    updatedLinks = [...links];
  } else {
    // Add new to top
    updatedLinks = [link, ...links];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
};

export const deleteLink = (id: string): void => {
  const links = getLinks();
  const updatedLinks = links.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
};

export const recordClick = (id: string): ShortLink | null => {
  const links = getLinks();
  const today = new Date().toISOString().split('T')[0];
  
  const linkIndex = links.findIndex(l => l.id === id);
  if (linkIndex === -1) return null;

  const link = links[linkIndex];
  link.totalClicks += 1;

  // Update history
  const historyIndex = link.clickHistory.findIndex(h => h.date === today);
  if (historyIndex >= 0) {
    link.clickHistory[historyIndex].count += 1;
  } else {
    link.clickHistory.push({ date: today, count: 1 });
    // Keep only last 30 days to prevent bloat
    if (link.clickHistory.length > 30) {
      link.clickHistory.shift();
    }
  }

  links[linkIndex] = link;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  return link;
};

export const checkAliasExists = (alias: string): boolean => {
  const links = getLinks();
  return links.some(l => l.alias === alias);
}

// Seed some initial data if empty for demo purposes
export const seedDataIfEmpty = () => {
  const links = getLinks();
  if (links.length === 0) {
    const now = Date.now();
    const demoLinks: ShortLink[] = [
      {
        id: 'demo-1',
        originalUrl: 'https://www.google.com',
        alias: 'google-search',
        createdAt: now - 10000000,
        totalClicks: 124,
        clickHistory: [
          { date: '2023-10-20', count: 10 },
          { date: '2023-10-21', count: 45 },
          { date: '2023-10-22', count: 69 },
        ],
        tags: ['search', 'engine']
      },
      {
        id: 'demo-2',
        originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        alias: 'mystery-video',
        createdAt: now - 5000000,
        totalClicks: 892,
        clickHistory: [
          { date: '2023-10-21', count: 200 },
          { date: '2023-10-22', count: 692 },
        ],
        tags: ['video', 'music']
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoLinks));
  }
};
