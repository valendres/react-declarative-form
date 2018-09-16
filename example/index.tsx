import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
    // LoginForm,
    InitialValuesForm,
} from './forms';
import 'typeface-roboto';

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
