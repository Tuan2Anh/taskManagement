module.exports = {
    testEnvironment: 'node',
    testTimeout: 10000,
    verbose: true,
    // Force exit after tests complete to avoid open handle issues
    forceExit: true,
    // Clear mocks between tests
    clearMocks: true,
};
