# The Demo Application
 
The EWC repository contains a folder named `demo`, which contains a
collection of forms that have been used to test EWC during development,
After linking the EWC folder to your active workspace, you can launch
this application by calling `demo.Run` with a right argument that selects
the mode (one of 'Desktop', 'Browser' or 'Multi'):

`]link.create # /path/to/ewc`
`demo.Run 'Desktop'`

Every window that is created by the Demo app contains a drop-down at the
top right, which allows you to pick one of the sample apps. There is also
a button with the caption "Stop", which can be used to end the demo.
Finally, for use by developers (or curious users), and when running in
Desktop modde, there is a button with the caption "Inspect", which will
open a DevTools window for the active HTMLRenderer window.

The demo application also works in 'Multi' mode, which means you can 
connect several browser sessions to it and see how cloning works. The `demo`
namespace contains both an `Initialise` function that starts a new session
in Multi mode, and an `onClose` function that is called when a session ends.