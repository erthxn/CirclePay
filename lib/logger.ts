type LogEntry = {
  ts: string;
  type: string;
  handle: string;
  status: string;
  detail: string;
  durationMs: number;
};

const MAX = 200;
const logs: LogEntry[] = [];

export function logEvent(entry: Omit<LogEntry, 'ts'>) {
  logs.unshift({
    ts: new Date().toISOString(),
    ...entry,
  });
  if (logs.length > MAX) logs.pop();
}

export function getLogs() {
  return logs.slice(0, 100);
}
