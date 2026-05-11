export type DomainError<Code extends string = string> = {
  code: Code;
  message: string;
  details?: unknown;
};

export type Ok<T> = {
  ok: true;
  value: T;
};

export type Err<Code extends string = string> = {
  ok: false;
  error: DomainError<Code>;
};

export type Result<T, Code extends string = string> = Ok<T> | Err<Code>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<Code extends string>(
  code: Code,
  message: string,
  details?: unknown
): Err<Code> {
  return {
    ok: false,
    error: details === undefined ? { code, message } : { code, message, details }
  };
}

export function isOk<T, Code extends string>(result: Result<T, Code>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, Code extends string>(result: Result<T, Code>): result is Err<Code> {
  return !result.ok;
}

export function unwrap<T, Code extends string>(result: Result<T, Code>): T {
  if (result.ok) {
    return result.value;
  }

  throw new Error(`${result.error.code}: ${result.error.message}`);
}
