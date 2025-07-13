<!--
# TabComponent

A flexible and reusable tab component that supports two different visual styles: 'bar' and 'stripe'.

## Usage

```vue
<template>
  <TabComponent
    v-model="activeTab"
    :tabs="tabItems"
    variant="bar"
    scrollable
    dense
  />
</template>

<script setup>
import { ref } from 'vue';
import TabComponent from 'components/ui/TabComponent.vue';

const activeTab = ref('tab1');
const tabItems = [
  { name: 'tab1', label: 'First Tab', icon: 'dashboard' },
  { name: 'tab2', label: 'Second Tab', icon: 'analytics' },
  { name: 'tab3', label: 'Third Tab', icon: 'settings' },
];
</script>
```

## Props

| Prop         | Type                 | Default | Description                                                       |
|--------------|----------------------|---------|-------------------------------------------------------------------|
| modelValue   | String               | -       | Current active tab (use with v-model)                             |
| tabs         | Array                | -       | Array of tab objects with name, label and optional icon properties|
| variant      | 'bar' \| 'stripe'    | -       | Visual style of tabs                                              |
| scrollable   | Boolean              | false   | Whether tabs should be scrollable horizontally                    |
| dense        | Boolean              | false   | Whether to use a more compact display                             |

## Variants

### Bar Variant
- Rounded tabs with background color
- Active tab has white background
- Inactive tabs have grey text
- No bottom indicator line
- Typically used for status filters or process steps

### Stripe Variant
- Clean tabs with icons and left alignment
- Active tab has accent color text with bottom border
- Inactive tabs have grey text
- Typically used for content sections or categories with icons

## Events

| Event                | Description                              |
|----------------------|------------------------------------------|
| update:modelValue    | Emitted when active tab changes          |

## Examples

### Bar Style (like in dispatches.vue)
```vue
<TabComponent
  v-model="activeTab"
  :tabs="[
    { name: 'all', label: 'All' },
    { name: 'active', label: 'Active' },
    { name: 'completed', label: 'Completed' }
  ]"
  variant="bar"
  scrollable
  dense
/>
```

### Stripe Style (like in reservations.vue)
```vue
<TabComponent
  v-model="activeTab"
  :tabs="[
    { name: 'overview', label: 'Overview', icon: 'o_dashboard' },
    { name: 'detailed', label: 'Detailed Analysis', icon: 'o_analytics' }
  ]"
  variant="stripe"
  dense
/>
```
-->

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    /**
   * Model value for the active tab
   */
    modelValue: string;

    /**
   * List of tabs to display
   * Each tab should have a name (used for value), a label (displayed text), and optionally an icon
   */
    tabs: Array<{ name: string; label: string; icon?: string }>;

    /**
   * Visual style of the tabs: 'bar' or 'stripe'
   * - bar: uses the style from dispatches.vue (more prominent, rounded corners)
   * - stripe: uses the style from reservations.vue (with icons, left aligned, bottom border)
   */
    variant: 'bar' | 'stripe';

    /**
   * Whether tabs should be scrollable (for many tabs)
   */
    scrollable?: boolean;

    /**
   * Whether to use dense mode for the tabs
   */
    dense?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    scrollable: false,
    dense: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const handleTabChange = (tab: string) => {
    emit('update:modelValue', tab);
};
</script>

<template>
    <div class="tab-component-wrapper">
        <!-- Stripe variant - custom layout like reservations.vue -->
        <div
            v-if="variant === 'stripe'"
            class="tabs-container q-mb-md"
        >
            <div class="tabs-list">
                <button
                    v-for="tab in tabs"
                    :key="tab.name"
                    class="tab-button"
                    :class="{ 'active': modelValue === tab.name }"
                    @click="handleTabChange(tab.name)"
                >
                    <q-icon
                        v-if="tab.icon"
                        :name="tab.icon"
                        size="20px"
                        class="q-mr-xs"
                    />
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <!-- Bar variant - using q-tabs -->
        <q-tabs
            v-else
            :model-value="modelValue"
            class="bg-grey-3 q-py-sm stepper-tabs"
            active-class="bg-white"
            inactive-class="text-grey-7"
            indicator-color="transparent"
            :no-caps="true"
            align="left"
            :dense="dense"
            :scrollable="scrollable"
            @update:model-value="handleTabChange"
        >
            <q-tab
                v-for="tab in tabs"
                :key="tab.name"
                :name="tab.name"
                :label="tab.label"
                :icon="tab.icon"
                class="tab-button"
            />
        </q-tabs>
    </div>
</template>

<style scoped lang="scss">
.tab-component-wrapper {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* Stripe variant styles - matching TabBar from reservations.vue */
.tabs-container {
  background-color: var(--app-bg-elevated);
  border-radius: 8px 8px 0 0;
  overflow: hidden; /* Prevent container overflow */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.tabs-list {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.tab-button {
  display: flex;
  align-items: center;
  padding: 1rem 0.5rem;
  margin-right: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--app-text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: color 0.2s ease;
  flex-shrink: 0; /* Prevent tabs from shrinking */
  min-width: fit-content; /* Ensure proper width */
  box-sizing: border-box;

  &:hover {
    color: rgba(75, 85, 99, 1);
  }

  &.active {
    color: var(--app-text-primary);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--app-text-primary);
    }
  }
}

/* Bar variant styles */
.stepper-tabs {
  background-color: var(--app-bg-elevated);
  border-radius: 8px;
}

.stepper-tabs .tab-button {
  border-radius: 8px;
  margin: 0 4px;
  min-height: 42px;
  font-weight: 600;
  padding: 0 16px;
}

/* Responsive styling */
@media (max-width: 599px) {
  .stepper-tabs .tab-button {
    min-width: auto;
    padding: 0 12px;
    font-size: 12px;
  }

  .tabs-list {
    padding: 0 0.5rem;
  }

  .tab-button {
    margin-right: 1rem;
    padding: 0.75rem 0.25rem;
  }
}
</style>
