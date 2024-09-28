import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, FormControl, ListGroup } from 'react-bootstrap';
import './style.css';
import PublicTest from './Components/PublicTestItem';
import { useQueries, useQueryClient, useQuery } from 'react-query';
import { fetchPublicTests, fetchPublicTestById } from './Components/api';

const Tests = () => {
  const queryClient = useQueryClient();
  const { data: publicTests, isLoading, error } = useQuery(['public-tests'], fetchPublicTests);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(12); // Количество тестов на странице
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const testQueries = useQueries(
    publicTests?.map(test => ({
      queryKey: ['test', test.id],
      queryFn: () => fetchPublicTestById(test.id),
      enabled: !!publicTests
    })) || []
  );

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  const isLoadingTests = testQueries.some(query => query.isLoading);
  const testData = testQueries.map(query => query.data).filter(Boolean);

  const filteredTests = testData.filter(test => 
    test.test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    test.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : testData.filter(test => 
      test.test.name.toLowerCase().includes(inputValue) || 
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
    setSearchQuery(suggestion.test.name);
    setSuggestions([]);
  };

  // Получаем индексы первого и последнего теста на текущей странице
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);

  // Изменяем страницу
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className='color'>
        <Container className="h-100">
          <Row className="h-100 align-items-center">
            <Col>
              <h1 className="h-white ml-100">Каталог тестов</h1>
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
                        {suggestion.test.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
      <Container>
        <Row>
          {isLoadingTests ? (
            <p>Загрузка тестов...</p>
          ) : currentTests.length > 0 ? (
            currentTests.map((test) => (
              <Col key={test.id} sm={12} md={6} lg={4}>
                <PublicTest
                  name={test.test.name} 
                  description={test.description} 
                  id={test.id} 
                  link={`/public-tests/test/${test.test.id}/`} 
                />
              </Col>
            ))
          ) : (
            <div className='text-center'>
              <h1 className='text-center'>Тестов нет</h1>
              <p>Новые тесты скоро , если тестов нет - сообщите 
                администратору
              </p>
            </div>
          )}
        </Row>
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination
              testsPerPage={testsPerPage}
              totalTests={filteredTests.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Tests;

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