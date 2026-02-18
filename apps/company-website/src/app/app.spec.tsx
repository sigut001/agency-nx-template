import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a header and a footer', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    
    // Check for semantic tags
    expect(baseElement.querySelector('header')).toBeTruthy();
    expect(baseElement.querySelector('footer')).toBeTruthy();
  });

  it('should have all required legal links in the footer', () => {
    const { getAllByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    
    // We expect these links to be present in the footer
    expect(getAllByText(/Impressum/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Datenschutz/i).length).toBeGreaterThan(0);
    expect(getAllByText(/AGB/i).length).toBeGreaterThan(0);
  });
});
