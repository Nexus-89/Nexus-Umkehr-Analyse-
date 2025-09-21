
import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-gray-850 p-4 sm:p-6 rounded-lg shadow-lg h-full flex flex-col ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
