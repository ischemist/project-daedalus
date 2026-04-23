# design guide

this is the practical companion to `design-philosophy.md`. philosophy answers "what should daedalus feel like?"; this answers "how should screens be built?"

the short version: daedalus is an operational tool. it should feel dense, calm, and exact. the ui should privilege scanability, stable layout, and fast repeated action over decorative composition.

## 1. variants are product language

daedalus uses a small semantic variant vocabulary:

- `aegean`: platform identity, navigation, route/results surfaces
- `forge`: actions that enqueue work or start execution
- `anvil`: structural chrome, neutral comparison state, admin surfaces
- `destructive`: irreversible or failure-oriented actions
- `default`: neutral chrome

variants are not decoration. when a page has a domain, pass the variant through the components that support it instead of hand-writing local color classes. buttons use intensity modifiers (`aegeanSolid`, `aegeanOutline`, `aegeanGhost`) to express action weight inside the same family.

## 2. neutral chrome, themed signals

the shell stays neutral. color appears where attention belongs: active nav, selected rows, focused controls, page headers, primary actions, and state badges. avoid tinting structural scaffolding just because a page has a theme.

## 3. page frame

prefer one of these shapes:

- full frame: themed header band + dense stats + content below.
- minimal frame: plain content region when breadcrumbs carry enough context.
- full-height workspace: split rails and one large work surface for route graphs, queues, schedulers, and other operational views.
- container: independent admin panels.
- edge-to-edge: dashboards where real estate matters more than reading width.

use `PAGE_GRADIENT`, `PAGE_HEADER_PADDING`, and `THEME_TOKENS` instead of rewriting frame classes inline.

## 4. hierarchy through density

headings should be modest. make hierarchy by changing density:

- header band: dense, terse, summary-oriented.
- rails: compact list controls and selected state.
- work surface: larger, stable, and uncluttered.

do not solve every grouping problem with cards. cards are for repeated objects, dialogs, and genuinely framed tools. page sections and workspaces should usually be bordered bands, rails, or unframed layouts.

## 5. list patterns

there are two primary list shapes:

- data table: when rows are operated on in place with sorting, filtering, or inline state changes.
- pill/rail row: when rows are navigational entities that select or open another surface.

routes currently use rail rows: targets select route sets, route rows select a single route or comparison role. this is better than card stacks because the user is scanning many related records.

## 6. url is view state

filters, selected route ids, view mode, comparison mode, and open detail surfaces should live in search params. `useState` is for temporary local interaction, not for state that should survive refresh or be shareable.

## 7. skeletons

skeletons should be the page with data redacted. same rails, same row counts where possible, same graph frame. do not use a single spinner when the eventual page shape is known.

## 8. mobile is a swap when needed

if desktop and mobile need different shapes, render different components at breakpoints. shrinking a dense operational table until it becomes unreadable is worse than a small amount of duplicated markup.

## 9. icons are typography

use `lucide-react`. icons should name or qualify nearby text; they are not decoration. keep sizes on the existing scale and inherit color where possible. no emoji in product ui.

## 10. route/results pages

route visualization pages should feel like workspaces:

- header band for target identity and route-set stats.
- left rail for target selection.
- second rail for route selection.
- large uninterrupted graph surface.
- view mode as url state: `single`, `compare`, `overlay`.

avoid nesting graph panes inside cards. the graph is the work surface.

single route mode should be uncolored by default. reference comparisons may use the syntharena green/orange language because one route is privileged. prediction comparisons should not imply correctness: shared nodes use a neutral anvil/slate signal, route-specific nodes use forge bronze, and route b is distinguished with dashed line style rather than a separate judgment hue. multi-route overlays use forge intensity instead of per-route colors.
