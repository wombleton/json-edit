/*global jsonEdit test ok equal deepEqual module*/
(function () {
    "use strict";
    var je = jsonEdit, priv = je.priv, ns = priv.ns;
    window.priv = priv;
    module("json edit");

    function hasClass(obj, cls) {
        return $.inArray(cls, obj["class"].split()) !== -1;
    }

    test("constructor exists", function () {
        ok($.isFunction(je), "json edit constructor exists and is a function");
    });

    test("privates are exported for test", function () {
        ok(priv, "private functions are exported for testing");
    });

    test("generate simple label", function () {
        deepEqual(priv.label("Name", "asd"), {
            "label": {
                "for": "asd",
                "$childs": "Name"
            }
        });
    });

    test("generate simple input", function () {
        deepEqual(priv.input("string", "asd"), {
            "input": {
                "id": "asd",
                "type": "text"
            }
        });

        deepEqual(priv.input("string", "asd", {"default": "foo"}), {
            "input": {
                "id": "asd",
                "type": "text",
                "value": "foo"
            }
        });

        deepEqual(priv.input("string", "asd", {"default": "foo", "required": true}), {
            "input": {
                "id": "asd",
                "type": "text",
                "value": "foo",
                "required": true
            }
        });

        deepEqual(
            priv.input("string", "asd", {
                "default": "foo",
                "required": true,
                "maxLength": 10
            }),
            {
                "input": {
                    "id": "asd",
                    "type": "text",
                    "value": "foo",
                    "required": true,
                    "maxlength": 10
                }
            }
        );

        deepEqual(
            priv.input("string", "asd", {
                "default": "foo",
                "required": true,
                "maxLength": 10,
                "description": "the asd field"
            }),
            {
                "input": {
                    "id": "asd",
                    "type": "text",
                    "value": "foo",
                    "required": true,
                    "maxlength": 10,
                    "title": "the asd field"
                }
            }
        );

        deepEqual(
            priv.input("number", "asd", {
                "type": "number",
                "maximum": 20,
                "minimum": 10
            }),
            {
                "input": {
                    "id": "asd",
                    "type": "number",
                    "max": 20,
                    "min": 10
                }
            }
        );

        deepEqual(
            priv.input("number", "asd", {
                "type": "number",
                "maximum": 20,
                "minimum": 10,
                "exclusiveMaximum": true,
                "exclusiveMinimum": true
            }),
            {
                "input": {
                    "id": "asd",
                    "type": "number",
                    "max": 19,
                    "min": 11
                }
            }
        );
    });

    function checkInputTypeAndFormat(type, format, expectedType) {
        deepEqual(
            priv.input(type, "asd", {
                format: format
            }),
            {
                "input": {
                    "id": "asd",
                    "type": expectedType
                }
            }
        );
    }

    test("input field type respect type and format", function () {
        var check = checkInputTypeAndFormat;

        check("string", null, "text");
        check("string", "asdasdadasda", "text");

        check("string", "email", "email");
        check("string", "date-time", "datetime");
        check("string", "date", "date");
        check("string", "time", "time");
        check("string", "uri", "url");
        check("string", "color", "color");
        check("string", "phone", "tel");
        check("string", "utc-millisec", "text");
        check("string", "regex", "text");
        check("string", "style", "text");
        check("string", "ip-address", "text");
        check("string", "ipv6", "text");
        check("string", "hostname", "text");

        check("number", null, "number");
        check("integer", null, "number");
        check("boolean", null, "checkbox");

        check("any", null, "text");
    });

    function checkGeneratedField(field, id, title, startIndex, classes, opts) {
        var
            divId = "je-" + id + "-" + startIndex,
            inputId = "je-" + id + "-input-" + (startIndex + 1);

        deepEqual(field, {
            "div": {
                "id": divId,
                "class": classes,
                "$childs": [
                    // this should be tested separetely so we trust they work
                    priv.label(title, inputId),
                    priv.input(opts.type, inputId, opts)
                ]
            }
        });
    }

    function checkField(opts, classes) {
        priv.ns._reset();

        var field = priv.genField("name", opts);
        checkGeneratedField(field, "name", "Name", 0, classes, opts);
    }

    test("generate simple string field", function () {
        checkField({
            "type": "string",
            "title": "Name"
        }, "je-field je-name je-string");

        checkField({
            "type": "number",
            "title": "Name",
            "required": true
        }, "je-field je-name je-number je-required");
    });

    test("fields are generated in order", function () {
        var
            nameOpts = {
                "type": "string",
                "title": "Name"
            },
            ageOpts = {
                "type": "number",
                "title": "Age"
            },
            fields;

        priv.ns._reset();

        fields = priv.genFields(["name", "age"], {
            "name": nameOpts,
            "age": ageOpts
        });

        checkGeneratedField(fields[0], "name", "Name", 0, "je-field je-name je-string", nameOpts);
        checkGeneratedField(fields[1], "age", "Age", 5, "je-field je-age je-number", ageOpts);
    });

    test("schemas for array", function () {
        var arrCont, arrItems, field;
        priv.ns._reset();

        field = priv.genField("numbers", {
            "type": "array",
            "title": "Nums",
            "items": {
                "type": "number"
            }
        });

        console.log(field);
        equal(field.div.id, priv.ns.id("numbers", false, 0));
        equal(field.div["class"], priv.ns.classes("field", "numbers", "array"));
        ok(field.div.$childs[0].label);
        ok(field.div.$childs[1].div);
        arrCont = field.div.$childs[1].div;

        equal(arrCont["class"], ns.cls("array"));
        equal(arrCont.$childs.length, 2);
        equal(arrCont.$childs[0].div["class"], ns.cls("array-items"));
        equal(arrCont.$childs[1].div["class"], ns.cls("array-actions"));

        equal(arrCont.$childs[0].div["class"], ns.cls("array-items"));

        arrItems = arrCont.$childs[0].div;

        equal(arrItems.$childs.length, 1);
        equal(arrItems.$childs[0].div["class"], ns.cls("array-item"));
        ok(arrItems.$childs[0].div.$childs[0].input);
    });

    test("enum turns item into selection", function () {
        var field = priv.genField("color", {
            "type": "string",
            "enum": ["red", "green", "blue"]
        });

        ok(true);
    });

    /*
    test("", function () {
    });
    */
}());