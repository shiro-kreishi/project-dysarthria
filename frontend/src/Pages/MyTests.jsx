import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, FormControl, Toast, ListGroup } from 'react-bootstrap';
import './style.css';
import { Link, useNavigate } from "react-router-dom";
import Test from './Components/TestItem';
import Modal from './Components/Modal';
import useModal from '../hooks/useModal';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchTests, deleteTest } from './Components/api';

const MyTests = () => {
  const queryClient = useQueryClient();
  const { data: tests, isLoading, error } = useQuery('tests', fetchTests);
  const { isActive, openModal, closeModal } = useModal();
  const [testToDelete, setTestToDelete] = useState(null);
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(12); // Количество тестов на странице

 
  const navigate = useNavigate();

  useEffect(() => {
    const testCreated = localStorage.getItem('testCreated');
    if (testCreated === 'true') {
      setShow(true);
      localStorage.removeItem('testCreated');
    }
  }, []);

  const filteredTests = tests?.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    test.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : tests?.filter(test => 
      test.name.toLowerCase().includes(inputValue) || 
      test.description.toLowerCase().includes(inputValue)
    );
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSuggestionsFetchRequested({ value });
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setSuggestions([]);
  };

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests?.slice(indexOfFirstTest, indexOfLastTest);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className='color'>
        <Container className="h-100">
          <Row className="h-100 align-items-center justify-content-between">
            <Col className='aling-items-center justify-content-'>
              <h1 className=" ml-100 h-white">Мои тесты</h1>
            </Col>
            <Col>
              <Form inline>
                <FormControl
                  type='text'
                  placeholder='Введите название или тип теста...'
                  className='mr-sm-2'
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {suggestions.length > 0 && (
                  <ListGroup className="suggestions-list">
                    {suggestions.map(suggestion => (
                      <ListGroup.Item 
                        key={suggestion.id} 
                        action 
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Form>
            </Col>
            <Col lg={3} className="d-flex ">
              <Link to='/my-tests/add-test' className='btn'>Добавить тест</Link>
              <Link to='/library/' className='btn'>Библиотека упражнений</Link>

            </Col>
          </Row>
        </Container>
      </div>
      <Container>
        <Row>
          {currentTests?.length > 0 ? (
            currentTests.map((test, index) => (
              <Col key={index} sm={12} md={6} lg={4}>
                <Test 
                  name={test.name} 
                  description={test.description} 
                  id={test.id} 
                  link={`/my-tests/test/${test.id}`} 
                  onEdit={() => navigate(`/my-tests/edit-test/test/${test.id}`)}
                />
              </Col>
            ))
          ) : (
            <div className='text-center'>
              <h1 className='text-center'>Тестов нет</h1>
              <p>Добавьте новые тесты. Если тесты не
                добавляются - обратитесь к администратору
              </p>
            </div>
          )}
        </Row>
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination
              testsPerPage={testsPerPage}
              totalTests={filteredTests?.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </Col>
        </Row>
      </Container>

      <div className="toast-container">
        <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg='success'>
          <Toast.Header>
            <strong className='me-auto'>Успешно!</strong>
          </Toast.Header>
          <Toast.Body className={'Dark' && 'text-white'}>Тест и упражнения к нему успешно созданы.</Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default MyTests;

// Компонент Pagination
const Pagination = ({ testsPerPage, totalTests, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalTests / testsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <Button onClick={() => paginate(number)} className="page-link">
              {number}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};