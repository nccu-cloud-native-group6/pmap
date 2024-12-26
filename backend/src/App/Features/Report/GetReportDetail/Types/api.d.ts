import type { paths } from '../../../../../Types/api.d.ts';

declare namespace GetReportDetail {
  interface IGetReportDetailResponse {
    data: paths['/report/{reportId}']['get']['responses']['200']['content']['application/json'];
  }
}
