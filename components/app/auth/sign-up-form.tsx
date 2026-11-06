'use client';

import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/business/password-input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { getAuthError } from '@/lib/auth/errors';
import type { AuthField } from '@/lib/auth/errors';

export function SignUpForm() {
  const t = useTranslations();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [invalidFields, setInvalidFields] = useState<AuthField[]>([]);
  const submitting = useRef(false);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get('password') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const username = String(data.get('username') ?? '').trim();

    const email = String(data.get('email') ?? '').trim();
    const emailInput = form.elements.namedItem('email');
    const issues: { field: AuthField; message: string }[] = [];

    if (!name) {
      issues.push({ field: 'name', message: t('auth.shared.nameRequired') });
    }

    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) {
      issues.push({ field: 'username', message: t('auth.shared.usernameInvalid') });
    }

    if (!email || (emailInput instanceof HTMLInputElement && emailInput.validity.typeMismatch)) {
      issues.push({ field: 'email', message: t('auth.shared.emailInvalid') });
    }

    if (!password) {
      issues.push({ field: 'password', message: t('auth.shared.passwordRequired') });
    } else if (password.length < 6 || password.length > 24) {
      issues.push({ field: 'password', message: t('auth.shared.passwordHelp') });
    }

    if (!data.get('confirmPassword') || password !== data.get('confirmPassword')) {
      issues.push({ field: 'confirmPassword', message: t('auth.shared.passwordMismatch') });
    }

    setInvalidFields(issues.map((issue) => issue.field));

    if (issues.length > 0) {
      toast.error(issues[0].message);

      const input = form.elements.namedItem(issues[0].field);

      if (input instanceof HTMLInputElement) {
        input.focus();
      }

      return;
    }

    submitting.current = true;
    setPending(true);

    try {
      const result = await authClient.signUp.email({ name, username, email, password });

      if (result.error) {
        const { fields, message } = getAuthError(result.error, 'auth.signUp.error');

        setInvalidFields(fields);
        toast.error(t(message));

        const input = form.elements.namedItem(fields[0] ?? '');

        if (input instanceof HTMLInputElement) {
          input.focus();
        }

        return;
      }

      toast.success(t('auth.signUp.success'));
      router.replace('/dashboard');
      router.refresh();
    } catch {
      toast.error(t('auth.signUp.error'));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <section className="flex w-full items-center justify-center" aria-labelledby="auth-title">
      <form
        className="flex w-full flex-col gap-10"
        onSubmit={submit}
        aria-busy={pending}
        noValidate
        onChange={(event) => {
          const input = event.target;

          if (input instanceof HTMLInputElement) {
            setInvalidFields((fields) => fields.filter((field) => field !== input.name));
          }
        }}
      >
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="auth-name">{t('auth.shared.name')}</FieldLabel>
            <Input
              id="auth-name"
              name="name"
              aria-invalid={invalidFields.includes('name')}
              autoComplete="nickname"
              required
              maxLength={100}
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="auth-username">{t('auth.shared.username')}</FieldLabel>
            <Input
              id="auth-username"
              name="username"
              aria-invalid={invalidFields.includes('username')}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_.]+"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="auth-email">{t('auth.shared.email')}</FieldLabel>
            <Input
              id="auth-email"
              name="email"
              aria-invalid={invalidFields.includes('email')}
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              disabled={pending}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="auth-password">{t('auth.shared.password')}</FieldLabel>
            <PasswordInput
              id="auth-password"
              name="password"
              aria-invalid={invalidFields.includes('password')}
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={24}
              disabled={pending}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="auth-confirm-password">{t('auth.shared.confirmPassword')}</FieldLabel>
            <PasswordInput
              id="auth-confirm-password"
              name="confirmPassword"
              minLength={6}
              aria-invalid={invalidFields.includes('confirmPassword')}
              autoComplete="new-password"
              required
              maxLength={24}
              disabled={pending}
            />
          </Field>
        </FieldGroup>
        <div className="flex justify-center">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            {t(`auth.signUp.${pending ? 'submitting' : 'submit'}`)}
          </Button>
        </div>
      </form>
    </section>
  );
}
