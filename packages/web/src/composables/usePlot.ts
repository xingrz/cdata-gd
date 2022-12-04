import { onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { Plot as G2Plot } from '@antv/g2plot';

type PlotCreator<P, T> = (el: HTMLDivElement, data: T[]) => P;

interface PlotRefs<P> {
  el: Ref<HTMLDivElement | undefined>;
  plot: Ref<P | undefined>;
}

interface IPlot<T> {
  render(): void;
  destroy(): void;
  changeData(data: T[]): void;
}

export default function usePlot<P extends IPlot<T>, T>(data: Ref<T[]>, creator: PlotCreator<P, T>): PlotRefs<P> {
  const el = ref<HTMLDivElement>();
  const plot = ref<P>();

  watch(el, (el, _oldEl, onCleanup) => {
    if (!el) return;
    plot.value = creator(el, data.value);
    if (plot.value instanceof G2Plot) {
      plot.value.render();
    }
    onCleanup(() => {
      plot.value?.destroy();
      plot.value = undefined;
    });
  });

  onBeforeUnmount(() => {
    plot.value?.destroy();
    plot.value = undefined;
  });

  watch(data, (data, oldData) => {
    if (plot.value instanceof G2Plot && data.length != oldData.length) {
      plot.value?.update({ data });
    } else {
      plot.value?.changeData(data);
    }
  });

  return { el, plot };
}
