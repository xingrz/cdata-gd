<template>
  <a-card>
    <div ref="plotElement" :style="{ height: '500px' }" />
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
  </a-card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Area, type AreaOptions } from '@antv/g2plot';
import { first, last } from 'lodash';
import type { Dayjs } from 'dayjs';
import type { IStats } from '@cdata/common/types/stats';

import toDay from '@/utils/toDay';
import sumOf from '@/utils/sumOf';

import usePlot from '@/composables/usePlot';

const props = defineProps<{
  stats: IStats[] | undefined;
}>();

const range = ref<[Dayjs, Dayjs]>();

function disabledDate(current: Dayjs): boolean {
  if (!props.stats?.length) return true;
  const start = toDay(first(props.stats)!.time);
  const end = toDay(last(props.stats)!.time);
  return current < start || current > end;
}

function selectRecent(days: number): void {
  const end = toDay(last(props.stats)!.time);
  const start = end.subtract(days, 'days');
  range.value = [start, end];
}

watch(props, () => {
  if (!range.value && props.stats) {
    selectRecent(30);
  }
});

const items = computed(() => (props.stats || [])
  .filter((data) => {
    if (!range.value) return true;
    const [start, end] = range.value;
    const current = toDay(data.time);
    return current >= start && current <= end;
  })
  .flatMap((data) => {
    const r1 = sumOf(data.data['新增本土确诊病例']);
    const r2 = sumOf(data.data['新增本土无症状感染者']);
    return [
      { time: data.time, value: r2, type: '新增本土无症状' },
      { time: data.time, value: r1, type: '新增本土确诊' },
    ];
  }));

const { plotElement, plot } = usePlot<Area, AreaOptions>((el) => new Area(el, {
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
}));

watch(items, () => {
  plot.value?.update({
    data: items.value,
  });
});
</script>
