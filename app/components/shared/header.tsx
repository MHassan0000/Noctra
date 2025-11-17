import React from 'react'

const Header = ({ title, subtitle }: { title: string, subtitle: string }) => {
    return (
        <>
            <div className='mx-20 my-10 text-center flex flex-col items-center justify-center gap-5' >
                <div className='text-5xl font-extrabold'>{title}</div>
                <div>{subtitle}</div>
            </div>
        </>
    )
}

export default Header