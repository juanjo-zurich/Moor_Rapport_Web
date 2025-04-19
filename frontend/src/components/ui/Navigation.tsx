import React from 'react';

interface NavigationProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ title, subtitle, children }) => {
  return (
    <div className="glass-effect p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gradient">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const TimerCard: React.FC<{
  time: string;
  title: string;
  subtitle: string;
}> = ({ time, title, subtitle }) => {
  return (
    <div className="card flex flex-col items-center p-6 bg-white">
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-500"/>
          <div className="w-2 h-2 rounded-full bg-yellow-500"/>
          <div className="w-2 h-2 rounded-full bg-green-500"/>
        </div>
        <span className="text-xl font-mono font-bold text-gradient">{time}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
};

export const ProjectStats: React.FC<{
  project: string;
  activity: string;
  duration: string;
  time: string;
  progress: number;
}> = ({ project, activity, duration, time, progress }) => {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-purple flex items-center justify-center text-white font-bold">
              {project.charAt(0)}
            </div>
            <span className="font-medium">{project}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{activity}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{duration}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-purple"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};