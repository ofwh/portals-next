'use client';

import { LoaderCircle, Pencil, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/business/password-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { authClient } from '@/lib/auth-client';

type AccountUser = typeof authClient.$Infer.Session.user;
type AccountField = 'name' | 'username' | 'email' | 'password';
type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';
type InputField = AccountField | PasswordField;

const passwordFields: PasswordField[] = ['currentPassword', 'newPassword', 'confirmPassword'];

type AccountDialogProps = { user: AccountUser; onSaved: (user: AccountUser) => void };
type DialogFieldsState = { saving: boolean; invalidFields: InputField[] };

type AvatarUser = Pick<typeof authClient.$Infer.Session.user, 'name' | 'email' | 'image'>;

function imageUrl(value: string): string | undefined {
  try {
    const url = new URL(value);

    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function AccountAvatar({ name, email, image, large = false }: AvatarUser & { large?: boolean }) {
  const t = useTranslations();

  return (
    <Avatar className={large ? 'size-24' : 'size-18'}>
      <AvatarImage src={imageUrl(image ?? '')} alt={t('admin.settings.account.imagePreview')} />
      <AvatarFallback className={large ? 'text-2xl' : undefined}>
        {Array.from(name || email)[0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function AvatarDialog({ user, onSaved }: AccountDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(user.image ?? '');
  const [saving, setSaving] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  function changeImage(value: string) {
    setImage(value);
    setInvalid(false);
    setError(null);
  }

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current) {
      return;
    }

    const value = image.trim();

    if (value && !imageUrl(value)) {
      setInvalid(true);
      toast.error(t('admin.settings.account.imageInvalid'));
      input.current?.focus();

      return;
    }

    submitting.current = true;
    setSaving(true);
    setError(null);

    try {
      const result = await authClient.updateUser({ image: value || null });

      if (result.error) {
        const message = t('admin.settings.account.saveError');

        setError(message);
        toast.error(message);

        return;
      }

      onSaved({ ...user, image: value || null });
      toast.success(t('admin.settings.account.saved'));
      setOpen(false);
    } catch {
      const message = t('admin.settings.account.saveError');

      setError(message);
      toast.error(message);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (submitting.current) {
          return;
        }

        if (nextOpen) {
          changeImage(user.image ?? '');
        }

        setOpen(nextOpen);
      }}
    >
      <div className="relative size-18 shrink-0">
        <AccountAvatar name={user.name} email={user.email} image={user.image} />
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="bg-background dark:bg-background dark:hover:bg-muted absolute right-0 bottom-0 rounded-sm"
              disabled={saving}
              aria-label={t('admin.settings.account.editField', { field: t('admin.settings.account.image') })}
            />
          }
        >
          <Pencil />
        </DialogTrigger>
      </div>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle id="account-image-dialog-title">
            {t('admin.settings.account.editField', { field: t('admin.settings.account.image') })}
          </DialogTitle>
          <DialogDescription id="account-image-dialog-help">{t('admin.settings.account.imageHelp')}</DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-4 right-4"
          disabled={saving}
          aria-label={t('shared.close')}
          onClick={() => setOpen(false)}
        >
          <X />
        </Button>
        <div className="flex justify-center pt-2 pb-4">
          <AccountAvatar name={user.name} email={user.email} image={image} large />
        </div>
        <form
          onSubmit={submit}
          noValidate
          aria-busy={saving}
          aria-labelledby="account-image-dialog-title"
          className="flex w-full flex-col gap-4"
        >
          <Field>
            <InputGroup>
              <InputGroupInput
                ref={input}
                id="account-image"
                name="image"
                type="url"
                autoComplete="off"
                value={image}
                onChange={(event) => changeImage(event.target.value)}
                disabled={saving}
                maxLength={2048}
                aria-label={t('admin.settings.account.image')}
                aria-describedby="account-image-dialog-help"
                aria-invalid={invalid}
              />
              {image && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    disabled={saving}
                    aria-label={t('shared.clear')}
                    onClick={() => {
                      changeImage('');
                      input.current?.focus();
                    }}
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </Field>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>
              {t('shared.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <LoaderCircle className="animate-spin" />}
              {saving ? t('shared.saving') : t('shared.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NicknameDialog(props: AccountDialogProps) {
  const t = useTranslations();

  return (
    <AccountEditDialog
      {...props}
      field="name"
      renderFields={({ saving, invalidFields }) => (
        <Field>
          <FieldLabel htmlFor="account-name">{t('admin.settings.account.name')}</FieldLabel>
          <Input
            id="account-name"
            name="name"
            defaultValue={props.user.name ?? ''}
            type="text"
            autoComplete="nickname"
            required
            disabled={saving}
            maxLength={100}
            aria-describedby="account-name-dialog-help"
            aria-invalid={invalidFields.includes('name')}
          />
        </Field>
      )}
    />
  );
}

function UsernameDialog(props: AccountDialogProps) {
  const t = useTranslations();

  return (
    <AccountEditDialog
      {...props}
      field="username"
      renderFields={({ saving, invalidFields }) => (
        <Field>
          <FieldLabel htmlFor="account-username">{t('admin.settings.account.username')}</FieldLabel>
          <Input
            id="account-username"
            name="username"
            defaultValue={props.user.username ?? ''}
            type="text"
            autoComplete="username"
            required
            disabled={saving}
            maxLength={30}
            aria-describedby="account-username-dialog-help"
            aria-invalid={invalidFields.includes('username')}
          />
        </Field>
      )}
    />
  );
}

function EmailDialog(props: AccountDialogProps) {
  const t = useTranslations();

  return (
    <AccountEditDialog
      {...props}
      field="email"
      renderFields={({ saving, invalidFields }) => (
        <Field>
          <FieldLabel htmlFor="account-email">{t('admin.settings.account.email')}</FieldLabel>
          <Input
            id="account-email"
            name="email"
            defaultValue={props.user.email ?? ''}
            type="email"
            autoComplete="email"
            required
            disabled={saving}
            maxLength={254}
            aria-describedby="account-email-dialog-help"
            aria-invalid={invalidFields.includes('email')}
          />
        </Field>
      )}
    />
  );
}

function PasswordDialog(props: AccountDialogProps) {
  const t = useTranslations();

  return (
    <AccountEditDialog
      {...props}
      field="password"
      renderFields={({ saving, invalidFields }) => (
        <FieldGroup className="gap-4">
          {passwordFields.map((key) => (
            <Field key={key}>
              <FieldLabel htmlFor={`account-${key}`}>
                {key === 'confirmPassword' ? t('auth.shared.confirmPassword') : t(`admin.settings.account.${key}`)}
              </FieldLabel>
              <PasswordInput
                id={`account-${key}`}
                name={key}
                required
                disabled={saving}
                autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                minLength={key === 'currentPassword' ? undefined : 6}
                maxLength={key === 'currentPassword' ? undefined : 24}
                aria-invalid={invalidFields.includes(key)}
              />
            </Field>
          ))}
        </FieldGroup>
      )}
    />
  );
}

export function AccountForm({ user }: { user: AccountUser }) {
  const t = useTranslations();
  const { refetch } = authClient.useSession();
  const [profile, setProfile] = useState(user);

  function saved(nextUser: AccountUser) {
    setProfile(nextUser);
    void refetch();
  }

  return (
    <FieldGroup>
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel id="account-image-label">{t('admin.settings.account.image')}</FieldLabel>
          <FieldDescription>{t('admin.settings.account.imageHelp')}</FieldDescription>
        </FieldContent>
        <div data-slot="field-control">
          <AvatarDialog user={profile} onSaved={saved} />
        </div>
      </Field>
      <NicknameDialog user={profile} onSaved={saved} />
      <UsernameDialog user={profile} onSaved={saved} />
      <EmailDialog user={profile} onSaved={saved} />
      <PasswordDialog user={profile} onSaved={saved} />
    </FieldGroup>
  );
}

function AccountEditDialog({
  user,
  onSaved,
  field,
  renderFields,
}: AccountDialogProps & {
  field: AccountField;
  renderFields: (state: DialogFieldsState) => ReactNode;
}) {
  const t = useTranslations();
  const profile = user;
  const [editing, setEditing] = useState<AccountField | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<InputField[]>([]);
  const submitting = useRef(false);

  function edit(field: AccountField | null) {
    setEditing(field);
    setError(null);
    setInvalidFields([]);
  }

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const value = String(data.get(field) ?? '').trim();
    const currentPassword = String(data.get('currentPassword') ?? '');
    const newPassword = String(data.get('newPassword') ?? '');
    const issues: { field: InputField; message: string }[] = [];

    if (field === 'name' && !value) {
      issues.push({ field, message: t('admin.settings.account.nameRequired') });
    }

    if (field === 'username' && !/^[a-zA-Z0-9_.]{3,30}$/.test(value)) {
      issues.push({ field, message: t('admin.settings.account.usernameInvalid') });
    }

    if (field === 'email') {
      const input = form.elements.namedItem('email');

      if (!value || (input instanceof HTMLInputElement && input.validity.typeMismatch)) {
        issues.push({ field, message: t('auth.shared.emailInvalid') });
      }
    }

    if (field === 'password') {
      if (!currentPassword) {
        issues.push({ field: 'currentPassword', message: t('auth.shared.passwordRequired') });
      }

      if (newPassword.length < 6 || newPassword.length > 24) {
        issues.push({ field: 'newPassword', message: t('auth.shared.passwordHelp') });
      }

      if (!data.get('confirmPassword') || newPassword !== data.get('confirmPassword')) {
        issues.push({ field: 'confirmPassword', message: t('auth.shared.passwordMismatch') });
      }
    }

    setError(null);
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
    setSaving(true);

    try {
      if (field === 'email' && value.toLowerCase() === profile.email.toLowerCase()) {
        edit(null);

        return;
      }

      const result =
        field === 'password'
          ? await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
          : field === 'email'
            ? await authClient.changeEmail({ newEmail: value, callbackURL: '/settings/account' })
            : await authClient.updateUser({ [field]: value });

      if (result.error) {
        const code = result.error.code;
        let message = t('admin.settings.account.saveError');

        if (code === 'USERNAME_IS_ALREADY_TAKEN') {
          message = t('admin.settings.account.usernameTaken');
        } else if (code === 'INVALID_PASSWORD') {
          message = t('admin.settings.account.currentPasswordInvalid');
        } else if (field === 'email' && profile.emailVerified) {
          message = t('admin.settings.account.emailVerificationRequired');
        }

        setInvalidFields([field === 'password' ? 'currentPassword' : field]);
        setError(message);
        toast.error(message);

        return;
      }

      if (field === 'email') {
        const refreshed = await authClient.getSession({ query: { disableCookieCache: true } });

        if (refreshed.error || !refreshed.data) {
          throw new Error();
        }

        if (refreshed.data.user.email.toLowerCase() !== value.toLowerCase()) {
          const message = t('admin.settings.account.emailNotUpdated');

          setInvalidFields(['email']);
          setError(message);
          toast.error(message);

          return;
        }

        onSaved(refreshed.data.user);
      } else if (field !== 'password') {
        onSaved({
          ...profile,
          [field]: field === 'username' ? value.toLowerCase() : value,
        });
      } else {
        onSaved(profile);
      }

      edit(null);
      toast.success(t('admin.settings.account.saved'));
    } catch {
      const message = t('admin.settings.account.saveError');

      setError(message);
      toast.error(message);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={editing === field}
      onOpenChange={(open) => {
        if (!submitting.current) {
          edit(open ? field : null);
        }
      }}
    >
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel id={`account-${field}-label`}>{t(`admin.settings.account.${field}`)}</FieldLabel>
          <FieldDescription id={`account-${field}-help`}>{t(`admin.settings.account.${field}Help`)}</FieldDescription>
        </FieldContent>
        <div data-slot="field-control">
          <div className="flex min-h-9 w-full min-w-0 items-center justify-end gap-4">
            <span className="min-w-0 text-right text-sm break-all" aria-labelledby={`account-${field}-label`}>
              {field === 'password' ? '••••••••' : profile[field] || t('admin.settings.account.notSet')}
            </span>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={saving}
                  aria-label={t('admin.settings.account.editField', {
                    field: t(`admin.settings.account.${field}`),
                  })}
                />
              }
            >
              {t('shared.edit')}
            </DialogTrigger>
          </div>
        </div>
      </Field>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle id={`account-${field}-dialog-title`}>
            {t('admin.settings.account.editField', { field: t(`admin.settings.account.${field}`) })}
          </DialogTitle>
          <DialogDescription id={`account-${field}-dialog-help`}>
            {t(`admin.settings.account.${field}Help`)}
          </DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-4 right-4"
          disabled={saving}
          aria-label={t('shared.close')}
          onClick={() => edit(null)}
        >
          <X />
        </Button>
        <form
          id={`account-${field}-form`}
          onSubmit={submit}
          noValidate
          aria-busy={saving}
          aria-labelledby={`account-${field}-dialog-title`}
          className="flex w-full flex-col gap-4"
          onChange={(event) => {
            const input = event.target;

            if (input instanceof HTMLInputElement) {
              setInvalidFields((current) => current.filter((item) => item !== input.name));
              setError(null);
            }
          }}
        >
          {renderFields({ saving, invalidFields })}
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => edit(null)}>
              {t('shared.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <LoaderCircle className="animate-spin" />}
              {saving ? t('shared.saving') : t('shared.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
