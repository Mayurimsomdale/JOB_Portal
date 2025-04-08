import { handle } from 'express/lib/router'
import React from 'react'

const inputform = ({htmlFor, lableText, type,name,value,handleChange}) => {
  return (
    <>
      <div className="mb-3">
  <label htmlFor={htmlFor} className="form-label">Email address</label>
  {lableText}
  <input type={type}
   className="form-control" 
   name={name}
   value={value}
   onChange={handleChange}
   />
  
</div>

    </>
  )
}

export default inputform
