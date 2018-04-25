import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import { App } from './components';

const HotApp = hot(module)(App);
const rootEl = document.getElementById('root');
ReactDOM.render(<HotApp />, rootEl);
