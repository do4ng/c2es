import { Parser } from 'acorn';
import { traverse } from 'estraverse';
import MagicString from 'magic-string';
import { TransformOptions } from '.';

export function process(code: string, options?: TransformOptions) {
  const string = new MagicString(code);
  const ast = Parser.parse(code, { ecmaVersion: 'latest' });

  const requirePrefix = options?.requirePrefix || '$$require_';

  const imports: string[][] = [];

  const $ = {
    dynamic: false,
    module: false,

    count: 9,
  };

  traverse(ast, {
    enter: (node) => {
      if (node.type === 'CallExpression' && node.callee.name === 'require') {
        const name = node.arguments[0].value;

        if (node.arguments[0].type === 'Literal') {
          $.count += 1;

          imports.push([name, $.count.toString(36)]);

          string.overwrite(
            node.start,
            node.end,
            `$$m(${requirePrefix}${$.count.toString(36)})`
          );

          $.module = true;
        } else {
          string.overwrite(
            node.start,
            node.end,
            `$$dynamic(${code.slice(node.arguments[0].start, node.arguments[0].end)})`
          );

          $.dynamic = true;
        }
      }
    },
  });
  string.appendLeft(0, options?.insert?.beforeImport || '');

  for (const load of imports) {
    string.appendLeft(0, `import * as ${requirePrefix}${load[1]} from "${load[0]}";\n`);
  }

  string.appendLeft(0, options?.insert?.afterImport || '');
  string.appendLeft(0, options?.insert?.beforeDefines || '');

  if ($.dynamic) {
    if (options?.dynamicImport) {
      string.appendLeft(
        0,
        'var $$dynamic=async(m)=>{if(global.require){return require(m)}return $$m(await import(m))};'
      );

      $.module = true;
    } else {
      string.appendLeft(
        0,
        // eslint-disable-next-line no-template-curly-in-string
        'var $$dynamic=(m)=>{if(global.require){return require(m)}throw new Error(`Cannot load module "${m}"`)};'
      );
    }
  }

  if ($.module) {
    string.appendLeft(0, 'var $$m=(m)=>m.default||m;');
  }
  string.appendLeft(0, 'var module={exports:{}};');
  string.appendLeft(0, options?.insert?.afterDefines || '');
  string.append(options?.insert?.beforeExport || '');
  string.append('export default module.exports;');

  string.append(options?.insert?.afterExport || '');

  return {
    code: string.toString(),
    sourcemap: string.generateMap().toString(),
  };
}
