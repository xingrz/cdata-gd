<template>
  <a-card>
    <a-statistic v-if="props.stats" :title="props.title" :value="m1">
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
    <a-skeleton v-else active :title="false" :paragraph="{ rows: 2 }" />
  </a-card>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import type { IIncreaseType, IStats } from '@cdata/common/types/stats';

import sumOf from '@/utils/sumOf';

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
