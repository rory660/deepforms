![deepforms](https://github.com/rory660/deepforms/blob/master/img/deepformsCentered.png?raw=true)

# deepforms
Send deep nested JSON objects from web forms

## !WARNING!
When you call `submitDeepForm` from an element's onclick event, make sure that the element is either:

- __Not__ contained within the form.
- Has its `type` field set to something other than `"submit"`.

Button elements inside forms will default to `type="submit"`, causing them to submit the form normally, rather than through the library function.
