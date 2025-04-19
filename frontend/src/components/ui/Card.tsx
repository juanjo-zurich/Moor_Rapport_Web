import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};

export const MemberCard: React.FC<{
  name: string;
  role: string;
  imageUrl: string;
  status: 'online' | 'away' | 'offline';
  stats: { today: string; week: string };
}> = ({ name, role, imageUrl, status, stats }) => {
  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-12 h-12 rounded-full object-cover"
          />
          <span 
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
              ${status === 'online' ? 'bg-success-green' : 
                status === 'away' ? 'bg-warning-orange' : 'bg-gray-400'}`
            }
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      <div className="flex space-x-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{stats.today}</p>
          <p className="text-xs text-gray-500">Today</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{stats.week}</p>
          <p className="text-xs text-gray-500">This week</p>
        </div>
      </div>
    </Card>
  );
};