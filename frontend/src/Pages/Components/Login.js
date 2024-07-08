import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";

const Login = ({ client, setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post("/api/user/login/", { email, password })
      .then(() => {
        setCurrentUser(true);
        navigate('/');
      });
    }
    catch (error) {
      console.error('Error login user: ', error);
      throw(error);
    }

  };

  return (
    <Box mt="10" textAlign="center">
      <form onSubmit={handleSubmit}>
        <FormControl id="formBasicEmail" mb="4">
          <FormLabel>Email address</FormLabel>
          <Input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="formBasicPassword" mb="4">
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </FormControl>
        <Button type="submit" colorScheme="teal">Войти</Button>
      </form>
    </Box>
  );
};

export default Login;