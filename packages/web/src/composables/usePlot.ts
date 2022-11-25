import { onMounted, ref, type Ref } from 'vue';
import type { Plot } from '@antv/g2plot';
import type { PickOptions } from '@antv/g2plot/lib/core/plot';

export default function usePlot<P extends Plot<O>, O extends PickOptions>
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

  return { plotElement, plot };
}
