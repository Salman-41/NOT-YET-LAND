import type { MetaArgs } from 'react-router';
import { VOLCANOES } from '../data/volcanoes';
export { default } from '../pages/Expedition';
export const meta = ({ params }: MetaArgs) => {
  const record = VOLCANOES.find(v => v.slug === params.slug);
  return [{ title: record ? `${record.name} / ${record.subtitle} — NOT YET LAND` : 'Field record not found — NOT YET LAND' }, { name: 'description', content: record?.lead ?? 'Explore six volcanic field records.' }];
};
