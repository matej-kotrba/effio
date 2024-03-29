import Sandbox from '@nyariv/sandboxjs';
import { isEqual } from 'lodash';

addEventListener('message', async (event) => {
  const code = event.data.code;
  const tests = event.data.tests;
  const logs: any[] = [];

  const oldConsoleLog = console.log;
  console.log = (...args) => {
    args.forEach((arg) => {
      if (typeof arg === 'object' || typeof arg === 'function') {
        logs[logs.length - 1].push(JSON.stringify(arg));
      } else {
        logs[logs.length - 1].push(arg);
      }
    });
  };
  const sandbox = new Sandbox();
  console.log = oldConsoleLog;

  for (let i = 0; i < tests.length; i++) {
    const item = tests[i];
    logs[i] = [];

    try {
      const exec = sandbox.compile(code);
      const scriptResult = exec({ data: JSON.parse(item.input) }).run();
      const output = JSON.parse(item.output);
      if (isEqual(scriptResult, output)) {
        postMessage({
          passed: true,
          result: scriptResult,
          logs: logs[i],
          index: i
        });
      } else {
        postMessage({
          passed: false,
          result: scriptResult,
          logs: logs[i],
          index: i
        });
      }
    } catch (e) {
      postMessage({
        passed: false,
        result: e,
        logs: [...logs[i], String(e)],
        index: i
      });
    }
  }
});
