# Introduction

EWC stands for "Everywhere Window Create". EWC is a cross-platform implementation of the `⎕WC` family of system functions
(`⎕WC, ⎕WS, ⎕WG, ⎕WN, ⎕NQ and ⎕DQ`) that are available in Dyalog APL
for Microsoft Windows.

EWC only supports a subset of the functionality provided by `⎕WC`.
This subset is growing, driven by the requirements of early adopters.
The supported subset is [documented in the object reference](ObjectRef/Classes.md).

!!!Note
     At this time, EWC is work in progress, and not supported via 
     normal channels. A supported release of EWC is expected in mid-2025.

EWC can run in "Desktop" mode using an HTMLRenderer. In this mode, EWC supports multiple forms in the same way as `⎕WC`, creating one HTMLRenderer for each form.

Alternatively, EWC can be initialised in "Browser" mode, in which case it starts a listener on the configured port (22322 by default), and a Browser must be connected to that port. In this mode, it really only makes sense to have a single form, although modeal MsgBox's can be
popped up if required.

Finally, there is an experimental "Multi" mode, intended to support 
multi-user applications. In this mode, EWC must also be used via browsers. 
For each connection, the application namespace is cloned.
If the application namespace is called `demo`, then clones will be named
`demo_1`, `demo_2` etc. This allows each session to have separate state.

The browser-based modes can be used on any Dyalog-supported platform,
desktop mode is restricted to the platforms where the HTMLRenderer is
available - currently Linux, MacOS and Windows.

# Getting Started

Check out the [installation instructions](Usage/Installation.md), the section on
[initialisation](Usage/Initialisation.md), or the [implementation details](Discussion/TechDetails.md).

If you are not familiar with `⎕WC`, you may want to start with the standard Dyalog
documentation for this feature. The documentation for `EWC` only discusses differences
between the original Win32 based implementation (`⎕WC`) and the emulation (`EWC`).

!!!Note
     During prototyping, the project has been known as JSWC, or "JavaScript WC". 
     Both the code and the documentation for EWC still contain references to JSWC.
     Until the transition is complete, JSWC should be read as EWC anywhere that it occurs.
     