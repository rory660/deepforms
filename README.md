![deepforms](https://github.com/rory660/deepforms/blob/master/img/deepformsCentered.png?raw=true)

Send deep nested JSON objects from HTML forms, in one function call.

# Features

- Allows forms to be sent as JSON strings representing deep objects
- Aggregates data from form fields that share a name attribute into a list
- Can be imported as an express middleware in node.js to parse the sent JSON
- Submits form data with the same method, action, target, etc as the original form, with no extra code required

# Usage

## Sending Forms

A form can be sent as a deep form by invoking `window.deepforms.submitDeepForm()`. Deep form data will be submitted as a single key `"deepFormData"` mapped to a JSON string containing the deep object.

### Field names

Form field names can be written using '.' syntax to represent layers of nesting in an object. For example:

```html
<input type = "text" name = "user.name" value = "testUser">
```

will be entered into the form object as:

```js
deepFormObject["user"]["name"] = "testUser";
```

### Multiple fields sharing the same name

If multiple fields in the form share a name, then their values will be parsed as a list:

```html
<input type = "text" name = "color" value = "blue">
<input type = "text" name = "color" value = "red">
```

will be entered into the form object as:

```js
deepFormObject["color"] = ["blue", "red"];
```

### `submitDeepForm()`

In order to submit a form as a deep form, invoke `submitDeepForm` as follows:

```html
<form id = "exampleForm" method = "POST" action = "/submitForm">
    <input type = "text" name = "user.name" value = "testUser">
    <input type = "text" name = "color" value = "blue">
    <input type = "text" name = "color" value = "red">
</form>
<button onclick="document.deepforms.submitDeepForm('exampleForm')">
```

Clicking the button will cause the form to be parsed as an object:

```json
{
    "user" : {
        "name" : "testUser"
    },
    "color" : ["blue", "red"]
}
```

and sent as a JSON string to the "/submitForm" route. Deep form data is always sent as a key/value pair with the key `"deepFormJSON"` and the JSON string as the value. The example above would be sent as:

```json
{"deepFormJSON" : "{'user':{'name':'testUser'},'color':['blue','red']}"}
```

### WARNING!
When you call `submitDeepForm` from an element's onclick event, make sure that the element is either:

- __Not__ contained within the form.
- Has its `type` field set to something other than `"submit"`.

Button elements inside forms will default to `type="submit"`, causing them to submit the form normally, rather than through the library function.

## Parsing Forms

Form data is always sent as the following key/value pair:

```
deepFormJSON = <JSON stirng containing form data>
```

### Express Middleware

Importing deepforms as a Node.js module exposes the `parser` middleware, which can be used in Express servers:

```js
const express = require("express")
const deepforms = require("deepforms")

const app = express()

app.use(deepforms.parser)

```

When the deep form parser is set as an Express middleware, any deep form sent to the server will be automatically parsed as an object and placed in `req.deepFormData`.

With the earlier example of `user.name = "testUser"` and `color = ["blue", "red"]`, the parser would cause `req` to contain the following:

```js
req.deepFormData == {
    "user" : {
        "name" : "testUser"
    },
    "color" : ["blue", "red"]
};
```

### Parsing the JSON directly

The JSON string can be found in the `deepFormJSON` field of the request body (or URL parameter if a GET request is sent). It can be simply parsed through `JSON.parse`:

```js
const deepFormData = JSON.parse(req.body.deepFormJSON)
```

# API

When imported as a frontend JS library:

### `submitDeepForm(formId)`

Arguments : The id of the form element to be submitted.

Submits the form as a deep nested JSON string containing the form data.

When imported as a Node.js module:

### `parser(req, res, next)`

Arguments: request object, response object, next function in middleware chain

Parses the deep form JSON string from `req.body.deepFormJSON` if it exists, and places the parsed object in `req.deepFormData`.
