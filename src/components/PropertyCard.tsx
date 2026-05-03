import { motion } from 'motion/react';
import { TrendingUp, MessageCircle, MapPin, Eye, Star, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Property } from '../types';
import React from 'react';
import { getGoogleDriveUrl } from '../lib/googleDrive';

interface PropertyCardProps {
  property: Property;
  onClick: (p: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const mainImage = (property.images && property.images.length > 0) 
    ? property.images[0] 
    : (property.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop");

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl overflow-hidden group cursor-pointer flex flex-col"
      onClick={() => onClick(property)}
    >
      <div className="h-52 relative overflow-hidden">
        <img 
          src={getGoogleDriveUrl(mainImage)} 
          alt={property.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop";
          }}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.tags.map(tag => (tag && (
            <span key={tag} className="px-3 py-1 bg-[#172B36]/80 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-display font-black text-primary uppercase tracking-wider">
              {tag}
            </span>
          )))}
        </div>
        <div className="absolute top-4 right-4">
           {property.verifiedStatus === 'verified' && (
              <div title="Verificado" className="p-1.5 bg-primary rounded-lg text-[#172B36] shadow-[0_0_20px_rgba(255,200,1,0.5)]">
                 <ShieldCheck className="w-4 h-4" />
              </div>
           )}
           {property.verifiedStatus === 'pending' && (
              <div title="Verificación Pendiente" className="p-1.5 bg-primary-dim rounded-lg text-[#172B36] shadow-[0_0_20px_rgba(255,153,50,0.5)]">
                 <Shield className="w-4 h-4 animate-pulse" />
              </div>
           )}
        </div>
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-display font-bold text-xl text-white group-hover:text-primary transition-colors">{property.name}</h4>
            <p className="text-zinc-500 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {property.location}, {property.zip}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-black text-xl text-white">
              ${property.price.toLocaleString()}
              {property.type === 'Commercial' && <span className="text-xs text-zinc-500 font-normal"> /mo</span>}
            </p>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${property.valuationTrend > 0 ? 'text-primary' : 'text-red-400'}`}>
              {property.valuationTrend > 0 ? '+' : ''}{property.valuationTrend}% telemetry flow
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 uppercase tracking-widest font-display text-[10px]">Interest Velocity</span>
            <div className="w-1/2 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${property.interestVelocity * 100}%` }}
                className="h-full bg-primary shadow-[0_0_8px_rgba(255,200,1,0.8)]"
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 uppercase tracking-widest font-display text-[10px]">Viewing Requests</span>
            <span className="text-white font-bold">{property.viewingRequests} this week</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;

// placeholder
