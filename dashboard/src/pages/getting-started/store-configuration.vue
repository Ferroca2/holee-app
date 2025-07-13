<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from 'stores/onboarding';
import { useSessionStore } from 'stores/session';
import { useStandardLayout } from 'src/hooks/useStandardLayout';
import useError from 'hooks/useError';
import { Store } from 'src/domain/stores/entity';
import StoreRepository from 'src/domain/stores/repository';
import BaseInput from 'components/ui/base-input.vue';
import BaseFileUpload from 'components/ui/base-file-upload.vue';
import NavigationButtons from 'components/ui/navigation-buttons.vue';
import { uploadImageToStorage } from 'src/utils/storage';
import { phoneToString } from 'src/utils/phone';

const router = useRouter();
const onboardingStore = useOnboardingStore();
const error = useError();
const session = useSessionStore();
const { pageClasses, headerClasses, titleClasses } = useStandardLayout();

// Form data
const data = reactive<Store>({
    name: '',
    address: {
        city: '',
        complement: '',
        country: 'Brasil',
        neighborhood: '',
        number: '',
        state: '',
        street: '',
        zipcode: '',
    },
    phone: '',
    email: '',
    links: {
        website: '',
        instagram: '',
        linkedin: '',
    },
    owner: {
        name: session.user?.displayName || '',
        id: session.user?.uid || '',
    },
    mission: '',
    vision: '',
    values: [],
    description: '',
    logo: '',
    createdAt: 0,
    updatedAt: 0,
    isActive: true,
    isDeleted: false,
});

// Computed properties to ensure string values for optional fields
const complementValue = computed({
    get: () => data.address.complement || '',
    set: (value: string) => {
        data.address.complement = value;
    },
});

const websiteValue = computed({
    get: () => data.links.website || '',
    set: (value: string) => {
        data.links.website = value;
    },
});

const instagramValue = computed({
    get: () => data.links.instagram || '',
    set: (value: string) => {
        data.links.instagram = value;
    },
});

const linkedinValue = computed({
    get: () => data.links.linkedin || '',
    set: (value: string) => {
        data.links.linkedin = value;
    },
});

// Additional form fields
const valuesText = ref('');
const locationSearch = ref('');
const selectedAddress = ref('');

// Loading states
const loading = ref(false);
const loadingAddress = ref(false);
const invalidCep = ref(false);

// Logo upload
const logoFile = ref<File | null>(null);
const logoUrl = ref('');

// Helper functions
const updateValues = (newText: string) => {
    data.values = newText
        .split(',')
        .map(value => value.trim())
        .filter(value => value.length > 0);
};

const searchAddress = async (cep: string) => {
    if (!cep || cep.length < 8) {
        invalidCep.value = false;
        return;
    }

    loadingAddress.value = true;
    invalidCep.value = false;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const addressData = await response.json();

        if (addressData.erro) {
            invalidCep.value = true;
            return;
        }

        data.address = {
            ...data.address,
            zipcode: addressData.cep,
            street: addressData.logradouro,
            city: addressData.localidade,
            state: addressData.uf,
            neighborhood: addressData.bairro,
        };

        selectedAddress.value = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`;
    } catch (err) {
        invalidCep.value = true;
        console.error('Erro ao buscar CEP:', err);
    } finally {
        loadingAddress.value = false;
    }
};

// Logo upload handlers
const onLogoFileSelected = (file: File) => {
    logoFile.value = file;
    logoUrl.value = URL.createObjectURL(file);
};

const onLogoFileRemoved = () => {
    logoFile.value = null;
    logoUrl.value = '';
    data.logo = '';
};

const onSubmit = async () => {
    // Validate required fields
    if (!data.name.trim()) {
        error('Por favor, informe o nome da empresa');
        return;
    }

    if (!data.email.trim()) {
        error('Por favor, informe o email da empresa');
        return;
    }

    if (!data.phone.trim()) {
        error('Por favor, informe o telefone da empresa');
        return;
    }

    if (!data.address.zipcode.trim()) {
        error('Por favor, informe o CEP da empresa');
        return;
    }

    loading.value = true;
    try {
        // Handle logo upload if present
        if (logoFile.value) {
            const logoPath = `stores/${session.user?.uid}/logo_${Date.now()}.${logoFile.value.type.split('/')[1]}`;
            data.logo = await uploadImageToStorage(logoFile.value, logoPath);
        }

        // Update values from text input
        updateValues(valuesText.value);

        const createData = {
            ...data,
            phone: phoneToString(data.phone),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const newStore = await StoreRepository.createStore(createData);

        // Update onboarding stage with the new store ID
        await onboardingStore.updateStage('store-configuration', newStore.id);

        await router.replace('/dashboard');

        // Show success message
        console.log('empresa criada com sucesso!');
    } catch (err) {
        error('Erro ao criar empresa');
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const onBack = () => {
    router.back();
};
</script>

<template>
    <q-page class="row justify-center">
        <div
            class="full-width q-mx-auto text-left"
            style="max-width: 600px"
        >
            <div :class="headerClasses">
                <div class="column">
                    <div class="text-h5 text-weight-bold q-mb-sm">
                        Configurar empresa 🏪
                    </div>
                    <div :class="titleClasses">
                        Configure as informações da sua nova empresa
                    </div>
                </div>
            </div>

            <q-form
                class="column q-gutter-lg"
                @submit.prevent="onSubmit"
            >
                <!-- Basic Information -->
                <div>
                    <base-input
                        v-model="data.name"
                        label="Nome da empresa"
                        placeholder="Digite o nome da empresa"
                        :rules="[val => !!val || 'Nome é obrigatório']"
                    />
                </div>

                <div>
                    <base-input
                        v-model="data.email"
                        label="Email"
                        placeholder="Digite o email da empresa"
                        type="email"
                        :rules="[
                            val => !!val || 'Email é obrigatório',
                            val => /.+@.+\..+/.test(val) || 'Email deve ser válido'
                        ]"
                    />
                </div>

                <div>
                    <base-input
                        v-model="data.phone"
                        label="Telefone"
                        placeholder="Digite o telefone"
                        mask="(##) #####-####"
                        :rules="[val => !!val || 'Telefone é obrigatório']"
                    />
                </div>

                <!-- Address -->
                <div>
                    <base-input
                        v-model="locationSearch"
                        label="CEP"
                        placeholder="Digite o CEP"
                        mask="#####-###"
                        :loading="loadingAddress"
                        :error="invalidCep"
                        error-message="CEP não encontrado"
                        :rules="[val => !!val || 'CEP é obrigatório']"
                        debounce="300"
                        @update:model-value="searchAddress"
                    />
                </div>

                <div v-if="selectedAddress">
                    <base-input
                        v-model="selectedAddress"
                        label="Endereço"
                        placeholder="Endereço será preenchido automaticamente"
                        readonly
                    />
                </div>

                <div
                    v-if="data.address.street"
                    class="row q-gutter-md"
                >
                    <div class="col">
                        <base-input
                            v-model="data.address.street"
                            label="Rua"
                            placeholder="Nome da rua"
                        />
                    </div>
                    <div class="col-3">
                        <base-input
                            v-model="data.address.number"
                            label="Número"
                            placeholder="Nº"
                        />
                    </div>
                </div>

                <div
                    v-if="data.address.neighborhood"
                    class="row q-gutter-md"
                >
                    <div class="col">
                        <base-input
                            v-model="data.address.neighborhood"
                            label="Bairro"
                            placeholder="Nome do bairro"
                        />
                    </div>
                    <div class="col">
                        <base-input
                            v-model="complementValue"
                            label="Complemento"
                            placeholder="Complemento (opcional)"
                        />
                    </div>
                </div>

                <div
                    v-if="data.address.city"
                    class="row q-gutter-md"
                >
                    <div class="col">
                        <base-input
                            v-model="data.address.city"
                            label="Cidade"
                            placeholder="Nome da cidade"
                        />
                    </div>
                    <div class="col-3">
                        <base-input
                            v-model="data.address.state"
                            label="Estado"
                            placeholder="UF"
                        />
                    </div>
                </div>

                <!-- Logo -->
                <div>
                    <base-file-upload
                        v-model="data.logo"
                        label="Logo da empresa"
                        placeholder="Adicione ou arraste a logo aqui"
                        accept="image/*"
                        :max-size="5"
                        @file-selected="onLogoFileSelected"
                        @file-removed="onLogoFileRemoved"
                    />
                    <div
                        v-if="logoUrl"
                        class="q-mt-md text-center"
                    >
                        <q-avatar size="80px">
                            <q-img :src="logoUrl" />
                        </q-avatar>
                    </div>
                </div>

                <!-- Links -->
                <div>
                    <base-input
                        v-model="websiteValue"
                        label="Website"
                        placeholder="https://exemplo.com (opcional)"
                    />
                </div>

                <div>
                    <base-input
                        v-model="instagramValue"
                        label="Instagram"
                        placeholder="@usuario (opcional)"
                    />
                </div>

                <div>
                    <base-input
                        v-model="linkedinValue"
                        label="LinkedIn"
                        placeholder="https://linkedin.com/in/perfil (opcional)"
                    />
                </div>

                <!-- Mission, Vision, Values -->
                <div>
                    <base-input
                        v-model="data.mission"
                        label="Missão"
                        placeholder="Descreva a missão da loja (opcional)"
                        type="textarea"
                        rows="3"
                    />
                </div>

                <div>
                    <base-input
                        v-model="data.vision"
                        label="Visão"
                        placeholder="Descreva a visão da loja (opcional)"
                        type="textarea"
                        rows="3"
                    />
                </div>

                <div>
                    <base-input
                        v-model="valuesText"
                        label="Valores"
                        placeholder="Digite os valores separados por vírgula (opcional)"
                        type="textarea"
                        rows="2"
                        @update:model-value="updateValues"
                    />
                </div>

                <div>
                    <base-input
                        v-model="data.description"
                        label="Descrição"
                        placeholder="Descreva a loja (opcional)"
                        type="textarea"
                        rows="4"
                    />
                </div>

                <navigation-buttons
                    :loading="loading"
                    :show-skip="false"
                    :show-back="true"
                    submit-text="Criar empresa"
                    @back="onBack"
                />
            </q-form>
        </div>
    </q-page>
</template>
