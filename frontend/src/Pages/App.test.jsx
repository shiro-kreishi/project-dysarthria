import axios from 'axios';
jest.mock('axios');
import React from "react";
import {getByRole, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import App from "../App";

describe('App testing', () => {
    it('matches snapshot', () => {
        const { asFragment } = render(<App />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('Navbar renders', () => {
        render(<App />)
        
        const homeLink = screen.getByRole('link', {name: 'Главная'});
        const testsLink = screen.getByRole('link', {name: 'Тесты'});
        const libraryLink = screen.getByRole('link', {name: 'Библиотека'});
        const myTestsLink = screen.getByRole('link', {name: 'Мои тесты'});
        const profileLink = screen.getByRole('link', {name: 'Профиль'});
        

        expect(homeLink).toBeInTheDocument();
        expect(testsLink).toBeInTheDocument();
        expect(libraryLink).toBeInTheDocument();
        expect(myTestsLink).toBeInTheDocument();
        expect(profileLink).toBeInTheDocument();
    })

    

});