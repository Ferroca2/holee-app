import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
    confirmPasswordReset,
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onIdTokenChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    User,
    verifyPasswordResetCode,
} from 'firebase/auth';
import { doc, getFirestore, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export interface LoginOptions {
    email: string;
    password: string;
}

export interface RegisterOptions {
    name: string;
    email: string;
    password: string;
}

export interface UserInfo {
    name: string;
    role: string;
    status: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    ignoreOnboarding: boolean;
}

export const useSessionStore = defineStore('session', () => {
    const router = useRouter();

    const user = ref<User | null>(null);
    const loading = ref(true);
    const userInfo = ref<UserInfo | null>(null);

    let unwatchUserInfo: () => void;


    onIdTokenChanged(getAuth(), async currentUser => {
        loading.value = false;
        user.value = currentUser;

        unwatchUserInfo?.();

        if (currentUser) {
            const userRef = doc(getFirestore(), 'users', currentUser.uid);

            unwatchUserInfo = onSnapshot(userRef, snap => {
                if (snap.exists()) {
                    userInfo.value = snap.data() as UserInfo;
                } else {
                    userInfo.value = null;
                }
            });
        } else {
            userInfo.value = null;
        }
    });

    return {
        user,
        userInfo,
        loading,
        async login({ email, password }: LoginOptions) {
            await signInWithEmailAndPassword(getAuth(), email, password);

            await router.replace('/home/reports/conversations');
        },
        async register(options: RegisterOptions) {
            const { user } = await createUserWithEmailAndPassword(
                getAuth(), options.email, options.password
            );
            await updateProfile(user, { displayName: options.name });

            const userRef = doc(getFirestore(), 'users', user.uid);

            await setDoc(userRef, {
                name: options.name,
            }, { merge: true });

            await user.getIdToken(true);
        },
        async logout() {
            await signOut(getAuth());
            await router.replace('/');
        },

        async sendResetEmail(email: string) {
            const auth = getAuth();
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';

            const continueUrl = `${protocol}//${hostname}${port}/reset-password`;

            await sendPasswordResetEmail(auth, email, {
                url: continueUrl,
                handleCodeInApp: true,
            });
        },

        async verifyResetCode(code: string) {
            const auth = getAuth();
            try {
                const email = await verifyPasswordResetCode(auth, code);
                return email;
            } catch (error) {
                throw new Error('Invalid or expired reset code');
            }
        },

        async resetPassword(code: string, newPassword: string) {
            const auth = getAuth();
            await confirmPasswordReset(auth, code, newPassword);
        },

        async authenticateWithGoogle() {
            const provider = new GoogleAuthProvider();
            const auth = getAuth();

            const { user } = await signInWithPopup(auth, provider);

            if (!user) {
                throw new Error('User not found');
            }

            // Check if user document exists in Firestore
            const userRef = doc(getFirestore(), 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                // User exists, proceed with login
                await setDoc(userRef, {
                    name: user.displayName || '',
                    email: user.email || '',
                }, { merge: true });

                await router.replace('/dashboard');
            } else {
                // User doesn't exist, create new user document and redirect to getting-started
                await setDoc(userRef, {
                    name: user.displayName || '',
                    email: user.email || '',
                }, { merge: true });

                await user.getIdToken(true);
                await router.replace('/getting-started/store-configuration');
            }
        },
    };
});
