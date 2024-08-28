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

  const deleteTestMutation = useMutation(deleteTest, {
    onSuccess: () => {
      queryClient.invalidateQueries('tests');
    },
  });

  const navigate = useNavigate();
  const handleDeleteTest = (testId) => {
    setTestToDelete(testId);
    openModal();
  };

  const confirmDeleteTest = () => {
    deleteTestMutation.mutate(testToDelete);
    setTestToDelete(null);
    closeModal();
  };

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

  return (
    <div>
      <div className='color'>
        <Container className="h-100">
          <Row className="h-100 align-items-center justify-content-between">
            <Col className='aling-items-center justify-content-'>
              <h1 className="h-white ml-100">Мои тесты</h1>
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
            <Col lg={2} sm={3} className="d-flex justify-content-end">
              <Button variant='outline-info'>Поиск</Button>
            </Col>
            <Col lg={2} className="d-flex justify-content-end">
              <Link to='/my-tests/add-test' className='btn btn-red '>Добавить тест</Link>
            </Col>
            <Col lg={2} className="d-flex justify-content-end">
              <Link to='/my-tests/add-exercise' className='btn btn-red'>Добавить упражнение</Link>
            </Col>
          </Row>
        </Container>
      </div>
      <Container>
        <Row clas>
          {filteredTests?.length > 0 ? (
            filteredTests.map((test, index) => (
              <Col key={index} sm={12} md={6} lg={2}>
                <Test 
                  name={test.name} 
                  description={test.description} 
                  id={test.id} 
                  link={`/my-tests/test/${test.id}`} 
                  onDelete={() => handleDeleteTest(test.id)}
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
      </Container>
      <Modal isActive={isActive} closeModal={closeModal}>
        <h1>Удалить выбранный тест?</h1>
        <p>
          <Button onClick={confirmDeleteTest}>Да</Button>
          <Button onClick={closeModal}>Нет</Button>
        </p>
      </Modal>

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