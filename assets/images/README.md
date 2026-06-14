# Images

The `placeholder-*.svg` files in this folder are temporary stand-ins so the
gallery looks intentional before real photos are added.

## Adding real photos

The easiest way is through the **content editor** at `/admin/` — open the
**Photo Gallery** entry and upload images there. They will be saved into this
folder automatically and the gallery will update.

If you prefer to add them by hand:

1. Drop your `.jpg` / `.png` / `.webp` files into this folder.
2. Edit `content/gallery.json` and point each `src` at your file, e.g.
   `"src": "assets/images/front-entrance.jpg"`.

**Tips for great-looking photos**

- Aim for landscape or square images at least 1200px wide.
- Compress them (e.g. [squoosh.app](https://squoosh.app)) so pages load fast.
- Keep file names lowercase with dashes, no spaces.
