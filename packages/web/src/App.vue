<template>
  <a-config-provider :locale="zh_CN">
    <div>
      <a-row :gutter="[16, 16]">
        <a-col :xs="24">
          <a-select v-model:value="visibleCity" :options="selectableCities" :style="{ width: '8em' }" />
        </a-col>
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日新增本土确诊" type="新增本土确诊病例" :city="visibleCity" />
        </a-col>
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日新增本土无症状" type="新增本土无症状感染者" :city="visibleCity" />
        </a-col>
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日新增境外输入确诊" type="新增境外输入确诊病例" :city="visibleCity" />
        </a-col>
        <a-col :xs="24" :md="12" :lg="6">
          <stats-card :stats="stats" title="昨日新增境外输入无症状" type="新增境外输入无症状感染者" :city="visibleCity" />
        </a-col>
        <a-col :xs="24">
          <timeline-card :stats="stats" :city="visibleCity" />
        </a-col>
        <a-col :xs="24">
          <dots-card :reports="reports" :streets="streets" />
        </a-col>
      </a-row>
      <footer :class="$style.footer">
        <a-typography-text type="secondary">
          <p>本页面数据由程序自动整理，不作参考依据。原始数据详见<a href="https://weibo.com/gdjkjy" target="_blank" noreferrer>@健康广东</a>或<a
              href="http://wjw.gz.gov.cn/ztzl/xxfyyqfk/yqtb/index.html" target="_blank" noreferrer>广州市卫健委</a>。</p>
          <p>
            <a href="https://github.com/xingrz/cdata-gd" target="_blank">源码</a>
            <a-divider type="vertical" />
            <a href="https://github.com/xingrz/cdata-gd/issues" target="_blank">问题反馈</a>
            <a-divider type="vertical" />
            <a href="https://github.com/xingrz/cdata-gd/blob/master/LICENSE" target="_blank">开源协议</a>
          </p>
        </a-typography-text>
      </footer>
    </div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import http from 'ky';
import { uniq } from 'lodash';

import type { IStats } from '@cdata/common/types/stats';
import type { IReport } from '@cdata/common/types/report';
import type { ILocation } from '@cdata/common/types/location';

import StatsCard from '@/cards/StatsCard.vue';
import TimelineCard from '@/cards/TimelineCard.vue';
import DotsCard from './cards/DotsCard.vue';

import loadDataset from '@/utils/loadDataset';

const stats = ref<IStats[] | null>(null);
onMounted(async () => {
  stats.value = await loadDataset('stats');
});

const cities = computed(() => uniq((stats.value || [])
  .flatMap((stat) => Object.values(stat.data))
  .flatMap((section) => Object.keys(section))));

const visibleCity = ref<string | null>(null);
const selectableCities = computed(() => [
  { label: '全省', value: null },
  ...cities.value.map((city) => ({
    label: city, value: city
  })),
]);

const streets = ref<Record<string, ILocation> | null>(null);
onMounted(async () => {
  streets.value = await http.get(`./data/streets.json`).json();
});

const reports = ref<IReport[] | null>(null);
onMounted(async () => {
  reports.value = await loadDataset('reports');
});
</script>

<style lang="scss" module>
:global(body) {
  padding: 16px;
}

:global(.ant-typography p) {
  & {
    margin-bottom: 0.5em;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
}

.footer {
  padding: 32px 0 16px;
  font-size: 90%;
}
</style>
