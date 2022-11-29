import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import type { Plot as G2Plot, Options as G2Options } from '@antv/g2plot';

import type { Plot as L7Plot } from '@antv/l7plot';
import type { PlotOptions as L7PlotOptions } from '@antv/l7plot/dist/lib/types/plot';

export default function usePlot<P extends G2Plot<G2Options> | L7Plot<L7PlotOptions>, T>
  (data: Ref<T[]>, creator: (el: HTMLDivElement, data: T[]) => P): {
    el: Ref<HTMLElement | undefined>;
    plot: Ref<P | undefined>;
  } {
  const el = ref<HTMLDivElement>();
  const plot = ref<P>();

  onMounted(() => {
    if (!el.value) return;
    plot.value = creator(el.value, data.value);
    plot.value.render();
  });

  onBeforeUnmount(() => {
    plot.value?.destroy();
  });

  watch(data, (data) => {
    plot.value?.changeData(data);
  });

  return { el, plot };
}
