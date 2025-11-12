

import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Copy, QrCode, RotateCcw, Save, Edit2, Globe, Link2 } from 'lucide-react';
import { ShortLink } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { checkAliasExists } from '../services/storageService';

interface CreateLinkProps {
  onSave: (link: ShortLink) => void;
  onCancel: () => void;
}

export const CreateLink: React.FC<CreateLinkProps> = ({ onSave }) => {
  const [mode, setMode] = useState<'input' | 'success'>('input');
  const [url, setUrl] = useState('');
  const [currentLink, setCurrentLink] = useState<ShortLink | null>(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editAlias, setEditAlias] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [host, setHost] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setHost(window.location.host);
    setOrigin(window.location.origin);
  }, []);

  const generateRandomAlias = () => {
    return Math.random().toString(36).substring(2, 8); // generates 6 random alphanumeric chars
  };

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // 1. Auto-create logic
    let alias = generateRandomAlias();
    // Ensure uniqueness (simple retry)
    while (checkAliasExists(alias)) {
      alias = generateRandomAlias();
    }

    const newLink: ShortLink = {
      id: uuidv4(),
      originalUrl: url,
      alias: alias,
      createdAt: Date.now(),
      totalClicks: 0,
      clickHistory: [],
      tags: ['auto']
    };

    // 2. Save and switch view
    onSave(newLink);
    setCurrentLink(newLink);
    setEditAlias(alias);
    setMode('success');
    setError(null);
    setShowQr(false);
  };

  const handleUpdateAlias = () => {
    if (!currentLink) return;
    const cleanAlias = editAlias.trim().replace(/\s+/g, '-');
    
    if (cleanAlias === currentLink.alias) {
      setIsEditing(false);
      return;
    }
    
    if (checkAliasExists(cleanAlias)) {
      setError('This alias is already taken.');
      return;
    }

    if (cleanAlias.length < 3) {
      setError('Alias is too short.');
      return;
    }

    const updatedLink = { ...currentLink, alias: cleanAlias };
    onSave(updatedLink);
    setCurrentLink(updatedLink);
    setIsEditing(false);
    setError(null);
  };

  const handleCopy = () => {
    if (!currentLink) return;
    const fullUrl = `${origin}/#/${currentLink.alias}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUrl('');
    setMode('input');
    setCurrentLink(null);
    setIsEditing(false);
    setShowQr(false);
  };

  // --- RENDER: INPUT MODE ---
  if (mode === 'input') {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-8 md:p-12 text-center max-w-2xl mx-auto transition-all">
        <div className="mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Link2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Paste your long link</h2>
          <p className="text-gray-500">We'll generate a short, trackable link for you instantly.</p>
        </div>

        <form onSubmit={handleShorten} className="relative">
          <div className="relative flex items-center">
            <Globe className="absolute left-4 text-gray-400 w-5 h-5" />
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url..."
              className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 text-lg transition-all placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            Shorten URL <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </form>
      </div>
    );
  }

  // --- RENDER: SUCCESS MODE ---
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-8 md:p-10 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
          <Check className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Link Created!</h2>
        <p className="text-gray-500 text-sm truncate max-w-md mx-auto mt-1">{currentLink?.originalUrl}</p>
      </div>

      {/* Link Card */}
      <div className="bg-gray-50 rounded-2xl p-2 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 w-full md:w-auto px-4 py-3 flex items-center">
            <span className="text-gray-400 font-medium mr-1 select-none">{host}/#/</span>
            
            {isEditing ? (
              <div className="flex-1 relative">
                <input 
                  autoFocus
                  type="text"
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  className="w-full bg-white border-b-2 border-indigo-500 px-1 py-0.5 outline-none font-bold text-indigo-700"
                />
              </div>
            ) : (
              <span className="font-bold text-gray-800 text-lg">{currentLink?.alias}</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto pr-2">
            {isEditing ? (
              <button 
                onClick={handleUpdateAlias}
                className="flex-1 md:flex-none bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-1.5" /> Save
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setEditAlias(currentLink?.alias || '');
                    setIsEditing(true);
                    setError(null);
                  }}
                  className="p-2.5 text-gray-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-colors"
                  title="Customize Link"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
                <button 
                  onClick={handleCopy}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${copied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
                >
                  {copied ? (
                    <><Check className="w-4 h-4 mr-2" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copy</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        {error && (
          <div className="px-4 pb-2 text-xs text-red-500 font-medium">{error}</div>
        )}
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowQr(!showQr)}
          className={`flex items-center justify-center px-4 py-3 rounded-xl border font-medium transition-all ${showQr ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
        >
          <QrCode className="w-5 h-5 mr-2" />
          {showQr ? 'Hide QR' : 'QR Code'}
        </button>
        <button 
          onClick={handleReset}
          className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Shorten Another
        </button>
      </div>

      {/* QR Code Panel */}
      {showQr && (
        <div className="mt-6 p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center animate-fade-in">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentLink?.originalUrl || '')}&bgcolor=ffffff`} 
            alt="QR Code" 
            className="w-48 h-48 rounded-lg mb-4 mix-blend-multiply"
          />
          <p className="text-sm text-gray-500 mt-2 text-center max-w-xs break-all">
            Scan to visit <br/>
            <span className="font-mono text-indigo-600 font-bold">{currentLink?.originalUrl}</span>
          </p>
          <button 
             onClick={() => {
                // Simple download simulation via new window
                window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(currentLink?.originalUrl || '')}`, '_blank');
             }}
             className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
          >
            Download High Res
          </button>
        </div>
      )}
    </div>
  );
};
