[![deepforms](https://github.com/rory660/deepforms/blob/master/img/deepformsCentered.png?raw=true)](#)

[![License: MIT](https://img.shields.io/badge/license-MIT-informational)](#) [![dependencies: None](https://img.shields.io/badge/dependencies-none-success)](#) [![CircleCI](https://circleci.com/gh/rory660/deepforms.svg?style=shield&circle-token=d5e081f54b8a54d62f5b2c213a1a88a1399786fc)](https://app.circleci.com/pipelines/github/rory660/deepforms)

Send deep nested JSON-encoded objects from HTML forms, in a single function call. [Check it out on npm!](https://www.npmjs.com/package/deepforms)

# Installation

_In the browser:_

Include the script from a node CDN such as _jsdelivr_:
```html
<script src="https://cdn.jsdelivr.net/npm/deepforms@1.0.0/deepforms.min.js"></script>
```

---

_As an Express middleware:_

run `npm install deepforms` in your package and place `require("deepforms")` in your node script.

# Features

- Allows forms to be sent as JSON strings representing deep objects
- Aggregates data from form fields that share a name attribute into a list
- Can be imported as an express middleware in node.js to parse the sent JSON
- Submits form data with the same method, action, target, etc as the original form, with no extra code required

# API

_When imported as a frontend JS library:_

### `submitDeepForm(formId)`

Arguments : The id of the form element to be submitted.

Submits the form as a deep nested JSON string containing the form data.

---

_When imported as a Node.js module:_

### `parser(req, res, next)`

Arguments: request object, response object, next function in middleware chain

Express middleware that parses the deep form JSON string from `req.body.deepFormJSON`, if it exists, and places the parsed object in `req.deepFormData`.

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

```
deepFormJSON : '{"user":{"name":"testUser"},"color":["blue","red"]}}'
```

---

## WARNING!
When you call `submitDeepForm` from an element's onclick event, make sure that the element is either:

- __Not__ contained within the form.
- Has its `type` field set to something other than `"submit"`.

Button elements inside forms will default to `type="submit"`, causing them to submit the form normally, rather than through the library function.

---

## Parsing Forms

Form data is always sent as the following key/value pair:

```
deepFormJSON = <JSON string containing form data>
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

## Author

[deepforms is created and maintained by Rory Brown](https://www.rorybrown.info)
