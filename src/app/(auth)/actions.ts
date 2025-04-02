'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { RegisterSchema } from '@/lib/validations/auth';

type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerWithEmail(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const validatedFields = RegisterSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.flatten().fieldErrors;
    const errorMessage = Object.values(firstError).flat()[0] || 'Invalid input.';
    console.error('Validation Errors:', validatedFields.error.flatten());
    return {
      error: errorMessage,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      asResponse: true,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'An error occurred during registration.' };
    }

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof APIError ? error.body?.message : 'An error occurred during registration.',
    };
  }
}

type LoginState = {
  error?: string;
  success?: boolean;
};

export async function loginWithEmail(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = Boolean(formData.get('rememberMe'));

  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe,
        callbackURL: '/dashboard',
      },
      asResponse: true,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'An error occurred during login.' };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof APIError ? error.body?.message : 'An error occurred during login.',
    };
  }
}

export async function initiateSocialLogin(provider: 'google' | 'github') {
  let response;
  try {
    console.log('initiateSocialLogin', provider);
    response = await auth.api.signInSocial({
      body: {
        provider,
        callbackURL: '/dashboard',
      },
    });
    console.log('response', response);
  } catch (error) {
    console.error('Error during signInSocial API call:', error);
    return {
      error:
        error instanceof APIError
          ? error.body?.message
          : 'An error occurred during the social sign-in process.',
    };
  }

  if (!response?.url) {
    console.error('signInSocial response missing URL');
    return { error: 'Failed to get redirect URL from social sign-in provider.' };
  }

  redirect(response.url);
}

export async function logout() {
  try {
    const response = await auth.api.signOut({
      headers: headers(),
      asResponse: true,
    });

    if (!response.success) {
      return { error: 'An error occurred during logout.' };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof APIError ? error.body?.message : 'An error occurred during logout.',
    };
  }
}

export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: headers(),
    });
  } catch (error) {
    return null;
  }
}
