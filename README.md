# ix-modal

Minimal repro: iX modals break under `ng serve` with Angular 22.1 (Vite 8 / rolldown) when zone.js is loaded.

`broken` and `working` differ only in `polyfills` (`angular.json`);
`excluded` keeps zone.js but takes iX out of Vite's prebundling (the workaround):

| Command            | polyfills     | Prebundle target    | iX bundled by           | Modal  |
| ------------------ | ------------- | ------------------- | ----------------------- | ------ |
| `npm run broken`   | `["zone.js"]` | browsers + `es2016` | rolldown/oxc (prebundle) | broken |
| `npm run working`  | `[]`          | browsers only       | rolldown/oxc (prebundle) | works  |
| `npm run excluded` | `["zone.js"]` | browsers + `es2016` | Angular's esbuild        | works  |

Run one server at a time: both share `.angular/cache`, and switching re-optimizes the deps.

```sh
npm run broken                          # then, in a 2nd terminal:
npm run check -- http://localhost:4300  # modal off-center, stays open, TDZ error

npm run working
npm run check -- http://localhost:4301  # modal centered, closes, 0 errors

npm run excluded
npm run check -- http://localhost:4302  # modal centered, closes, 0 errors (zone.js still loaded)
```

`check` uses Playwright; set `CHROMIUM_PATH` to a local Chrome/headless shell if Playwright's own browser isn't installed.

See the rewritten code the browser actually runs:

```sh
grep -c '_assertClassBrand(t, this' .angular/cache/22.1.7/ix-modal/vite/deps/@siemens_ix-angular_standalone.js
```

Why: for zone.js apps `@angular/build` appends `es2016` to the rolldown prebundle target
(`node_modules/@angular/build/src/builders/dev-server/vite/index.js:296-299`), so oxc lowers iX's
`static #e` private fields. iX's minified class is named `t` and `ensureCache()` has a local `const t`,
so the lowered `_assertClassBrand(t, …)` hits that local in its TDZ:
https://github.com/oxc-project/oxc/issues/27376
