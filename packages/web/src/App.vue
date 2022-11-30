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
        <a-col :xs="24" v-if="visibleCity">
          <district-card :city="visibleCity" :reports="reports" :streets="streets" />
        </a-col>
      </a-row>
      <footer :class="$style.footer">
        <a-typography-text type="secondary">
          <p>
            本页面数据由程序自动整理，不作参考依据。原始数据详见<a href="https://weibo.com/gdjkjy" target="_blank" noreferrer>@健康广东</a>及相应来源标注。
          </p>
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
import { computed, onMounted, ref, watch } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import http from 'ky';
import { uniq } from 'lodash';

import type { IStats } from '@cdata/common/types/stats';
import type { IReport } from '@cdata/common/types/report';
import type { ILocation } from '@cdata/common/types/location';

import StatsCard from '@/cards/StatsCard.vue';
import TimelineCard from '@/cards/TimelineCard.vue';
import DistrictCard from './cards/DistrictCard.vue';

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

watch(cities, (cities) => {
  const url = new URL(window.location.href);
  const city = url.searchParams.get('c');
  if (city && cities.includes(city) && visibleCity.value != city) {
    visibleCity.value = city;
  }
});

watch(visibleCity, (city) => {
  const url = new URL(window.location.href);
  if (city) {
    url.searchParams.set('c', city);
  } else {
    url.searchParams.delete('c');
  }
  history.replaceState(null, '', url);
});

const streets = ref<Record<string, ILocation> | null>(null);
const reports = ref<IReport[] | null>(null);

watch(visibleCity, async (city) => {
  streets.value = null;
  reports.value = null;
  if (city) {
    try {
      streets.value = await http.get(`./data/streets/${city}.json`).json();
      reports.value = await loadDataset(`reports/${city}`);
    } catch (e) {
      streets.value = {};
      reports.value = [];
    }
  }
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
