import { Parser } from 'acorn';
import { traverse } from 'estraverse';
import MagicString from 'magic-string';
import { TransformOptions } from '.';

export function process(code: string, options?: TransformOptions) {
  const string = new MagicString(code);
  const ast = Parser.parse(code, { ecmaVersion: 'latest' });

  const imports: {
    type: 'property' | 'all' | 'dynamic';
    value: string;
    id: string | string[];
    as: string;
    loc: {
      start: number;
      end: number;
    };
    original?: string;
  }[] = [];

  const requirePrefix = options?.requirePrefix || '$$require_';

  let addDynamicRequire = false;
  let addModuleImporter = false;

  traverse(ast, {
    enter: (node, parent) => {
      if (
        node.type === 'CallExpression' &&
        node.callee.name === 'require' &&
        parent.type === 'VariableDeclarator'
      ) {
        parent._require = true;
        parent._node = node;
      } else if (
        node.type === 'CallExpression' &&
        node.callee.name === 'require' &&
        parent.type !== 'VariableDeclarator'
      ) {
        string.overwrite(node.callee.start, node.callee.end, '$$dynamic_require');
        addDynamicRequire = true;
      } else if (node.type === 'ObjectPattern') {
        node._isproperties = true;
        node._properties = [];
        node._original = code.slice(node.start, node.end);
        parent._isproperties = true;
      } else if (node.type === 'Property' && parent._isproperties) {
        parent._properties.push({ [node.key.name]: node.value.name });
      }
    },

    leave: (node, parent) => {
      if (node._require) {
        // parent: VariableDeclaration
        // node: VariableDeclarator
        // node._node: CallExpression

        const args = node.init.arguments[0];

        const id = code.slice(args.start, args.end);
        let type: any;

        if (args.type !== 'Literal') {
          type = 'dynamic';
        }

        if (node._isproperties) {
          imports.push({
            type: type || 'property',
            value: id,
            as: node.id._properties
              .map(
                (key) =>
                  `${Object.keys(key)[0]} as ${requirePrefix}${Object.values(key)[0]}`
              )
              ?.join(','),
            id: (node.id._properties as string[]).map((p) => Object.values(p)[0]),
            original: node.id._original,
            loc: {
              start: parent.start,
              end: parent.end,
            },
          });
        } else {
          imports.push({
            type: type || 'all',
            value: id,
            id: node.id.name,
            as: `${requirePrefix}${node.id.name}`,
            original: node.id._original,
            loc: {
              start: parent.start,
              end: parent.end,
            },
          });
        }
      }
    },
  });

  for (const importer of imports) {
    switch (importer.type) {
      case 'all':
        addModuleImporter = true;

        string.overwrite(
          importer.loc.start,
          importer.loc.end,
          `var ${importer.id}=$$m(${requirePrefix}${importer.id});`
        );
        string.appendLeft(0, `import * as ${importer.as} from ${importer.value};`);
        break;

      case 'property':
        string.overwrite(
          importer.loc.start,
          importer.loc.end,
          (importer.id as string[])
            .map((id) => `var ${id}=${requirePrefix}${id};`)
            .join('')
        );
        string.appendLeft(0, `import {${importer.as}} from ${importer.value};`);
        break;

      case 'dynamic':
        string.overwrite(
          importer.loc.start,
          importer.loc.end,
          `var ${importer.original || importer.as} = $$dynamic_require(${
            importer.value
          });`
        );
        addDynamicRequire = true;
        break;

      default:
        break;
    }
  }

  if (addDynamicRequire) {
    if (options?.dynamicImport) {
      addModuleImporter = true;

      string.appendLeft(
        0,
        // eslint-disable-next-line no-template-curly-in-string
        'var $$dynamic_require=async(m)=>{if(require){return require(m)}return $$m(await import(m))};'
      );
    } else {
      string.appendLeft(
        0,
        // eslint-disable-next-line no-template-curly-in-string
        'var $$dynamic_require=(m)=>{if(require){return require(m)}throw new Error(`Cannot load module "${m}"`)};'
      );
    }
  }

  if (addModuleImporter) {
    string.appendLeft(0, 'var $$m=(m)=>m.default||m;');
  }

  string.appendLeft(0, 'var module={exports:{}};');
  string.append('export default module;');

  return {
    code: string.toString(),
    sourcemap: string.generateMap().toString(),
  };
}
