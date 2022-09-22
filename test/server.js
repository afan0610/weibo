/**
 * @description jest server
 * @author 阿凡
 */

const request = require('supertest');
const server = require('../src/app').callback();

module.exports = request(server);
