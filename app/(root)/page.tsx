import React from 'react'
import Sidebar from '../components/shared/sidebar'
import Hero from '../components/shared/hero'
import {CollectionDisplay} from '../components/shared/CollecionDisplay'
import { getAllImages } from "@/lib/actions/image.actions"

export default async function HomePage({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';
  const images = await getAllImages({ page, searchQuery})
  return (
    <div className="min-h-screen w-screen bg-white overflow-x-hidden">
      <div className="w-full max-w-[100vw] mx-auto">
        <div className="flex">
          {/* Sidebar - Hidden on mobile, fixed on larger screens */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="w-full md:pl-20">
            <div className="w-full">
              <Hero />
              <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full max-w-7xl mx-auto">
                  <CollectionDisplay 
                    hasSearch={true}
                    images={images?.data}
                    totalPages={images?.totalPage}
                    page={page}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
