import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon } from "@chakra-ui/react";
import axiosConfig from './AxiosConfig';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password1 || !password2) {
      setError('Заполните все поля');
      return;
    } else if (password1 !== password2) {
      setError('Пароли не совпадают');
      return;
    } else if (password1.length < 8) {
      setError('Пароль должен состоять минимум из 8 символов');
      return;
    } else if (password1 === password1.toLowerCase()) {
      setError('В пароле должна быть хотя бы одна заглавная буква');
      return;
    }

    try {
      await axiosConfig.post("/api/user/register/", { email, password: password1, username });
      navigate('/profile/confirmation');
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
          <Input type={showPassword1 ? 'text' : 'password'} placeholder="Password" value={password1} onChange={e => setPassword1(e.target.value)} />
          <Button variant={'ghost'} onClick={() => setShowPassword1((showPassword1) => !showPassword1)}>
            {showPassword1 ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </FormControl>
        <FormControl id="formBasicPassword2" mb="4">
          <FormLabel>Password confirmation</FormLabel>
          <Input type={showPassword2 ? 'text' : 'password'} placeholder="Password confirmation" value={password2} onChange={e => setPassword2(e.target.value)} />
          <Button variant={'ghost'} onClick={() => setShowPassword2((showPassword2) => !showPassword2)}>
            {showPassword2 ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
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