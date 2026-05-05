import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col h-full animate-pulse shadow-sm">
      <div className="h-2.5 w-full bg-gray-100 mb-6 -mt-8 -mx-8 rounded-t-3xl"></div>
      <div className="flex justify-between items-start mb-6">
        <div className="h-6 w-24 bg-gray-100 rounded-lg"></div>
        <div className="h-4 w-16 bg-gray-100 rounded-lg"></div>
      </div>
      <div className="h-8 w-full bg-gray-200 rounded-xl mb-4"></div>
      <div className="h-8 w-2/3 bg-gray-200 rounded-xl mb-6"></div>
      <div className="space-y-4 mb-8 flex-grow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
          <div className="h-4 w-32 bg-gray-100 rounded"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
          <div className="h-4 w-48 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-100 rounded"></div>
        <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
      </div>
    </div>
  );
};
