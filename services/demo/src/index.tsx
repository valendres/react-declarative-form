import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import { CssBaseline } from '@material-ui/core';
import 'typeface-roboto';

import {
    // LoginForm,
    InitialValuesForm,
} from './forms';

const App = () => (
    <React.Fragment>
        {/* <LoginForm /> */}
        <InitialValuesForm />
    </React.Fragment>
);

const HotApp = hot(module)(App);
const rootEl = document.getElementById('root');
ReactDOM.render(
    <React.Fragment>
        <CssBaseline />
        <HotApp />
    </React.Fragment>,
    rootEl,
);
