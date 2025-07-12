/**
 * Utilities for deep object manipulation and validation
 * Zero-dependency, fully typed, cycle-safe implementations
 */

/**
 * Options for configuring undefined field detection
 */
export interface FindUndefinedFieldsOptions {
    /** Include symbol-keyed properties in the search (includes non-enumerable symbols) */
    includeSymbols?: boolean;
    /** Include non-enumerable properties in the search */
    includeNonEnumerable?: boolean;
    /** Follow property getters (with try/catch protection) */
    followGetters?: boolean;
    /** Label to use for root-level undefined (default: '<root>') */
    rootLabel?: string;
}

/**
 * Options for configuring deep equality comparison
 */
export interface IsEqualOptions {
    /** Include symbol-keyed properties in comparison (includes non-enumerable symbols) */
    includeSymbols?: boolean;
    /** Include non-enumerable properties in comparison */
    includeNonEnumerable?: boolean;
    /** Follow property getters (with try/catch protection) */
    followGetters?: boolean;
    /** Custom comparator function. Return undefined to use default logic. */
    comparator?: (a: unknown, b: unknown) => boolean | undefined;
}

/**
 * PathBuilder utility for efficient path construction
 */
class PathBuilder {
    private segments: string[] = [];

    push(segment: string): void {
        this.segments.push(segment);
    }

    pop(): void {
        this.segments.pop();
    }

    build(): string {
        // Avoid regex: manually handle leading dot removal
        const joined = this.segments.join('');
        return joined.startsWith('.') ? joined.slice(1) : joined;
    }

    get depth(): number {
        return this.segments.length;
    }
}

/**
 * Recursively finds all fields with undefined values in an object,
 * including nested objects and arrays. Protected against circular references.
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: undefined, c: { d: undefined } };
 * findUndefinedFields(obj); // ['b', 'c.d']
 *
 * // Root-level undefined
 * findUndefinedFields(undefined); // ['<root>']
 *
 * // With options
 * findUndefinedFields(obj, { rootLabel: 'ROOT', followGetters: true });
 * ```
 *
 * @param value - The value to validate
 * @param options - Configuration options
 * @returns Array of field paths that have undefined values (empty array if none found)
 */
export function findUndefinedFields<T extends object>(
    value: T,
    options?: FindUndefinedFieldsOptions
): string[];
export function findUndefinedFields(
    value: unknown,
    options?: FindUndefinedFieldsOptions
): string[];
export function findUndefinedFields(
    value: unknown,
    options: FindUndefinedFieldsOptions = {}
): string[] {
    const {
        includeSymbols = false,
        includeNonEnumerable = false,
        followGetters = false,
        rootLabel = '<root>',
    } = options;

    // Handle root-level undefined
    if (value === undefined) {
        return [rootLabel];
    }

    const undefinedFields: string[] = [];
    const visited = new WeakSet<object>();
    const pathBuilder = new PathBuilder();

    function traverse(current: unknown): void {
        // Handle primitives and null
        if (current === null || typeof current !== 'object') {
            return;
        }

        // Cycle detection
        if (visited.has(current)) {
            return;
        }
        visited.add(current);

        // Handle arrays
        if (Array.isArray(current)) {
            current.forEach((item, index) => {
                pathBuilder.push(`[${index}]`);

                if (item === undefined) {
                    undefinedFields.push(pathBuilder.build());
                } else {
                    traverse(item);
                }

                pathBuilder.pop();
            });
            return;
        }

        // Handle objects - optimize key collection
        let keys: (string | symbol)[];

        if (includeNonEnumerable && includeSymbols) {
            // Use Reflect.ownKeys for most comprehensive key collection
            keys = Reflect.ownKeys(current);
        } else {
            const stringKeys = includeNonEnumerable
                ? Object.getOwnPropertyNames(current)
                : Object.keys(current);

            const symbolKeys = includeSymbols
                ? Object.getOwnPropertySymbols(current)
                : [];

            keys = [...stringKeys, ...symbolKeys];
        }

        // Process all keys
        for (const key of keys) {
            const keyStr = typeof key === 'symbol' ? key.toString() : key;
            pathBuilder.push(pathBuilder.depth === 0 ? keyStr : `.${keyStr}`);

            const descriptor = Object.getOwnPropertyDescriptor(current, key);
            let propertyValue: unknown;

            if (descriptor) {
                if ('value' in descriptor) {
                    propertyValue = descriptor.value;
                } else if (followGetters && descriptor.get) {
                    // Try to read getter value safely
                    try {
                        propertyValue = descriptor.get.call(current);
                    } catch {
                        // Skip getters that throw
                        pathBuilder.pop();
                        continue;
                    }
                } else {
                    // Skip write-only properties or when not following getters
                    pathBuilder.pop();
                    continue;
                }
            } else {
                propertyValue = (current as Record<string | symbol, unknown>)[key];
            }

            if (propertyValue === undefined) {
                undefinedFields.push(pathBuilder.build());
            } else {
                traverse(propertyValue);
            }

            pathBuilder.pop();
        }
    }

    traverse(value);
    return undefinedFields;
}

/**
 * Compares two values for deep structural equality.
 * Handles primitives, objects, arrays, Maps, Sets, dates, regexes, BigInt, and circular references.
 *
 * Note: WeakMap/WeakSet comparisons fall back to reference equality due to their opaque nature.
 *
 * @example
 * ```typescript
 * // Basic usage
 * isEqual([1, 2, 3], [1, 2, 3]); // true
 * isEqual({ a: 1 }, { a: 1 }); // true
 *
 * // BigInt support
 * isEqual(123n, 123n); // true
 * isEqual(new Number(42), new Number(42)); // true
 *
 * // Custom comparator
 * const options = {
 *   comparator: (a, b) => {
 *     if (typeof a === 'string' && typeof b === 'string') {
 *       return a.toLowerCase() === b.toLowerCase();
 *     }
 *     return undefined; // Use default logic
 *   }
 * };
 * isEqual('Hello', 'HELLO', options); // true
 *
 * // Jest test example:
 * describe('objectUtils', () => {
 *   test('compares BigInt values', () => {
 *     expect(isEqual(123n, 123n)).toBe(true);
 *     expect(isEqual(123n, 124n)).toBe(false);
 *   });
 * });
 * ```
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param options - Configuration options
 * @returns true if values are deeply equal, false otherwise
 */
export function isEqual<T>(a: T, b: unknown, options?: IsEqualOptions): b is T {
    const {
        includeSymbols = false,
        includeNonEnumerable = false,
        followGetters = false,
        comparator,
    } = options || {};

    // Use a WeakMap to track compared pairs for cycle detection
    const comparedPairs = new WeakMap<object, WeakSet<object>>();

    function compare(x: unknown, y: unknown): boolean {
        // Try custom comparator first
        if (comparator) {
            const customResult = comparator(x, y);
            if (customResult !== undefined) {
                return customResult;
            }
        }

        // Identical references or equal primitives (including NaN)
        if (Object.is(x, y)) return true;

        // Handle BigInt
        if (typeof x === 'bigint' && typeof y === 'bigint') {
            return x === y;
        }

        // Handle primitive wrapper objects
        if (isPrimitiveWrapper(x) && isPrimitiveWrapper(y)) {
            return Object.is(x.valueOf(), y.valueOf());
        }

        // Type guards for primitives
        if (x === null || y === null || typeof x !== 'object' || typeof y !== 'object') {
            return false;
        }

        // Cycle detection
        if (hasCycleConflict(x, y)) return false;
        markCompared(x, y);

        // Handle special object types
        if (x instanceof Date && y instanceof Date) {
            return x.getTime() === y.getTime();
        }

        if (x instanceof RegExp && y instanceof RegExp) {
            return x.source === y.source && x.flags === y.flags;
        }

        // Handle Map
        if (x instanceof Map && y instanceof Map) {
            if (x.size !== y.size) return false;
            for (const [key, value] of x) {
                if (!y.has(key) || !compare(value, y.get(key))) {
                    return false;
                }
            }
            return true;
        }

        // Handle Set - optimized O(n) comparison using Map for lookups
        if (x instanceof Set && y instanceof Set) {
            if (x.size !== y.size) return false;

            // Convert y to a Map for efficient lookups
            const yValuesMap = new Map<unknown, boolean>();
            for (const value of y) {
                yValuesMap.set(value, false); // false = not yet matched
            }

            // Check each value in x against y
            for (const xValue of x) {
                let found = false;
                for (const [yValue, matched] of yValuesMap) {
                    if (!matched && compare(xValue, yValue)) {
                        yValuesMap.set(yValue, true); // Mark as matched
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            }

            return true;
        }

        // Handle WeakMap and WeakSet (can only check constructor)
        if ((x instanceof WeakMap && y instanceof WeakMap) ||
            (x instanceof WeakSet && y instanceof WeakSet)) {
            return x === y; // Reference equality for weak collections
        }

        // Handle ArrayBuffer and typed arrays
        if (x instanceof ArrayBuffer && y instanceof ArrayBuffer) {
            if (x.byteLength !== y.byteLength) return false;
            const view1 = new Uint8Array(x);
            const view2 = new Uint8Array(y);
            for (let i = 0; i < view1.length; i++) {
                if (view1[i] !== view2[i]) return false;
            }
            return true;
        }

        // Handle typed arrays
        if (ArrayBuffer.isView(x) && ArrayBuffer.isView(y)) {
            if (x.constructor !== y.constructor) return false;
            if (x.byteLength !== y.byteLength) return false;
            const view1 = new Uint8Array(x.buffer, x.byteOffset, x.byteLength);
            const view2 = new Uint8Array(y.buffer, y.byteOffset, y.byteLength);
            for (let i = 0; i < view1.length; i++) {
                if (view1[i] !== view2[i]) return false;
            }
            return true;
        }

        // Handle arrays
        if (Array.isArray(x) && Array.isArray(y)) {
            if (x.length !== y.length) return false;
            for (let i = 0; i < x.length; i++) {
                if (!compare(x[i], y[i])) return false;
            }
            return true;
        }

        // Type mismatch (one array, one not)
        if (Array.isArray(x) || Array.isArray(y)) {
            return false;
        }

        // Handle plain objects - optimize key collection
        let keysX: (string | symbol)[];
        let keysY: (string | symbol)[];

        if (includeNonEnumerable && includeSymbols) {
            keysX = Reflect.ownKeys(x);
            keysY = Reflect.ownKeys(y);
        } else {
            const stringKeysX = includeNonEnumerable
                ? Object.getOwnPropertyNames(x)
                : Object.keys(x);
            const stringKeysY = includeNonEnumerable
                ? Object.getOwnPropertyNames(y)
                : Object.keys(y);

            const symbolKeysX = includeSymbols
                ? Object.getOwnPropertySymbols(x)
                : [];
            const symbolKeysY = includeSymbols
                ? Object.getOwnPropertySymbols(y)
                : [];

            keysX = [...stringKeysX, ...symbolKeysX];
            keysY = [...stringKeysY, ...symbolKeysY];
        }

        if (keysX.length !== keysY.length) return false;

        // Check all properties
        for (const key of keysX) {
            if (!Object.prototype.hasOwnProperty.call(y, key)) return false;

            const valueX = getPropertyValue(x, key, followGetters);
            const valueY = getPropertyValue(y, key, followGetters);

            // Skip properties that couldn't be read
            if (valueX === SKIP_PROPERTY || valueY === SKIP_PROPERTY) {
                continue;
            }

            if (!compare(valueX, valueY)) {
                return false;
            }
        }

        return true;
    }

    function hasCycleConflict(x: object, y: object): boolean {
        const xPairs = comparedPairs.get(x);
        return xPairs ? xPairs.has(y) : false;
    }

    function markCompared(x: object, y: object): void {
        if (!comparedPairs.has(x)) {
            comparedPairs.set(x, new WeakSet());
        }
        if (!comparedPairs.has(y)) {
            comparedPairs.set(y, new WeakSet());
        }
        comparedPairs.get(x)!.add(y);
        comparedPairs.get(y)!.add(x);
    }

    return compare(a, b);
}

/**
 * @internal
 * Helper symbol for skipping properties that can't be read
 */
const SKIP_PROPERTY = Symbol('SKIP_PROPERTY');

/**
 * Safely gets a property value, handling getters if enabled
 */
function getPropertyValue(obj: object, key: string | symbol, followGetters: boolean): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (descriptor) {
        if ('value' in descriptor) {
            return descriptor.value;
        } else if (followGetters && descriptor.get) {
            try {
                return descriptor.get.call(obj);
            } catch {
                return SKIP_PROPERTY;
            }
        } else {
            return SKIP_PROPERTY;
        }
    }

    return (obj as Record<string | symbol, unknown>)[key];
}

/**
 * Checks if a value is a primitive wrapper object
 */
function isPrimitiveWrapper(value: unknown): value is number | string | boolean {
    return (value instanceof Number) ||
           (value instanceof String) ||
           (value instanceof Boolean);
}
