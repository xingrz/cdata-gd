import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
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

  function render() {
    if (!el.value || plot.value) return;
    plot.value = creator(el.value, data.value);
    if (plot.value instanceof G2Plot) {
      plot.value.render();
    }
  }

  onMounted(render);
  watch(el, render);

  onBeforeUnmount(() => {
    plot.value?.destroy();
  });

  watch(data, (data) => {
    plot.value?.changeData(data);
  });

  return { el, plot };
}
