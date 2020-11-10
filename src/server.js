import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from "react-router-dom";

import { Provider } from 'react-redux'
import configureStore from './redux/configureStore'
import App from './containers/App'


module.exports = function render(initialState, req, context) {
  // Configure the store with the initial state provided
  const store = configureStore(initialState)

  let content = renderToString(
    <StaticRouter location={req.url} context={context}>
      <Provider store={store} >
        <App />
      </Provider>
    </StaticRouter>
  );

  // Get a copy of store data to create the same store on client side 
  const preloadedState = store.getState();

  return { content, preloadedState };
}
