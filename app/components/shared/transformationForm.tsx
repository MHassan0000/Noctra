"use client"

import React, { useState, useTransition } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/app/components/ui/button"
import { CustomInput } from './customInput'
import { aspectRatioOptions, creditFee, transformationTypes } from '@/constants'
import { deepMergeObjects, debounce } from '@/lib/utils'
import { updateCredits } from '@/lib/actions/user.actions'
import { getCldImageUrl } from 'next-cloudinary'
import { addImage , updateImage } from '@/lib/actions/image.actions'
import { useRouter } from "next/navigation"

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
import { AspectRatioKey } from '@/lib/utils'
import MediaUploader from './MediaUploader'
import TransformedImage from './tranformedImage'

export const formSchema = z.object({
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
})
const TransformationForm = ({ action, data = null, type, creditBalance, userId, config = null }: TransformationFormProps) => {
    const initialValues = data && action === "Update" ? {
        title: data.title,
        aspectRatio: data.aspectRatio,
        color: data.color,
        prompt: data.prompt,
        publicId: data.publicId,
    } : defaultValues


    const TransformationType = transformationTypes[type as TransformationTypeKey]
    const [Image, setImage] = useState(data);
    const [NewTransformation, setNewTransformation] = useState<Transformations | null>(null);
    const [isSubmitting, setisSubmitting] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [TransformationConfig, setTransformationConfig] = useState(config);
    const [isPending, startTransition] = useTransition()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,

    })
    const router = useRouter()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setisSubmitting(true);

        if (data || Image) {
            const transformationUrl = getCldImageUrl({
                width: Image?.width,
                height: Image?.height,
                src: Image?.publicId,
                ...TransformationConfig
            })

            const imageData = {
                title: values.title,
                publicId: Image?.publicId,
                transformationType: type,
                width: Image?.width,
                height: Image?.height,
                config: TransformationConfig,
                secureURL: Image?.secureURL,
                transformationURL: transformationUrl,
                aspectRatio: values.aspectRatio,
                prompt: values.prompt,
                color: values.color,
            }

            if (action === 'Add') {
                try {
                    const newImage = await addImage({
                        image: imageData,
                        userId,
                        path: '/'
                    })

                    if (newImage) {
                        form.reset()
                        setImage(data)
                        router.push(`/transformations/${newImage._id}`)
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (action === 'Update') {
                try {
                    const updatedImage = await updateImage({
                        image: {
                            ...imageData,
                            _id: data._id
                        },
                        userId,
                        path: `/transformations/${data._id}`
                    })

                    if (updatedImage) {
                        router.push(`/transformations/${updatedImage._id}`)
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        setisSubmitting(false)
    }

    const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
        const imageSize = aspectRatioOptions[value as AspectRatioKey]

        setImage((prevState: any) => ({
            ...prevState,
            aspectRatio: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height,
        }))

        setNewTransformation(TransformationType.config);

        return onChangeField(value)
    }

    const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
        debounce(() => {
            setNewTransformation((prevState: any) => ({
                ...prevState,
                [type]: {
                    ...prevState?.[type],
                    [fieldName === 'prompt' ? 'prompt' : 'to']: value
                }
            }))
        }, 1000)();

        return onChangeField(value)
    }
    const onTransformHandler = async () => {
        setIsTransforming(true)

        setTransformationConfig(
            deepMergeObjects(NewTransformation, TransformationConfig)
        )

        setNewTransformation(null)

        startTransition(async () => {
            await updateCredits(userId, creditFee)
        })
    }




    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CustomInput control={form.control} render={({ field }) => <Input {...field} />} name="title" formLabel="Image Title" className="w-full" />
                {type == 'fill' && (
                    <div className='flex flex-col gap-5 lg:flex-row lg:gap-10'>

                        <CustomInput control={form.control} name="aspectRatio" formLabel="Aspect Ratio" className="w-full"
                            render={({ field }) => (
                                <Select onValueChange={(value) => onSelectFieldHandler(value, field)}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Select Size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(aspectRatioOptions).map((key) => (
                                            <SelectItem key={key} value={key} className='py-3 cursor-pointer hover:bg-purple-100'>
                                                {aspectRatioOptions[key as AspectRatioKey].label}
                                            </SelectItem>

                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                )}
                {(type === 'remove' || type === 'recolor') && (
                    <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
                        <CustomInput
                            control={form.control}
                            name="prompt"
                            formLabel={
                                type === 'remove' ? 'Object to remove' : 'Object to recolor'
                            }
                            className="w-full"
                            render={({ field }) => (
                                <Input
                                    value={field.value}
                                    className="rounded-2xl border-2 border-purple-200/20 shadow-sm shadow-purple-200/15 text-dark-600 disabled:opacity-100 p-16-semibold h-[50px] md:h-[54px] focus-visible:ring-offset-0 px-4 py-3 focus-visible:ring-transparent !important"
                                    onChange={(e) => onInputChangeHandler(
                                        'prompt',
                                        e.target.value,
                                        type,
                                        field.onChange
                                    )}
                                />
                            )}
                        />

                        {type === 'recolor' && (
                            <CustomInput
                                control={form.control}
                                name="color"
                                formLabel="Replacement Color"
                                className="w-full"
                                render={({ field }) => (
                                    <Input

                                        value={field.value}
                                        className="rounded-2xl border-2 border-purple-200/20 shadow-sm shadow-purple-200/15 text-dark-600 disabled:opacity-100 p-16-semibold h-[50px] md:h-[54px] focus-visible:ring-offset-0 px-4 py-3 focus-visible:ring-transparent !important"
                                        onChange={(e) => onInputChangeHandler(
                                            'color',
                                            e.target.value,
                                            'recolor',
                                            field.onChange
                                        )}
                                    />
                                )}
                            />
                        )}
                    </div>
                )}
                <div className="grid h-fit min-h-[200px] grid-cols-1 gap-5 py-4 md:grid-cols-2">
                    <CustomInput
                        control={form.control}
                        name="publicId"
                        className="flex size-full flex-col"
                        render={({ field }) => (
                            <MediaUploader
                                onValueChange={field.onChange}
                                setImage={setImage}
                                publicId={field.value}
                                image={Image}
                                type={type}
                            />
                        )}
                    />
                    <TransformedImage
                        image={Image}
                        type={type}
                        title={form.getValues().title}
                        isTransforming={isTransforming}
                        setIsTransforming={setIsTransforming}
                        transformationConfig={TransformationConfig}

                    />
                </div>


                <div className="flex flex-col gap-4">
                    <Button
                        type="button"
                        className="submit-button capitalize"
                        disabled={isTransforming || NewTransformation === null}
                        onClick={onTransformHandler}
                    >
                        {isTransforming ? 'Transforming...' : 'Apply Transformation'}
                    </Button>
                    <Button
                        type="submit"
                        className="submit-button capitalize"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Save Image'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default TransformationForm