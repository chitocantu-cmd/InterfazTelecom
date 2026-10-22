// Markdown mínimo para los artículos del centro técnico, sin HTML crudo (no hay forma de inyectar etiquetas).
// Admite: ## y ### títulos, párrafos, listas con «-» o «1.», tablas con «|», citas «>» (se muestran como nota),
// **negritas**, *cursivas*, `código` y [enlaces](/ruta o https://…). Lo demás se muestra como texto.
import { Fragment, type ReactNode } from 'react'
import { Link } from '../i18n/Link'

type Block =
  | { kind: 'h2' | 'h3' | 'p' | 'note'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    if (line.startsWith('### ')) { blocks.push({ kind: 'h3', text: line.slice(4).trim() }); i++; continue }
    if (line.startsWith('## ')) { blocks.push({ kind: 'h2', text: line.slice(3).trim() }); i++; continue }
    if (/^\s*[-*] /.test(line) || /^\s*\d+\. /.test(line)) {
      const ordered = /^\s*\d+\. /.test(line)
      const items: string[] = []
      while (i < lines.length && (ordered ? /^\s*\d+\. /.test(lines[i]) : /^\s*[-*] /.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.) /, '').trim())
        i++
      }
      blocks.push({ kind: ordered ? 'ol' : 'ul', items })
      continue
    }
    if (line.trim().startsWith('|') && lines[i + 1]?.trim().match(/^\|?\s*:?-{3,}/)) {
      const head = cells(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]))
      blocks.push({ kind: 'table', head, rows })
      continue
    }
    if (line.startsWith('>')) {
      const text: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) text.push(lines[i++].replace(/^>\s?/, ''))
      blocks.push({ kind: 'note', text: text.join(' ') })
      continue
    }
    const text: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |>|\s*[-*] |\s*\d+\. |\s*\|)/.test(lines[i])) text.push(lines[i++].trim())
    blocks.push({ kind: 'p', text: text.join(' ') })
  }
  return blocks
}

/** Texto en línea: **negritas**, *cursivas*, `código` y [enlaces](destino). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((\S+?)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1]) out.push(<strong key={k++} className="font-semibold text-ink">{m[1]}</strong>)
    else if (m[2]) out.push(<em key={k++}>{m[2]}</em>)
    else if (m[3]) out.push(<code key={k++} className="bg-mist px-1 font-mono text-[0.9em]">{m[3]}</code>)
    else if (m[4] && m[5]) {
      const href = m[5]
      out.push(href.startsWith('/')
        ? <Link key={k++} to={href} className="font-medium text-corp link-line">{m[4]}</Link>
        : <a key={k++} href={/^https?:\/\//.test(href) ? href : '#'} target="_blank" rel="noopener noreferrer" className="font-medium text-corp link-line">{m[4]}</a>)
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source }: { source: string }) {
  return (
    <>
      {parseMarkdown(source).map((b, i) => {
        switch (b.kind) {
          case 'h2': return <h2 key={i} className="mt-14 text-h3 first:mt-0">{inline(b.text)}</h2>
          case 'h3': return <h3 key={i} className="mt-10 text-h4">{inline(b.text)}</h3>
          case 'p': return <p key={i} className="mt-5 text-body">{inline(b.text)}</p>
          case 'note': return <p key={i} className="mt-6 border-l-2 border-tech bg-ice/60 px-5 py-4 text-small text-body">{inline(b.text)}</p>
          case 'ul': return <ul key={i} className="mt-5 space-y-2.5">{b.items.map((it, j) => <li key={j} className="flex gap-3 text-body"><span aria-hidden className="mt-[0.8em] h-px w-3 shrink-0 bg-corp" /><span>{inline(it)}</span></li>)}</ul>
          case 'ol': return <ol key={i} className="mt-5 space-y-2.5">{b.items.map((it, j) => <li key={j} className="flex gap-3 text-body"><span className="font-mono text-[0.85rem] text-corp tabular">{String(j + 1).padStart(2, '0')}</span><span>{inline(it)}</span></li>)}</ol>
          case 'table': return (
            <div key={i} className="mt-6 overflow-x-auto" tabIndex={0} role="region" aria-label={b.head.join(' · ')}>
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead><tr className="border-b border-ink/80">{b.head.map((h, j) => <th key={j} scope="col" className="pb-3 pr-5 text-small font-medium text-muted">{inline(h)}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, j) => <tr key={j} className="border-b border-line">{r.map((c, n) => (n === 0 ? <th key={n} scope="row" className="py-3.5 pr-5 align-top text-small font-medium text-ink">{inline(c)}</th> : <td key={n} className="py-3.5 pr-5 align-top text-small text-body">{inline(c)}</td>))}</tr>)}</tbody>
              </table>
            </div>
          )
          default: return <Fragment key={i} />
        }
      })}
    </>
  )
}
