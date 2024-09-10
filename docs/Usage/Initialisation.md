# Initialising an EWC session

Once you have a folder on your machine containing EWC, you can load it into a Dyalog APL session (18.2 or later is required):

`]link.import # /path/to/ewc`

Where `/path/to/ewc` is the name of the folder that you created during [installation](Installation.md).

# EWC.Init

The function EWC.Init takes a right argument of the mode that you want to 
enable: 

* 'Desktop' to run each form in an HTMLRenderer
* 'Browser' to allow a single session from a browser
* 'Multi' to allow multiple sessions from browsers (more about that later)

For example:

`EWC.Init 'Desktop'`

`EWC.Init` will also create cover-functions `eWC`, `eWS` and so on, in the 
namespace from which Init was called. These are intended to be used
as replacements for the system functions `⎕WC`, `⎕WS`, etc.

If you would like to use a different prefix letter for these functions, you can 
provide a left argument to change the names. For example,

`'x' EWC.Init 'Browser'`

Will create functions `xWC`, `xWS` etc, and start EWC in Browser mode.

# 'Multi' Mode

In Desktop and Browser mode, your application can call EWC.Init and then immediately
continue to create GUI components using `eWC`. In browser mode, EWC.Init will not
return until a browser is connected.

However, in Multi mode, your application namespace must contain a 
function called `Initialise` which will be called when each new browser session starts,
to create the GUI for the new session.

If your application namespace contains a function called `onClose`, then it will be 
called when the browser session is terminated.

Note that in Multi mode, the only permitted prefix is 'e'.