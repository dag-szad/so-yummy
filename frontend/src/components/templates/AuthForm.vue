<template>
    <div class="form">
        <h1 class="form__title">{{ formTitle }}</h1>
        <form @submit.prevent="handleSubmit" class="input">
            <div
                :class="[
                    'input__container',
                    getValidationClass(usernameError, username),
                ]"
                v-if="isRegister"
            >
                <svg class="input__icon">
                    <use href="../../assets/icons/icons.svg#user-icon"></use>
                </svg>
                <input
                    id="username"
                    type="text"
                    v-model="username"
                    @input="validate('username')"
                    placeholder="Name"
                />
            </div>
            <p v-if="usernameError" class="input__error">{{ usernameError }}</p>

            <div
                :class="[
                    'input__container',
                    getValidationClass(emailError, email),
                ]"
            >
                <svg class="input__icon">
                    <use href="../../assets/icons/icons.svg#mail-icon"></use>
                </svg>
                <input
                    id="email"
                    type="email"
                    v-model="email"
                    @blur="validate('email')"
                    placeholder="Email"
                />
            </div>
            <p v-if="emailError" class="input__error">{{ emailError }}</p>

            <div
                :class="[
                    'input__container',
                    getValidationClass(passwordError, password),
                ]"
            >
                <svg class="input__icon">
                    <use
                        href="../../assets/icons/icons.svg#password-icon"
                    ></use>
                </svg>
                <input
                    id="password"
                    type="password"
                    v-model="password"
                    @input="validate('password')"
                    placeholder="Password"
                />
            </div>
            <p v-if="passwordError" class="input__error">{{ passwordError }}</p>

            <main-button
                :button-title="buttonTitle"
                shape="square"
                type="green"
                theme="light"
                size="large"
                aria-label="Submit the form"
                class="input__button"
            ></main-button>

            <p v-if="errorMessage" class="input__error">{{ errorMessage }}</p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MainButton from './MainButton.vue'

const router = useRouter()

const props = defineProps({
    destination: {
        type: String,
        required: true,
        validator: (value: string) =>
            ['login', 'register'].includes(value.toLowerCase()),
    },
})

const username = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const errorMessage = ref<string>('')

const usernameError = ref<string>('')
const emailError = ref<string>('')
const passwordError = ref<string>('')

const isRegister = computed(
    () => props.destination.toLowerCase() === 'register'
)
const formTitle = computed(() =>
    isRegister.value ? 'Registration' : 'Sign In'
)
const buttonTitle = computed(() => (isRegister.value ? 'Sign up' : 'Sign in'))

const handleSubmit = async () => {
    if (isRegister.value && !validateForm()) return
    try {
        const endpoint = isRegister.value ? '/register' : '/login'
        const payload = {
            email: email.value,
            password: password.value,
            ...(isRegister.value && { username: username.value }),
        }

        const response = await axios.post(
            `http://localhost:3000${endpoint}`,
            payload
        )

        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
            router.push('/main')
        } else {
            errorMessage.value = response.data.message || 'An error occurred'
        }
    } catch {
        errorMessage.value = 'Invalid email or password'
    }
}

const validate = (field: 'username' | 'email' | 'password') => {
    if (!isRegister.value) return

    const value =
        field === 'username'
            ? username.value
            : field === 'email'
            ? email.value
            : password.value

    if (field === 'username' && /\d/.test(value)) {
        usernameError.value = 'Username must contain only letters'
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        emailError.value = 'Invalid email format'
    } else if (field === 'password' && value.length < 8) {
        passwordError.value = 'Password must be at least 8 characters long'
    } else {
        usernameError.value = emailError.value = passwordError.value = ''
    }
}

const validateForm = () => {
    validate('username')
    validate('email')
    validate('password')
    return !usernameError.value && !emailError.value && !passwordError.value
}

const getValidationClass = (error: string, field: string) => {
    return error ? 'input--error' : field ? 'input--valid' : ''
}
</script>

<style lang="scss" scoped>
.form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    padding: 28px 32px;
    width: 100%;

    color: var(--main-white);
    background-color: var(--grey-form);

    border-radius: 30px;

    @media (min-width: 768px) {
        margin: 0;
    }

    &__title {
        font-weight: 600;
        font-size: 1.5rem;

        @media (min-width: 768px) {
            font-size: 1.75rem;
        }
    }
}

.input {
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media (min-width: 768px) {
        gap: 24px;
    }

    &__container {
        display: flex;
        align-items: center;

        padding: 16px 18px;

        border-radius: 5px;
        border: 1px solid var(--grey-form-border);

        transition: border-color 0.3s ease-in-out;

        &:hover,
        &:active,
        &:focus-within {
            border-color: var(--main-white);
            .input__icon {
                color: var(--main-white);
            }
        }

        &.input--error {
            border-color: var(--error-red);
            .input__icon {
                color: var(--error-red);
            }
        }

        &.input--valid {
            border-color: var(--correct-green);
            .input__icon {
                color: var(--correct-green);
            }
        }
    }

    &__icon {
        margin-right: 8px;

        width: 24px;
        height: 24px;

        transition: color 0.3s ease-in-out;
        color: var(--grey);
    }

    input {
        border: none;
        outline: none;
        background: transparent;

        color: var(--main-white);
        flex: 1;
    }

    &__error {
        font-size: 0.75rem;
    }

    &__button {
        margin-top: 10px;
    }
}
</style>
