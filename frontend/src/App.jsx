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
import TestPassing from './Pages/TestPassing';
import AddExercise from './Pages/AddExercise';
import usePermissions from './hooks/usePermissions';
import EditTest from './Pages/EditTest';

function App() {
  const { isAllowed, isLoading, error } = usePermissions();

  if (isLoading) {
    // Показать экран загрузки, пока идет проверка прав
    return <div>Loading...</div>;
  }

  if (error) {
    // Показать сообщение об ошибке
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Navbar collapseOnSelect expand="md" bg="light" variant="light" className="custom-navbar">
        <Container className="center-nav">
          <Navbar.Toggle aria-controls="responsive-navbar-nav" className="custom-nav-toggle" />
          <Navbar.Collapse id="responsive-navbar-nav" style={{ position: "relative" }}>
            <Nav className="mx-auto">
              <Nav.Link href="/" className="custom-nav-link">Главная</Nav.Link>
              <Nav.Link href="/tests" className="custom-nav-link">Тесты</Nav.Link>
              {isAllowed && (
                <>
                  <Nav.Link href="/library" className="custom-nav-link">Библиотека</Nav.Link>
                  <Nav.Link href="/my-tests" className="custom-nav-link">Мои тесты</Nav.Link>
                </>
              )}
              <Nav.Link href="/profile" className="custom-nav-link">Профиль</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<Tests />} />
          {isAllowed && (
            <>
              <Route path='/my-tests/edit-test/test/:id' element={<EditTest />} />
              <Route path="/library" element={<Library />} />
              <Route path="/my-tests" element={<MyTests />} />
              <Route path="/my-tests/add-test" element={<AddTest />} />
              <Route path="/my-tests/add-exercise" element={<AddExercise />} />
              <Route path="/my-tests/test/:id" element={<TestPassing />} />
            </>
          )}
          <Route path="/profile/*" element={<Profile />} />
          <Route path="/public-tests/test/:id" element={<TestPassing />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;