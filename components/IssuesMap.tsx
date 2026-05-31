'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons based on status
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${color};
        position: absolute;
        bottom: -6px;
        left: 6px;
      "></div>
    `,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32]
  });
};

const iconColors = {
  'OPEN': '#ef4444', // red
  'IN PROGRESS': '#f59e0b', // amber
  'RESOLVED': '#10b981', // green
};

interface IssuesMapProps {
  issues: any[];
  onUpvote: (id: string) => void;
  language: 'en' | 'ta';
}

function MapUpdater({ issues }: { issues: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (issues.length > 0) {
      const bounds = L.latLngBounds(issues.filter(i => i.lat && i.lng).map(i => [i.lat, i.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [issues, map]);
  return null;
}

export default function IssuesMap({ issues, onUpvote, language }: IssuesMapProps) {
  // Default to Chennai coordinates
  const defaultCenter: [number, number] = [13.0827, 80.2707];

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {issues.map(issue => {
          if (!issue.lat || !issue.lng) return null;
          
          const status = issue.status?.toUpperCase() || 'OPEN';
          const iconColor = iconColors[status as keyof typeof iconColors] || iconColors.OPEN;
          
          return (
            <Marker 
              key={issue.id} 
              position={[issue.lat, issue.lng]}
              icon={createIcon(iconColor)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800 text-sm">{issue.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mb-3 line-clamp-2">{issue.description}</p>
                  
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                    <span className="text-xs text-slate-500">{new Date(issue.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-sky-600 hover:bg-sky-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvote(issue.id);
                        }}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        <span className="text-xs font-bold">{issue.upvotes || 0}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <MapUpdater issues={issues} />
      </MapContainer>
    </div>
  );
}
