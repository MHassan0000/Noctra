import React from 'react'
import { UserButton, SignInButton } from '@clerk/nextjs'
import Sidebar from '../components/shared/sidebar'
import Hero from '../components/shared/hero'


export default function HomePage() {
  return (
    <>



      <div className='flex justify-center items-center'>
        <div className='m-1 rounded-full'>
          <Sidebar />
        </div>
        <div className='overflow-y-auto'>

          <Hero />
          
          
        </div>

      </div>


    </>
  )
}
