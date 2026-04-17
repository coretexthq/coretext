import { JSDOM } from 'jsdom';
const dom = new JSDOM('', { url: 'http://localhost/' });
const window = dom.window;

// Test the plan's exact code snippet
delete window.location;
window.location = new URL('http://localhost/');

try {
  window.history.pushState({}, '', 'http://localhost/?q=studio');
  console.log("Success pushState");
} catch(e) {
  console.log("Error pushState:", e.message);
}

// See if it updated window.location.search
console.log("window.location.search:", window.location.search);
