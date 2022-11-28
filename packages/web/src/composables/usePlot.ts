import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import type { Plot as G2Plot } from '@antv/g2plot';
import type { PickOptions as G2PickOptions } from '@antv/g2plot/lib/core/plot';

import type { Plot as L7Plot } from '@antv/l7plot';
import type { PlotOptions as L7PlotOptions } from '@antv/l7plot/dist/lib/types/plot';

export function useG2Plot<P extends G2Plot<O>, O extends G2PickOptions>
  (creator: (element: HTMLElement) => P): {
    plotElement: Ref<HTMLElement | undefined>;
    plot: Ref<P | undefined>;
  } {
  const plotElement = ref<HTMLElement>();
  const plot = ref<P>();

  onMounted(() => {
    if (!plotElement.value) return;
    plot.value = creator(plotElement.value);
    plot.value.render();
  });

  onBeforeUnmount(() => {
    plot.value?.destroy();
  });

  return { plotElement, plot };
}

export function useG2TinyPlot<P extends G2Plot<O>, O extends G2PickOptions>
  (data: Ref<number[]>, creator: (element: HTMLElement, data: number[]) => P): {
    plotElement: Ref<HTMLElement | undefined>;
    plot: Ref<P | undefined>;
  } {
  const plotElement = ref<HTMLElement>();
  const plot = ref<P>();
  watch([plotElement, data], ([element, data], _oldValue, onCleanup) => {
    if (element) {
      plot.value = creator(element, data);
      plot.value.render();
      onCleanup(() => plot.value?.destroy());
    }
  });
  return { plotElement, plot };
}

export function useL7Plot<P extends L7Plot<O>, O extends L7PlotOptions>
  (creator: (element: HTMLDivElement) => P): {
    plotElement: Ref<HTMLElement | undefined>;
    plot: Ref<P | undefined>;
  } {
  const plotElement = ref<HTMLDivElement>();
  const plot = ref<P>();

  onMounted(() => {
    if (!plotElement.value) return;
    plot.value = creator(plotElement.value);
  });

  onBeforeUnmount(() => {
    plot.value?.destroy();
  });

  return { plotElement, plot };
}
