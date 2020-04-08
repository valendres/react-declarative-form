module.exports = function (wallaby) {
    const path = require('path');
    process.env.NODE_PATH +=
        path.delimiter +
        path.join(wallaby.localProjectDir, '../../node_modules');

    return {
        files: [
            {
                pattern: 'src/**/*spec.ts?(x)',
                instrument: false,
                ignore: true,
            },
            {
                pattern: 'src/**/*test.ts?(x)',
                instrument: false,
                ignore: true,
            },
            {
                pattern: 'test/**/*',
                instrument: false,
            },
            {
                pattern: 'tsconfig.json',
                instrument: true,
            },
            {
                pattern: 'src/**/*.ts*',
                instrument: true,
            },
        ],

        tests: ['src/**/*test.ts*'],

        testFramework: 'jest',

        env: {
            type: 'node',
            runner: 'node',
        },

        compilers: {
            '**/*.ts?(x)': wallaby.compilers.typeScript({
                module: 'CommonJS',
                jsx: 'React',
                target: 'es5',
            }),
            '**/*.js': wallaby.compilers.babel(),
        },

        debug: true,
    };
};
