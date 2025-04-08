import React from 'react'
import '../styles/homepage.css'
import { Link } from 'react-router-dom';

const Homepage = () => {
  return (
    <>
      <video autoPlay muted loop id='myVideo'> 
        <source src='/assets/videos/bg.mp4' type=" video/mp4"/>
      </video>
      <div className='content'>
        <div className='card w-25' >
            <img src="/assets/videos/images/jp.jpg" alt="logo" />
      
       <br></br>
       <hr />
        <div className="card-body" style={{marginTop:'-60px'}}>
            <h5 className="card-title">India's No. 1 Career Platform</h5>
            <p className='card-text'>
            Search and manage your jobs with ease. A free and open-source job portal application
            </p>
            <div className='d-flex justify-content-between mt-5 '>
            <p>
             Not a user Register <Link to='/register'>Hear!</Link> {/* Corrected the link tag */}
            </p>
            <p>
             <Link to='/login' className='mybtn'>Login</Link> {/* Corrected the link tag */}
            </p>
            </div>
            </div>
        </div>
      </div>
    </>
  )
}

export default Homepage
