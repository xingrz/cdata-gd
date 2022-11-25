<template>
  <div ref="chart" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Area } from '@antv/g2plot';
import type { IStats } from '@cdata/common/types/stats';

import loadDataset from '@/utils/loadDataset';

const dataset = ref<IStats[]>([]);
onMounted(async () => {
  dataset.value = await loadDataset('stats');
});

function sum(section: Record<string, number>): number {
  return Object.values(section).reduce((n, sum) => n + sum, 0);
}

const items = computed(() => dataset.value.flatMap((data) => {
  const r1 = sum(data.data['新增本土确诊病例']);
  const r2 = sum(data.data['新增本土无症状感染者']);
  return [
    { time: data.time, value: r2, type: '新增本土无症状' },
    { time: data.time, value: r1, type: '新增本土确诊' },
  ];
}));

const chart = ref<HTMLElement>();
let plot: Area;
onMounted(() => {
  if (!chart.value) return;
  plot = new Area(chart.value, {
    height: 500,
    data: items.value,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    label: {},
    point: {},
    tooltip: {
      customItems(originalItems) {
        originalItems.push({
          name: '总新增',
          value: originalItems.reduce((total, item) => total + Number(item.value), 0),
          data: {},
          mappingData: {},
          color: '',
          marker: '',
        });
        return originalItems;
      },
    },
  });
  plot.render();
});
watch(items, () => {
  plot.update({
    data: items.value,
  });
});
</script>
