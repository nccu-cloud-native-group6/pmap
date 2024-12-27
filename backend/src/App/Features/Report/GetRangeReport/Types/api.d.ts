import type { paths } from '../../../../../Types/api.d.ts';

declare namespace GetRangeReport {
  type TGetRangeReportParams = paths['/reports']['get']['parameters']['query'];

  interface IGetRangeReportResponse {
    data: paths['/reports']['get']['responses']['200']['content']['application/json'];
  }
}
