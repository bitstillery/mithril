import {MithrilComponent} from '../../../index'
import m from '../../../index'
import {PerformanceWithoutSignals} from './performance-without-signals'
import {PerformanceWithSignals} from './performance-with-signals'

type TabId = 'without-signals' | 'with-signals'

export class PerformancePage extends MithrilComponent {
    activeTab: TabId = 'without-signals'

    view() {
        const activeTab = this.activeTab

        return m('div.performance-page', [
            m('div.docs-sandbox-tabs.performance-tabs', [
                m(
                    'button.docs-sandbox-tab',
                    {
                        class: activeTab === 'without-signals' ? 'active' : '',
                        onclick: () => {
                            this.activeTab = 'without-signals'
                            m.redraw()
                        },
                    },
                    'Without signals',
                ),
                m(
                    'button.docs-sandbox-tab',
                    {
                        class: activeTab === 'with-signals' ? 'active' : '',
                        onclick: () => {
                            this.activeTab = 'with-signals'
                            m.redraw()
                        },
                    },
                    'With signals',
                ),
            ]),
            activeTab === 'without-signals'
                ? m('div.performance-tab-panel', [
                      m('p', 'Uses m.redraw() every frame to update the table.'),
                      m(PerformanceWithoutSignals as any),
                  ])
                : m('div.performance-tab-panel', [
                      m('p', 'Uses state() for reactivity—no m.redraw() needed.'),
                      m(PerformanceWithSignals as any),
                  ]),
        ])
    }
}
