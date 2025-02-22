import React, { useState } from "react";
import { CloseIcon } from "../assets/base64";

const SettingsPopup = ({ onClose, onSave, onRestoreDefaults, settings, setSettings }) => {
    const handleCheckboxChange = (section, option) => {
        let updatedSetting = {
            ...settings,
            [section]: {
                ...settings[section],
                [option]: !settings[section][option],
            },
        }
        setSettings(updatedSetting);
        localStorage.setItem("puzzelSetting", JSON.stringify(updatedSetting));
    };


    return (
        <div className="settings-popup">
            <div className="px-4">
                <div className="d-flex justify-content-end">
             <button className="btn btn-tranparent pt-3" onClick={onClose}><img src={CloseIcon} width={22}/></button>
             </div>
                <h2 className="fw-bolder">Puzzle Settings</h2>

                <div className="section pt-3">
                    <h5 className="setting-title">At the start of a word</h5>
                    <label className="ps-2">
                        <input
                            height={24}
                            type="checkbox"
                            checked={settings["startOfWord"]["backspaceIntoPreviousWord"]}
                            onChange={() => handleCheckboxChange("startOfWord", "backspaceIntoPreviousWord")}
                        />
                        {" "} Backspace into previous word
                    </label>
                </div>

                <div className="section pt-3">
                    <h5 className="setting-title">Within a word</h5>
                    <label className="ps-2">
                        <input
                            type="checkbox"
                            checked={settings["withinWord"]["skipFilledSquares"]}
                            onChange={() => handleCheckboxChange("withinWord", "skipFilledSquares")}
                        />{" "}
                        Skip over filled squares
                    </label>
                    {/* <label className="d-block ps-4">
                        <input
                            type="checkbox"
                            checked={settings["withinWord"]["skipPenciledSquares"]}
                            onChange={() => handleCheckboxChange("withinWord", "skipPenciledSquares")}
                        />{" "}
                        Even penciled-in squares
                    </label> */}
                </div>

                <div className="section">
                    <h5 className="setting-title pt-3">At the end of a word</h5>
                    <label className="ps-2">
                        <input
                            type="checkbox"
                            checked={settings["endOfWord"]["jumpBackToFirstBlank"]}
                            onChange={() => handleCheckboxChange("endOfWord", "jumpBackToFirstBlank")}
                        />{" "}
                        Jump back to first blank in the word
                    </label>
                    <label className="ps-2 d-block">
                        <input
                            type="checkbox"
                            checked={settings["endOfWord"]["jumpToNextClue"]}
                            onChange={() => handleCheckboxChange("endOfWord", "jumpToNextClue")}
                        />{" "}
                        Jump to next clue (if not jumping back)
                    </label>
                </div>

                <div className="section pt-3">
                    <h5 className="setting-title">Interactions</h5>
                    <label className="ps-2">
                        <input
                            type="checkbox"
                            checked={settings["interactions"]["playSoundOnSolve"]}
                            onChange={() => handleCheckboxChange("interactions", "playSoundOnSolve")}
                        />{" "}
                        Play sound on solve
                    </label>
                    <label className="d-block ps-2">
                        <input
                            type="checkbox"
                            checked={settings["interactions"]["showTimer"]}
                            onChange={() => handleCheckboxChange("interactions", "showTimer")}
                        />{" "}
                        Show timer
                    </label>
                </div>

                <div className="d-flex pt-5 justify-content-center" >
                    <button onClick={onRestoreDefaults} className="btn btn-outline-dark rounded-5 px-3 py-2">Restore defaults</button>
                    <button onClick={onSave} className="btn btn-dark rounded-5 px-3 py-2 ms-3">Save and close</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPopup;