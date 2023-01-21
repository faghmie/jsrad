# Product Roadmap

## General

1. Distribution: Setup Github-Actions for CI/CD to auto-build the distribution and then push it to [https://www.doagileprojects.com/](https://www.doagileprojects.com/)
2. Allow work to be save to your personal cloud-storage the way [https://www.diagrams.net/](https://www.diagrams.net/) does it
3. See if same code can be used to create a desktop version using Electron
4. Define process to allow developers to add new widgets easily. The code-base is currently shared, so need to think of where and how to keep those widgets

## Usability
5. Create a wiki for the tool
6. Create a web-page for the tool
7. Generate Documentation: relook at the structure of the documentation being generated
8. Allow documentation to be written in markdown (my biznous.net tool already does this, so I need to port it)
9. Ability to remove a project from the browser-storage
10. Open New Project dialogue should have a section that allows user to select "system examples/templates"
   1. Create an example or template for each type of element to illustrate how it is used in app-mode and with code-snippets connected

## Code Cleanup
13. General: remove all unused 3rd party libraries
13. UI-Product-Tour: refactor this and see if still applicable - initial idea was for this functionality to introduce new users to the tool.
14. Feedback.js - is meant to allow users to send feedback to my email, but need to consider an "About" dialog with a link to github where they can leave comments?
1.  General: remove all code that was meant to read data from the server.
2.  General: remove all "data-aware" code. This was only applicable because of the "server" component that use to exist
3.  User-Menu: remove class - not used currently - might use later when user-cloud-storage is introduced
4.  Mobile-Toolbar - remove this class and find way to auto-scale SidePanel.js class for mobile
5.  Card.js - convert to a class and module
6.  App.js - conver to class and module. Also remove all "data-awareness code.
7.  Find a better line drawing library - current one is custom written:
   1. JsPlumb - used before but felt clunky and "heavy"


## UI Modeller
2.  Process/Code-snippets should be stitch together using drag-n-drop of lines
3.  Allow elements to be responsive when running in app-mode. Not sure how difficult this is going to be.
4.  Implement "re-use from existing" - code already exists but needs to be refactored to fit into the new code.
5.  Widgets/Toolbox - allow for "section" to be collapsable - accordian-like behavior
6.  Code-snippets: create a "logger" window to output messages to
7.  Shape-widgets: understand and implement a way to create rounded corners for the shapes 
9.  Shape-widgets: understand and implement a way to create allow borders to have same styles as normal html/css borders (e.g. dashed vs solid vs dotted)
10. UI-Modeller: fix z-index of "design-mode" form so that resizer is below toolboxes
11. Icon-Selector: refactor to "class" and change from font-awesome to line-awesome
12. Widget-Context-Menu: either refactor or remove this functionality
13. Image-Selector - not sure if should still be used. Might drop this, cause the way the product works now it is online only - thus image selector will be as simple as setting URL to image and not selecting a file from disk. Initially, this functionality would take an image and then upload it to "your area" and then allow then user to use that image from a link in "your space".
14. Logger.js - Meant to be a "debug-window" for code-snippets so that you can view the messages flowing. Might need to re-introduce this, but it first needs to be refactored.

## Data Modeller
3.  Data-Modeller: fix z-index of menu to be above lines
4.  Data-Modeller: Import CSV - use to allow you to import structure 