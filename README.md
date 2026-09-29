# Toybox

The home page for my small web toys. Live at https://tinytoybox.me

## Toys in this repo

Each toy is a self-contained folder with its own `index.html` and `img/` folder, so any one of them can be edited without touching the others.

| Folder | Toy | What it is |
| --- | --- | --- |
| `flipside/` | [Flipside](https://tinytoybox.me/flipside/) | One tap gravity-flip runner game |
| `slice-party/` | [Slice Party](https://tinytoybox.me/slice-party/) | Swipe to slice candy blobs, dodge bombs |
| `starlight/` | [Starlight](https://tinytoybox.me/starlight/) | A musical desert night sky |
| `kalimba-rain/` | [Kalimba Rain](https://tinytoybox.me/kalimba-rain/) | Chime bars played by falling rain |
| `doodle-zoo/` | [Doodle Zoo](https://tinytoybox.me/doodle-zoo/) | Drawings that come alive as bouncy creatures |
| `goo-lab/` | [Goo Lab](https://tinytoybox.me/goo-lab/) | Squishy candy goo you can drag, slice and mix |
| `snake/` | [Snake](https://tinytoybox.me/snake/) | Retro Corner: Swipe to steer, eat the candy, and grow as long as you can. Gold stars are worth a bonus. |
| `block-drop/` | [Block Drop](https://tinytoybox.me/block-drop/) | Retro Corner: Stack the falling blocks, clear rows and chase a quad as the speed climbs. |
| `road-hop/` | [Road Hop](https://tinytoybox.me/road-hop/) | Retro Corner: Hop across busy roads and ride logs over the river. Keep moving or the screen catches you. |
| `maze-munch/` | [Maze Munch](https://tinytoybox.me/maze-munch/) | Retro Corner: Gobble every dot in a fresh maze each level. Dodge the ghosts and grab a power pellet. |
| `hangman/` | [Hangman](https://tinytoybox.me/hangman/) | Retro Corner: Guess the hidden word before the stick figure is finished. Animals, food, tech and Namibia. |
| `paddle-duel/` | [Paddle Duel](https://tinytoybox.me/paddle-duel/) | Retro Corner: Classic paddle and ball against the computer. Win a heart back every five points. |

## Adding a toy

1. Create a folder with the toy's name, containing `index.html` and `img/` (`preview.png` at 1200 by 630, plus `favicon-64.png` and `favicon-180.png`).
2. Copy the preview to `img/<name>-preview.png` and add a card to the home page `index.html`.

Plain HTML, CSS and JavaScript. No build step.

`Kalimba/` is only a redirect so the old capital K link still works.

## Shared pieces

Every toy loads one shared file, `toybox.js`, and the whole site is covered by `sw.js`.

| File | What it does |
| --- | --- |
| `toybox.js` | Shared sound and motion settings, the small menu on each toy (home, fullscreen, share, install), keeps the screen awake, blocks pull-to-refresh and double-tap zoom |
| `sw.js` | Service worker: every toy works offline after the first visit. Change `VERSION` inside it when you want to force everyone to refresh |
| `manifest.webmanifest` and `<toy>/manifest.webmanifest` | Lets the site and each toy be installed to a home screen |

Best scores are read from the browser by the home page, so a new game only needs its own folder and a card. If it uses a custom score key, add it to the list near the top of `toybox.js`.
