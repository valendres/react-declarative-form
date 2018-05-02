import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import { App } from './components';
import CssBaseline from 'material-ui/CssBaseline';
import 'typeface-roboto';

const HotApp = hot(module)(App);
const rootEl = document.getElementById('root');
ReactDOM.render(
    <React.Fragment>
        <CssBaseline />
        <HotApp />
    </React.Fragment>,
    rootEl,
);
