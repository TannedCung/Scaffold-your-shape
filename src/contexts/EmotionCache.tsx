'use client';

import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider as DefaultCacheProvider } from '@emotion/react';
import { ReactNode, useState } from 'react';

export type NextAppDirEmotionCacheProviderProps = {
  options: Parameters<typeof createCache>[0];
  CacheProvider?: typeof DefaultCacheProvider;
  children: ReactNode;
};

export function NextAppDirEmotionCacheProvider(props: NextAppDirEmotionCacheProviderProps) {
  const { options, CacheProvider = DefaultCacheProvider, children } = props;

  const [registry] = useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: { name: string; isGlobal: boolean }[] = [];
    
    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (serialized.name !== undefined) {
        const name = serialized.name;
        const isGlobal = selector === '';
        inserted.push({ name, isGlobal });
      }
      return prevInsert(...args);
    };
    
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const inserted = registry.flush();
    if (inserted.length === 0) {
      return null;
    }

    const styles = '';
    const dataEmotionAttributes = new Set<string>();

    inserted.forEach(({ name, isGlobal }) => {
      dataEmotionAttributes.add(`${registry.cache.key}-${name}`);

      if (isGlobal) {
        dataEmotionAttributes.add(`${registry.cache.key}-global`);
      }
    });

    registry.cache.sheet.flush();

    return (
      <>
        {Array.from(dataEmotionAttributes).map((dataEmotionAttribute) => (
          <style
            key={dataEmotionAttribute}
            data-emotion={dataEmotionAttribute}
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        ))}
      </>
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
