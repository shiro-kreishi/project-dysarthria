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
import { Link } from 'react-router-dom';
import AvatarProfile from './Avatar.jpg';

const Home = ({ currentUser, client }) => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const response = await client.get("/api/user/current-user/");
        setEmail(response.data.email);
        setFirstname(response.data.first_name);
        setLastname(response.data.last_name);
        setPatronymic(response.data.patronymic);
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

  return (
    <Box textAlign="center" mt="10">
      {!currentUser ? <Heading>Пожалуйста зайдите или зарегистрируйтесь</Heading> : 
        <>
          {admin ? (
            <a href="admin_homepage_page.html"><Button>Панель администратора</Button></a> // На данный момент не работает
          ) : <></>}
          <Flex minH={'100vh'} align={'center'} justify={'center'}>
            <Stack spacing={4} w={'full'} maxW={'md'} rounded={'xl'} boxShadow={'lg'} p={6} my={12}>
              <FormControl id="userName">
                <Center>
                  <Avatar size="xl" src={AvatarProfile}></Avatar>
                </Center>
              </FormControl>
              <FormControl id="email">
                <FormLabel>Email</FormLabel>
                <Input value={email} readOnly />
              </FormControl>
              <FormControl id="firstName">
                <FormLabel>Имя</FormLabel>
                <Input value={firstname} readOnly />
              </FormControl>
              <FormControl id="lastName">
                <FormLabel>Фамилия</FormLabel>
                <Input value={lastname} readOnly />
              </FormControl>
                <FormControl id="patronymic">
                <FormLabel>Отчество</FormLabel>
                <Input value={patronymic} readOnly />
              </FormControl>
              <Link to="/profile/change-data">
                <Button bg={'blue.400'} color={'white'} w="full" _hover={{ bg: 'blue.500' }}>Редактировать профиль</Button>
              </Link>
            </Stack>
          </Flex>
        </>
      }
    </Box>
  );
};

export default Home;