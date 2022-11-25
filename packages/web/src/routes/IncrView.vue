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

const increasement = computed(() =>
  dataset.value
    .map((data) => [
      {
        type: '新增本土确诊',
        time: data.time,
        value: sum(data.data['新增本土确诊病例']),
      },
      {
        type: '新增本土无症状',
        time: data.time,
        value: sum(data.data['新增本土无症状感染者']),
      },
    ])
    .flat()
);

const chart = ref<HTMLElement>();
let area: Area;
onMounted(() => {
  if (!chart.value) return;
  area = new Area(chart.value, {
    height: 500,
    data: increasement.value,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    tooltip: {
      customItems: (originalItems) => {
        let count = 0;
        originalItems.forEach((item) => (count += Number(item.value)));
        originalItems.push({
          name: '总计',
          value: count,
          data: {},
          mappingData: {},
          color: '',
          marker: '',
        });
        return originalItems;
      },
    },
  });
  area.render();
});
watch(increasement, () => {
  area.update({
    data: increasement.value,
  });
});
</script>
