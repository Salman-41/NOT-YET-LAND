import { afterEach, expect, it } from 'vitest';
import { useArchiveStore } from '../app/state/archive';

afterEach(() => useArchiveStore.getState().setRenderer('none'));

it('grants the renderer budget to one terrain viewport and transfers it to the map', () => {
  const state = useArchiveStore.getState();
  state.setTerrainScene('field-instrument');
  expect(useArchiveStore.getState()).toMatchObject({ renderer: 'terrain', activeSceneId: 'field-instrument' });
  state.setTerrainScene('next-field-instrument');
  expect(useArchiveStore.getState().activeSceneId).toBe('next-field-instrument');
  state.setRenderer('map');
  expect(useArchiveStore.getState()).toMatchObject({ renderer: 'map', activeSceneId: null });
  state.setRenderer('none');
  expect(useArchiveStore.getState().activeSceneId).toBeNull();
});
