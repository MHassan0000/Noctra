import React from 'react'
import { transformationTypes } from '@/constants'
import Header from '@/app/components/shared/header';
import { notFound } from 'next/navigation';

export default async function AddTransformationTypePage({params} :  SearchParamProps){
  const { type } = await params;
  const Transformation = transformationTypes[type as keyof typeof transformationTypes];
  
  if (!Transformation) {
  
    notFound();
  }
  
  return (
    <>
      <Header title={Transformation.title} subtitle={Transformation.subTitle}></Header>
    </>
  )
}

