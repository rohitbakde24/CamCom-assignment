import React from "react";
import { CloseIcon } from "../assets/base64";

const Overlay = ({ setIsRunning }) => {
  const onClickContinueBtn = () => {
    setIsRunning(true);
  };
  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-US", options);
  return (
    <>
      <div className="footer-overlay">
         <button className="btn btn-tranparent position-absolute top-0 end-0 me-1" onClick={onClickContinueBtn}><img src={CloseIcon} width={22}/></button>
        <div className="text-center">
          <h2 className="d-block fw-bolder m-0 ">Your game is paused.</h2>
          <h5 className="d-block mb-4 pt-1">Ready to play?</h5>
          <button
            onClick={onClickContinueBtn}
            className="btn btn-dark px-5 py-2 rounded-5"
          >
            Continue
          </button>
          <h6 className="fw-bold m-0 pt-4">{formattedDate}</h6>
          <span>CamCom Assignment by Rohit Bakde</span>
        </div>
      </div>
    </>
  );
};

export default Overlay;
