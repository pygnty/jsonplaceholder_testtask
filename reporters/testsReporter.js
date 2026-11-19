export default class TestsReporter {
  constructor(_globalConfig) {
  }

  onRunComplete(_contexts, results) {
    const slowest = results.testResults
      .flatMap((file) => file.testResults)
      .filter((test) => test.duration !== null && test.duration !== undefined)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    if (slowest.length === 0) return;

    const lines = slowest.map((test) => `\t${String(test.duration)} ms  ${test.fullName}`);
    console.log(`\nSlowest tests:\n${lines.join('\n')}\n`);
  }
}
