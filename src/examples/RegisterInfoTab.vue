<template>
  <div class="bblocks-register-info-tab-plugin">
    <h3>{{ register?.name ?? 'Unknown register' }}</h3>
    <p v-if="register?.url">
      <a :href="String(register.url)" target="_blank" rel="noopener">{{ register.url }}</a>
    </p>
    <p v-if="importsCount > 0">
      Imports {{ importsCount }} other register{{ importsCount === 1 ? '' : 's' }}.
    </p>
    <button type="button" @click="showRaw = !showRaw">
      {{ showRaw ? 'Hide' : 'Show' }} raw register JSON
    </button>
    <pre v-if="showRaw">{{ JSON.stringify(register, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';

// Reactive state (showRaw) is the whole point of using Vue here rather than plain DOM, unlike
// dependents-tab-plugin.js's vanilla counterpart — see README.md "Tab plugins" for when either
// approach makes sense.
const props = defineProps({
  register: { type: Object as PropType<Record<string, unknown> | null>, default: null },
});

const showRaw = ref(false);
const importsCount = computed(() => {
  const imports = props.register?.imports;
  return Array.isArray(imports) ? imports.length : 0;
});
</script>
