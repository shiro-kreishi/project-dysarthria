import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Avatar,
  Center,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AssignDoctorGroup from './AssignDoctorGroups';

const Home = ({ currentUser, client }) => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const response = await client.get("/api/user/current-user/");
        setEmail(response.data.email);
        // setUsername(response.data.username);
        setFirstname(response.data.first_name);
        setLastname(response.data.last_name);
        setPatronymic(response.data.patronymic)
      }
    };

    fetchUserData();
  }, [currentUser, client]);

  const handleChangeData = async (e) => {
    e.preventDefault();
    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];
      if (!csrfToken) {
        console.error('CSRF token is missing');
        return;
      }
      await client.post("/api/user/update-name/", {
        first_name: firstname,
        last_name: lastname,
        patronimyc: patronymic,
      }, {
        headers: {
          'X-CSRFToken': csrfToken
        }
      });
    } catch (error) {
      console.error("Error change data: ", error.response ? error.response.data : error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];
      if (!csrfToken) {
        console.error('CSRF token is missing');
        return;
      }
      await client.post("/api/user/change-password/", { old_password: password1, new_password: password2 }, {
        headers: {
          'X-CSRFToken': csrfToken
        }
      });
      await client.post("/api/user/login/", { email, password: password2 });
    } catch (error) {
      console.error("Error change password: ", error.response ? error.response.data : error.message);
    }
  };

  return (
    <Box textAlign="center" mt="10">
      {!currentUser ? <Heading>Пожалуйста зайдите или зарегистрируйтесь</Heading> : 
        <Flex minH={'100vh'} align={'center'} justify={'center'}>
          <Stack spacing={4} w={'full'} maxW={'md'} rounded={'xl'} boxShadow={'lg'} p={6} my={12}>
            <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
              Профиль пользователя
            </Heading>
            <FormControl id="userName">
              <FormLabel>Фотография</FormLabel>
              <Stack direction={['column', 'row']} spacing={6}>
                <Center>
                  <Avatar size="xl" src="https://bit.ly/sage-adebayo"></Avatar>
                </Center>
                <Center w="full">
                  <Button w="full">Изменить фотографию</Button>
                </Center>
              </Stack>
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input placeholder="email@example.com" _placeholder={{ color: 'gray.500' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id="lastName" isRequired>
              <FormLabel>Фамилия</FormLabel>
              <Input placeholder="Введите фамилию" _placeholder={{ color: 'gray.500' }} type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} />
            </FormControl>
            <FormControl id="firstName" isRequired>
              <FormLabel>Имя</FormLabel>
              <Input placeholder="Введите имя" _placeholder={{ color: 'gray.500' }} type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
            </FormControl>
            <FormControl id="patronymic" isRequired>
              <FormLabel>Отчество</FormLabel>
              <Input placeholder="Введите отчество" _placeholder={{ color: 'gray.500' }} type="text" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
            </FormControl>
            <Stack spacing={6} direction={['column', 'row']}>
              <form onSubmit={handleChangeData}>
                <Button type="submit" bg={'blue.400'} color={'white'} w="full" _hover={{ bg: 'blue.500' }}>
                  Изменить данные
                </Button>
              </form>
            </Stack>
            <FormControl id="password1" isRequired>
              <FormLabel>Old password</FormLabel>
              <Input placeholder="Old password" _placeholder={{ color: 'gray.500' }} type={showPassword1 ? 'text' : 'password'} value={password1} onChange={e => setPassword1(e.target.value)} />
              <Button variant={'ghost'} onClick={() => setShowPassword1((showPassword1) => !showPassword1)}>
                {showPassword1 ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </FormControl>
            <FormControl id="password2" isRequired>
              <FormLabel>New password</FormLabel>
              <Input placeholder="New password" _placeholder={{ color: 'gray.500' }} type={showPassword2 ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)} />
              <Button variant={'ghost'} onClick={() => setShowPassword2((showPassword2) => !showPassword2)}>
                {showPassword2 ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </FormControl>
            <Stack spacing={6} direction={['column', 'row']}>
              <form onSubmit={handleChangePassword}>
                <Button type="submit" bg={'blue.400'} color={'white'} w="full" _hover={{ bg: 'blue.500' }}>
                  Изменить пароль
                </Button>
              </form>
            </Stack>
          </Stack>
        </Flex>
      }
      {/*{currentUser && username === 'Admin' ? (*/}
      {/*  <AssignDoctorGroup/>*/}
      {/*) : <></>}*/}
    </Box>
  );
};

export default Home;