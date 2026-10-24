# Sparkle Jewellery Website

## Files
- `index.html`: jewellery shop/listing page
- `style.css`: shop page styles
- `script.js`: shop interactions
- `products-data.js`: shared product catalogue from the supplied spreadsheet
- `product.html`: full product detail page
- `product-detail.css`: product detail page styling
- `product-detail.js`: product gallery, product details, recommendations and interactions

## Run
Keep all files in this same folder. Open `index.html` with Live Server or in a browser.
Click any product image or product name to open its full detail page. The detail page reads the selected product from the URL, for example `product.html?id=1`.

Product names, prices, descriptions, product image URLs and source links come from the existing product data. If a product only has one image URL in the spreadsheet, the gallery will show that image; additional gallery images can be added later. The original product/source link is retained in `products-data.js` for future use.

Cart and wishlist interactions are front-end demos; they are not connected to a backend or payment service.
