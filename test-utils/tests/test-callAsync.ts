'use strict'

import {describe, test, expect} from 'bun:test';

import callAsync from '../../test-utils/callAsync';

describe('callAsync', () => {
    test('works', async() => {
        let count = 0;

        await new Promise(resolve => {
            callAsync(() => {
                expect(count).toBe(1);
                resolve();
            });
            count++;
        });
    });

    test('gets called before setTimeout', async() => {
        await new Promise((resolve, reject) => {
            let timeout;

            callAsync(() => {
                clearTimeout(timeout);
                resolve();
            });

            timeout = setTimeout(() => {
                reject(new Error('callAsync was called too slow'));
            }, 5);
        });
    });
});
