# 2q.js
2q.js is a tool I use to make elements dynamically in JS without multiple lines of createElement, set content, styles, appending them to a parent and so forth.

Similar functionallity looks like this in 2q.js: `document.body.q('img.big-image', {src: 'myimage.png'})`

This tool is still in development, and as I find bugs and come up with features, I fix and add them as needed. If you find a bug or have a feature request, just make an Issue.

## An Example

This should show how 2q.js can improve your development experience:

```js
import getProducts from 'somewhere';
import formatPrice from 'somewhere';

const productListContainer = document.getElementById('products');

getProducts().then(products => {
  products.forEach(product => {
    productListContainer.q('.product', [
      q('img.product-image', { src: product.image }),
      q('.product-name', { text: product.name }),
      q('.product-price', { text: formatPrice(product.price) }),
      q('.product-description', { text: product.description }),
      q('.button.button-buy', { text: 'Buy' }),
    ]);
  });
});
```
