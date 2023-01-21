# TODO

## General

- [ ] Distribution: Setup Github-Actions for CI/CD to auto-build the distribution and then push it to [https://www.doagileprojects.com/](https://www.doagileprojects.com/)
- [ ] Allow work to be save to your personal cloud-storage the way [https://www.diagrams.net/](https://www.diagrams.net/) does it
- [ ] See if same code can be used to create a desktop version using Electron
- [ ] Define process to allow developers to add new widgets easily. The code-base is currently shared, so need to think of where and how to keep those widgets

## Usability
- [ ] Create a wiki for the tool
- [ ] Create a web-page for the tool
- [ ] Generate Documentation: relook at the structure of the documentation being generated
- [ ] Allow documentation to be written in markdown (my biznous.net tool already does this, so I need to port it)
- [ ] Ability to remove a project from the browser-storage
- [ ] Open New Project dialogue should have a section that allows user to select "system examples/templates"
   - [ ] Create an example or template for each type of element to illustrate how it is used in app-mode and with code-snippets connected

## Code Cleanup
- [ ] General: remove all unused 3rd party libraries
- [ ] UI-Product-Tour: refactor this and see if still applicable - initial idea was for this functionality to introduce new users to the tool.
- [ ] Feedback.js - is meant to allow users to send feedback to my email, but need to consider an "About" dialog with a link to github where they can leave comments?
- [ ] General: remove all code that was meant to read data from the server.
- [ ] General: remove all "data-aware" code. This was only applicable because of the "server" component that use to exist
- [ ] User-Menu: remove class - not used currently - might use later when user-cloud-storage is introduced
- [ ] Mobile-Toolbar - remove this class and find way to auto-scale SidePanel.js class for mobile
- [ ] Card.js - convert to a class and module
- [ ] App.js - conver to class and module. Also remove all "data-awareness code.
- [ ] Find a better line drawing library - current one is custom written:
   - [ ] JsPlumb - used before but felt clunky and "heavy"


## UI Modeller
- [ ] Process/Code-snippets should be stitch together using drag-n-drop of lines
- [ ] Allow elements to be responsive when running in app-mode. Not sure how difficult this is going to be.
- [ ] Implement "re-use from existing" - code already exists but needs to be refactored to fit into the new code.
- [ ] Widgets/Toolbox - allow for "section" to be collapsable - accordian-like behavior
- [ ] Code-snippets: create a "logger" window to output messages to
- [ ] Shape-widgets: understand and implement a way to create rounded corners for the shapes 
- [ ] Shape-widgets: understand and implement a way to create allow borders to have same styles as normal html/css borders (e.g. dashed vs solid vs dotted)
- [ ] UI-Modeller: fix z-index of "design-mode" form so that resizer is below toolboxes
- [ ] Icon-Selector: refactor to "class" and change from font-awesome to line-awesome
- [ ] Widget-Context-Menu: either refactor or remove this functionality
- [ ] Image-Selector - not sure if should still be used. Might drop this, cause the way the product works now it is online only - thus image selector will be as simple as setting URL to image and not selecting a file from disk. Initially, this functionality would take an image and then upload it to "your area" and then allow then user to use that image from a link in "your space".
- [ ] Logger.js - Meant to be a "debug-window" for code-snippets so that you can view the messages flowing. Might need to re-introduce this, but it first needs to be refactored.

## Data Modeller
- [ ] Data-Modeller: fix z-index of menu to be above lines
- [ ] Data-Modeller: Import CSV - use to allow you to import structure 