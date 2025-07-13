<script setup lang="ts">
import { ref, computed } from 'vue';

// Define props
const props = defineProps({
    modelValue: {
        type: [String, Array],
        required: true,
    },
    label: {
        type: String,
        default: '',
    },
    accept: {
        type: String,
        default: '*/*',
    },
    placeholder: {
        type: String,
        default: 'Upload a file',
    },
    placeholderIcon: {
        type: String,
        default: 'upload_file',
    },
    placeholderText: {
        type: String,
        default: 'Click to upload',
    },
    hintText: {
        type: String,
        default: '',
    },
    maxSize: {
        type: Number,
        default: 50, // In MB
    },
    showProgress: {
        type: Boolean,
        default: false,
    },
    progress: {
        type: Number,
        default: 0,
    },
    required: {
        type: Boolean,
        default: false,
    },
    allowRemove: {
        type: Boolean,
        default: true,
    },
    mode: {
        type: String,
        default: 'file', // 'file' or 'data' (for CSV/Excel data imports)
    },
    parseData: {
        type: Boolean,
        default: false, // If true, component will parse CSV/Excel data
    },
    description: {
        type: String,
        default: '', // Additional description text under the upload area
    },
    multiple: {
        type: Boolean,
        default: false, // Allow multiple file uploads
    },
    maxFiles: {
        type: Number,
        default: 10, // Maximum number of files that can be uploaded
    },
});

const emit = defineEmits([
    'update:modelValue',
    'file-selected',
    'file-removed',
    'data-parsed',  // New event for when CSV/Excel data is parsed
    'files-selected', // For multiple file selection
]);

// Internal state
const fileInput = ref<HTMLInputElement | null>(null);
const fileChanged = ref(false);
const isUploading = ref(false);
const fileName = ref('');
const fileList = ref<Array<{name: string, path: string}>>([]);

// Determine if we're in multiple mode
const isMultipleMode = computed(() => props.multiple && props.mode === 'data');

// Computed to determine if we have a file
const hasFile = computed(() => {
    if (isMultipleMode.value) {
        return Array.isArray(props.modelValue) && props.modelValue.length > 0;
    }
    return Boolean(props.modelValue);
});

// Computed for how many files we have
const fileCount = computed(() => {
    if (isMultipleMode.value && Array.isArray(props.modelValue)) {
        return props.modelValue.length;
    }
    return hasFile.value ? 1 : 0;
});

// Check if we've reached the max files limit
const reachedMaxFiles = computed(() => {
    if (!isMultipleMode.value) return false;
    return fileCount.value >= props.maxFiles;
});

// Trigger file input click
const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

// Handle file selection
const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    if (isMultipleMode.value) {
        // Handle multiple files
        handleMultipleFiles(files);
    } else {
        // Handle single file
        handleSingleFile(files[0]);
    }

    // Clear the input value to allow selecting the same file again
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// Handle single file upload
const handleSingleFile = (file: File) => {
    // Store filename for display
    fileName.value = file.name;

    // Check file size
    if (file.size > props.maxSize * 1024 * 1024) {
        // Notify size error
        const sizeError = `File size exceeds the limit of ${props.maxSize} MB`;
        console.error(sizeError);
        return;
    }

    // File is valid, emit event with file
    fileChanged.value = true;
    isUploading.value = true;

    // Emit the event with the file
    emit('file-selected', file);
};

// Handle multiple files upload
const handleMultipleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const currentList = Array.isArray(props.modelValue) ? [...props.modelValue] : [];

    // Check if adding these files would exceed the max limit
    if (currentList.length + files.length > props.maxFiles) {
        console.error(`You can only upload a maximum of ${props.maxFiles} files.`);
        return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size
        if (file.size > props.maxSize * 1024 * 1024) {
            console.error(`File ${file.name} exceeds the limit of ${props.maxSize} MB`);
            continue;
        }

        validFiles.push(file);

        // Update file list for display
        fileList.value.push({
            name: file.name,
            path: URL.createObjectURL(file),
        });
    }

    if (validFiles.length > 0) {
        fileChanged.value = true;
        isUploading.value = true;

        // Emit all valid files
        emit('files-selected', validFiles);
    }
};

// Remove a file - modify the function to accept either an index or an event
const removeFile = (indexOrEvent: number | Event) => {
    // If it's an event (from the single file mode), handle it
    if (typeof indexOrEvent !== 'number') {
        if (hasFile.value && props.allowRemove) {
            fileChanged.value = true;
            fileName.value = '';
            fileList.value = [];
            emit('update:modelValue', isMultipleMode.value ? [] : '');
            emit('file-removed');
        }
        return;
    }

    // Otherwise, it's an index from multiple mode
    const index = indexOrEvent;
    if (isMultipleMode.value) {
        // Remove specific file from array
        if (Array.isArray(props.modelValue)) {
            const newList = [...props.modelValue];
            newList.splice(index, 1);
            fileList.value.splice(index, 1);
            emit('update:modelValue', newList);
            emit('file-removed', index);
        }
    }
};

// Get file name from URL or stored filename
const getFileNameFromUrl = computed(() => {
    // If we have stored the filename directly, use it
    if (fileName.value) return fileName.value;

    // Otherwise try to extract it from the URL
    if (!props.modelValue || (isMultipleMode.value && Array.isArray(props.modelValue) && props.modelValue.length === 0)) return '';

    try {
        if (isMultipleMode.value) return 'Multiple files'; // For multiple mode

        const url = new URL(props.modelValue as string);
        const pathSegments = url.pathname.split('/');
        return pathSegments[pathSegments.length - 1];
    } catch (e) {
        // Fallback to full value if not a valid URL
        if (typeof props.modelValue === 'string') {
            const segments = props.modelValue.split('/');
            return segments[segments.length - 1];
        }
        return '';
    }
});

// Computed for file type icon
const fileTypeIcon = computed(() => {
    if (!props.modelValue && !fileName.value) return props.placeholderIcon;

    if (props.accept.includes('image/')) {
        return 'image';
    } else if (props.accept.includes('.csv') || props.accept.includes('.xlsx') || props.accept.includes('.xls')) {
        return 'table_chart';
    } else {
        return 'insert_drive_file';
    }
});
</script>

<template>
    <div class="base-file-upload">
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
                v-if="isMultipleMode && maxFiles > 0"
                class="file-limit"
            >(máx. {{ maxFiles }} arquivos)</span>
        </div>

        <!-- Upload container -->
        <div
            class="file-upload-container"
            :class="{'multi-upload': isMultipleMode}"
        >
            <!-- Empty state or add more files button -->
            <div
                v-if="!hasFile || (isMultipleMode && !reachedMaxFiles)"
                class="file-upload-placeholder"
                @click="triggerFileInput"
            >
                <q-btn
                    flat
                    color="accent"
                    :icon="placeholderIcon"
                >
                    <q-tooltip>
                        {{ isMultipleMode && fileCount > 0 ? 'Adicionar mais arquivos' : placeholderText }}
                    </q-tooltip>
                </q-btn>
                <div class="upload-text q-mt-sm">
                    {{ isMultipleMode && fileCount > 0 ? 'Adicionar mais arquivos' : placeholderText }}
                </div>
                <div
                    v-if="hintText"
                    class="upload-hint"
                >
                    {{ hintText }}
                </div>
                <div
                    v-if="isMultipleMode && fileCount > 0"
                    class="upload-hint"
                >
                    {{ fileCount }} de {{ maxFiles }} arquivos
                </div>
                <input
                    ref="fileInput"
                    type="file"
                    :accept="accept"
                    :multiple="isMultipleMode"
                    class="hidden-input"
                    @change="handleFileSelect"
                >
            </div>

            <!-- File name display when single file is available and not in multiple mode -->
            <div
                v-if="hasFile && !isMultipleMode"
                class="file-name-container"
            >
                <div class="file-info">
                    <q-icon
                        :name="fileTypeIcon"
                        size="md"
                        color="accent"
                        class="q-mr-sm"
                    />
                    <div class="file-name">
                        {{ getFileNameFromUrl }}
                    </div>
                </div>
                <q-btn
                    v-if="allowRemove"
                    round
                    flat
                    dense
                    color="grey-7"
                    icon="close"
                    class="file-remove-btn"
                    @click="removeFile"
                />
            </div>

            <!-- File list for multiple mode -->
            <div
                v-if="isMultipleMode && fileList.length > 0"
                class="file-list-container"
            >
                <div
                    v-for="(file, index) in fileList"
                    :key="index"
                    class="file-list-item"
                >
                    <div class="file-info">
                        <q-icon
                            :name="fileTypeIcon"
                            size="sm"
                            color="accent"
                            class="q-mr-xs"
                        />
                        <div class="file-name">
                            {{ file.name }}
                        </div>
                    </div>
                    <q-btn
                        v-if="allowRemove"
                        round
                        flat
                        dense
                        color="grey-7"
                        icon="close"
                        size="xs"
                        class="file-remove-btn"
                        @click="removeFile(index)"
                    />
                </div>
            </div>
        </div>

        <!-- Description text if provided -->
        <div
            v-if="description"
            class="file-description q-py-sm"
        >
            <small class="text-grey-7">
                {{ description }}
            </small>
        </div>

        <!-- Progress bar -->
        <q-linear-progress
            v-if="showProgress && isUploading"
            :value="progress / 100"
            class="q-mt-xs"
            color="accent"
        />
    </div>
</template>

<style lang="scss" scoped>
.base-file-upload {
    width: 100%;
    margin-bottom: 16px;
}

.field-label {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 5px;
    color: var(--app-text-primary);
    display: flex;
    align-items: center;
}

.required {
    color: var(--q-negative);
    margin-left: 2px;
}

.file-limit {
    font-size: 11px;
    color: var(--app-text-secondary);
    margin-left: 4px;
}

.file-upload-container {
    background-color: var(--app-bg-elevated);
    border: 2px dashed var(--app-border);
    border-radius: 8px;
    overflow: hidden;
    width: 100%;

    &.multi-upload {
        display: flex;
        flex-direction: column;
    }
}

.file-upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 20px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--app-bg-surface);
    }
}

.upload-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-accent);
}

.upload-hint {
    font-size: 12px;
    color: var(--app-text-secondary);
    margin-top: 4px;
}

.hidden-input {
    display: none;
}

/* File name display styles */
.file-name-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: var(--app-bg-elevated);
}

.file-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0; /* For text truncation */
}

.file-name {
    font-size: 13px;
    color: var(--app-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-remove-btn {
    margin-left: 8px;
}

/* Multiple files list styles */
.file-list-container {
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: var(--app-bg-elevated);
    border-top: 1px solid var(--app-border);
}

.file-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--app-border);

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: var(--app-bg-surface);
    }
}

.file-description {
    font-size: 12px;
    line-height: 1.4;
    color: var(--app-text-secondary);
}

:deep(.q-btn) {
    border-radius: 10px;
    font-size: 14px;
    height: 40px;

    .q-icon {
        font-size: 24px;
    }
}

/* Media query for mobile */
@media (max-width: 600px) {
    .file-upload-placeholder {
        padding: 20px;
    }
}
</style>
