import React from 'react';
import './Overlay.css';

const Overlay = ({setIsRunning}) => {
    const onClickContinueBtn = ()=>{
        setIsRunning(true)
    }
  return (
    <>
    <div className='footer-overlay'>
        <button onClick={onClickContinueBtn}>Continue</button>
    </div>
    </>
  )
}

export default Overlay