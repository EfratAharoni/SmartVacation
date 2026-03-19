import React, { useState } from "react";
import "./Confirmation.css";

export default function Confirmation() {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <button className="confirmation-close" onClick={() => setShow(false)} title="סגור">×</button>
        <div className="confirmation-modal-content">
          <h2>החופשה נסגרה!</h2>
          <p className="confirmation-success">התשלום התקבל בהצלחה.</p>
          <div className="confirmation-info">
            <h4>הנה כמה דברים שכדאי לסגור עכשיו:</h4>
            <ul>
              <li>ביטוח נסיעות</li>
              <li>סים לחו"ל</li>
              <li>לבדוק שהדרכון בתוקף לפחות 6 חודשים</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
