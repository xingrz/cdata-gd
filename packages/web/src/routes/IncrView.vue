<template>
  <div ref="chart" />
  <a-space>
    <a-range-picker v-model:value="range" :disabled-date="disabledDate">
      <template #renderExtraFooter>
        <a-space>
          <a-button size="small" @click="() => range = undefined">显示所有</a-button>
          <a-button size="small" @click="() => selectRecent(60)">近 60 天</a-button>
          <a-button size="small" @click="() => selectRecent(30)">近 30 天</a-button>
          <a-button size="small" @click="() => selectRecent(7)">近 7 天</a-button>
        </a-space>
      </template>
    </a-range-picker>
  </a-space>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Area } from '@antv/g2plot';
import { first, last } from 'lodash';
import type { Dayjs } from 'dayjs';
import type { IStats } from '@cdata/common/types/stats';

import loadDataset from '@/utils/loadDataset';
import toDay from '@/utils/toDay';

const dataset = ref<IStats[]>([]);
onMounted(async () => {
  dataset.value = await loadDataset('stats');
  selectRecent(30);
});

const range = ref<[Dayjs, Dayjs]>();
function disabledDate(current: Dayjs): boolean {
  if (dataset.value.length == 0) return true;
  const start = toDay(first(dataset.value)!.time);
  const end = toDay(last(dataset.value)!.time);
  return current < start || current > end;
}
function selectRecent(days: number): void {
  const end = toDay(last(dataset.value)!.time);
  const start = end.subtract(days, 'days');
  range.value = [start, end];
}

function sum(section: Record<string, number>): number {
  return Object.values(section).reduce((n, sum) => n + sum, 0);
}

const items = computed(() => dataset.value
  .filter((data) => {
    if (!range.value) return true;
    const [start, end] = range.value;
    const current = toDay(data.time);
    return current >= start && current <= end;
  })
  .flatMap((data) => {
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
