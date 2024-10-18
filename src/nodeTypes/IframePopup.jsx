import React, { useState } from "react";
import ReactDOM from "react-dom";

export const IframePopup = ({ url, disabled }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const popupContent = isPopupOpen && (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={() => setIsPopupOpen(false)}>
          ✖
        </button>
        <iframe
          width="100%"
          height="100%"
          style={{ border: "none", pointerEvents: "auto" }}
          src={url}
        ></iframe>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="iframe-parent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={!disabled ? () => setIsPopupOpen(true) : null}
      >
        <iframe
          scrolling="no"
          width="100%"
          height="100%"
          style={{
            pointerEvents: "none",
            border: "1px solid black",
            background: isHovered ? "#f3f3f8" : "unset",
          }}
          src={url}
        ></iframe>
      </div>

      {/* Render popup outside of parent component using React Portal */}
      {ReactDOM.createPortal(popupContent, document.body)}
    </>
  );
};

/*import React, { useState } from "react";

export const IframePopup = ({ url }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <div className="iframe-parent" onClick={() => setIsPopupOpen(true)}>
        <iframe
          scrolling="no"
          width="100%"
          height="100%"
          style={{
            pointerEvents: "none",
            border: "1px solid black",
            //...data?.style,
          }}
          src={url}
        ></iframe>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}>
          <div className="popup-content">
            <iframe
              width="100%"
              height="100%"
              style={{ border: "none" }}
              src={url}
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};
*/
