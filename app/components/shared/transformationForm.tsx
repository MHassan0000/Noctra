"use client"

import React, { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/app/components/ui/button"
import { CustomInput } from './customInput'
import { aspectRatioOptions, transformationTypes } from '@/constants'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select"
import { Input } from "@/app/components/ui/input"
import { defaultValues } from '@/constants'

export const formSchema = z.object({
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
})
const TransformationForm = ({ action, data = null, type, creditBalance, userId }: TransformationFormProps) => {
    const initialValues = data && action === "Update" ? {
        title: data.title,
        aspectRatio: data.aspectRatio,
        color: data.color,
        prompt: data.prompt,
        publicId: data.publicId,
    } : defaultValues


    const TransformationType = transformationTypes[type as TransformationTypeKey]
    const [Image, setImage] = useState(data);
    const [newTransformation, setNewTransformation] = useState<Transformations |null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,

    })
    const onSelectFieldHandler = (value: string, onChangeField:(value: string) => void) => {

    
    }


    function onSubmit(values: z.infer<typeof formSchema>) {

        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CustomInput control={form.control} render={({ field }) => <Input {...field} />} name="title" formLabel="Title" className="w-full" />
                {type == 'fill' && (
                    <CustomInput control={form.control} name="aspectRatio" formLabel="Aspect Ratio" className="w-full" 
                    render={({ field }) => (
                    <Select onValueChange={(value )=> onSelectFieldHandler(value,field)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(aspectRatioOptions).map((key) => (
                                <SelectItem key={key} value={key} className='select-item'>
                                    {aspectRatioOptions[key as ]}
                                </SelectItem>

                            ))}
                        </SelectContent>
                    </Select>
                    )}
                    />
                )}
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

export default TransformationForm