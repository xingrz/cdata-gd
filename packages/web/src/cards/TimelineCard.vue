<template>
  <a-card>
    <div ref="lineEl" :style="{ height: '500px' }" />
    <a-row type="flex" justify="end" :gutter="[8, 8]" :style="{ marginTop: '32px' }">
      <a-col flex="0 1 auto">
        <a-radio-group v-model:value="compareBy" button-style="solid">
          <a-radio-button :value="null">合计</a-radio-button>
          <a-radio-button value="city" v-if="props.city == null">按城市</a-radio-button>
          <a-radio-button value="type">按类型</a-radio-button>
        </a-radio-group>
      </a-col>
      <a-col flex="0 1 auto" v-if="props.city == null">
        <a-select v-model:value="visibleCities" :options="selectableCities" mode="multiple" placeholder="所有城市"
          :max-tag-count="2" allow-clear :style="{ width: '16em' }" />
      </a-col>
      <a-col flex="0 1 auto">
        <a-select v-model:value="visibleTypes" :options="selectableTypes" mode="multiple" :max-tag-count="2"
          :style="{ width: '24em' }" />
      </a-col>
      <a-col flex="0 1 auto">
        <a-range-picker v-model:value="range" :disabled-date="isUnavailable.bind(null, props.stats)">
          <template #renderExtraFooter>
            <a-space>
              <a-button size="small" @click="() => range = undefined">显示所有</a-button>
              <a-input-group compact>
                <a-button size="small" @click="() => range = recent(props.stats, 60)">近 60 天</a-button>
                <a-button size="small" @click="() => range = recent(props.stats, 30)">近 30 天</a-button>
                <a-button size="small" @click="() => range = recent(props.stats, 7)">近 7 天</a-button>
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
import { Line } from '@antv/g2plot';
import type { Dayjs } from 'dayjs';
import { groupBy, sumBy } from 'lodash';
import type { IIncreaseType, IStats } from '@cdata/common/types/stats';

import { isUnavailable, recent, withIn } from '@/utils/day';

import usePlot from '@/composables/usePlot';

const props = defineProps<{
  stats: IStats[] | null;
  city: string | null;
  cities: string[];
}>();

const range = ref<[Dayjs, Dayjs]>();

watch(props, () => {
  if (!range.value && props.stats) {
    range.value = recent(props.stats, 30);
  }
});

const compareBy = ref<null | 'city' | 'type'>(null);
watch(props, () => compareBy.value = null);

const selectableCities = computed<SelectProps['options']>(() => props.cities
  .map((city) => ({ value: city, label: city })));

const visibleCities = ref<string[]>([]);

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

interface IFlattenItem {
  time: string;
  data: {
    type: IIncreaseType;
    city: string;
    value: number;
  }[];
  ref: string;
}

function filterType(type: IIncreaseType) {
  return visibleTypes.value.includes(type);
}

function filterCity(city: string) {
  if (props.city == null) {
    return visibleCities.value.length == 0 || visibleCities.value.includes(city);
  } else {
    return props.city == city;
  }
}

const flattenItems = computed<IFlattenItem[]>(() => (props.stats || [])
  .filter((data) => withIn(data, range.value))
  .map((stats) => {
    const data = (Object.keys(stats.data) as IIncreaseType[])
      .filter(filterType)
      .flatMap((type) => (Object.keys(stats.data[type]))
        .filter(filterCity)
        .flatMap((city) => ({
          type: type,
          city: city,
          value: stats.data[type][city],
        })));

    return {
      time: stats.time,
      data: data,
      ref: stats.ref!,
    }
  }));

interface IItem {
  time: string;
  name: string;
  value: number;
  ref: string;
  items?: IItem[];
}

const items = computed<IItem[]>(() => flattenItems.value
  .flatMap((item): IItem[] | IItem => {
    if (compareBy.value == 'city') {
      const cities = (visibleCities.value.length ? visibleCities.value : props.cities);
      const grouped = groupBy(item.data, 'city');
      return cities.flatMap((city) => ({
        time: item.time,
        name: city,
        value: grouped[city] ? sumBy(grouped[city], 'value') : 0,
        ref: item.ref,
      }));
    }

    const items = Object.entries(groupBy(item.data, 'type')).flatMap(([type, data]) => ({
      time: item.time,
      name: type,
      value: sumBy(data, 'value'),
      ref: item.ref,
    }));

    if (compareBy.value == 'type') {
      return items;
    } else {
      return {
        time: item.time,
        name: '总新增',
        value: sumBy(item.data, 'value'),
        ref: item.ref,
        items: items,
      };
    }
  }));

const { el: lineEl } = usePlot(items, (el, data) => new Line(el, {
  autoFit: true,
  data: data,
  xField: 'time',
  yField: 'value',
  seriesField: 'name',
  label: {},
  point: {},
  tooltip: {
    enterable: true,
    customItems(originalItems) {
      const data = originalItems[0].data as IItem;
      if (compareBy.value == null) {
        for (const item of (data.items || [])) {
          originalItems.push({
            name: item.name,
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
</script>
