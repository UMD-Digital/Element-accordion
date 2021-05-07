# &lt;umd-accordion&gt; element

## Installation

```
$ yarn add @umd/accordion
```

## Usage

```js
import '@umd/accordion';
```

```html
<umd-accordion>
  <button aria-controls="example-1">Example 1</button>
  <div aria-hidden="true" id="example-1">
    <div class="rich-text">
      <p>Example Text</p>
    </div>
  </div>

  <button aria-controls="example-2">Example 2</button>
  <div aria-hidden="true" id="example-2">
    <div class="rich-text">
      <p>Example 2 Text</p>
    </div>
  </div>
</umd-accordion>
```

## CSS Styling. Default styling is in place. The shadow DOM styles can't be overwrite but you can globally umd-accordion.

```css
umd-accordion:not(:defined) {
  display: none;
}

umd-accordion:defined {
  display: block;
  max-width: 50%;
  margin: 50px auto;
}
```

## License

Distributed under the MIT license. See LICENSE for details.
