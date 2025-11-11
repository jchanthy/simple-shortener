
import React, { useState, useEffect } from 'react';
import { 
  Zap,
  ExternalLink,
  LayoutGrid
} from 'lucide-react';
import { LinksList } from './components/LinksList';
import { CreateLink } from './components/CreateLink';
import { getLinks, saveLink, deleteLink, recordClick, seedDataIfEmpty } from './services/storageService';
import { ShortLink } from './types';

type AppView = 'create' | 'list';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('create');
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Redirection State
  const [redirectState, setRedirectState] = useState<{active: boolean; url?: string}>({ active: false });

  // Initialize data and check for redirection hash
  useEffect(() => {
    // 1. Check for hash routing (e.g. /#/alias)
    const hash = window.location.hash;
    if (hash.startsWith('#/') && hash.length > 2) {
      const alias = hash.substring(2);
      const storedLinks = getLinks();
      const targetLink = storedLinks.find(l => l.alias === alias);

      if (targetLink) {
        setRedirectState({ active: true, url: targetLink.originalUrl });
        
        // Record the click
        recordClick(targetLink.id);
        
        // Redirect after a short delay to show feedback
        setTimeout(() => {
          window.location.replace(targetLink.originalUrl);
        }, 1500);
        return; // Stop execution here to show redirect screen
      }
    }

    // 2. Normal App Load
    seedDataIfEmpty();
    setLinks(getLinks());
  }, [refreshTrigger]);

  const handleCreateLink = (newLink: ShortLink) => {
    // Note: saveLink handles updates automatically now
    saveLink(newLink);
    setRefreshTrigger(prev => prev + 1);
    // We stay in create view now because CreateLink handles its own success state
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      deleteLink(id);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleSimulateClick = (id: string) => {
    recordClick(id);
    setRefreshTrigger(prev => prev + 1);
  };

  // Redirection Screen
  if (redirectState.active) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto">
             <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <ExternalLink className="w-8 h-8 text-indigo-600" />
             </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h2>
            <p className="text-gray-500 text-sm">
              Taking you to <br/>
              <span className="font-medium text-indigo-600 break-all">{redirectState.url}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main App Interface
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={() => setView('create')}
          >
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            </div>
            <span className="text-xl font-bold text-gray-800">
              LinkSmart
            </span>
          </div>

          <button 
             onClick={() => setView(view === 'create' ? 'list' : 'create')}
             className="flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all"
           >
             {view === 'create' ? (
               <>
                 <LayoutGrid className="w-4 h-4 mr-2" />
                 My Links
               </>
             ) : (
               <>
                 <Zap className="w-4 h-4 mr-2" />
                 Create New
               </>
             )}
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-12">
        {view === 'create' ? (
          <div className="animate-fade-in">
            <CreateLink onSave={handleCreateLink} onCancel={() => {}} />
            
            {/* Recent Links Preview (Optional) */}
            {links.length > 0 && (
               <div className="mt-16 text-center">
                 <p className="text-gray-400 text-sm mb-2">Previously created</p>
                 <div className="flex flex-wrap justify-center gap-3">
                   {links.slice(0, 3).map(l => (
                     <button 
                       key={l.id}
                       onClick={() => setView('list')}
                       className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                     >
                       /{l.alias}
                     </button>
                   ))}
                 </div>
               </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
             <div className="text-center">
               <h2 className="text-3xl font-bold text-gray-900">Your Links</h2>
               <p className="text-gray-500 mt-2">Manage and track your shortened URLs</p>
             </div>
             <LinksList 
               links={links} 
               onDelete={handleDeleteLink} 
               onSimulateClick={handleSimulateClick} 
             />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
