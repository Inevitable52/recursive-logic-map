const { spawn } = require('child_process');

const py = spawn('python', ['../python/part_m.py']);

function runPartM(patterns, partL, partN) {
  return new Promise((resolve, reject) => {
    const payload = {
      type: 'run',
      data: {
        patterns,
        partL: { enabled: !!partL },
        partN: {
          confidence: partN?.selfModel?.confidence ?? 0.5,
          patternsLen: Percy.PartL?.Patterns?.length || 0
        }
      }
    };

    const message = JSON.stringify(payload) + '\n';
    py.stdin.write(message);

    let buffer = '';

    const onData = (data) => {
      buffer += data.toString();
      if (buffer.includes('\n')) {
        py.stdout.removeListener('data', onData);
        try {
          const result = JSON.parse(buffer.trim());
          resolve(result);
        } catch (e) {
          reject(e);
        }
      }
    };

    py.stdout.on('data', onData);
  });
}

module.exports = { runPartM };
