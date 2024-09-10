# Configuration

The `EWC` namespace contains a number of variables that can be used to 
configure the system.

## PORT

Sets the port number to be used by the server. Defaults to 22322.
                         
## RESOURCES

Sets up virtual folders that contain images and other resources that your 
application might refer to. This is a 2-column matric containing pairs of virtual
folder names and real folders containing resource files. For example:

`EWC.RESOURCES←1 2⍴'images' '/tmp/myapp/images'`

This creates a virtual folder `/images/` that can be referred to when creating
ImageLists and other objects created from image files.

You can define as many resources as you like, one per row.

## FONTMAP

EWC includes a number of free fonts. FONTMAP is a font substitution table, which can
be used to map Windows font names used in existing applications to the free alternatives.
If FONTMAP is not specified, FONTMAP is initialised from FontMap. At the time this
text was written, FontMap was a 2-column matrix containing the following fonts:

|Legacy Font     | Free Font Substitute |
|----------------|----------------------|
|Segoe UI        | Merriweather         |                     
|Times New Roman | Noto Sans            |
|Courier New     | Nimbus Mono          | 

You can set

## LOGMODES

This variable allows you to control the log messages that are output to the session
while running EWC. At this stage in the development of EWC, all messages are output
for diagnostic purposes. By default, all message types are output (`EWC.LOGMODES←⎕A`). 
At the time that this text was written, the following modes existed:

- D: Debug
- E: Error
- F: Format Request
- W: Warning
- T: Transmit on WebSocket
- R: Receive on WebSocket
- C: Connect or Disconnect
- U: Unsupported feature
- N: Explicit NQ
- P: ProcessEvent
- G: WG processing

An up-to-date list can be found in the function `EWC.Log`.

## For Developers

The following configuration settings are intended for use during development of EWC
itself:

## SHOWDEVTOOLS

If you set this to 1, EWC will call `ShowDevTools 1` on each HTMLRenderer that it creates.

## JSClientFolder

If you want to override EWC's efforts to locate a folder where the JavaScript client
code resides, you can set this variable to point to a specific folder. This is only
useful if you are either a developer or on the bleeding edge of client development,
and need to switch between versions of the client.

If this variable is not set, EWC will first look for a sibling folder called
`EWC-client` in case you have a checkout of the JavaScript code in that location,
and if that does not exist use the client in the `/client/dist` folder within the
EWC folder.