import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  isRegister = false,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  isRegister?: boolean;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {isRegister && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="username"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Username
          </Label>

          <Input
            id="username"
            name="username"
            className="bg-muted text-md md:text-sm"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            required
            autoFocus
          />
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus={!isRegister}
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
        />
      </div>

      {children}
    </Form>
  );
}
