import React from "react";
import { CloseIcon } from "../assets/base64";
import CongratsGIF from '../assets/celebrate.gif'

const CongratsPopup = ({handleCancel, time }) => {
  const onClickBackToPuzzelBtn = () => {
    handleCancel();
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
      <div className="congrats-overlay">
         <button className="btn btn-tranparent position-absolute top-0 end-0 me-1" onClick={onClickBackToPuzzelBtn}><img src={CloseIcon} width={22}/></button>
        <div className="text-center">
        <img src={CongratsGIF} alt="congrats"/>
          <h2 className="d-block fw-bolder m-0 ">Congratulations!</h2>
          <h5 className="d-block mb-4 pt-1">You solved The Puzzel
          in <b>{time}</b>.</h5>
          <button
            onClick={onClickBackToPuzzelBtn}
            className="btn btn-dark px-5 py-2 rounded-5"
          >
            Back To Puzzel
          </button>
          <h6 className="fw-bold m-0 pt-4">{formattedDate}</h6>
          <span>CamCom Assignment by Rohit Bakde</span>
        </div>
      </div>
    </>
  );
};

export default CongratsPopup;
