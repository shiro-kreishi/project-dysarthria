import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Container, Row, Col, Button } from 'react-bootstrap';
import { useRevalidator } from 'react-router-dom';


const AssignDoctorGroup = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLooading] = useState(true);
    const [error, setError] = useState(null);


    //Получаем список всех пользователей
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/v0/users/');
                setUsers(response.data);
                setLooading(false);

            } catch(error){
                console.log('Ошибка при загрузке пользователей', error);
                setError(error);
                setLooading(false);
            }
        }
        fetchUsers();
    }, []);

    //Функция для доавбления пользователя в группу докторов
    const assignDoctorGroup = async (userId) => {
        const csrftoken = getCookie('csrftoken');
    
        try {
          await axios.post('http://127.0.0.1:8000/api/user/assign-doctor-group/', { user_id: userId }, {
            headers: {
              'X-CSRFToken': csrftoken,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });
          alert('Пользователь успешно добавлен в группу врачей');
        } catch (error) {
          console.error('Ошибка при добавлении пользователя в группу врачей', error);
          alert('Не удалось добавить пользователя в группу врачей');
        }
      };

      function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Проверяем, начинается ли cookie с искомого имени
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      }


      if (loading) return <p>Загрузка пользователей...</p>;
      if (error) return <p>Ошибка при загрузке пользователей</p>;
    
      return (
        <Container>
          <Row>
            <Col>
              <h1>Добавить пользователей в группу врачей</h1>
              <ul>
                {users.map(user => (
                  <li key={user.id}>
                    {user.username} ({user.email})
                    <Button onClick={() => assignDoctorGroup(user.id)} className="btn-blue">
                      Добавить в группу врачей
                    </Button>
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </Container>
      );
}

export default AssignDoctorGroup;