import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './style.css';

const Test = ({ name, description, id, link, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(link);
  };

  return (
    <div className="test-item" onClick={handleClick}>
      <Button className="edit-button" onClick={(e) => { e.stopPropagation(); onEdit(); }}></Button>
      <Button className="delete-button" onClick={(e) => { e.stopPropagation(); onDelete(); }}></Button>
      <div className="test-header">
        <h3 className="test-title">{name}</h3>
        <p className="test-description">{description}</p>
      </div>
    </div>
  );
};

export default Test;