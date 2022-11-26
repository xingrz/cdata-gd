<template>
  <a-card>
    <div ref="plotElement" :style="{ height: '500px' }" />
    <a-row type="flex" justify="end" :gutter="[8, 8]" :style="{ marginTop: '32px' }">
      <a-col flex="0 1 auto">
        <a-radio-group v-model:value="showTotal">
          <a-radio-button :value="true">合计</a-radio-button>
          <a-radio-button :value="false">分项</a-radio-button>
        </a-radio-group>
      </a-col>
      <a-col flex="0 1 auto">
        <a-select v-model:value="visibleTypes" :options="selectableTypes" mode="multiple" :max-tag-count="1"
          :style="{ width: '15em' }" />
      </a-col>
      <a-col flex="0 1 auto">
        <a-range-picker v-model:value="range" :disabled-date="disabledDate">
          <template #renderExtraFooter>
            <a-space>
              <a-button size="small" @click="() => range = undefined">显示所有</a-button>
              <a-input-group compact>
                <a-button size="small" @click="() => selectRecent(60)">近 60 天</a-button>
                <a-button size="small" @click="() => selectRecent(30)">近 30 天</a-button>
                <a-button size="small" @click="() => selectRecent(7)">近 7 天</a-button>
              </a-input-group>
            </a-space>
          </template>
        </a-range-picker>
      </a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { Line, type LineOptions } from '@antv/g2plot';
import { first, last } from 'lodash';
import type { Dayjs } from 'dayjs';
import type { IIncreaseType, IStats } from '@cdata/common/types/stats';

import toDay from '@/utils/toDay';
import sumOf from '@/utils/sumOf';

import usePlot from '@/composables/usePlot';

const props = defineProps<{
  stats: IStats[] | null;
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

const showTotal = ref(true);

const selectableTypes: SelectProps['options'] & { value: IIncreaseType }[] = [
  { value: '新增本土确诊病例', label: '本土确诊' },
  { value: '新增本土无症状感染者', label: '本土无症状' },
  { value: '新增境外输入确诊病例', label: '境外输入确诊' },
  { value: '新增境外输入无症状感染者', label: '境外输入无症状' },
];

const defaultVisibleTypes: IIncreaseType[] = [
  '新增本土确诊病例',
  '新增本土无症状感染者',
];

const visibleTypes = ref<IIncreaseType[]>(defaultVisibleTypes);

watch(visibleTypes, () => {
  if (visibleTypes.value.length == 0) {
    visibleTypes.value = defaultVisibleTypes;
  }
});

interface IItem {
  time: string;
  value: number;
  type: string;
  ref?: string;
  items?: IItem[];
}

const items = computed(() => (props.stats || [])
  .filter((data) => {
    if (!range.value) return true;
    const [start, end] = range.value;
    const current = toDay(data.time);
    return current >= start && current <= end;
  })
  .flatMap((data): IItem | IItem[] => {
    const items = visibleTypes.value.map((type) => {
      const sum = sumOf(data.data[type]);
      return { time: data.time, value: sum, type: type, ref: data.ref };
    });
    if (showTotal.value) {
      const total = items.reduce((total, item) => total + item.value, 0);
      return { time: data.time, value: total, type: '总新增', ref: data.ref, items };
    } else {
      return items;
    }
  }));

const { plotElement, plot } = usePlot<Line, LineOptions>((el) => new Line(el, {
  height: 500,
  data: items.value,
  xField: 'time',
  yField: 'value',
  seriesField: 'type',
  label: {},
  point: {},
  tooltip: {
    enterable: true,
    customItems(originalItems) {
      const data = originalItems[0].data as IItem;
      if (showTotal.value) {
        for (const item of (data.items || [])) {
          originalItems.push({
            name: item.type,
            value: item.value,
            data: {},
            mappingData: {},
            color: '',
            marker: '',
          });
        }
      } else if (originalItems.length > 1) {
        originalItems.push({
          name: '总新增',
          value: originalItems.reduce((total, item) => total + Number(item.value), 0),
          data: {},
          mappingData: {},
          color: '',
          marker: '',
        });
      }
      if (data.ref) {
        originalItems.push({
          name: '数据来源',
          value: `<a href="${data.ref}" target="_blank" noreferrer>@健康广东</a>`,
          data: {},
          mappingData: {},
          color: '',
          marker: '',
        });
      }
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
