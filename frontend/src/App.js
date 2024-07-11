import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar } from 'react-bootstrap';
import './style.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Tests from './Pages/Tests';
import Library from './Pages/Library';
import MyTests from './Pages/MyTests';
import Profile from './Pages/Profile';

function App() {
  return (
    <>
      <Navbar collapseOnSelect expand='md' bg='light' variant='light'>
        <Container className='custom-container'>
          <Navbar.Toggle aria-controls='responsive-navbar-nav' className='custom-nav-toggle'/>
          <Navbar.Collapse id='responsive-navbar-nav'>
            <Nav className='modal-fullscreen'>
              <Nav.Link href='/' className='custom-nav-link'>Главная</Nav.Link>
              <Nav.Link href='/tests' className='custom-nav-link'>Тесты</Nav.Link>
              <Nav.Link href='/library' className='custom-nav-link'>Библиотека</Nav.Link>
              <Nav.Link href='/my-tests' className='custom-nav-link'>Мои тесты</Nav.Link>
              <Nav.Link href='/profile' className='custom-nav-link'>Профиль</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tests' element={<Tests />} />
          <Route path='/library' element={<Library />} />
          <Route path='/my-tests' element={<MyTests />} />
          <Route path='/profile/*' element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;