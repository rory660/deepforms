(function(){
    // Submits a form as a JSON string containing a deep nested object.
    // Form fields are converted into object entries, with the name representing
    // the key of the object. Names with '.' characters are treated as "deep" keys
    // in which each substring of the key (split on '.') represents the key for
    // each layer of object nesting.
    const submitDeepForm = function(formId){
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
        field.name="deepFormData"
        field.value=json
        jsonForm.appendChild(field)
        document.body.appendChild(jsonForm)
        jsonForm.submit()
    }

    // Serializes a form as an object represented in a JSON string.
    const serializeDeepForm = function(form){
        const arr = serializeFormAsArray(form)
        const obj = arrayToDeepObj(arr)
        const json = JSON.stringify(obj)
        return json
    }

    // Serializes a form as an array containing key-value pairs.
    const serializeFormAsArray = function(form){
        return Array.from(new FormData(form))
    }

    // Converts an array of key-value tuples into a deep object,
    // where each key is a "deep" key composed of subkeys joined
    // on a '.', such as "person.details.name".
    const arrayToDeepObj = function(arr){
        let obj = {}
        for(let i = 0; i < arr.length; i++){
            const item = arr[i]
            const k = item[0]
            const v = item[1]
            obj = addKeyValuePairDeep(obj, k, v)
        }
        return obj
    }

    // Nests a blank object in a given object, adding a key from the list if required at each depth.
    const nestBlankObject = function(obj, keyComponents){
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

    // Takes an object, a "deep" key composed of multiple keys joined on a '.', and a value.
    // nests the value into the object based on the key provided, and if the layers of nesting do not currently
    // exist, they are added as blank objects.
    const addKeyValuePairDeep = function(obj, deepKey, value){
        const keyComponents = deepKey.split(".")
        const keyLength = keyComponents.length
        const objWithNesting = nestBlankObject(obj, keyComponents.slice(0, keyLength - 1))
        let currentObj = objWithNesting
        for(let i = 0; i < keyLength - 1; i++){
            currentObj = currentObj[keyComponents[i]]
        }

        const deepestKey = keyComponents[keyLength - 1]
        currentObj[keyComponents[keyComponents.length - 1]] = combineValues(currentObj[deepestKey], value)
        return objWithNesting
    }

    // Adds a key/value pair to an object. if there is already a value, it wraps it in a list and pushes the given value.
    const combineValues = function(val1, val2){
        if(val1 === undefined){
            return val2
        }
        if(val2 === undefined){
            return val1
        }
        if(Array.isArray(val1)){
            return [...val1, val2]
        }
        
        return [val1, val2]
    
    }

    // parsing middleware for deep forms. Places an object containing the deep form data in req.deepFormData
    const parser = function(req, res, next){
        if("body" in req && "deepformData" in req.body){
            req.deepFormData = JSON.parse(req.body.deepFormData)
        }
    }

    const isNode = function(){
        return (typeof window) === "undefined" && module.exports
    }

    if(isNode()){
        module.exports = {parser}
    }
    else{
        window.deepforms = {submitDeepForm}
    }

}())