import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './style.css';

const PublicTest = ({ name, description, id, link,}) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(link);
  };

  return (
    <div className="test-item" onClick={handleClick}>
      <div className="test-header">
        <h3 className="test-title">{name}</h3>
        <p className="test-description">{description}</p>
      </div>
    </div>
  );
};

export default PublicTest;