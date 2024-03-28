import {
  TechRadarApi,
  TechRadarLoaderResponse,
} from '@backstage/plugin-tech-radar';

export class LocalTechApiDataClient implements TechRadarApi {
  async load(id: string | undefined): Promise<TechRadarLoaderResponse> {
    console.log('Loading /tech-radar.json');
    const data = await fetch('/tech-radar.json').then(res => {
        return res.json();
      });
    return {
      ...data,
      entries: data.entries.map(entry => ({
        ...entry,
        timeline: entry.timeline.map(timeline => ({
          ...timeline,
          date: new Date(timeline.date),
        })),
      })),
    };
  }
}
