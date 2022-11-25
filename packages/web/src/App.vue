<template>
  <a-config-provider :locale="zh_CN">
    <incr-view />
  </a-config-provider>
</template>

<script lang="ts" setup>
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import IncrView from '@/routes/IncrView.vue';
</script>
