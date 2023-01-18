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


