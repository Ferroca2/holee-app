<script setup lang="ts">
import { computed } from 'vue';

// Define size type
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Define props
const props = defineProps({
    // Content props
    label: {
        type: String,
    },
    icon: {
        type: String,
    },
    iconRight: {
        type: String,
    },

    // Appearance props
    color: {
        type: String,
        default: 'accent',
    },
    dense: {
        type: Boolean,
        default: true,
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
    size: {
        type: String as () => ButtonSize,
        default: 'md',
        validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
    },

    // Style variant props
    flat: {
        type: Boolean,
        default: false,
    },
    outline: {
        type: Boolean,
        default: false,
    },
    unelevated: {
        type: Boolean,
        default: false,
    },
    rounded: {
        type: Boolean,
        default: false,
    },

    // State props
    loading: {
        type: Boolean,
        default: false,
    },
    disable: {
        type: Boolean,
        default: false,
    },

    // Tooltip
    tooltip: {
        type: String,
    },
});

const emit = defineEmits<{
    click: [event: Event];
}>();

const buttonClass = computed(() => {
    const classes = ['base-button'];

    return classes.join(' ');
});

const handleClick = (event: Event) => {
    if (!props.disable && !props.loading) {
        emit('click', event);
    }
};
</script>

<template>
    <q-btn
        :dense="dense"
        no-caps
        :outline="outline"
        :flat="flat"
        :unelevated="unelevated"
        :disable="disable"
        :color="color"
        :loading="loading"
        :icon="icon"
        :icon-right="iconRight"
        :label="label"
        :rounded="rounded"
        :class="buttonClass"
        :size="size"
        :style="fullWidth ? 'width: 100%' : undefined"
        @click="handleClick"
    >
        <!-- Loading slot -->
        <template
            v-if="loading"
            #loading
        >
            <q-spinner-ios
                color="white"
            />
        </template>

        <!-- Default slot for custom content -->
        <slot />

        <!-- Tooltip -->
        <q-tooltip v-if="tooltip">
            {{ tooltip }}
        </q-tooltip>
    </q-btn>
</template>

<style lang="scss" scoped>
.base-button {
    // Fixed styling as per requirements
    border-radius: 10px !important;
    height: 40px !important;
    min-height: 40px !important;
    font-size: 14px;
    letter-spacing: 0.3px;
    padding: 5px 15px;

    // Icon sizing
    :deep(.q-icon) {
        font-size: 16px;
        font-weight: 600;
    }

    // Size variations (adjust font and icon size only, height stays 40px)
    &.q-btn--size-xs {
        font-size: 12px;

        :deep(.q-icon) {
            font-size: 14px;
        }
    }

    &.q-btn--size-sm {
        font-size: 13px;

        :deep(.q-icon) {
            font-size: 15px;
        }
    }

    &.q-btn--size-lg {
        font-size: 16px;

        :deep(.q-icon) {
            font-size: 18px;
        }
    }

    &.q-btn--size-xl {
        font-size: 18px;

        :deep(.q-icon) {
            font-size: 20px;
        }
    }

    // Flat buttons
    &.q-btn--flat {
        color: var(--app-text-secondary);

        &:hover {
            background-color: var(--app-bg-elevated);
        }
    }

    // Outline buttons
    &.q-btn--outline {
        border-width: 1px;

        &:hover {
            background-color: var(--app-bg-elevated);
        }
    }

    // Loading state
    &.q-btn--loading {
        pointer-events: none;
    }

    // Disabled state
    &.q-btn--disable {
        opacity: 0.6;
        pointer-events: none;
    }

    // Transitions
    transition: all 0.2s ease;

    &:hover:not(.q-btn--disable):not(.q-btn--loading) {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px var(--app-shadow);
    }

    &:active:not(.q-btn--disable):not(.q-btn--loading) {
        transform: translateY(0);
    }
}

// Mobile responsive adjustments
@media (max-width: 600px) {
    .base-button {
        // Ensure minimum touch target size
        min-width: 44px;
        padding: 5 12px;
    }
}
</style>
