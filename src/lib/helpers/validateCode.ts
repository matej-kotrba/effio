import Sandbox from "@nyariv/sandboxjs"
import isEquel from "lodash/isEqual"

export function validateCode(code: string, tests: ProgrammingQuestion["tests"]) {
  const originalConsoleLog = console.log;
  const wholeConsoleLogs: string[][] = []
  let codeConsoleLogs: string[] = [];

  // console.log = (...args: any[]) => {
  //   args.forEach((arg) => {
  //     if (typeof arg === 'object' || typeof arg === 'function') {
  //       codeConsoleLogs.push(JSON.stringify(arg));
  //     } else {
  //       codeConsoleLogs.push(arg);
  //     }
  //   });
  // };

  const sandbox = new Sandbox();

  // The 0 case does not work

  const result: boolean[] = tests.map((test, index) => {
    try {
      const exec = sandbox.compile(code);
      const compileResult = exec({ data: test.input }).run()
      wholeConsoleLogs[index] = codeConsoleLogs
      codeConsoleLogs = []
      console.log(compileResult, JSON.parse(test.output), isEquel(compileResult, JSON.parse(test.output)))
      return isEquel(compileResult, JSON.parse(test.output))
    }
    catch (e) {
      return false
    }
  })


  // console.log = originalConsoleLog;

  return {
    testPasses: result,
    consoleLogs: wholeConsoleLogs
  }
}