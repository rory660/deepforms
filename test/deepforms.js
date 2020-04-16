const {parser, __private} = require("../deepforms")
const {
    submitDeepForm,
    serializeDeepForm,
    serializeFormAsArray,
    arrayToDeepObject,
    nestBlankObject,
    addKeyValuePairDeep,
    combineValues
} = __private

const expect = require("chai").expect

describe("#parser", function(){
    context("without arguments", function(){
        it("should throw a TypeError", function(){
            expect(parser).to.throw(TypeError)
        })
    })
})

describe("#submitDeepForm", function(){
    context("without arguments", function(){
        it("should throw a TypeError", function(){
            expect(submitDeepForm).to.throw(TypeError)
        })
    })
})

describe("#serializeDeepForm", function(){
    context("without arguments", function(){
        it("should throw a TypeError", function(){
            expect(serializeDeepForm).to.throw(TypeError)
        })
    })
})

describe("#serializeFormAsArray", function(){
    context("without arguments", function(){
        it("should throw a TypeError", function(){
            expect(serializeFormAsArray).to.throw(TypeError)
        })
    })
})

describe("#arrayToDeepObject", function(){
    context("Without arguments", function(){
        it("should throw a TypeError", function(){
            expect(arrayToDeepObject).to.throw(TypeError)
        })
    })

    context("With invalid arguments", function(){
        it("should throw a TypeError", function(){
            expect(()=>arrayToDeepObject(1)).to.throw(TypeError)
            expect(()=>arrayToDeepObject("a")).to.throw(TypeError)
            expect(()=>arrayToDeepObject(undefined)).to.throw(TypeError)
            expect(()=>arrayToDeepObject({})).to.throw(TypeError)
        })
    })

    context("With an empty list", function(){
        it("should return an empty object", function(){
            expect(arrayToDeepObject([])).to.eql({})
        })
    })

    context("With list of keys and values", function(){
        it("should return an object containing the key/value pairs", function(){
            expect(arrayToDeepObject([["k1", "v1"],["k2", "v2"]])).to.eql({"k1":"v1","k2":"v2"})
        })
    })

    context("With list of deep keys and values", function(){
        it("should return an object containing the deep key/value pairs", function(){
            expect(arrayToDeepObject([["k1", "v1"],["k2.k1", "v2"]])).to.eql({"k1":"v1","k2":{"k1":"v2"}})
        })
    })

    context("With list of deep keys and values, where two pairs share a key", function(){
        it("should return an object containing the deep key/value pairs, with the shared values combined", function(){
            expect(arrayToDeepObject([["k1", "v1"],["k1", "v2"],["k2.k1", "v3"]])).to.eql({"k1":["v1","v2"],"k2":{"k1":"v3"}})
        })
    })
})

describe("#addKeyValuePairDeep", function(){
    context("without arguments", function(){
        it("should throw a TypeError", function(){
            expect(addKeyValuePairDeep).to.throw(TypeError)
        })
    })

    context("With invalid arguments", function(){
        it("should throw a TypeError", function(){
            expect(()=>addKeyValuePairDeep(1,"a", "v")).to.throw(TypeError)
            expect(()=>addKeyValuePairDeep(undefined,"a", "v")).to.throw(TypeError)
            expect(()=>addKeyValuePairDeep("b","a", "v")).to.throw(TypeError)
            expect(()=>addKeyValuePairDeep({},1, "v")).to.throw(TypeError)
            expect(()=>addKeyValuePairDeep({},[], "v")).to.throw(TypeError)
            expect(()=>addKeyValuePairDeep({},{}, "v")).to.throw(TypeError)
            expect(()=>addKeyValuePairDeep({},undefined, "v")).to.throw(TypeError)
        })
    })

    context("With a normal key and an empty object", function(){
        it("should add the value at the key location in the object", function(){
            expect(addKeyValuePairDeep({},"a", "val")).to.eql({"a":"val"})
        })
    })

    context("With a deep key and an empty object", function(){
        it("should add the value at the key location in the object", function(){
            expect(addKeyValuePairDeep({},"a.b.c", "val")).to.eql({"a":{"b":{"c":"val"}}})
        })
    })

    context("With a normal key and an object containing a value in the key location", function(){
        it("should combine the new value with the existing value", function(){
            expect(addKeyValuePairDeep({"a":"val1"},"a", "val2")).to.eql({"a":["val1", "val2"]})
            expect(addKeyValuePairDeep({"a":["val1","val2"]},"a", "val3")).to.eql({"a":["val1", "val2", "val3"]})
        })
    })

    context("With a deep key and an object containing a value in the key location", function(){
        it("should combine the new value with the existing value", function(){
            expect(addKeyValuePairDeep({"a":{"b": "val1"}},"a.b", "val2")).to.eql({"a":{"b": ["val1", "val2"]}})
            expect(addKeyValuePairDeep({"a":{"b": ["val1", "val2"]}},"a.b", "val3")).to.eql({"a":{"b": ["val1", "val2", "val3"]}})
        })
    })
})

describe("#nestBlankObject", function(){
    context("Without arguments", function(){
        it("should throw a TypeError", function(){
            expect(nestBlankObject).to.throw(TypeError)
        })
    })

    context("With invalid arguments", function(){
        it("should throw a TypeError", function(){
            expect(()=>nestBlankObject(1,["a","b","c"])).to.throw(TypeError)
            expect(()=>nestBlankObject("a",["a","b","c"])).to.throw(TypeError)
            expect(()=>nestBlankObject(undefined,["a","b","c"])).to.throw(TypeError)
            expect(()=>nestBlankObject({},1)).to.throw(TypeError)
            expect(()=>nestBlankObject({},"")).to.throw(TypeError)
            expect(()=>nestBlankObject({},{})).to.throw(TypeError)
            expect(()=>nestBlankObject({},["a","b",2])).to.throw(TypeError)
        })
    })

    context("With no key components", function(){
        it("should throw an error", function(){
            expect(()=>nestBlankObject({},[])).to.throw(Error)
        })
    })

    context("With a blank object and a single-component key", function(){
        it("should add a blank object to the object with the key", function(){
            expect(nestBlankObject({},["a"])).to.eql({"a":{}})
        })
    })

    context("With a blank object and a multi-component key", function(){
        it("should add nest a blank object in the object with the key components as keys", function(){
            expect(nestBlankObject({},["a","b","c"])).to.eql({"a":{"b":{"c":{}}}})
        })
    })

    context("With an object that already contains a value at the key location", function(){
        it("should return an unaltered object", function(){
            expect(nestBlankObject({"a":123},["a"])).to.eql({"a":123})
            expect(nestBlankObject({"a":{"b":{"c":{}}}},["a","b","c"])).to.eql({"a":{"b":{"c":{}}}})
        })
    })

})

describe("#combineValues", function(){
    context("Without arguments", function(){
        it("should throw a TypeError", function(){
            expect(combineValues).to.throw(TypeError)
        })
    })

    context("With two integers", function(){
        it("should return a list wrapping the two integers", function(){
            expect(combineValues(1, 2)).to.eql([1, 2])
        })
    })

    context("With two strings", function(){
        it("should return a list wrapping the two strings", function(){
            expect(combineValues("a", "b")).to.eql(["a","b"])
        })
    })

    context("With a list and a non-list value", function(){
        it("should return the list with the other value pushed", function(){
            expect(combineValues(["a","b"],"c")).to.eql(["a", "b", "c"])
        })
    })

    context("With two lists", function(){
        it("should return the list with the other list nested at the end", function(){
            expect(combineValues(["a","b"],["c", "d"])).to.eql(["a","b",["c","d"]])
        })
    })

})