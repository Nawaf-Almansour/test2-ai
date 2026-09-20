// Polyfills for Jest testing environment

// TextEncoder/TextDecoder
import { TextDecoder, TextEncoder } from 'util';
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// fetch API
import 'whatwg-fetch';

// AbortController
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';