import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from '../axiosConfig';

const Register = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password || !password2 || !first_name || !last_name) {
      setError('Заполните все поля');
      return;
    } else if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    } else if (password.length < 8) {
      setError('Пароль должен состоять минимум из 8 символов');
      return;
    } else if (password === password.toLowerCase()) {
      setError('В пароле должна быть хотя бы одна заглавная буква');
      return;
    }

    try {
      await axios.post("/api/user/register/", { email, username, password, password2, first_name, last_name });
      const loginResponse = await axios.post("/api/token/", { email, password });
      const tokenAccess = loginResponse.data.access;
      const tokenRefresh = loginResponse.data.refresh;
      console.log('Registration and login successful');
      localStorage.setItem('tokenAccess', tokenAccess);
      document.cookie = `tokenRefresh=${tokenRefresh}`;
      setCurrentUser(true);
      navigate('/');
    } catch (error) {
      console.error('Error registering new user: ', error.response ? error.response.data : error.message);
      setError('Ошибка регистрации');
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
        <FormControl id="formBasicFirst_name" mb="4">
          <FormLabel>First name</FormLabel>
          <Input type="text" placeholder="Enter first name" value={first_name} onChange={e => setFirst_name(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicLast_name" mb="4">
          <FormLabel>Last name</FormLabel>
          <Input type="text" placeholder="Enter last name" value={last_name} onChange={e => setLast_name(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicPassword" mb="4">
          <FormLabel>Password</FormLabel>
          <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button variant={'ghost'} onClick={() => setShowPassword((showPassword) => !showPassword)}>
            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
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
