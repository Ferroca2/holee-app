<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    value: {
        type: [String, Number],
        required: true,
    },
    trendValue: {
        type: String,
        default: '',
    },
    trendDirection: {
        type: String,
        default: 'positive',
        validator: (value: string) => ['positive', 'negative'].includes(value),
    },
    trendPrefix: {
        type: String,
        default: '',
    },
    trendSuffix: {
        type: String,
        default: 'em relação ao período anterior',
    },
});
</script>

<template>
    <q-card class="stat-card">
        <q-card-section class="q-pb-none">
            <div class="card-header">
                <div class="text-subtitle2 text-weight-bold text-grey-9">
                    {{ title }}
                </div>
                <q-icon
                    :name="icon"
                    size="24px"
                    class="card-icon text-accent"
                />
            </div>
            <div class="text-h5 text-weight-bold text-grey-9 q-mt-sm">
                {{ value }}
            </div>
            <div
                v-if="trendValue"
                :class="[trendDirection === 'positive' ? 'text-positive' : 'text-negative', 'text-caption q-mt-xs']"
            >
                {{ trendPrefix }}{{ trendValue }} {{ trendSuffix }}
            </div>
        </q-card-section>
    </q-card>
</template>

<style scoped lang="scss">
.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  height: 100%;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .q-card__section {
    padding: 16px;
  }

  .card-header {
    padding-right: 28px; // Make space for the icon
    position: relative;

    .card-icon {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
</style>
