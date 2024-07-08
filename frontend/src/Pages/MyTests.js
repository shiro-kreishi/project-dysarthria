import { Container, Row, Col, Form, Button, FormControl } from 'react-bootstrap';
import './style.css';
import { Link, Route, Routes } from 'react-router-dom';
import Test from './Test';
import AddTest from './AddTest';

function MyTests() {
  return (
    <div>
      <div className='color'>
        <Container className='h-100'>
          <Row className='h-100 align-items-center'>
            <Col>
              <h1 className='white-text ml-100'>Мои тесты</h1>
            </Col>
            <Col>
              <Form inline>
                <FormControl
                  type='text'
                  placeholder='Введите название или тип теста...'
                  className='mr-sm-2'
                />
                <Button variant='outline-info'>Поиск</Button>
                <Link to='./AddTest' className='btn btn-red'>Добавить тест</Link>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
        <Container>
          <Row>
            <Col><Test title='Тест 1' /></Col>
            <Col><Test title='Тест 2' /></Col>
          </Row>
        </Container>
        <Routes>
          <Route path='./AddTest' element={<AddTest />} />
        </Routes>
    </div>
  );
}

export default MyTests;
