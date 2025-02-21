import React from "react";
import { CloseIcon } from "../assets/base64";

const ResetConfirmation = ({ handleCancel, handleSubmission, title, btnText }) => {
  const onClickCancel = () => {
    handleCancel();
  };
  const onClickStartOver = () => {
    handleSubmission();
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
        <button className="btn btn-tranparent position-absolute top-0 end-0 me-1" onClick={onClickCancel}><img src={CloseIcon} width={22}/></button>
        <div className="text-center">
          <div>
            <h5 className="d-block mb-4 pt-1">
              {title}
            </h5>
            <div className="d-flex justify-content-center">
              <div className="mt-2">
                <button
                  onClick={onClickStartOver}
                  className="btn btn-dark rounded-5 d-block confirmation-btn-width"
                >
                  {btnText}
                </button>
                <button
                  onClick={onClickCancel}
                  className="btn btn-outline-dark mt-3 rounded-5 d-block confirmation-btn-width"
                >
                  Cancel
                </button>
              </div>
            </div>
            <h6 className="fw-bold m-0 pt-4">{formattedDate}</h6>
            <span>CamCom Assignment by Rohit Bakde</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetConfirmation;
