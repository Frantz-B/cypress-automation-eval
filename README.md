# Cypress Framework
 
 This Framework was created to explore Cypress and verify its ability to automate a specific product and covering the API/ UI test cases for that product. 
In Any automation Framework it’s always preferable to put any methods, commands, data, or files that used in the testing in separated folders, and we find out that this can be done in Cypress in 2 ways: 
### 1. Using the “build in” folders in Cypress.  
Cypress provides folders for the user to add any commands and files, and these folders are:
##### a. Fixtures (under Cypress):
“Fixtures” Folder is used to contain any files needs in testing, these files (“e.g. payload files”) can be accessed directly in Test case file using:
```
 cy.fixture(‘file_name’).then((resp) =>{
// any action 
// var x = resp.name (Saving the name value from “file_name” in x)
})
```
Our issue with that folder that we cannot have any sub-folders in it, and we have to put all of our files in one folder which is bad in case a lot of files are used and located under one folder. 

##### b. Commands.js (under Cypress > Support):
We can add any customize commands under “Commands.js” file, we can add any command by using: 
```
Cypress.commands.add(“CammandName”, (Parameters) => {
// Any action
})
``` 
And we used this way to create our API requests (POST, PUT, PATCH, GET, and DELETE) in this one file, and we can call these commands by using: 
```
cy.CommandName(Parameters).then((response) => {
// Any Action
})
```
Our issue with this file that the API request methods should not be added as ‘build in’ commands for Cypress, because these type of requests is better to be constant function which will make it easier to track or when providing .

You can find an exmpale of this scenario under -> cypress\integration\kargo\apibrands.js

### 2. Create our own folders 
By creating our own folders/ files we can control and organize all the files or methods used in our testing.
So, we created 2 folders as follows: 
##### a. configuration folder (under Cypress): 
Where we add all of our files and we can organize them in sub folders, we can access these folders using this in the top of the test case file: 

const file = require(../../configuration/filenamePath.json)
file.name = updateName // updating the name 

##### b. http folder (under Cypress > src ):
We create this folder to add all the API request commands as separated files. 
We can access to file by using: 
```
const post = require(../..src/http/post.js)
```
```
post(url, body, function(response){
// Any action
})
```

You can find an exmpale of this scenario under -> cypress\integration\kargo\apibrands_custom.js


In Cypress there is a lot of options to do any type of automation testing, we think that the 2 approaches mentioned above are best approaches to use, they are both working fine and they run as smoothly as possible. However, in terms of structure/ readability / tracking files/ and fixing issues, the second one is better.   
