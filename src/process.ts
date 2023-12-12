import { builtinModules } from 'node:module';
import { Parser } from 'acorn';
import { parse } from 'cjs-module-lexer';
import { traverse } from 'estraverse';
import MagicString from 'magic-string';
import { TransformOptions } from '.';

export function process(code: string, options?: TransformOptions) {
  const string = new MagicString(code);
  const ast = Parser.parse(code, { ecmaVersion: 'latest' });

  const requirePrefix = options?.requirePrefix || '$$require_';

  const imports: Record<string, string> = {};

  const $ = {
    dynamic: false,
    module: false,

    count: 9,
  };

  const { exports } = parse(code);

  traverse(ast, {
    enter: (node) => {
      if (node.type === 'CallExpression' && node.callee.name === 'require') {
        let name = node.arguments[0].value;

        if (builtinModules.includes(name)) {
          name = `node:${name}`;
        }

        if (node.arguments[0].type === 'Literal') {
          let target;

          if (imports[name]) {
            target = imports[name];
          } else {
            $.count += 1;

            imports[name] = $.count.toString(36);
            target = imports[name];
          }

          string.overwrite(node.start, node.end, `$$m(${requirePrefix}${target})`);

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

  for (const load of Object.keys(imports)) {
    string.appendLeft(
      0,
      `import * as ${requirePrefix}${imports[load]} from "${load}";\n`
    );
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
  string.append('var $$default=module.exports;');
  string.append(
    `var {${exports
      .map((exporter) => `${exporter}:$$export_${exporter}`)
      .join(',')}}=module.exports;`
  );
  string.append(
    `export {${exports
      .map((exporter) => `$$export_${exporter} as ${exporter}`)
      .join(',')}${exports.length === 0 ? '' : ','}$$default as default};`
  );

  string.append(options?.insert?.afterExport || '');

  return {
    code: string.toString(),
    sourcemap: string.generateMap().toString(),
  };
}
