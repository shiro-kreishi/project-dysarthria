//Компонент объекта теста для списков на страницах Tests, MyTests 
import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Test = ({ name, description, id, link }) => {
  return (
    <Link to={`${link}`} >
      <div className='test-item'>
        <div className="test-header">
          <h3 className="test-title">{name}</h3>
          <p className="test-description">{description}</p>
        </div>
      </div>
      
    </Link>
  );
};

export default Test;
