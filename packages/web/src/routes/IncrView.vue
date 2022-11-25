<template>
  <div ref="chart" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Line } from '@antv/g2plot';
import type { IStats } from '@datagd/common/types/stats';

import loadDataset from '@/utils/loadDataset';

const dataset = ref<IStats[]>([]);
onMounted(async () => {
  dataset.value = await loadDataset('stats');
});

function sum(section: Record<string, number>): number {
  return Object.values(section).reduce((n, sum) => n + sum, 0);
}

const increasement = computed(() => dataset.value.map((data) => ({
  time: data.time,
  value: sum(data.data['新增本土确诊病例']) + sum(data.data['新增本土无症状感染者']),
})));

const chart = ref<HTMLElement>();
let linePlot: Line;
onMounted(() => {
  if (!chart.value) return;
  linePlot = new Line(chart.value, {
    height: 500,
    data: increasement.value,
    xField: 'time',
    yField: 'value',
    label: {},
    point: {},
    meta: {
      value: {
        alias: '新增',
      },
    },
  });
  linePlot.render();
});
watch(increasement, () => {
  linePlot.update({
    data: increasement.value,
  })
});
</script>
