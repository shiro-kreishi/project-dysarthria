import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';

const Test = ({ name, description, id, link }) => {
   const navigate = useNavigate();

  const handleClick = async () => {
    navigate(link); // Переход по ссылке после обновления
  };

  return (
    <div className='test-item' onClick={handleClick}>
      <div className="test-header">
        <h3 className="test-title">{name}</h3>
        <p className="test-description">{description}</p>
      </div>
    </div>
  );
};

export default Test;
