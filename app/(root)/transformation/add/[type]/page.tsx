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
      <div className="min-h-screen w-full bg-white overflow-x-hidden">
        <div className="w-full mx-auto max-w-full">
          <div className="flex w-full">
            <div className="hidden md:block shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1 min-w-0 w-full md:pl-20 mx-auto max-w-full overflow-x-hidden">
              <Header title={Transformation.title} subtitle={Transformation.subTitle}></Header>
              <section className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 py-6 sm:py-10">
                <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 xl:p-10">
                  <TransformationForm
                    action="Add"
                    userId={user._id}
                    type={Transformation.type as TransformationTypeKey}
                    creditBalance={user.creditBalance}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

