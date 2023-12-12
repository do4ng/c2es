import { readFileSync, writeFileSync } from 'fs';
import { process } from './process';

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
  map?: {
    emit?: boolean;
    dist?: string;
  };
}

export function c2es(entry: string, output: string, options?: TransformOptions) {
  const code = readFileSync(entry);
  const processed = process(code.toString(), options);

  if (options?.map?.emit) {
    writeFileSync(options?.map?.dist || `${output}.map`, processed.sourcemap);
  }

  writeFileSync(output, processed.code);
}

export { process };
