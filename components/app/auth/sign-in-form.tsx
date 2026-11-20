'use client';

import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/business/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { getAuthError } from '@/lib/auth/errors';
import type { AuthField } from '@/lib/auth/errors';

export function SignInForm() {
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
    const identifier = String(data.get('identifier') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const issues: { field: AuthField; message: string }[] = [];

    if (!identifier) {
      issues.push({ field: 'identifier', message: t('auth.shared.identifierRequired') });
    }

    if (!password) {
      issues.push({ field: 'password', message: t('auth.shared.passwordRequired') });
    } else if (password.length < 6 || password.length > 24) {
      issues.push({ field: 'password', message: t('auth.shared.passwordHelp') });
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
      const result = identifier.includes('@')
        ? await authClient.signIn.email({ email: identifier, password, rememberMe: data.get('rememberMe') === 'on' })
        : await authClient.signIn.username({
            username: identifier,
            password,
            rememberMe: data.get('rememberMe') === 'on',
          });

      if (result.error) {
        const { fields, message } = getAuthError(result.error, 'auth.signIn.error');

        setInvalidFields(fields);
        toast.error(t(message));

        const input = form.elements.namedItem(fields[0] ?? '');

        if (input instanceof HTMLInputElement) {
          input.focus();
        }

        return;
      }

      toast.success(t('auth.signIn.success'));
      router.replace('/dashboard');
      router.refresh();
    } catch {
      toast.error(t('auth.signIn.error'));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <section className="w-full" aria-labelledby="auth-title">
      <form
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
            <FieldLabel htmlFor="auth-identifier">{t('auth.shared.identifier')}</FieldLabel>
            <Input
              id="auth-identifier"
              name="identifier"
              aria-invalid={invalidFields.includes('identifier')}
              autoComplete="username"
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
              autoComplete="current-password"
              required
              minLength={6}
              maxLength={24}
              disabled={pending}
            />
          </Field>

          <Field orientation="horizontal">
            <Checkbox id="auth-remember" name="rememberMe" defaultChecked disabled={pending} />
            <FieldLabel htmlFor="auth-remember">{t('auth.shared.rememberMe')}</FieldLabel>
          </Field>
        </FieldGroup>
        <div className="mt-10 flex justify-center">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            {t(`auth.signIn.${pending ? 'submitting' : 'submit'}`)}
          </Button>
        </div>
      </form>
    </section>
  );
}
