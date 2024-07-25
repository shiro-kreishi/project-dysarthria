import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import { ChakraProvider, Box, Button, Flex, Heading } from "@chakra-ui/react";
import axios from './axiosConfig';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';

function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenAccess = localStorage.getItem('tokenAccess');
    if (tokenAccess) {
      setCurrentUser(true);
    } else {
      setCurrentUser(false);
    }
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();

    let tokenAccess = localStorage.getItem('tokenAccess');
    if (!tokenAccess) {
      console.error("No token found");
      return;
    }

    try {
      let values = document.cookie.split('; ');
      for (let i = 0; i < values.length; i++) {
        if (values[i].split('=')[0] === 'tokenRefresh') {
          var tokenRefresh = values[i].split('=')[1];
          break;
        }
      }
      try {
        await axios.post("/api/token/verify/", { token: tokenAccess });
      } catch {
        const response = await axios.post("/api/token/refresh/", { refresh: tokenRefresh });
        tokenAccess = response.data.access;
      }
      await axios.post("/api/user/logout/", {
        refresh_token: tokenRefresh
      }, {
        headers: {
          'Authorization': `Bearer ${tokenAccess}`
        }
      });
      console.log('User logged out');
      setCurrentUser(false);
      document.cookie = 'tokenRefresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('tokenAccess');
      navigate('/profile');
    } catch (error) {
      console.error("Error logging out: ", error.response ? error.response.data : error.message);
    }
  };

  return (
    <ChakraProvider>
      <Box>
        <Flex as="nav" bg="blue.500" p="4" color="white" justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="lg">Вход или регистрация</Heading>
          <Flex>
            {currentUser ? (
              <form onSubmit={handleLogout}>
                <Button type="submit" colorScheme="teal">Выход</Button>
              </form>
            ) : (
              <>
                <Link to="/profile/login">
                  <Button colorScheme="teal" mr="4">Вход</Button>
                </Link>
                <Link to="/profile/register">
                  <Button colorScheme="teal">Регистрация</Button>
                </Link>
              </>
            )}
          </Flex>
        </Flex>
        <Routes>
          <Route path="/" element={<Home currentUser={currentUser} />} />
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
          <Route path="/register" element={<Register setCurrentUser={setCurrentUser} />} />
        </Routes>
      </Box>
    </ChakraProvider>
  );
}

export default Profile;
