import React from 'react'
import { UserButton,SignInButton } from '@clerk/nextjs'
import Sidebar from '../components/shared/sidebar'


export default function HomePage() {
  return (
    <>
      

      
      <div className='flex'>
        <div className='m-1 rounded-full'>
        <Sidebar/>
        </div>
        <h1 className='text-5xl text-black'>Homepage</h1>
        
      </div>
      

    </>
  )
}
