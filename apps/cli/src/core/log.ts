export function ok(message: string): void {
  console.log(`✔ ${message}`);
}

export function warn(message: string): void {
  console.warn(`⚠ ${message}`);
}

export function fail(message: string): void {
  console.error(`✖ ${message}`);
}

export function info(message: string): void {
  console.log(`  ${message}`);
}
