export type LogMode = {
  quiet?: boolean;
};

let quiet = false;

export function setQuiet(value: boolean): void {
  quiet = value;
}

export function isQuiet(): boolean {
  return quiet;
}

export function ok(message: string): void {
  if (quiet) {
    return;
  }
  console.log(`✔ ${message}`);
}

export function warn(message: string): void {
  console.warn(`⚠ ${message}`);
}

export function fail(message: string): void {
  console.error(`✖ ${message}`);
}

export function info(message: string): void {
  if (quiet) {
    return;
  }
  console.log(`  ${message}`);
}

/** Always prints (used for final summaries). */
export function summary(message: string): void {
  console.log(message);
}
