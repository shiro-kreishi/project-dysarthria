import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './style.css';

const ExerciseItem = ({ name, description, id, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/exercise/${id}`);
  };

  return (
    <div className='exercise-item' onClick={handleClick}>
      <Button className="delete-button" onClick={(e) => { e.stopPropagation(); onDelete(); }}></Button>
      <div className="test-header">
        <h3 className="test-title">{name}</h3>
        <p className="test-description">{description}</p>
      </div>
    </div>
  );
};

export default ExerciseItem;