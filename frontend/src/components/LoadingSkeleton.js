import React from 'react';

export const WorkflowCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-dark-700 rounded-2xl p-6 mb-4">
      <div className="h-4 bg-dark-600 rounded mb-3"></div>
      <div className="h-3 bg-dark-600 rounded mb-2 w-3/4"></div>
      <div className="h-3 bg-dark-600 rounded w-1/2"></div>
    </div>
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="animate-pulse flex gap-3">
    <div className="w-6 h-6 bg-dark-600 rounded-full flex-shrink-0 mt-1"></div>
    <div className="flex-1">
      <div className="bg-dark-700 rounded-r-2xl rounded-tl-2xl rounded-bl-md p-3">
        <div className="h-3 bg-dark-600 rounded mb-2"></div>
        <div className="h-3 bg-dark-600 rounded mb-2 w-5/6"></div>
        <div className="h-3 bg-dark-600 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

export const SidebarSkeleton = () => (
  <div className="animate-pulse bg-dark-800 w-16 h-full flex flex-col items-center py-4">
    <div className="w-10 h-10 bg-dark-600 rounded-xl mb-6"></div>
    <div className="flex flex-col gap-3 flex-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-12 h-12 bg-dark-600 rounded-xl"></div>
      ))}
    </div>
  </div>
);

export const WorkflowBuilderSkeleton = () => (
  <div className="animate-pulse h-full p-6">
    <div className="h-8 bg-dark-700 rounded mb-6 w-1/3"></div>
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-dark-700 rounded-lg"></div>
      ))}
    </div>
    <div className="h-64 bg-dark-700 rounded-lg"></div>
  </div>
);

export const PageSkeleton = () => (
  <div className="animate-pulse p-6">
    <div className="h-8 bg-dark-700 rounded mb-6"></div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-dark-700 rounded"></div>
      ))}
    </div>
  </div>
);