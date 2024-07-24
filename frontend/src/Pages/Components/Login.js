import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon } from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from '../axiosConfig';

const Login = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните поля');
      return;
    }

    try {
      const response = await axios.post("/api/token/", { email, password });
      const tokenAccess = response.data.access;
      const tokenRefresh = response.data.refresh;
      localStorage.setItem('tokenAccess', tokenAccess);
      document.cookie = `tokenRefresh=${tokenRefresh}`;
      console.log('tokenAccess:', tokenAccess);
      console.log('tokenRefresh:', tokenRefresh);
      setCurrentUser(true);
      navigate('/');
    } catch (error) {
      console.error('Error logging in user: ', error.response ? error.response.data : error.message);
      setError('Не корректные данные');
    }
  };

  return (
    <Box mt="10" textAlign="center">
      <form onSubmit={handleSubmit}>
        <FormControl id="formBasicEmail" mb="4">
          <FormLabel>Email</FormLabel>
          <Input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicPassword" mb="4">
          <FormLabel>Пароль</FormLabel>
          <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button variant={'ghost'} onClick={() => setShowPassword((showPassword) => !showPassword)}>
            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </FormControl>
        {error && (
          <Alert status="error" mb="4">
            <AlertIcon />
            {error}
          </Alert>
        )}
        <Button type="submit" colorScheme="teal">Войти</Button>
      </form>
    </Box>
  );
};

export default Login;
