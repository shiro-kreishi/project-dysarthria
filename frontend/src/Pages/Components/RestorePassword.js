import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useColorModeValue,
} from "@chakra-ui/react";
import axiosConfig from './AxiosConfig';

const RestorePassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Заполните поле');
      return;
    }

    try {
      const response = await axiosConfig.post("/api/user/forgot-password/", { email });
      if (response.status === 201) {
        console.log("User forgot password");
        navigate('/profile/confirmation');
      } else {
        setError('Пользователь с таким Email не существует');
      }
    } catch (error) {
      console.error('Error recovering password: ', error);
      setError('Пользователь с таким Email не существует');
    }
  };

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} w={'full'} py={12} px={6}>
        <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
          <Stack spacing={4} >
            <form onSubmit={handleSubmit}>
              <FormControl id="formBasicEmail" mb="4">
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Введите Email" value={email} onChange={e => setEmail(e.target.value)} />
              </FormControl>
              <Stack spacing={10}>
                {error && (
                  <Alert status="error" mb="4">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                <Button type="submit" bg={'blue.400'} color={'white'} _hover={{ bg: 'blue.500', }}>Восстановить</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default RestorePassword;