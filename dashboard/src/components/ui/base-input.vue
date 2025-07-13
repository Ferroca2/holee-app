<script setup lang="ts">
import { computed, ref } from 'vue';
import { ValidationRule } from 'quasar';
import { mdiEye, mdiEyeOff } from '@quasar/extras/mdi-v6';

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

// Define button type
interface ButtonConfig {
    icon?: string;
    disable?: boolean;
    onClick: () => void;
}

// Define props
const props = defineProps({
    // Required props
    modelValue: {
        type: [String, Number],
        required: true,
    },
    label: {
        type: String,
        required: false,
    },
    placeholder: {
        type: String,
        required: true,
    },
    // Optional props
    maxLength: {
        type: Number,
        default: null,
    },
    mask: {
        type: String,
        default: '',
    },
    rules: {
        type: Array as () => ValidationRule[],
        default: () => [],
    },
    reverseFillMask: {
        type: Boolean,
        default: false,
    },
    rightIcon: {
        type: String,
        default: '',
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
    btn: {
        type: Object as () => ButtonConfig,
        default: () => null,
    },
    required: {
        type: Boolean,
        default: false,
    },
    charCounter: {
        type: Boolean,
        default: false,
    },
    prependIcon: {
        type: String,
        default: '',
    },
    type: {
        type: String as () => 'text' | 'email' | 'password' | 'number' | 'textarea' | 'search' | 'tel' | 'file' | 'url' | 'date' | 'time' | 'datetime-local',
        default: 'text',
    },
    loading: {
        type: Boolean,
        default: false,
    },
    disable: {
        type: Boolean,
        default: false,
    },
    showPasswordToggle: {
        type: Boolean,
        default: false,
    },
    error: {
        type: Boolean,
        default: false,
    },
    errorMessage: {
        type: String,
        default: '',
    },
    debounce: {
        type: [String, Number],
        default: 0,
    },
    autogrow: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'keydown']);

// Internal state for password visibility
const isPasswordVisible = ref(false);

// Create a computed property for the model value
const inputValue = computed({
    get: () => props.modelValue,
    set: value => {
        emit('update:modelValue', value);
    },
});

// Compute the actual input type (handle password visibility)
const actualInputType = computed(() => {
    if (props.type === 'password' && props.showPasswordToggle) {
        return isPasswordVisible.value ? 'text' : 'password';
    }
    return props.type;
});

// Compute password toggle icon
const passwordToggleIcon = computed(() => {
    return isPasswordVisible.value ? mdiEyeOff : mdiEye;
});

// Toggle password visibility
const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

// Compute character count display if maxLength is provided
const charCount = computed(() => {
    if (props.maxLength) {
        return `${String(props.modelValue).length}/${props.maxLength}`;
    }
    return '';
});

// Safe handler for enter key press
const handleEnterKey = () => {
    if (props.btn && typeof props.btn.onClick === 'function') {
        props.btn.onClick();
    }
};

// Event handlers for focus and blur
const handleFocus = (event: Event) => {
    emit('focus', event);
};

const handleBlur = (event: Event) => {
    emit('blur', event);
};

// Event handler for keydown
const handleKeydown = (event: Event) => {
    emit('keydown', event);
};

// Template ref for the q-input
const qInputRef = ref();

// Expose the q-input ref so parent components can access it
defineExpose({
    qInputRef,
});
</script>

<template>
    <div class="base-input-component">
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
            <span
                v-if="maxLength && charCounter"
                class="char-limit"
            >(máx. {{ maxLength }} caracteres)</span>
        </div>

        <!-- Tag input container for proper layout -->
        <div class="tag-input-container">
            <!-- Input with all the slots and props -->
            <q-input
                ref="qInputRef"
                v-model="inputValue"
                outlined
                :placeholder="placeholder"
                :maxlength="maxLength"
                :mask="mask"
                :rules="rules"
                :reverse-fill-mask="reverseFillMask"
                :type="actualInputType"
                :loading="loading"
                :disable="disable"
                :error="error"
                :error-message="errorMessage"
                :debounce="debounce"
                :autogrow="autogrow && type === 'textarea'"
                class="tag-input"
                @keyup.enter="handleEnterKey"
                @focus="handleFocus"
                @blur="handleBlur"
                @keydown="handleKeydown"
            >
                <!-- Prepend slot for icon -->
                <template
                    v-if="prependIcon"
                    #prepend
                >
                    <q-icon :name="prependIcon" />
                </template>

                <!-- Append slot for icons, tooltips, char counter -->
                <template #append>
                    <!-- Character counter -->
                    <div
                        v-if="charCounter && maxLength"
                        class="char-counter"
                    >
                        {{ charCount }}
                    </div>

                    <!-- Password toggle icon -->
                    <q-icon
                        v-if="showPasswordToggle && type === 'password'"
                        :name="passwordToggleIcon"
                        size="xs"
                        class="cursor-pointer q-mr-xs"
                        @click="togglePasswordVisibility"
                    />

                    <!-- Right icon with optional tooltip -->
                    <q-icon
                        v-if="rightIcon"
                        :name="rightIcon"
                        size="xs"
                    >
                        <q-tooltip
                            v-if="tooltip?.text"
                        >
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
            </q-input>

            <!-- Action button if provided -->
            <q-btn
                v-if="btn"
                color="accent"
                :icon="btn.icon || 'add'"
                size="xs"
                class="add-button"
                :disable="btn.disable"
                @click="btn.onClick"
            />
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
            class="input-hint"
        >
            {{ hint.message }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.base-input-component {
  position: relative;
  width: 100%;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  color: var(--app-text-primary);
}

.required {
  color: var(--q-negative);
  margin-left: 2px;
}

.char-limit {
  font-weight: normal;
  color: var(--app-text-secondary);
  font-size: 11px;
  margin-left: 4px;
}

.char-counter {
  font-size: 10px;
  color: var(--app-text-secondary);
}

// Tag input container for proper layout
.tag-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-input {
  flex: 1;
  max-width: 100%;
}

.add-button {
  width: 28px;
  height: 40px;
  border-radius: 10px;
}

// Using the exact styling from create-dispatch-dialog.vue
:deep(.q-field__control) {
  height: 40px;
  border-radius: 10px;
  background-color: var(--app-bg-surface);
}

// Special handling for textarea type
:deep(.q-field__control:has(textarea)) {
  height: auto;
  min-height: 40px;
}

:deep(.q-field__marginal) {
  height: 40px;
}

// Special handling for textarea marginal
:deep(.q-field__control:has(textarea) .q-field__marginal) {
  height: auto;
  align-self: flex-start;
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

// Specific textarea focus styling
:deep(.q-field--focused.q-field--auto-height .q-field__control:before) {
  border-color: var(--app-accent);
  border-width: 2px;
}

// Ensure textarea native element styling
:deep(.q-field__native) {
  padding-top: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  color: var(--app-text-primary);
}

// Special handling for textarea native element
:deep(.q-field__native:is(textarea)) {
  align-items: flex-start;
  padding-top: 12px;
  padding-bottom: 12px;
  resize: vertical;
  min-height: 20px;
}

:deep(.q-placeholder) {
  align-items: center;
  padding: 0;
  color: var(--app-text-secondary);
}

:deep(.q-btn) {
  border-radius: 10px;
  font-size: 14px;
  height: 40px;

  .q-icon {
    font-size: 16px;
  }
}

:deep(.q-btn__content) {
  font-weight: 600;
}

.validation-error {
  font-size: 12px;
  color: var(--q-negative);
  margin-top: 4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.input-hint {
  font-size: 11px;
  color: var(--app-text-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

// Mobile specific adjustments
@media (max-width: 600px) {
  .tag-input {
    max-width: none;
    width: calc(100% - 48px);
  }
}

// Form row adjustments
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
}

// Interactive elements
.cursor-pointer {
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
}
</style>
