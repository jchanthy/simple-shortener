
import React, { useState } from 'react';
import { ShortLink } from '../types';
import { Trash2, Copy, BarChart2, Play, ArrowUpRight } from 'lucide-react';

interface LinksListProps {
  links: ShortLink[];
  onDelete: (id: string) => void;
  onSimulateClick: (id: string) => void;
}

export const LinksList: React.FC<LinksListProps> = ({ links, onDelete, onSimulateClick }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const origin = window.location.origin;

  const handleCopy = (alias: string, id: string) => {
    const fullUrl = `${origin}/#/${alias}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVisit = (link: ShortLink) => {
    onSimulateClick(link.id);
    window.open(link.originalUrl, '_blank');
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No links yet</h3>
        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Once you create links, they will appear here with their performance stats.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Short Link</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Destination</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Clicks</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {links.map((link) => {
              const fullShortLink = `${origin}/#/${link.alias}`;
              
              return (
                <tr key={link.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center mb-1.5">
                        <a 
                          href={`/#/${link.alias}`} 
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline text-base break-all flex items-center"
                        >
                          {link.alias}
                          <ArrowUpRight className="w-3 h-3 ml-1 opacity-50" />
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {link.tags && link.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-md uppercase tracking-wider">{tag}</span>
                        ))}
                      </div>
                      <div className="md:hidden text-xs text-gray-400 mt-2 truncate max-w-[150px]">
                        {link.originalUrl}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-xs hidden md:table-cell">
                    <div className="flex items-center group-hover:text-gray-900 text-gray-500 transition-colors">
                      <span className="text-sm truncate w-full" title={link.originalUrl}>
                        {link.originalUrl}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1.5">
                      {new Date(link.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                      <BarChart2 className="w-3.5 h-3.5 text-gray-400 mr-2" />
                      <span className="font-bold text-gray-900">{link.totalClicks}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleVisit(link)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Test Visit"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(link.alias, link.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
                        title="Copy Link"
                      >
                        {copiedId === link.id ? (
                           <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">Copied!</span>
                        ) : null}
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(link.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
