import React from "react";
import './modal.css';

const Modal = ({ isActive, closeModal, children }) => {
  if (!isActive) return null;

  return (
    <div className="modal" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
