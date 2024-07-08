import { Box, Heading } from "@chakra-ui/react";

const Home = ({ currentUser }) => {
  return (
    <Box textAlign="center" mt="10">
      {currentUser ? <Heading>Вы уже зашли в профиль</Heading> : <Heading>Пожалуйста зайдите или зарегистрируйтесь</Heading>}
    </Box>
  );
};

export default Home;