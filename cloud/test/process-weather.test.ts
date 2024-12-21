import { preciptation10MinToRainDegree } from '../lib/lambda-handler/process-weather';

test('test preciptation10MinToRainDegree max input', () => {
  const preciptation10Min = 6.7;

  const result = preciptation10MinToRainDegree(preciptation10Min);

  // Our max rain degree is 5.0
  expect(result).toBe(5);
});

test('test preciptation10MinToRainDegree half input', () => {
  const preciptation10Min = 6.7 / 2;

  const result = preciptation10MinToRainDegree(preciptation10Min);

  expect(result).toBe(2.5);
});

test('test preciptation10MinToRainDegree min input', () => {
  const preciptation10Min = 0;

  const result = preciptation10MinToRainDegree(preciptation10Min);

  expect(result).toBe(0);
});

test('test preciptation10MinToRainDegree negative input', () => {
  const preciptation10Min = -99;

  const result = preciptation10MinToRainDegree(preciptation10Min);

  expect(result).toBe(0);
});
