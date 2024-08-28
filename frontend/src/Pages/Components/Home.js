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

const Home = ({ currentUser, client }) => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const response = await client.get("/api/user/current-user/");
        setEmail(response.data.email);
        setFirstname(response.data.first_name);
        setLastname(response.data.last_name);
        setPatronymic(response.data.patronymic)
      }
    };

    const checkAdmin = async () => {
      if (currentUser) {
        try {
          const response = await client.get("/api/user/check-user-permissions/");
          if (response.data.groups[0].name === "Administrators") {
            setAdmin(true);
          }
        } catch (error) {
          console.error("Error: ", error.response ? error.response.data : error.message);
        }
      }
    };

    fetchUserData();
    checkAdmin();
  }, [currentUser, client]);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];
      if (!csrfToken) {
        console.error('CSRF token is missing');
        return;
      }
      await client.post("/api/user/change-email/", { new_email: email, password }, {
        headers: {
          'X-CSRFToken': csrfToken
        }
      });
    } catch (error) {
      console.error("Error change email: ", error.response ? error.response.data : error.message);
    }
  };

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
        patronymic: patronymic,
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
        <>
          {admin ? (
            <Button href="admin_homepage_page.html">Панель администратора</Button> // На данный момент не работает
          ) : <></>}
          <Flex minH={'100vh'} align={'center'} justify={'center'}>
            <Stack spacing={4} w={'full'} maxW={'md'} rounded={'xl'} boxShadow={'lg'} p={6} my={12}>
              <FormControl id="userName">
                <Center>
                  <Avatar size="xl" src="https://bit.ly/sage-adebayo"></Avatar>
                </Center>
              </FormControl>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder="Email" _placeholder={{ color: 'gray.500' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Пароль</FormLabel>
                <Input placeholder="Пароль" _placeholder={{ color: 'gray.500' }} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} />
                <Button variant={'ghost'} onClick={() => setShowPassword((showPassword) => !showPassword)}>
                  {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </FormControl>
              <Stack spacing={6} direction={['column', 'row']}>
                <form onSubmit={handleChangeEmail}>
                  <Button type="submit" bg={'blue.400'} color={'white'} w="full" _hover={{ bg: 'blue.500' }}>
                    Изменить почту
                  </Button>
                </form>
              </Stack>
              <FormControl id="firstName" isRequired>
                <FormLabel>Имя</FormLabel>
                <Input placeholder="Имя" _placeholder={{ color: 'gray.500' }} type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
              </FormControl>
              <FormControl id="lastName" isRequired>
                <FormLabel>Фамилия</FormLabel>
                <Input placeholder="Фамилия" _placeholder={{ color: 'gray.500' }} type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} />
              </FormControl>
                <FormControl id="patronymic" isRequired>
                <FormLabel>Отчество</FormLabel>
                <Input placeholder="Отчество" _placeholder={{ color: 'gray.500' }} type="text" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
              </FormControl>
              <Stack spacing={6} direction={['column', 'row']}>
                <form onSubmit={handleChangeData}>
                  <Button type="submit" bg={'blue.400'} color={'white'} w="full" _hover={{ bg: 'blue.500' }}>
                    Изменить данные
                  </Button>
                </form>
              </Stack>
              <FormControl id="password1" isRequired>
                <FormLabel>Старый пароль</FormLabel>
                <Input placeholder="Старый пароль" _placeholder={{ color: 'gray.500' }} type={showPassword1 ? 'text' : 'password'} value={password1} onChange={e => setPassword1(e.target.value)} />
                <Button variant={'ghost'} onClick={() => setShowPassword1((showPassword1) => !showPassword1)}>
                  {showPassword1 ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </FormControl>
              <FormControl id="password2" isRequired>
                <FormLabel>Новый пароль</FormLabel>
                <Input placeholder="Новый пароль" _placeholder={{ color: 'gray.500' }} type={showPassword2 ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)} />
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
        </>
      }
    </Box>
  );
};

export default Home;