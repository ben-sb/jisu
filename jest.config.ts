const { compilerOptions } = require('./tsconfig');
const { pathsToModuleNameMapper } = require('ts-jest');

export default {
    roots: ["<rootDir>/tests"],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/tokeniser/**/*",
        "src/parser/**/*"
    ],
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
    preset: "ts-jest"
};