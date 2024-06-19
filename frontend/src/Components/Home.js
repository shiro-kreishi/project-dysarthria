// Home.js
import React from 'react';
import { Box, Heading } from "@chakra-ui/react";

const Home = ({ currentUser }) => {
  return (
    <Box textAlign="center" mt="10">
      {currentUser ? <Heading>You're logged in!</Heading> : <Heading>Please log in or register.</Heading>}
    </Box>
  );
};

export default Home;