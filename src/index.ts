import { writeFileSync } from 'node:fs';
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

export async function c2es(entry: string, output: string, options?: TransformOptions) {
  const processed = await process(entry, options);

  if (options?.map?.emit) {
    writeFileSync(options?.map?.dist || `${output}.map`, processed.sourcemap);
  }

  writeFileSync(output, processed.code);
}

export { process };
