import { describe, expect, test } from 'bun:test'
import { diffAnswer, type DiffPart } from '../src/ui/diff'

const changed = (parts: DiffPart[]) => parts.filter((p) => p.changed).map((p) => p.text)

describe('diffAnswer', () => {
  test('identical answers have no changes', () => {
    const d = diffAnswer('const x = 5;', 'const x = 5;')
    expect(changed(d.answer)).toEqual([])
    expect(changed(d.model)).toEqual([])
  })

  test('marks a wrong word on both sides', () => {
    const d = diffAnswer('luvut.pop(4);', 'luvut.push(4);')
    expect(changed(d.answer)).toEqual(['pop'])
    expect(changed(d.model)).toEqual(['push'])
  })

  test('marks what is missing from the answer', () => {
    const d = diffAnswer('console.log("Hei maailma)', 'console.log("Hei maailma");')
    expect(changed(d.answer)).toEqual([])
    expect(changed(d.model)).toEqual(['"'])
  })

  test('ignores whitespace, semicolons and quote style like the checker', () => {
    const d = diffAnswer("const  nimi='Ada'", 'const nimi = "Ada";')
    expect(changed(d.answer)).toEqual([])
    expect(changed(d.model)).toEqual([])
  })

  test('keeps the original text intact', () => {
    const answer = 'if (x > 1) {\n  y++\n}'
    const model = 'if (x >= 1) {\n  y++;\n}'
    const d = diffAnswer(answer, model)
    expect(d.answer.map((p) => p.text).join('')).toBe(answer)
    expect(d.model.map((p) => p.text).join('')).toBe(model)
    expect(changed(d.model)).toEqual(['='])
  })
})
