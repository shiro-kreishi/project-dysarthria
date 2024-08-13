import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon } from "@chakra-ui/react";
import axiosConfig from './AxiosConfig';

const Register = ({ client, setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password) {
      setError('Заполните все поля');
      return;
    } else if (password.length < 8) {
      setError('Пароль должен состоять минимум из 8 символов');
      return;
    } else if (password === password.toLowerCase()) {
      setError('В пароле должна быть хотя бы одна заглавная буква');
      return;
    }

    try {
      await axiosConfig.post("/api/user/register/", { email, username, password });
      await axiosConfig.post("/api/user/login/", { email, password });
      console.log('Registration and login successful');
      setCurrentUser(true);
      localStorage.setItem('currentUser', JSON.stringify(true));
      navigate('/');
    } catch (error) {
      console.error('Error registering new user: ', error);
    }
  };

  return (
    <Box mt="10" textAlign="center">
      <form onSubmit={handleSubmit}>
        <FormControl id="formBasicEmail" mb="4">
          <FormLabel>Email address</FormLabel>
          <Input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicUsername" mb="4">
          <FormLabel>Username</FormLabel>
          <Input type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicPassword" mb="4">
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </FormControl>
        {error && (
          <Alert status="error" mb="4">
            <AlertIcon />
            {error}
          </Alert>
        )}
        <Button type="submit" colorScheme="teal">Зарегистрироваться</Button>
      </form>
    </Box>
  );
};

export default Register;