import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ className }) => (
  <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
);

const LCDetailsPageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <SkeletonLoader className="h-12 w-12 rounded-lg flex-shrink-0" />
              <div className='w-full'>
                <SkeletonLoader className="h-8 w-3/4 mb-2" />
                <SkeletonLoader className="h-4 w-1/2" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonLoader className="h-10 w-24 rounded-lg" />
            <SkeletonLoader className="h-10 w-20 rounded-lg" />
            <SkeletonLoader className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <SkeletonLoader className="h-6 w-1/3 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonLoader className="h-8 w-full" />
                <SkeletonLoader className="h-8 w-full" />
                <SkeletonLoader className="h-8 w-full" />
                <SkeletonLoader className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <SkeletonLoader className="h-6 w-1/2 mb-4" />
              <div className="space-y-3">
                <SkeletonLoader className="h-8 w-full" />
                <SkeletonLoader className="h-8 w-full" />
                <SkeletonLoader className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LCDetailsPageSkeleton;