import React from "react";
import "./MessageBox.css";
import { isElement } from "lodash";
import { FcInfo } from "react-icons/fc";
import { PiWarningFill } from "react-icons/pi";
import { VscError } from "react-icons/vsc";
import { HiQuestionMarkCircle } from "react-icons/hi";

const MsgBox = ({ data, onClose, isDesktop, options }) => {
  // console.log("msgbox", data, options?.Desktop);
  const { Caption, Text, Style, Btns } = data?.Properties;
  // console.log({ Caption, Text, Style, Btns, isDesktop });
  const Icon = () => {
    switch (Style) {
      case "Info":
        return <FcInfo className="icon info-icon" />;
      case "Query":
        return <HiQuestionMarkCircle className="icon question-icon" />;
      case "Warn":
        return <PiWarningFill className="icon warning-icon"  />;
      case "Error":
        return <VscError className="icon error-icon" />;
      default:
        return "";
    }
  };


  let renderCheck = options.Desktop === 1 ? false : true
  
  // let renderCheck = true
  return (
    <div className="msgbox-overlay">
      <div className={`msgbox-container ${renderCheck? 'with-border': ''}`}>
        {renderCheck && <div className= "msgbox-header with-border">{Caption}</div>}
        <div className="msgbox-body">
          {Style && Style !== "Msg" && (
            <Icon/>
          )}
          <span>{Text}</span>
        </div>
        <div className={`msgbox-footer ${renderCheck ? 'with-border': ''}`}>
          {Array.isArray(Btns) ? (
            Btns.map((btn, index) => (
              <button
                key={index}
                className="rounded-button "
                onClick={() => onClose(`MsgBtn${index + 1}`, data?.ID)}
              >
                {btn === "OK" ? "OK": btn.charAt(0).toUpperCase() + btn.slice(1).toLowerCase()}
              </button>
            ))
          ) : (
            <button
              className="rounded-button"
              onClick={() => onClose("MsgBtn1", data?.ID)}
            >
              {Btns}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MsgBox;
