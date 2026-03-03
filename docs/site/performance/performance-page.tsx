import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {PerformanceWithoutSignals} from './performance-without-signals'
import {PerformanceWithSignals} from './performance-with-signals'

type TabId = 'without-signals' | 'with-signals'

const DEMO_COMPONENTS = {
    'without-signals': PerformanceWithoutSignals,
    'with-signals': PerformanceWithSignals,
} as const

/** Mounts the active demo via m.mount so signal updates trigger synchronous redraw (ADR-0015). */
const PerformanceMount = {
    onbeforeupdate(vnode: Vnode<{activeTab: TabId}>, old: Vnode<{activeTab: TabId}>) {
        const tab = vnode.attrs?.activeTab ?? 'without-signals'
        const oldTab = old?.attrs?.activeTab ?? 'without-signals'
        if (tab === oldTab) return false // Tab unchanged - skip patch to preserve m.mount content
        return true
    },
    oncreate(vnode: Vnode<{activeTab: TabId}>) {
        const tab = vnode.attrs?.activeTab ?? 'without-signals'
        m.mount(vnode.dom as HTMLElement, DEMO_COMPONENTS[tab] as any)
    },
    onupdate(vnode: Vnode<{activeTab: TabId}>) {
        const tab = vnode.attrs?.activeTab ?? 'without-signals'
        m.mount(vnode.dom as HTMLElement, DEMO_COMPONENTS[tab] as any)
    },
    onremove(vnode: Vnode<{activeTab: TabId}>) {
        m.mount(vnode.dom as HTMLElement, null)
    },
    view(vnode: Vnode<{activeTab: TabId}>) {
        return <div class='performance-mount' />
    },
}

export class PerformancePage extends MithrilComponent {
    activeTab: TabId = 'without-signals'

    view() {
        const activeTab = this.activeTab

        return (
            <div class='performance-page'>
                <div class='docs-sandbox-tabs performance-tabs'>
                    <button
                        class={activeTab === 'without-signals' ? 'docs-sandbox-tab active' : 'docs-sandbox-tab'}
                        onclick={() => {
                            this.activeTab = 'without-signals'
                            m.redraw()
                        }}
                    >
                        Without signals
                    </button>
                    <button
                        class={activeTab === 'with-signals' ? 'docs-sandbox-tab active' : 'docs-sandbox-tab'}
                        onclick={() => {
                            this.activeTab = 'with-signals'
                            m.redraw()
                        }}
                    >
                        With signals
                    </button>
                </div>
                <div class='performance-tab-panel'>
                    <p>
                        {activeTab === 'without-signals'
                            ? 'Uses m.redraw() every frame to update the table.'
                            : 'Uses state() for reactivity—no m.redraw() needed.'}
                    </p>
                    {m(PerformanceMount as any, {activeTab})}
                </div>
            </div>
        )
    }
}
