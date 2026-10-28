import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript-api'
import { catalog } from '../src/catalog.ts'

const root = path.resolve(import.meta.dirname, '..')
const folder = path.join(root, 'src/components/image-ui')
const program = ts.createProgram(
  catalog.map((item) => path.join(folder, item.id + '.tsx')),
  {
    target: ts.ScriptTarget.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  },
)
const checker = program.getTypeChecker()
const api = {}
const canvasFields = new Set([
  'nodes',
  'edges',
  'onNodesChange',
  'onEdgesChange',
  'onConnect',
  'onGenerate',
  'onPromptChange',
  'onAddNode',
])
for (const item of catalog) {
  const source = program.getSourceFile(path.join(folder, item.id + '.tsx'))
  const name = item.id
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
  const declaration = source.statements.find(
    (statement) => ts.isInterfaceDeclaration(statement) && statement.name.text === name + 'Props',
  )
  if (!declaration) throw new Error('Missing public interface for ' + item.id)
  const type = checker.getTypeAtLocation(declaration)
  const defaults = {}
  const component = source.statements.find(
    (statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === name,
  )
  const bindings = component?.parameters[0]?.name
  if (bindings && ts.isObjectBindingPattern(bindings))
    for (const element of bindings.elements)
      if (element.initializer)
        defaults[element.name.getText(source)] = ts.isStringLiteral(element.initializer)
          ? element.initializer.text
          : element.initializer.getText(source)
  api[item.id] = type
    .getProperties()
    .filter((symbol) => item.id !== 'generative-canvas' || canvasFields.has(symbol.name))
    .map((symbol) => {
      const required = !(symbol.flags & ts.SymbolFlags.Optional)
      let typeName = checker.typeToString(
        checker.getTypeOfSymbolAtLocation(symbol, declaration),
        declaration,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
      )
      if (!required) typeName = typeName.replace(/ \| undefined$/, '')
      return {
        name: symbol.name,
        type: typeName,
        required,
        ...(Object.hasOwn(defaults, symbol.name) ? { default: defaults[symbol.name] } : {}),
      }
    })
}
const sharedTypes = await readFile(path.join(folder, 'types.ts'), 'utf8')
const canvas = program
  .getSourceFile(path.join(folder, 'generative-canvas.tsx'))
  .statements.find(
    (statement) => ts.isTypeAliasDeclaration(statement) && statement.name.text === 'CanvasNode',
  )
  .getText()
await mkdir(path.join(root, 'src/docs'), { recursive: true })
await writeFile(
  path.join(root, 'src/docs/generated-api.json'),
  JSON.stringify({ components: api, sharedTypes, canvasNode: canvas }, null, 2) + '\n',
)
console.log(
  `Generated types, optionality, and destructured defaults for ${catalog.length} public component interfaces.`,
)
