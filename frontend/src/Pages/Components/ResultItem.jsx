import React, { useState, useEffect } from "react";
import './style.css';
import { fetchTestById } from "./api";
import { useNavigate } from "react-router-dom";

const Result = ({ test, user = 'No name', json_result, link }) => {
    const [testName, setTestName] = useState('Загрузка...');
    const results = JSON.parse(json_result);
    const navigate = useNavigate();

    const handleClick = async () => {
        navigate(link);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const testData = await fetchTestById(test);
                setTestName(testData.name);
            } catch (error) {
                console.error('Ошибка при загрузке данных теста:', error);
                setTestName('Ошибка загрузки');
            }
        };

        fetchData();
    }, [test]);

    const totalAnswers = results.length;
    const correctAnswers = results.filter(result => JSON.stringify(result.user_answer) === JSON.stringify(result.correct_answer)).length;
    const percentageCorrect = totalAnswers > 0 ? ((correctAnswers / totalAnswers) * 100).toFixed(2) : 0;

    return (
        <div className="result-item" onClick={handleClick}>
            <div className="result-header">
                <div className="result-header-content">
                    <p><h1 className="white-text">{testName} {user}</h1></p>
                    <p className="white-text">Правильных ответов: {correctAnswers} из {totalAnswers}</p>
                </div>
                <div className="result-header-percentage white-text">
                    <h1>{percentageCorrect}%</h1>
                </div>
            </div>
            <div className="result-body">
                {results.map((result, index) => (
                    <div
                        key={index}
                        className={`result-square ${JSON.stringify(result.user_answer) === JSON.stringify(result.correct_answer) ? 'green' : 'red'}`}
                    ></div>
                ))}
            </div>
        </div>
    )
}

export default Result;