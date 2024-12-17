import express from 'express';
import { weatherController } from '../Controller/weatherController.js';
import wrapAsync from '../utils/wrapAsync.js';
const router = express.Router();

router.get('/', wrapAsync(weatherController.getWeather));

export default router;
