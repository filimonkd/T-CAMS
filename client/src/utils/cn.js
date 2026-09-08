/**
 * Tiny classname joiner. Accepts strings, arrays and conditional objects and
 * drops anything falsy, which is all the `clsx`/`classnames` API surface this
 * project actually uses - so no dependency is added for it.
 *
 *   cn('a', cond && 'b', { c: isC })  ->  'a b c'
 */
export default function cn(...inputs) {
  const out = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(' ');
}
