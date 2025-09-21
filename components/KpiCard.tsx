
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-gray-850 p-5 rounded-lg shadow-lg flex items-center space-x-4">
      <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-gray-800 text-sky-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default KpiCard;
