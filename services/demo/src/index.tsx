import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { hot } from 'react-hot-loader';
// import { CssBaseline } from '@material-ui/core';
import 'typeface-roboto';

import { App } from './view';

const HotApp = hot(module)(App);
const rootEl = document.getElementById('root');
ReactDOM.render(
    <Router>
        <QueryParamProvider ReactRouterRoute={Route}>
            {/* <CssBaseline /> */}
            <HotApp />
        </QueryParamProvider>
    </Router>,
    rootEl,
);
