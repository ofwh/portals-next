'use client';

import { useCallback } from 'react';

export type CookieOptions = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
};

export function useCookie() {
  const get = useCallback((name: string): string | undefined => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const prefix = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(prefix));

    if (cookie === undefined) {
      return undefined;
    }

    const value = cookie.slice(prefix.length);

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }, []);

  const set = useCallback((name: string, value: string, options: CookieOptions = {}) => {
    if (typeof document === 'undefined') {
      return;
    }

    const attributes = [
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
      `Path=${options.path ?? '/'}`,
      `SameSite=${options.sameSite ?? 'lax'}`,
    ];

    if (options.domain) {
      attributes.push(`Domain=${options.domain}`);
    }

    if (options.maxAge !== undefined) {
      attributes.push(`Max-Age=${Math.trunc(options.maxAge)}`);
    }

    if (options.expires) {
      attributes.push(`Expires=${options.expires.toUTCString()}`);
    }

    if (options.secure ?? window.location.protocol === 'https:') {
      attributes.push('Secure');
    }

    document.cookie = attributes.join('; ');
  }, []);

  const remove = useCallback(
    (name: string, options: CookieOptions = {}) => {
      set(name, '', { ...options, maxAge: 0, expires: new Date(0) });
    },
    [set],
  );

  return { get, set, remove };
}
