import {
  TechRadarApi,
  TechRadarLoaderResponse,
} from '@backstage/plugin-tech-radar';

export class LocalTechApiDataClient implements TechRadarApi {
  async load(_: string | undefined): Promise<TechRadarLoaderResponse> {
    return await fetch('/tech-radar.json').then(res => {
      return res.json();
    });
  };
}
