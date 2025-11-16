import React from 'react'
import { transformationTypes } from '@/constants'
import Header from '@/app/components/shared/header';

export default function AddTransformationTypePage({params : {type} } :  SearchParamProps){
  console.log(type);
  const Transformation = transformationTypes[type];
  console.log(Transformation);
  return (
    <>
      <Header title={Transformation.title} subtitle={Transformation.subTitle}></Header>
    </>
  )
}

