<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import {
    mdiAccountCircle,
    mdiLock,
    mdiGoogle,
} from '@quasar/extras/mdi-v6';
import { useSessionStore } from 'stores/session';
import useError from '../hooks/useError';
import BaseButton from 'src/components/ui/base-button.vue';
import BaseInput from 'src/components/ui/base-input.vue';
import logo from 'assets/logo.png';
import logoWhite from 'assets/logo-white.png';
import { useQuasar } from 'quasar';

const session = useSessionStore();
const error = useError();

const data = reactive({
    email: '',
    password: '',
});

const loading = ref(false);
const googleLoading = ref(false);

async function login() {
    loading.value = true;
    try {
        await session.login(data);
    } catch (err) {
        error(err);
    } finally {
        loading.value = false;
    }
}

async function loginWithGoogle() {
    googleLoading.value = true;
    try {
        await session.authenticateWithGoogle();
    } catch (err: any) {
        // Check if this is a "not registered" error
        if (err?.message?.includes('User not registered')) {
            // Show a more user-friendly error message
            error('Conta não encontrada. Você precisa se cadastrar primeiro.');
        } else {
            error(err);
        }
    } finally {
        googleLoading.value = false;
    }
}

const $q = useQuasar();
// Logo configuration
const logoSrc = computed(() => {
    return $q.dark.isActive ? logoWhite : logo;
});

</script>

<template>
    <q-page class="page column full-height align-center q-pa-xl">
        <div class="form-container">
            <div class="text-start text-h5 text-weight-bold q-mt-xl">
                <q-img
                    :src="logoSrc"
                    alt="logo"
                    class="logo"
                />
            </div>
            <q-form
                class="form"
                @submit.prevent="login"
            >
                <div class="form__contents column">
                    <base-input
                        v-model="data.email"
                        label="E-mail"
                        placeholder="seu@email.com"
                        type="email"
                        :prepend-icon="mdiAccountCircle"
                    />
                    <base-input
                        v-model="data.password"
                        type="password"
                        label="Senha"
                        placeholder="Digite sua senha"
                        :prepend-icon="mdiLock"
                        :show-password-toggle="true"
                    />
                </div>
                <div class="text-right text-caption text-accent q-mt-sm">
                    <router-link to="/forgot-password">
                        Esqueci minha senha
                    </router-link>
                </div>
                <base-button
                    class="form__submit"
                    color="accent"
                    type="submit"
                    :loading="loading"
                    label="Entrar"
                />

                <div class="divider">
                    <span>ou</span>
                </div>

                <base-button
                    class="form__google-btn"
                    outline
                    color="grey-8"
                    :loading="googleLoading"
                    :icon="mdiGoogle"
                    label="Continuar com Google"
                    @click="loginWithGoogle"
                />
            </q-form>
        </div>
    </q-page>
</template>


<style scoped lang="scss">
.page {
    padding-top: 8rem;
}

.form-container {
    max-width: 500px; /* alinhado com o form */
    width: 100%;
    margin: 0 auto; /* centraliza o contêiner */
    text-align: left; /* alinha o texto à esquerda */
}

@media screen and (max-width: 768px) {
    .title{
        font-size: 2rem;
    }
}

.form {
    width: 100%;
    &__contents {
        gap: 1.5rem;
        margin-top: 1.5rem;
    }

    &__submit {
        margin-top: 1.5rem;
        width: 100%;
        height: 50px;
        font-size: 14pt;
    }

    &__google-btn {
        width: 100%;
        height: 50px;
        font-size: 14pt;
        border: 1px solid #e0e0e0;

        &:hover {
            background-color: #f5f5f5;
        }
    }

    &__login {
        width: 100%;
        text-align: center;
        font-size: 13px;
        margin-top: 1rem;
    }
}

.divider {
    display: flex;
    align-items: center;
    margin: 1.5rem 0 1rem 0;

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e0e0e0;
    }

    span {
        margin: 0 1rem;
        color: #666;
        font-size: 14px;
    }
}

</style>
