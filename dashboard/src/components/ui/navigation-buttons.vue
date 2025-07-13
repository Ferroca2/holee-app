<script setup lang="ts">
import BaseButton from './base-button.vue';

interface Props {
    loading?: boolean;
    showSkip?: boolean;
    showBack?: boolean;
    submitText?: string;
    backText?: string;
    skipText?: string;
}

withDefaults(defineProps<Props>(), {
    loading: false,
    showSkip: true,
    showBack: true,
    submitText: 'Continuar',
    backText: 'Voltar',
    skipText: 'Pular',
});

const emit = defineEmits<{
    back: [];
    skip: [];
    submit: [];
}>();
</script>

<template>
    <div class="navigation-buttons q-pt-lg">
        <div class="row">
            <base-button
                v-if="showBack"
                :label="backText"
                color="primary"
                outline
                class="col-6 q-mr-md"
                @click="emit('back')"
            />
            <base-button
                v-if="showSkip"
                :label="skipText"
                color="grey-6"
                flat
                class="col q-mr-md"
                @click="emit('skip')"
            />
            <base-button
                :label="submitText"
                color="accent"
                type="submit"
                :loading="loading"
                class="col"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.navigation-buttons {
    width: 100%;
}
</style>
