import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon } from "@chakra-ui/react";
import axiosConfig from './AxiosConfig';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !lastName || !firstName || !patronymic || !password1 || !password2) {
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
      await axiosConfig.post("/api/user/register/", {
        email: email,
        last_name: lastName,
        first_name: firstName,
        patronymic: patronymic,
        password: password1,
        });
      navigate('/profile/confirmation');
    } catch (error) {
      console.error('Error registering new user: ', error);
    }
  };

  return (
    <Box mt="10" textAlign="center">
      <form onSubmit={handleSubmit}>
        <FormControl id="formBasicEmail" mb="4">
          <FormLabel>Электронная почта</FormLabel>
          <Input type="email" placeholder="Введите электронную почту" value={email} onChange={e => setEmail(e.target.value)} />
        </FormControl>
        {/*<FormControl id="formBasicUsername" mb="4">*/}
        {/*  <FormLabel>Username</FormLabel>*/}
        {/*  <Input type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />*/}
        {/*</FormControl>*/}
        <FormControl id="formBasicLastName" mb="4">
          <FormLabel>Фамилия</FormLabel>
          <Input type="text" placeholder="Введите фамилию" value={lastName} onChange={e => setLastName(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicFirstName" mb="4">
          <FormLabel>Имя</FormLabel>
          <Input type="text" placeholder="Введите имя" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicPatronimyc" mb="4">
          <FormLabel>Отчетсво</FormLabel>
          <Input type="text" placeholder="Введите отчество" value={patronymic} onChange={e => setPatronymic(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicPassword" mb="4">
          <FormLabel>Пароль</FormLabel>
          <Input type={showPassword1 ? 'text' : 'password'} placeholder="Введите пароль" value={password1} onChange={e => setPassword1(e.target.value)} />
          <Button variant={'ghost'} onClick={() => setShowPassword1((showPassword1) => !showPassword1)}>
            {showPassword1 ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </FormControl>
        <FormControl id="formBasicPassword2" mb="4">
          <FormLabel>Повторите пароль</FormLabel>
          <Input type={showPassword2 ? 'text' : 'password'} placeholder="Повторите пароль" value={password2} onChange={e => setPassword2(e.target.value)} />
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