import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar } from 'react-bootstrap';
import './style.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Tests from './Pages/Tests';
import Library from './Pages/Library';
import MyTests from './Pages/MyTests';
import Profile from './Pages/Profile';
import AddTest from './Pages/AddTest';
import { DataProvider } from './Pages/Components/DataContext';
import TestPassing from './Pages/TestPassing';
import AddExercise from './Pages/AddExercise';
import { useEffect, useState } from 'react';
import axiosConfig from './Pages/Components/AxiosConfig';

function App() {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const getAccess = async () => {
      try {
        const response = await axiosConfig.get("/api/user/check-user-permissions/");
        if (response.data.access === "allow") {
          setIsAllowed(true);
        }
        console.log(response.data.access);
      } catch (error) {
        console.log(error);
      }
    }

    getAccess();
  }, []);


  return (
    <>
      <Navbar collapseOnSelect expand='md' bg='light' variant='light' className='custom-navbar'>
        <Container className='center-nav'>
          <Navbar.Toggle aria-controls='responsive-navbar-nav' className='custom-nav-toggle' />
          <Navbar.Collapse id='responsive-navbar-nav' style={{ position: 'relative' }}>
            <Nav className='mx-auto'>
              <Nav.Link href='/' className='custom-nav-link'>Главная</Nav.Link>
              <Nav.Link href='/tests' className='custom-nav-link'>Тесты</Nav.Link>
              {isAllowed && (
                <>
                  <Nav.Link href='/library' className='custom-nav-link'>Библиотека</Nav.Link>
                  <Nav.Link href='/my-tests' className='custom-nav-link'>Мои тесты</Nav.Link>
                </>
              )}
              <Nav.Link href='/profile' className='custom-nav-link'>Профиль</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/tests' element={<Tests />} />
            {isAllowed && (
              <>
                <Route path='/library' element={<Library />} />
                <Route path='/my-tests' element={<MyTests />} />
                <Route path='/my-tests/add-test' element={<AddTest />} />
                <Route path='/my-tests/add-exercise' element={<AddExercise />} />
                <Route path='/my-tests/test/:id' element={<TestPassing />} />
                <Route path='/tests/public-tests/:id' element={<TestPassing />} />
              </>
            )}
            <Route path='/profile/*' element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </>
  );
}

export default App;