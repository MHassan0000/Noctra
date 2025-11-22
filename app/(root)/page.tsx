import React, { Suspense } from 'react'
import Sidebar from '../components/shared/sidebar'
import Hero from '../components/shared/hero'
import {CollectionDisplay} from '../components/shared/CollecionDisplay'
import { getAllImages } from "@/lib/actions/image.actions"

export default async function HomePage({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';
  const images = await getAllImages({ page, searchQuery});
  
  // Ensure we always have valid data
  const imageData = images?.data || [];
  const totalPages = images?.totalPage || 1;
  
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden" style={{ overflowX: 'hidden' }}>
      <div className="w-full mx-auto max-w-full overflow-x-hidden">
        <div className="flex w-full overflow-x-hidden">
          {/* Sidebar - Hidden on mobile, fixed on larger screens */}
          <div className="hidden md:block shrink-0">
            <Sidebar />
          </div>
          
          {/* Main Content - Centered with auto margins when sidebar is hidden */}
          <div className="flex-1 min-w-0 w-full md:pl-20 mx-auto max-w-full overflow-x-hidden" style={{ overflowX: 'hidden', maxWidth: '100%' }}>
            <div className="w-full overflow-x-hidden" style={{ overflowX: 'hidden', width: '100%' }}>
              <Hero />
            </div>
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 mx-auto max-w-full overflow-x-hidden" style={{ overflowX: 'hidden' }}>
              <div className="w-full max-w-7xl mx-auto overflow-x-hidden">
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-600 dark:text-gray-300">Loading...</div>
                  </div>
                }>
                  <CollectionDisplay 
                    hasSearch={true}
                    initialImages={imageData}
                    initialTotalPages={totalPages}
                    initialPage={page}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
