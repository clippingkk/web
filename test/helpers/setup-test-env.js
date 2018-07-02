require('babel-register')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

const document = new JSDOM('<!DOCTYPE html><body></body>')
global.document = document
global.window = document.defaultView
global.navigator = document.window.navigator
