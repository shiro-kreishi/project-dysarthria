import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Flex,
  Stack,
  InputRightElement,
  InputGroup,
  useColorModeValue,
} from "@chakra-ui/react";
import axiosConfig from './AxiosConfig';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const PasswordConfirmation = () => {
  const [code, setCode] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const url = "/api/user/forgot-password-change/";
  let { passwordConfirmKey } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const sendPasswordConfirmation = async () => {
      if (passwordConfirmKey) {
        try {
          const response = await axiosConfig.get(`${url}${passwordConfirmKey}/`);
          console.log(response);
        }
        catch (e) {
          console.log(e);
        }
      }
    };

    sendPasswordConfirmation();
}, [axiosConfig, passwordConfirmKey, url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || !password1 || !password2) {
      setError('Заполните поля');
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
      const response = await axiosConfig.post("/api/user/forgot-password-change/", { url: passwordConfirmKey, code, new_password: password1 });
      if (response.status === 201) {
        navigate('/');
      } else {
        setError('Не корректные данные');
      }
    } catch (error) {
      console.error('Error recovering password: ', error);
      setError('Не корректные данные');
    }
  };

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} w={'full'} py={12} px={6}>
        <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
          <Stack spacing={4} >
            <form onSubmit={handleSubmit}>
              <FormControl id="formBasicCode" mb="4">
                <FormLabel>Код из письма на Email</FormLabel>
                <Input type="text" placeholder="Введите код" value={code} onChange={e => setCode(e.target.value)} />
              </FormControl>
              <FormControl id="formBasicPassword1" mb="4">
                <FormLabel>Пароль</FormLabel>
                <InputGroup>
                  <Input type={showPassword1 ? 'text' : 'password'} placeholder="Введите пароль" value={password1} onChange={e => setPassword1(e.target.value)} />
                  <InputRightElement h={'full'}>
                    <Button variant={'ghost'} onClick={() => setShowPassword1((showPassword1) => !showPassword1)}>
                      {showPassword1 ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl id="formBasicPassword2" mb="4">
                <FormLabel>Подтверждение пароля</FormLabel>
                <InputGroup>
                  <Input type={showPassword2 ? 'text' : 'password'} placeholder="Подтвердите пароль" value={password2} onChange={e => setPassword2(e.target.value)} />
                  <InputRightElement h={'full'}>
                    <Button variant={'ghost'} onClick={() => setShowPassword2((showPassword2) => !showPassword2)}>
                      {showPassword2 ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10}>
                {error && (
                  <Alert status="error" mb="4">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                <Button type="submit" bg={'blue.400'} color={'white'} _hover={{ bg: 'blue.500', }}>Применить</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default PasswordConfirmation;