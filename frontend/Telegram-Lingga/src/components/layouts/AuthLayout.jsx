import React from 'react';
import UI_IMG from "../../assets/images/diskominfo.jpg";

const AuthLayout = ({children}) => {
  return <div className='flex'>
    <div className='w-screen h-screen md:w-[90vw] px-12 pt-8 pb-12'>
        <h2 className='text-lg font-medium text-black'>Telegram Sanapati Kabupaten Lingga</h2>
        {children}
    </div>

    <div className='hidden md:flex'>
        <img src={UI_IMG} alt="Logo Diskominfo" className='' />
    </div>
  </div>
}

export default AuthLayout