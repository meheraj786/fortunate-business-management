import React from 'react'

const Input = ({type,placeholder}) => {
  return (
    <input type={type || "text"} placeholder={placeholder} className={`w-full rounded-[8px] text-left px-4 py-4 text-[18px] bg-[#F1F4F9] border border-[#D8D8D8] text-[#A6A6A6]`} />
  )
}

export default Input