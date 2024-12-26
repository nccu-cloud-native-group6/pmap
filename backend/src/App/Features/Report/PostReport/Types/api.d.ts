import type { paths } from '../../../../../Types/api.d.ts';
import type { Report } from '../../../../../Database/entity/report.js';

declare namespace PostReport {
  type TAddReportReqBody =
    paths['/reports']['post']['requestBody']['content']['application/json'];

  interface INewReport
    extends Pick<Report, 'comment' | 'rainDegree' | 'userId' | 'locationId'> {
    photoUrl: string | null;
  }
  interface IAddReportResponse {
    data: paths['/reports']['post']['responses']['201']['content']['application/json'];
  }
}
