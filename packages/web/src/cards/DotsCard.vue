<template>
  <a-card>
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="18">
        <div ref="plotElement" :style="{ height: '85vh' }" />
      </a-col>
      <a-col :xs="24" :md="6">
        <a-range-picker v-model:value="range" :disabled-date="isUnavailable.bind(null, props.reports)"
          :style="{ width: '100%' }">
          <template #renderExtraFooter>
            <a-space>
              <a-button size="small" @click="() => range = recent(props.reports, 1)" type="primary">昨天</a-button>
              <a-input-group compact>
                <a-button size="small" @click="() => range = recent(props.reports, 60)">近 60 天</a-button>
                <a-button size="small" @click="() => range = recent(props.reports, 30)">近 30 天</a-button>
                <a-button size="small" @click="() => range = recent(props.reports, 7)">近 7 天</a-button>
              </a-input-group>
            </a-space>
          </template>
        </a-range-picker>
        <a-divider />
        <a-checkbox-group v-model:value="visibleTypes" :options="selectableTypes" :class="$style.selections" />
        <a-divider />
        <a-checkbox-group v-model:value="visibleSources" :options="selectableSources" :class="$style.selections" />
        <a-divider />
        <div :class="$style.notes">
          <p>标记仅示意新增数字所属街道，并不代表感染者准确位置。</p>
          <p>数据来源：<a href="http://wjw.gz.gov.cn/ztzl/xxfyyqfk/yqtb/index.html" target="_blank" noreferrer>广州市卫健委</a></p>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { Dot, type DotOptions } from '@antv/l7plot';
import type { Dayjs } from 'dayjs';
import { uniq } from 'lodash-es';
import type { IReport, IReportType } from '@cdata/common/types/report';
import type { ILocation } from '@cdata/common/types/location';

import { isUnavailable, recent, withIn } from '@/utils/day';

import { useL7Plot } from '@/composables/usePlot';

const props = defineProps<{
  reports: IReport[] | null;
  streets: Record<string, ILocation>;
}>();

const range = ref<[Dayjs, Dayjs]>();

watch(props, () => {
  if (!range.value && props.reports) {
    range.value = recent(props.reports, 1);
  }
});

const selectableTypes: SelectProps['options'] & { value: IReportType }[] = [
  { value: '本土确诊病例', label: '新增本土确诊' },
  { value: '本土无症状感染者', label: '新增本土无症状' },
];

const visibleTypes = ref<IReportType[]>([
  '本土确诊病例',
  '本土无症状感染者',
]);

const visibleData = computed(() => (props.reports || [])
  .filter((report) => withIn(report, range.value))
  .flatMap((report) => visibleTypes.value.flatMap((type) => report.data[type]))
  .filter((item) => props.streets[item.street]));

const sources = computed(() => uniq(visibleData.value.map((item) => item.source)));

const selectableSources = computed<SelectProps['options']>(() => sources.value
  .map((source) => ({ label: source, value: source })));

const visibleSources = ref<string[]>([]);
watch(sources, () => visibleSources.value = sources.value);

const items = computed(() => {
  const items: Record<string, number> = {};
  for (const item of visibleData.value) {
    if (!visibleSources.value.includes(item.source)) continue;
    if (typeof items[item.street] == 'undefined') items[item.street] = 0;
    items[item.street]++;
  }
  return Object.keys(items).map((name) => {
    const street = props.streets[name];
    return { ...street, name, count: items[name] };
  });
});

const { plotElement, plot } = useL7Plot<Dot, DotOptions>((el) => new Dot(el, {
  height: 500,
  autoFit: true,
  map: {
    type: 'amap',
  },
  source: {
    data: items.value,
    parser: { type: 'json', x: 'lng', y: 'lat' },
  },
  size: {
    field: 'count',
    value: ({ count }) => Math.min(150, 7 + count * 0.03),
  },
  color: {
    field: 'count',
    value: ['#e7b155', '#f36d34', '#d52b2b', '#800505', '#420101'],
    scale: { type: 'quantize' }
  },
  style: {
    opacity: 0.75,
  },
  tooltip: {
    items: [
      { field: 'name', alias: '地点' },
      { field: 'count', alias: '新增数' },
    ],
  },
  state: {
    active: true,
  },
  zoom: {
    position: 'bottomright',
  },
  legend: {
    position: 'bottomleft',
  },
}));

watch(items, () => {
  plot.value?.changeData(items.value);
});
</script>

<style lang="scss" module>
.selections {
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: scroll;
}

.notes {
  font-size: 90%;
  opacity: 0.5;
}
</style>
