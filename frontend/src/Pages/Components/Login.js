import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon } from "@chakra-ui/react";
import axiosConfig from './AxiosConfig';

const Login = ({ client, setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните поля');
      return;
    }

    try {
      console.log(client.baseURL);
      const response = await axiosConfig.post("/api/user/login/", { email, password });
      if (response.status === 200) {
        console.log('Login successful');
        setCurrentUser(true);
        localStorage.setItem('currentUser', JSON.stringify(true));
        navigate('/');
      } else {
        setError('Не корректные данные');
      }
    } catch (error) {
      console.error('Error logging in user: ', error);
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
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
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