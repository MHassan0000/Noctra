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
    
    <>

      <div className='flex justify-center items-center'>
        <div className='rounded-full'>
          <Sidebar />
        </div>
        <div className='flex flex-col justify-center items-center overflow-y-auto'>

          <Hero />
          <CollectionDisplay 
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPage}
          page={page}
        />
          
          
        </div>

      </div>


    </>
  )
}
