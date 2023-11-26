import Sandbox from "@nyariv/sandboxjs"
import isEquel from "lodash/isEqual"

export function validateCode(code: string, tests: ProgrammingQuestion["tests"]) {
  const originalConsoleLog = console.log;
  const wholeConsoleLogs: string[][] = []
  let codeConsoleLogs: string[] = [];

  console.log = (...args: any[]) => {
    args.forEach((arg) => {
      if (typeof arg === 'object' || typeof arg === 'function') {
        codeConsoleLogs.push(JSON.stringify(arg));
      } else {
        codeConsoleLogs.push(arg);
      }
    });
  };

  const sandbox = new Sandbox();
  const exec = sandbox.compile(code);

  const result: boolean[] = tests.map((test, index) => {
    exec({ input: test.input }).run()
    wholeConsoleLogs[index] = codeConsoleLogs
    codeConsoleLogs = []
    return isEquel(result, test.output)
  })


  console.log = originalConsoleLog;

  return {
    testPasses: result,
    consoleLogs: wholeConsoleLogs
  }
}