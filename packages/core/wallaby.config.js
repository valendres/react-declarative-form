module.exports = function(wallaby) {
    return {
        files: [
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

        compilers: {
            '**/*.ts?(x)': wallaby.compilers.typeScript({
                module: 'commonjs',
                jsx: 'React',
            }),
        },

        testFramework: 'jest',

        env: {
            type: 'node',
            runner: 'node',
        },

        hints: {
            ignoreCoverage: /istanbul ignore next/,
        },

        debug: true,
    };
};
