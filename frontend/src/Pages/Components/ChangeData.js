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
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Toast, ToastContainer } from 'react-bootstrap';

const ChangeData = ({ currentUser, client }) => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [show, setShow] = useState(false);
  const [showEmailChangeSuccess, setShowEmailChangeSuccess] = useState(false);

  // Ошибки для каждой формы
  const [emailError, setEmailError] = useState('');
  const [dataError, setDataError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

    fetchUserData();
  }, [currentUser, client]);

  const handleChangeEmail = async (e) => {
    e.preventDefault();

    // Проверка
    if (!email || !password) {
      setEmailError("Заполните все поля");
      return;
    }

    setEmailError(''); // Очистка ошибки перед запросом
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
      setShowEmailChangeSuccess(true);
    } catch (error) {
      console.error("Error change email: ", error.response ? error.response.data : error.message);
      // Проверка, что ошибка пришла от сервера
      if (error.response && error.response.data) {
        // Обработка ошибок от сервера
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          // Обработка ошибок, если они в виде объекта (например, {"field": ["error message"]})
          setEmailError(Object.values(serverErrors).flat().join(', '));
        }
      } else {
        // Общая ошибка, если нет ответа от сервера
        setEmailError("Ошибка при изменении данных");
      }
    }
  };

  const handleChangeData = async (e) => {
    e.preventDefault();

    // Проверка
    if (!firstname || !lastname) {
      setDataError("Заполните все поля");
      return;
    }

    setDataError('');
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
      setShow(true);
    } catch (error) {
      console.error("Error change data: ", error.response ? error.response.data : error.message);
      setDataError("Ошибка при изменении данных");
      if (error.response && error.response.data) {
        // Обработка ошибок от сервера
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          // Обработка ошибок, если они в виде объекта (например, {"field": ["error message"]})
          setDataError(Object.values(serverErrors).flat().join(', '));
        }
      } else {
        // Общая ошибка, если нет ответа от сервера
        setDataError("Ошибка при изменении данных");
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Проверка
    if (!password1 || !password2) {
      setPasswordError("Заполните все поля");
      return;
    }

    if (password1 === password2) {
      setPasswordError("Новый пароль не может быть таким же, как старый");
      return;
    }

    setPasswordError('');
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
      setShow(true);
    } catch (error) {
      console.error("Error change password: ", error.response ? error.response.data : error.message);
      // Проверка, что ошибка пришла от сервера
      if (error.response && error.response.data) {
        // Обработка ошибок от сервера
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          // Обработка ошибок, если они в виде объекта (например, {"field": ["error message"]})
          setPasswordError(Object.values(serverErrors).flat().join(', '));
        }
      } else {
        // Общая ошибка, если нет ответа от сервера
        setPasswordError("Ошибка при изменении данных");
      }
    }
  };

  return (
    <Box textAlign="center" mt="10">
      {!currentUser ? <Heading>Пожалуйста зайдите или зарегистрируйтесь</Heading> :
        <>
          <Flex minH={'100vh'} align={'center'} justify={'center'}>
            <Stack spacing={4} w={'full'} maxW={'md'} rounded={'xl'} boxShadow={'lg'} p={6} my={12}>
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
              {emailError && (
                  <Alert status="error" mb="4">
                    <AlertIcon />
                    {emailError}
                  </Alert>
              )}
              <Stack spacing={6}>
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
              <FormControl id="patronymic">
                <FormLabel>Отчество</FormLabel>
                <Input placeholder="Отчество" _placeholder={{ color: 'gray.500' }} type="text" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
              </FormControl>
              {dataError && (
                  <Alert status="error" mb="4">
                    <AlertIcon />
                    {dataError}
                  </Alert>
                )}
              <Stack spacing={6}>
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
              {passwordError && (
                <Alert status="error" mb="4">
                  <AlertIcon />
                  {passwordError}
                </Alert>
              )}
              <Stack spacing={6}>
                <form onSubmit={handleChangePassword}>
                  <Button type="submit" bg={'blue.400'} color={'white'} w="full" _hover={{ bg: 'blue.500' }}>
                    Изменить пароль
                  </Button>
                </form>
              </Stack>
            </Stack>
          </Flex>
          <div className="toast-container">
            <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg='success'>
              <Toast.Header>
                <strong className='me-auto'>Успешно!</strong>
              </Toast.Header>
              <Toast.Body className={'Dark' && 'text-white'}>Данные успешно изменены.</Toast.Body>
            </Toast>
            <ToastContainer position="top-end" className="p-3">
            <Toast onClose={() => setShowEmailChangeSuccess(false)} show={showEmailChangeSuccess} delay={20000} autohide bg='success'>
              <Toast.Header>
                <strong className='me-auto'>Успешно!</strong>
              </Toast.Header>
              <Toast.Body>Вам пришло сообщение на почту, перейдите по ссылке в письме чтобы её изменить.</Toast.Body>
            </Toast>
          </ToastContainer>
          </div>
        </>
      }
    </Box>
  );
};

export default ChangeData;