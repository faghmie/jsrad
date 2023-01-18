# About
A short informal description would be: *A tool to visually create screen and process maps. It is a kind of a low/no code project*

I will get around to the documentation at some point, if there is enough interest in the project.

Any issues can be mailed to me: faghmie@gmail.com

I needed some sort of diagram tool which I could easily generate my SQL from and also play with the data in the tables to get a feel for how effective my ERD is.

I hope you find the project usefull :-)


# Introduction 

This project was started as a hobby a few years ago. The initial intent was to understand how easily one can create a drag-n-drop screen mock-up tool. Since then I might have lost some sight and deviated in some areas. At this point in time the product can do the following things:
1. Do limited general drawings using predefined elements/shapes
2. Create forms
3. Create processes that perform some task using code-snippets/components
4. Create a data-model
5. Export your drawing/forms/code-processes as documentation
6. Export your work into a JSON file
7. Automatically stores your work to the browser-storage (indexedDB)


The tool consists of the following components:
1. UI Designer
2. Data Modeller

# UI Designer

This is the starting point for any new project being created, and will be the first screen you interact with. The area operates under two modes:
1. Design Mode
2. Play Mode

## Design Mode
This is where you drag-n-drop items onto the screen and change properties about the elements. Each element has their own custom properties, and formatting of certain elements can also be done. The area offers a toolbox from which you can select the elements you wish to place onto the screen. Within the design mode you can edit the following about an element:
1. Formatting
2. Custom Properties
3. Comments (for others to read/review)
4. Documentation Notes

## Play Mode
The purpose of this mode is to allow the user to interact with the various screens with elements and processes as if it was an actual application.


# Data Modeller

You can use the program to create some basic ERD's with it.
You can then edit the data in the tables.

## Foreign keys

Simply drag-and-drop the field from the first table into the header
of the second table you want to link to.

## Documentation

Using your ERD the system will attempt to create some basic documentation.

** I still need to make it exportable to HTML. :-)


## Import - CSV

The system can import a CSV file and auto-create the table with its data.

# Product Roadmap

1. Allow work to be save to your personal cloud-storage the way [https://www.diagrams.net/](https://www.diagrams.net/) does it
2. Allow documentation to be written in markdown (my biznous.net tool already does this, so I need to port it)
3. Process/Code-snippets should be stitch together using drag-n-drop of lines
4. Find a better line drawing library - current one is custom written:
   1. JsPlumb - used before but felt clunky and "heavy"
5. Allow elements to be responsive when running in app-mode. Not sure how difficult this is going to be.
6. Implement "re-use from existing" - code already exists but needs to be refactored to fit into the new code.
7. Widgets/Toolbox - allow for "section" to be collapsable - accordian-like behavior
8. Open New Project dialogue should have a section that allows user to select "system examples/templates"
   1. Create an example or template for each type of element to illustrate how it is used in app-mode and with code-snippets connected
9. See if same code can be used to create a desktop version using Electron
10. Define process to allow developers to add new widgets easily. The code-base is currently shared, so need to think of where and how to keep those widgets
11. Code-snippets: create a "logger" window to output messages to
12. Shape-widgets: understand and implement a way to create rounded corners for the shapes 
13. Shape-widgets: understand and implement a way to create allow borders to have same styles as normal html/css borders (e.g. dashed vs solid vs dotted)
14. Create a wiki for the tool
15. Create a web-page for the tool
16. Data-Modeller: fix z-index of menu to be above lines
17. UI-Modeller: fix z-index of "design-mode" form so that resizer is below toolboxes
18. Icon-Selector: refactor to "class" and change from font-awesome to line-awesome
19. Widget-Context-Menu: either refactor or remove this functionality
20. User-Menu: remove class - not used currently - might use later when user-cloud-storage is introduced
21. UI-Product-Tour: refactor this and see if still applicable - initial idea was for this functionality to introduce new users to the tool.
22. Mobile-Toolbar - remove this class and find way to auto-scale SidePanel.js class for mobile
23. Image-Selector - not sure if should still be used. Might drop this, cause the way the product works now it is online only - thus image selector will be as simple as setting URL to image and not selecting a file from disk. Initially, this functionality would take an image and then upload it to "your area" and then allow then user to use that image from a link in "your space".
24. Logger.js - Meant to be a "debug-window" for code-snippets so that you can view the messages flowing. Might need to re-introduce this, but it first needs to be refactored.
25. Feedback.js - is meant to allow users to send feedback to my email, but need to consider an "About" dialog with a link to github where they can leave comments?
26. Card.js - convert to a class and module
27. App.js - conver to class and module. Also remove all "data-awareness code.
28. General: remove all code that was meant to read data from the server.
29. General: remove all "data-aware" code. This was only applicable because of the "server" component that use to exist
30. Distribution: Setup Github-Actions for CI/CD to auto-build the distribution and then push it to [https://www.doagileprojects.com/](https://www.doagileprojects.com/)
    
