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

const Home = ({ currentUser }) => {  // defaultValue={}
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
            <FormControl id="userName" isRequired>
              <FormLabel>Username</FormLabel>
              <Input placeholder="Username" _placeholder={{ color: 'gray.500' }} type="text"/>
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input placeholder="email@example.com" _placeholder={{ color: 'gray.500' }} type="email"/>
            </FormControl>
            <Stack spacing={6} direction={['column', 'row']}>
              <Button bg={'blue.400'} color={'white'} w="full" _hover={{ bg: 'blue.500' }}>
                Изменить
              </Button>
            </Stack>
          </Stack>
        </Flex>
      }
    </Box>
  );
};

export default Home;