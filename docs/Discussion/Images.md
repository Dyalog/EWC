# Images

In EWC all images are defined using images files, which can be in any format
supported by web browsers. You can not refer directly to image files on your
local machine, the images must be served up by the web server whic his embedded
in EWC.

The location of your images must be declared by setting the variable EWC.RESOURCES
before calling EWC.Init, for example:

`EWC.RESOURCES←1 2⍴'images' '/tmp/myapp/images'`

This creates a virtual folder `/images/` that can be referred to when using images.

The ImageList object has a new property `Files`, which contains a list of the
file names that define the ImageList. It is not possible to populate an
ImageList by creating child icons and bitmap objects, as in `⎕WC`.

The `File` property of an Icon, and the `Picture` property of a `Button`, `Form`
and several other properties, are also affected by this.

See the [Configuration] for more details.