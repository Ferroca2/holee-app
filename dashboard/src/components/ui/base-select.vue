<script setup lang="ts">
import { computed } from 'vue';

// Define tooltip content type
interface TooltipContent {
    text?: string;
    content?: string | string[];
}

// Define validation error type
interface ValidationError {
    condition: boolean;
    message: string;
}

// Define hint type
interface Hint {
    condition?: boolean;
    message: string;
}

// Define option type
interface SelectOption {
    label: string;
    value: any;
    disable?: boolean;
}

// Define props
const props = defineProps({
    // Required props
    modelValue: {
        type: [String, Number, Boolean, Object, Array, null],
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: false,
    },
    placeholder: {
        type: String,
        required: true,
    },
    options: {
        type: Array as () => SelectOption[] | any[],
        required: true,
    },
    // Optional props
    useOptionsAsList: {
        type: Boolean,
        default: false,
    },
    mapOptions: {
        type: Boolean,
        default: false,
    },
    emitValue: {
        type: Boolean,
        default: false,
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    tooltip: {
        type: Object as () => TooltipContent,
        default: () => null,
    },
    validationError: {
        type: Object as () => ValidationError,
        default: () => null,
    },
    hint: {
        type: Object as () => Hint,
        default: () => null,
    },
    required: {
        type: Boolean,
        default: false,
    },
    prependIcon: {
        type: String,
        default: '',
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    disable: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

// Create a computed property for the model value
const inputValue = computed({
    get: () => props.modelValue,
    set: value => {
        emit('update:modelValue', value);
    },
});
</script>

<template>
    <div class="base-select-component">
        <div class="q-mb-sm">
            <!-- Label with optional required mark -->
            <div
                v-if="label"
                class="field-label"
            >
                {{ label }}
                <span
                    v-if="required"
                    class="required"
                >*</span>
            </div>

            <!-- Caption -->
            <div
                v-if="caption"
                class="text-caption text-grey-7 q-pl-xs"
            >
                {{ caption }}
            </div>
        </div>

        <!-- Select input container -->
        <div class="select-input-container">
            <!-- Select with all the slots and props -->
            <q-select
                v-model="inputValue"
                outlined
                :options="options"
                :placeholder="placeholder"
                :map-options="mapOptions"
                :emit-value="emitValue"
                :multiple="multiple"
                :clearable="clearable"
                :loading="loading"
                :disable="disable"
                dense
                options-dense
                behavior="menu"
                dropdown-icon="unfold_more"
                class="select-input"
            >
                <!-- Prepend slot for icon -->
                <template
                    v-if="prependIcon"
                    #prepend
                >
                    <q-icon :name="prependIcon" />
                </template>

                <!-- Append slot for tooltip -->
                <template #append>
                    <!-- Right icon with optional tooltip -->
                    <q-icon
                        v-if="tooltip?.text"
                        name="help_outline"
                        size="xs"
                    >
                        <q-tooltip>
                            {{ tooltip.text }}
                        </q-tooltip>
                    </q-icon>

                    <!-- Help icon with tooltip -->
                    <q-icon
                        v-if="tooltip?.content"
                        name="help_outline"
                        size="xs"
                    >
                        <q-tooltip>
                            <div v-if="typeof tooltip.content === 'string'">
                                {{ tooltip.content }}
                            </div>
                            <div v-else-if="Array.isArray(tooltip.content)">
                                <div
                                    v-for="(item, index) in tooltip.content"
                                    :key="index"
                                >
                                    {{ item }}
                                </div>
                            </div>
                        </q-tooltip>
                    </q-icon>
                </template>

                <!-- Custom option display -->
                <template #option="scope">
                    <q-item
                        v-bind="scope.itemProps"
                        class="q-px-md"
                    >
                        <q-item-section>
                            <q-item-label
                                class="text-grey-9 text-weight-bold"
                                style="font-size: 13px;"
                            >
                                {{ scope.label }}
                            </q-item-label>
                        </q-item-section>
                        <q-item-section
                            v-if="scope.selected"
                            side
                        >
                            <q-icon
                                name="check_circle"
                                color="grey-9"
                                size="16px"
                            />
                        </q-item-section>
                    </q-item>
                </template>

                <!-- No options slot -->
                <template #no-option>
                    <q-item>
                        <q-item-section class="text-grey-7">
                            Nenhuma opção disponível
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
        </div>

        <!-- Validation error message -->
        <div
            v-if="validationError?.condition"
            class="validation-error"
        >
            <q-icon
                name="error"
                size="xs"
                color="negative"
                class="q-mr-xs"
            />
            <span>{{ validationError.message }}</span>
        </div>

        <!-- Hint message -->
        <div
            v-if="hint?.condition !== false && hint?.message"
            class="select-hint"
        >
            {{ hint.message }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.base-select-component {
    width: 100%;
}

.field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text-primary);
    display: flex;
    align-items: center;
}

.required {
    color: var(--q-negative);
    margin-left: 2px;
}

// Select input container for proper layout
.select-input-container {
    display: flex;
    gap: 8px;
    align-items: center;
}

.select-input {
    flex: 1;
    overflow: hidden;
}

// Using the same styling as BaseInput for consistency
:deep(.q-field__control) {
    border-radius: 10px;
    background-color: var(--app-bg-surface);
}

:deep(.q-field--outlined .q-field__control:before) {
    border-color: var(--app-border);
}

:deep(.q-field--outlined:hover .q-field__control:before) {
    border-color: var(--app-border-hover);
}

:deep(.q-field--focused .q-field__control:before) {
    border-color: var(--app-accent);
    border-width: 2px;
}

:deep(.q-field__native) {
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text-primary);
    padding: 0;
}

// For tags display when multiple selection
:deep(.q-chip) {
    margin: 2px;
    font-size: 11px;
    height: 22px;
    border-radius: 6px;
}

// Custom dropdown styling for options
:deep(.q-menu) {
    margin-top: 8px;
    background-color: var(--app-bg-surface);
    border: 1px solid var(--app-border);

    .q-item {
        min-height: 40px;
        padding: 8px 10px;
    }

    .q-item__label {
        font-size: 12px;
        font-weight: 600;
        color: var(--app-text-primary);
    }

    // Remove default background color change for selected items
    .q-manual-focusable--focused {
        background: var(--app-bg-elevated) !important;
    }
}

// Error and hint styles
.validation-error {
    font-size: 12px;
    color: var(--q-negative);
    margin-top: 4px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}

.select-hint {
    font-size: 11px;
    color: var(--app-text-secondary);
    margin-top: 4px;
    line-height: 1.4;
}
</style>
