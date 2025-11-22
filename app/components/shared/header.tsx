import React from 'react'

const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => {
    return (
        <>
            <div className='w-full mx-auto px-4 sm:px-6 lg:px-8 my-6 sm:my-8 md:my-10 text-center flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-5 max-w-7xl mt-20' >
                <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold capitalize wrap-break-word'>{title}</div>
                {subtitle && <div className='text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl'>{subtitle}</div>}
            </div>
        </>
    )
}

export default Header