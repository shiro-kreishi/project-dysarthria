import './style.css';

function Test({ title }) {
  return (
    <div className='test-item'>
      <div className='test-header'>
        <h3 className='test-title'>{title}</h3>
      </div>
    </div>
  );
}

export default Test;
