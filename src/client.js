import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import configureStore from './redux/configureStore';
import App from './containers/App';

import './styles.scss';


// Read the state sent with markup
const state = window.__STATE__;

// delete the state from global window object
delete window.__STATE__;

const store = configureStore(state)

hydrate(
  <BrowserRouter>
    <Provider store={store} >
      <App />
    </Provider>
  </BrowserRouter>,
  document.querySelector('#app')
);
