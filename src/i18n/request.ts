
import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

// Can't be static because it reads cookies
export const dynamic = 'force-dynamic';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'sv';
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
