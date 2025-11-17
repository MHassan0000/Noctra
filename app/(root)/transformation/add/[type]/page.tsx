import React from 'react'
import { transformationTypes } from '@/constants'
import Header from '@/app/components/shared/header';
import { notFound } from 'next/navigation';
import Sidebar from '@/app/components/shared/sidebar';
import TransformationForm from '@/app/components/shared/transformationForm';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

export default async function AddTransformationTypePage({ params }: SearchParamProps) {
  const { type } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const Transformation = transformationTypes[type as keyof typeof transformationTypes];
  const user = await getUserById(userId);
  if (!Transformation) {
    notFound();
  }

  return (
    <>
      <div className='flex justify-center items-center'>
        <div className='rounded-full'>
          <Sidebar />
        </div>
        <div>


          <Header title={Transformation.title} subtitle={Transformation.subTitle}></Header>
          <div className=  "m-10 mx-auto p-4  bg-white rounded-lg shadow-md xm:w-[300px] sm:w-[400px] md:w-[800px] xl:w-full">

            <TransformationForm
              action="Add"
              userId={user._id}
              type={Transformation.type as TransformationTypeKey}
              creditBalance={user.creditBalance}

            />
          </div>


        </div>

      </div>
    </>
  )
}

