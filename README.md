sauvage
=======

Mobile application for "sauvage de ma rue" citizen science project

Install notes
-------------

Developement and build environment relies on Git and Node.js (>= 0.8). Please,
ensure you have this tools installed on your computer.

To build the project, run the following commands::

    cd <project root>/
    npm install
    grunt

If you encounter any error, please update Node/NPM to a recent stable release
before trying anything else.

This will make a production release of the code (minification, etc) and put it
in the `build/` directory.