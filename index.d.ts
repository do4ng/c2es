export interface TransformOptions {
  dynamicImport?: boolean;
  requirePrefix?: string;
}

export function c2es(entry: string, output: string, options?: TransformOptions): void;

export function process(
  code: string,
  options?: TransformOptions
): { code: string; sourcemap: string };
