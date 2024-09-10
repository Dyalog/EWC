# Form

The EWC implementation of [`⎕WC` class Form](https://help.dyalog.com/19.0/index.htm#GUI/Objects/Form.htm) has some degree of support for:

| Properties|  |  |  |
|--|--|--|--|
 |  [BCol](https://help.dyalog.com/19.0/index.htm#GUI/Properties/BCol.htm)        |  [Coord](https://help.dyalog.com/19.0/index.htm#GUI/Properties/Coord.htm)      |  [Posn](https://help.dyalog.com/19.0/index.htm#GUI/Properties/Posn.htm)        |                                                                         |
 |  [CSS](https://help.dyalog.com/19.0/index.htm#GUI/Properties/CSS.htm)          |  [Flex](https://help.dyalog.com/19.0/index.htm#GUI/Properties/Flex.htm)        |  [Size](https://help.dyalog.com/19.0/index.htm#GUI/Properties/Size.htm)        |                                                                         |
 |  [Caption](https://help.dyalog.com/19.0/index.htm#GUI/Properties/Caption.htm)  |  [Picture](https://help.dyalog.com/19.0/index.htm#GUI/Properties/Picture.htm)  |  [Visible](https://help.dyalog.com/19.0/index.htm#GUI/Properties/Visible.htm)  |                                                                         |


| Events|  |  |  |
|--|--|--|--|
 |  [Configure](https://help.dyalog.com/19.0/index.htm#GUI/MethodOrEvents/Configure.htm)  |  [MouseDown](https://help.dyalog.com/19.0/index.htm#GUI/MethodOrEvents/MouseDown.htm)  |  [MouseUp](https://help.dyalog.com/19.0/index.htm#GUI/MethodOrEvents/MouseUp.htm)  |                                                                                       |

NB: Links above are to the complete `⎕WC` documentation

## Known Limitations

Coord defaults to Pixel, Size to 400 600 and Posn to 100 100.
The `Picture` property must refer to a file which resides in one of the folders
defined in the EWC.RESOURCES array. See [Images](../Usage/Configuration.md)
for more information.
