import Sandbox from "@nyariv/sandboxjs"
import isEquel from "lodash/isEqual"

export function validateCode(code: string, tests: ProgrammingQuestion["tests"], recursionCalls = 0) {
  if (recursionCalls > 10) return { testPasses: [], consoleLogs: [] }
  if (!Sandbox.prototype) {
    setTimeout(() => {
      return validateCode(code, tests, recursionCalls + 1)
    }, 100)
  }

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

  const result: boolean[] = tests.map((test, index) => {
    try {
      const exec = sandbox.compile(code);
      const compileResult = exec({ data: JSON.parse(test.input) }).run()
      wholeConsoleLogs[index] = codeConsoleLogs
      codeConsoleLogs = []
      return isEquel(compileResult, JSON.parse(test.output))
    }
    catch (e) {
      return false
    }
  })


  console.log = originalConsoleLog;

  return {
    testPasses: result,
    consoleLogs: wholeConsoleLogs
  }
}