import React from 'react'

const Header = ({ title, subtitle }: { title: string, subtitle: string }) => {
    return (
        <>
            <div >
                <div className='text-5xl'>{title}</div>
                <div>{subtitle}</div>
            </div>
        </>
    )
}

export default Header