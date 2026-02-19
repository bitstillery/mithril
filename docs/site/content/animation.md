<!--meta-description
Basic CSS animations with Mithril: enter on create, exit with onbeforeremove.
-->

# Animations

Use CSS animations for enter effects. Use `onbeforeremove` to animate before removal — return a Promise that resolves when the animation ends.

```css
.animate-in {
    animation: slide-in 0.4s ease-out;
}
.animate-out {
    animation: slide-out 0.4s ease-in;
}
@keyframes slide-in {
    from {
        opacity: 0;
        transform: translateY(-12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes slide-out {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-12px);
    }
}
```

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $show = state({on: true}, 'anim.show')

class Box extends MithrilComponent {
    onbeforeremove(vnode: m.VnodeDOM) {
        vnode.dom.classList.add('animate-out')
        return new Promise((resolve) => {
            vnode.dom.addEventListener('animationend', resolve)
        })
    }
    view() {
        return (
            <div class='animate-in' style='padding:12px;background:#2c313c;border-radius:4px;'>
                Hello
            </div>
        )
    }
}

class App extends MithrilComponent {
    view() {
        return (
            <div>
                <button onclick={() => ($show.on = !$show.on)}>Toggle</button>
                {$show.on ? <Box /> : null}
            </div>
        )
    }
}

m.mount(document.body, App)
```

Animate only `opacity` and `transform` when possible — these are hardware-accelerated.
