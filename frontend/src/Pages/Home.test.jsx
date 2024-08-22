import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './Home';
import { Img, list } from '@chakra-ui/react';

describe('Home component', () => {
    it('matches snapshot', () => {
        const { asFragment } = render(<Home />);
        expect(asFragment()).toMatchSnapshot();
    });
    it('Welcome renders', () => {
        render(<Home />);
        expect(screen.getByText('Добро пожаловать в "НАЗВАНИЕ"')).toBeInTheDocument();
    });

    it('Image is displayed', () => {
        render(<Home />);
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toBeVisible();
    });

    it('Descripiton renders', () => {
        render(<Home />);
        expect(screen.getByText(/«НАЗВАНИЕ» — это инновационное веб-приложение/i)).toBeInTheDocument();
    });

    it('List renders', () => {
        render(<Home />);
        expect(screen.getByRole('list')).toBeInTheDocument();
    })
});