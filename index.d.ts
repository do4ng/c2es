export interface TransformOptions {
  dynamicImport?: boolean;
  requirePrefix?: string;
  insert?: {
    beforeImport?: string;
    afterImport?: string;
    beforeDefines?: string;
    afterDefines?: string;
    beforeExport?: string;
    afterExport?: string;
  };
}

export function c2es(
  entry: string,
  output: string,
  options?: TransformOptions
): Promise<void>;

export function process(
  path: string,
  options?: TransformOptions
): Promise<{ code: string; sourcemap: string }>;
