import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';

export const useGluedEmotionCache = (key = 'emotion') => {
  const [cache] = useState(() => {
    const cache = createCache({ key });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const entries = Object.entries(cache.inserted);
    if (entries.length === 0) return null;
    const names = entries
      .map(([n]) => n)
      .filter((n) => typeof n === 'string')
      .join(' ');
    const styles = entries.map(([, s]) => s).join('\n');
    const emotionKey = `${key} ${names}`;
    return <style data-emotion={emotionKey} dangerouslySetInnerHTML={{ __html: styles }} />;
  });

  return cache;
};
