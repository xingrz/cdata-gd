<template>
  <a-config-provider :locale="zh_CN">
    <div :class="$style.container">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日新增本土确诊" type="新增本土确诊病例" />
        </a-col>
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日本土无症状" type="新增本土无症状感染者" />
        </a-col>
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日新增境外输入确诊" type="新增境外输入确诊病例" />
        </a-col>
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日新增增境外输入无症状" type="新增境外输入无症状感染者" />
        </a-col>
        <a-col :xs="24">
          <plot-card :stats="stats" />
        </a-col>
      </a-row>
    </div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';

import type { IStats } from '@cdata/common/types/stats';

import StatsCard from '@/cards/StatsCard.vue';
import PlotCard from '@/cards/PlotCard.vue';

import loadDataset from '@/utils/loadDataset';

const stats = ref<IStats[]>();
onMounted(async () => {
  stats.value = await loadDataset('stats');
});
</script>

<style lang="scss" module>
:global(body) {
  padding: 32px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
