module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.js',
    '!server.js', // 排除主服务器文件
    '!jest.config.js',
    '!setupTests.js',
  ],
};