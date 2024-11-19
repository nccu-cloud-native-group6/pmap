import { handler } from './compute-weather.function'; // Replace with the actual path of your handler file

const e = {};
const context = {};
handler(e, context)
  .then((result) => {
    console.log('Result:', result);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
