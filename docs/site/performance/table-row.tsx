import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {QueryCell} from './query-cell'
import type {DbRow, Query} from './types'

interface Attrs {
    row: DbRow
}

export class TableRow extends MithrilComponent<Attrs> {
    view(vnode: Vnode<Attrs>) {
        const {row} = vnode.attrs ?? {}
        if (!row) return <tr />
        const lastSample = row.lastSample
        const queries = lastSample?.topFiveQueries ?? []
        return m('tr', {key: row.dbname}, [
            m('td.dbname', {key: `${row.dbname}-dbname`}, row.dbname),
            m('td.query-count', {key: `${row.dbname}-count`}, [
                m('span', {class: lastSample?.countClassName ?? 'label'}, lastSample?.nbQueries ?? 0),
            ]),
            ...queries.map((query: Query, i: number) => m(QueryCell as any, {key: `${row.dbname}-q${i}`, query})),
        ])
    }
}
