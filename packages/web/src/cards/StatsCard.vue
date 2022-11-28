<template>
  <a-card>
    <a-space v-if="props.stats" direction="vertical" :style="{ width: '100%' }">
      <a-statistic :title="props.title" :value="m1">
        <template #suffix>
          <span :class="$style.inc" v-if="diff > 0">
            <arrow-up-outlined />
            {{ `${Math.abs(diff * 100).toFixed(2)}%` }}
          </span>
          <span :class="$style.dec" v-else-if="diff < 0">
            <arrow-down-outlined />
            {{ `${Math.abs(diff * 100).toFixed(2)}%` }}
          </span>
        </template>
      </a-statistic>
      <div ref="plotElement" :style="{ height: '30px' }" />
    </a-space>
    <a-skeleton v-else active :title="false" :paragraph="{ rows: 3 }" />
  </a-card>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import { TinyArea, type TinyAreaOptions } from '@antv/g2plot';
import { takeRight } from 'lodash';
import type { IIncreaseType, IStats } from '@cdata/common/types/stats';

import sumOf from '@/utils/sumOf';

import { useG2TinyPlot } from '@/composables/usePlot';

const props = defineProps<{
  stats: IStats[] | null;
  title: string;
  city: string | null;
  type: IIncreaseType;
}>();

function getData(stats: IStats[] | null, minus: number, city: string | null, type: IIncreaseType): number | undefined {
  if (stats) {
    const section = stats[stats.length - minus].data[type];
    if (city) {
      return section[city] || 0;
    } else {
      return sumOf(section);
    }
  }
}

const m1 = computed(() => getData(props.stats, 1, props.city, props.type));
const m2 = computed(() => getData(props.stats, 2, props.city, props.type));

const diff = computed(() => {
  if (m1.value && m2.value) {
    return (m1.value - m2.value) / m1.value;
  } else {
    return 0;
  }
});

const items = computed(() => takeRight(props.stats || [], 30)
  .map((data) => props.city ? (data.data[props.type][props.city] || 0) : sumOf(data.data[props.type])));

const { plotElement } = useG2TinyPlot<TinyArea, TinyAreaOptions>(items, (el, data) => new TinyArea(el, {
  autoFit: true,
  data: data,
  smooth: true,
  areaStyle: {
    fill: '#d6e3fd',
  },
}));
</script>

<style lang="scss" module>
:global(.ant-statistic-content-suffix) {
  font-size: 75%;
}

.inc {
  color: #cf1322;
}

.dec {
  color: #3f8600;
}
</style>
