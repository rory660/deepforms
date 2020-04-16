(function(){
    // Submits a form as a JSON string containing a deep nested object.
    // Form fields are converted into object entries, with the name representing
    // the key of the object. Names with '.' characters are treated as "deep" keys
    // in which each substring of the key (split on '.') represents the key for
    // each layer of object nesting.
    const submitDeepForm = function(formId){
        if(formId === undefined || typeof form !== "string") throw new TypeError("formId must be a valid string")

        console.log("Submitting form id: " + formId)
        const form = document.getElementById(formId)

        const json = serializeDeepForm(form)

        const jsonForm = document.createElement("form")
        const formAttributes = form.attributes
        for(let i = 0; i < form.attributes.length; i++){
            let attr = formAttributes[i]
            if(attr == "id" || attr == "class"){
                continue
            }
            jsonForm.setAttribute(attr.name, attr.value)
        }
        
        const field = document.createElement("input")
        field.type="hidden"
        field.name="deepFormJSON"
        field.value=json
        jsonForm.appendChild(field)
        document.body.appendChild(jsonForm)
        jsonForm.submit()
    }

    // Serializes a form as an object represented in a JSON string.
    const serializeDeepForm = function(form){
        if(form === undefined || typeof form !== "object" || form.tagName !== "form") throw new TypeError("form must be a valid DOM form object")

        const arr = serializeFormAsArray(form)
        const obj = arrayToDeepObject(arr)
        const json = JSON.stringify(obj)
        return json
    }

    // Serializes a form as an array containing key-value pairs.
    const serializeFormAsArray = function(form){
        if(form === undefined || typeof form !== "object" || form.tagName !== "form") throw new TypeError("form must be a valid DOM form object")
        
        return Array.from(new FormData(form))
    }

    // Converts an array of key-value tuples into a deep object,
    // where each key is a "deep" key composed of subkeys joined
    // on a '.', such as "person.details.name".
    const arrayToDeepObject = function(arr){
        if(arr === undefined || !Array.isArray(arr)) throw new TypeError("arr must be a valid array")
        
        let obj = {}
        for(let i = 0; i < arr.length; i++){
            const item = arr[i]
            const k = item[0]
            const v = item[1]
            obj = addKeyValuePairDeep(obj, k, v)
        }
        return obj
    }

    // Takes an object, a "deep" key composed of multiple keys joined on a '.', and a value.
    // nests the value into the object based on the key provided, and if the layers of nesting do not currently
    // exist, they are added as blank objects.
    const addKeyValuePairDeep = function(obj, deepKey, value){
        if(obj === undefined || typeof obj !== "object") throw new TypeError("obj must be a valid object")
        if(deepKey === undefined || typeof deepKey !== "string") throw new TypeError("deepKey must be a valid string")
        
        const keyComponents = deepKey.split(".")
        const keyLength = keyComponents.length

        let objWithNesting = {...obj}
        if(keyLength > 1){
            objWithNesting = nestBlankObject(obj, keyComponents.slice(0, keyLength - 1))
        }


        let currentObj = objWithNesting
        for(let i = 0; i < keyLength - 1; i++){
            currentObj = currentObj[keyComponents[i]]
        }

        const deepestKey = keyComponents[keyLength - 1]
        const deepestVal = currentObj[deepestKey]
        if(deepestVal === undefined){
            currentObj[keyComponents[keyComponents.length - 1]] = value
        }
        else{
            currentObj[keyComponents[keyComponents.length - 1]] = combineValues(currentObj[deepestKey], value)
        }
        return objWithNesting
    }

    // Nests a blank object in a given object, adding a key from the list if required at each depth.
    const nestBlankObject = function(obj, keyComponents){
        if(obj === undefined || typeof obj !== "object") throw new TypeError("obj must be a valid object")
        if(keyComponents === undefined || !Array.isArray(keyComponents)) throw new TypeError("keyComponents must be a valid array")

        if(keyComponents.length == 0) throw new Error("keyComponents must contain at least one value")
        keyComponents.forEach(c=>{if(typeof c !== "string") throw new TypeError("key components must be strings")})
        
        const returnObj = {...obj}
        let currentObj = returnObj
        for(let i = 0; i < keyComponents.length; i++){
            let k = keyComponents[i]
            if(!(keyComponents[i] in currentObj)){
                currentObj[k] = {}
            }
            currentObj = currentObj[k]
        }
        return returnObj;
    }

    // Adds a key/value pair to an object. if there is already a value, it wraps it in a list and pushes the given value.
    const combineValues = function(val1, val2){
        if(val1 === undefined) throw new TypeError("val1 must be a defined")
        if(val2 === undefined) throw new TypeError("val2 must be a defined")

        if(Array.isArray(val1)){
            return [...val1, val2]
        }
        return [val1, val2]
    
    }

    // parsing middleware for deep forms. Places an object containing the deep form data in req.deepFormData
    const parser = function(req, res, next){
        if(req === undefined || typeof req !== "object") throw new TypeError("req must be a valid request object")
        if(res === undefined || typeof res !== "object") throw new TypeError("res must be a valid response object")
        if(next === undefined || typeof next !== "function") throw new TypeError("next must be a valid callback function")

        if("body" in req && "deepFormJSON" in req.body){
            req.deepFormData = JSON.parse(req.body.deepFormJSON)
        }
        next()
    }

    const isNode = function(){
        return (typeof window) === "undefined" && module.exports
    }

    if(isNode()){
        module.exports = {
            parser,
            __private : {
                submitDeepForm,
                serializeDeepForm,
                serializeFormAsArray,
                arrayToDeepObject,
                nestBlankObject,
                addKeyValuePairDeep,
                combineValues
            }
        }
    }
    else{
        window.deepforms = {
            submitDeepForm,
            __private : {
                serializeDeepForm,
                serializeFormAsArray,
                arrayToDeepObject,
                nestBlankObject,
                addKeyValuePairDeep,
                combineValues
            }
        }
    }

}())