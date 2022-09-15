'use strict';
Object.defineProperty(exports, '__esModule', { value: !0 });
var e = require('os'),
    n = require('camelcase'),
    t = require('json-schema-ref-parser'),
    r = require('handlebars/runtime'),
    a = require('path'),
    o = require('fs'),
    l = require('util'),
    i = require('prettier/standalone'),
    s = require('prettier/parser-typescript');
function u(e) {
    return e && 'object' == typeof e && 'default' in e ? e : { default: e };
}
var p,
    c = u(n),
    m = u(t),
    d = u(r),
    f = u(i),
    h = u(s);
function y(e) {
    return e?.replace(/\\/g, '\\\\');
}
function v(e, n) {
    const t = n['x-enum-varnames'],
        r = n['x-enum-descriptions'];
    return e.map((e, n) => ({
        name: t?.[n] || e.name,
        description: r?.[n] || e.description,
        value: e.value,
        type: e.type,
    }));
}
function g(n) {
    return n ? n.replace(/(\*\/)/g, '*_/').replace(/\r?\n(.*)/g, (n, t) => `${e.EOL} * ${t.trim()}`) : null;
}
function P(e) {
    return null != e && '' !== e;
}
function b(e) {
    return Array.isArray(e)
        ? e
              .filter((e, n, t) => t.indexOf(e) === n)
              .filter(P)
              .map(e =>
                  'number' == typeof e
                      ? { name: `'_${e}'`, value: String(e), type: 'number', description: null }
                      : {
                            name: String(e)
                                .replace(/\W+/g, '_')
                                .replace(/^(\d+)/g, '_$1')
                                .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                                .toUpperCase(),
                            value: `'${e}'`,
                            type: 'string',
                            description: null,
                        }
              )
        : [];
}
function O(e) {
    if (/^(\w+=[0-9]+)/g.test(e)) {
        const n = e.match(/(\w+=[0-9]+,?)/g);
        if (n) {
            const e = [];
            return (
                n.forEach(n => {
                    const t = n.split('=')[0],
                        r = parseInt(n.split('=')[1].replace(/[^0-9]/g, ''));
                    t &&
                        Number.isInteger(r) &&
                        e.push({
                            name: t
                                .replace(/\W+/g, '_')
                                .replace(/^(\d+)/g, '_$1')
                                .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                                .toUpperCase(),
                            value: String(r),
                            type: 'number',
                            description: null,
                        });
                }),
                e.filter((e, n, t) => t.map(e => e.name).indexOf(e.name) === n)
            );
        }
    }
    return [];
}
function x(e) {
    if (e) {
        if (!/^[a-zA-Z_$][\w$]+$/g.test(e)) return `'${e}'`;
    }
    return e;
}
(exports.HttpClient = void 0),
    ((p = exports.HttpClient || (exports.HttpClient = {})).FETCH = 'fetch'),
    (p.XHR = 'xhr'),
    (p.NODE = 'node'),
    (p.AXIOS = 'axios');
const k = new Map([
    ['file', 'binary'],
    ['any', 'any'],
    ['object', 'any'],
    ['array', 'any[]'],
    ['boolean', 'boolean'],
    ['byte', 'number'],
    ['int', 'number'],
    ['integer', 'number'],
    ['float', 'number'],
    ['double', 'number'],
    ['short', 'number'],
    ['long', 'number'],
    ['number', 'number'],
    ['char', 'string'],
    ['date', 'string'],
    ['date-time', 'string'],
    ['password', 'string'],
    ['string', 'string'],
    ['void', 'void'],
    ['null', 'null'],
]);
function R(e) {
    return e.replace(/^[^a-zA-Z_$]+/g, '').replace(/[^\w$]+/g, '_');
}
function w(e = 'any', n) {
    const t = { type: 'any', base: 'any', template: null, imports: [], isNullable: !1 },
        r = (function (e, n) {
            return 'binary' === n ? 'binary' : k.get(e);
        })(e, n);
    if (r) return (t.type = r), (t.base = r), t;
    const a = decodeURIComponent(
        e
            .trim()
            .replace(/^#\/definitions\//, '')
            .replace(/^#\/parameters\//, '')
            .replace(/^#\/params\//, '')
            .replace(/^#\/responses\//, '')
            .replace(/^#\/securityDefinitions\//, '')
    );
    if (/\[.*\]$/g.test(a)) {
        const e = a.match(/(.*?)\[(.*)\]$/);
        if (e?.length) {
            const n = w(R(e[1])),
                r = w(R(e[2]));
            return (
                'any[]' === n.type
                    ? ((t.type = `${r.type}[]`), (t.base = r.type), (n.imports = []))
                    : r.type
                    ? ((t.type = `${n.type}<${r.type}>`), (t.base = n.type), (t.template = r.type))
                    : ((t.type = n.type), (t.base = n.type), (t.template = n.type)),
                t.imports.push(...n.imports),
                t.imports.push(...r.imports),
                t
            );
        }
    }
    if (a) {
        const e = R(a);
        return (t.type = e), (t.base = e), t.imports.push(e), t;
    }
    return t;
}
function q(e, n, t) {
    const r = [];
    for (const a in n.properties)
        if (n.properties.hasOwnProperty(a)) {
            const o = n.properties[a],
                l = !!n.required?.includes(a);
            if (o.$ref) {
                const e = w(o.$ref);
                r.push({
                    name: x(a),
                    export: 'reference',
                    type: e.type,
                    base: e.base,
                    template: e.template,
                    link: null,
                    description: g(o.description),
                    isDefinition: !1,
                    isReadOnly: !0 === o.readOnly,
                    isRequired: l,
                    isNullable: !0 === o['x-nullable'],
                    format: o.format,
                    maximum: o.maximum,
                    exclusiveMaximum: o.exclusiveMaximum,
                    minimum: o.minimum,
                    exclusiveMinimum: o.exclusiveMinimum,
                    multipleOf: o.multipleOf,
                    maxLength: o.maxLength,
                    minLength: o.minLength,
                    maxItems: o.maxItems,
                    minItems: o.minItems,
                    uniqueItems: o.uniqueItems,
                    maxProperties: o.maxProperties,
                    minProperties: o.minProperties,
                    pattern: y(o.pattern),
                    imports: e.imports,
                    enum: [],
                    enums: [],
                    properties: [],
                });
            } else {
                const n = t(e, o);
                r.push({
                    name: x(a),
                    export: n.export,
                    type: n.type,
                    base: n.base,
                    template: n.template,
                    link: n.link,
                    description: g(o.description),
                    isDefinition: !1,
                    isReadOnly: !0 === o.readOnly,
                    isRequired: l,
                    isNullable: !0 === o['x-nullable'],
                    format: o.format,
                    maximum: o.maximum,
                    exclusiveMaximum: o.exclusiveMaximum,
                    minimum: o.minimum,
                    exclusiveMinimum: o.exclusiveMinimum,
                    multipleOf: o.multipleOf,
                    maxLength: o.maxLength,
                    minLength: o.minLength,
                    maxItems: o.maxItems,
                    minItems: o.minItems,
                    uniqueItems: o.uniqueItems,
                    maxProperties: o.maxProperties,
                    minProperties: o.minProperties,
                    pattern: y(o.pattern),
                    imports: n.imports,
                    enum: n.enum,
                    enums: n.enums,
                    properties: n.properties,
                });
            }
        }
    return r;
}
const C = /~1/g,
    j = /~0/g;
function A(e, n) {
    if (n.$ref) {
        const t = n.$ref
            .replace(/^#/g, '')
            .split('/')
            .filter(e => e);
        let r = e;
        return (
            t.forEach(e => {
                const t = decodeURIComponent(e.replace(C, '/').replace(j, '~'));
                if (!r.hasOwnProperty(t)) throw new Error(`Could not find reference: "${n.$ref}"`);
                r = r[t];
            }),
            r
        );
    }
    return n;
}
function D(e, n, t, r, a) {
    const o = { type: r, imports: [], enums: [], properties: [] },
        l = [];
    if (
        (t
            .map(n => a(e, n))
            .filter(e => {
                const n = e.properties.length,
                    t = e.enums.length;
                return !('any' === e.type && !n && !t);
            })
            .forEach(e => {
                o.imports.push(...e.imports), o.enums.push(...e.enums), o.properties.push(e);
            }),
        n.required)
    ) {
        const r = (function (e, n, t, r) {
            return t
                .reduce((n, t) => {
                    if (t.$ref) {
                        const a = A(e, t);
                        return [...n, ...r(e, a).properties];
                    }
                    return [...n, ...r(e, t).properties];
                }, [])
                .filter(e => !e.isRequired && n.includes(e.name))
                .map(e => ({ ...e, isRequired: !0 }));
        })(e, n.required, t, a);
        r.forEach(e => {
            o.imports.push(...e.imports), o.enums.push(...e.enums);
        }),
            l.push(...r);
    }
    if (n.properties) {
        const t = q(e, n, a);
        t.forEach(e => {
            o.imports.push(...e.imports), o.enums.push(...e.enums), 'enum' === e.export && o.enums.push(e);
        }),
            l.push(...t);
    }
    return (
        l.length &&
            o.properties.push({
                name: 'properties',
                export: 'interface',
                type: 'any',
                base: 'any',
                template: null,
                link: null,
                description: '',
                isDefinition: !1,
                isReadOnly: !1,
                isNullable: !1,
                isRequired: !1,
                imports: [],
                enum: [],
                enums: [],
                properties: l,
            }),
        o
    );
}
function I(e, n, t = !1, r = '') {
    const a = {
        name: r,
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: g(n.description),
        isDefinition: t,
        isReadOnly: !0 === n.readOnly,
        isNullable: !0 === n['x-nullable'],
        isRequired: !1,
        format: n.format,
        maximum: n.maximum,
        exclusiveMaximum: n.exclusiveMaximum,
        minimum: n.minimum,
        exclusiveMinimum: n.exclusiveMinimum,
        multipleOf: n.multipleOf,
        maxLength: n.maxLength,
        minLength: n.minLength,
        maxItems: n.maxItems,
        minItems: n.minItems,
        uniqueItems: n.uniqueItems,
        maxProperties: n.maxProperties,
        minProperties: n.minProperties,
        pattern: y(n.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (n.$ref) {
        const e = w(n.$ref);
        return (
            (a.export = 'reference'),
            (a.type = e.type),
            (a.base = e.base),
            (a.template = e.template),
            a.imports.push(...e.imports),
            a
        );
    }
    if (n.enum && 'boolean' !== n.type) {
        const e = v(b(n.enum), n);
        if (e.length) return (a.export = 'enum'), (a.type = 'string'), (a.base = 'string'), a.enum.push(...e), a;
    }
    if (('int' === n.type || 'integer' === n.type) && n.description) {
        const e = O(n.description);
        if (e.length) return (a.export = 'enum'), (a.type = 'number'), (a.base = 'number'), a.enum.push(...e), a;
    }
    if ('array' === n.type && n.items) {
        if (n.items.$ref) {
            const e = w(n.items.$ref);
            return (
                (a.export = 'array'),
                (a.type = e.type),
                (a.base = e.base),
                (a.template = e.template),
                a.imports.push(...e.imports),
                a
            );
        }
        {
            const t = I(e, n.items);
            return (
                (a.export = 'array'),
                (a.type = t.type),
                (a.base = t.base),
                (a.template = t.template),
                (a.link = t),
                a.imports.push(...t.imports),
                a
            );
        }
    }
    if ('object' === n.type && 'object' == typeof n.additionalProperties) {
        if (n.additionalProperties.$ref) {
            const e = w(n.additionalProperties.$ref);
            return (
                (a.export = 'dictionary'),
                (a.type = e.type),
                (a.base = e.base),
                (a.template = e.template),
                a.imports.push(...e.imports),
                a
            );
        }
        {
            const t = I(e, n.additionalProperties);
            return (
                (a.export = 'dictionary'),
                (a.type = t.type),
                (a.base = t.base),
                (a.template = t.template),
                (a.link = t),
                a.imports.push(...t.imports),
                a
            );
        }
    }
    if (n.allOf?.length) {
        const t = D(e, n, n.allOf, 'all-of', I);
        return (
            (a.export = t.type),
            a.imports.push(...t.imports),
            a.properties.push(...t.properties),
            a.enums.push(...t.enums),
            a
        );
    }
    if ('object' === n.type) {
        if (((a.export = 'interface'), (a.type = 'any'), (a.base = 'any'), n.properties)) {
            q(e, n, I).forEach(e => {
                a.imports.push(...e.imports),
                    a.enums.push(...e.enums),
                    a.properties.push(e),
                    'enum' === e.export && a.enums.push(e);
            });
        }
        return a;
    }
    if (n.type) {
        const e = w(n.type, n.format);
        return (
            (a.export = 'generic'),
            (a.type = e.type),
            (a.base = e.base),
            (a.template = e.template),
            a.imports.push(...e.imports),
            a
        );
    }
    return a;
}
function T(e, n, t) {
    return t.indexOf(e) === n;
}
function E(e, n) {
    if (void 0 === e.default) return;
    if (null === e.default) return 'null';
    switch (e.type || typeof e.default) {
        case 'int':
        case 'integer':
        case 'number':
            return 'enum' === n.export && n.enum?.[e.default] ? n.enum[e.default].value : e.default;
        case 'boolean':
            return JSON.stringify(e.default);
        case 'string':
            return `'${e.default}'`;
        case 'object':
            try {
                return JSON.stringify(e.default, null, 4);
            } catch (e) {}
    }
}
const $ =
    /^(arguments|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/g;
function H(e) {
    const n = e
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return c.default(n).replace($, '_$1');
}
function S(e, n) {
    const t = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null,
    };
    return (
        n.forEach(n => {
            const r = A(e, n),
                a = (function (e, n) {
                    const t = {
                        in: n.in,
                        prop: n.name,
                        export: 'interface',
                        name: H(n.name),
                        type: 'any',
                        base: 'any',
                        template: null,
                        link: null,
                        description: g(n.description),
                        isDefinition: !1,
                        isReadOnly: !1,
                        isRequired: !0 === n.required,
                        isNullable: !0 === n['x-nullable'],
                        format: n.format,
                        maximum: n.maximum,
                        exclusiveMaximum: n.exclusiveMaximum,
                        minimum: n.minimum,
                        exclusiveMinimum: n.exclusiveMinimum,
                        multipleOf: n.multipleOf,
                        maxLength: n.maxLength,
                        minLength: n.minLength,
                        maxItems: n.maxItems,
                        minItems: n.minItems,
                        uniqueItems: n.uniqueItems,
                        pattern: y(n.pattern),
                        imports: [],
                        enum: [],
                        enums: [],
                        properties: [],
                        mediaType: null,
                    };
                    if (n.$ref) {
                        const e = w(n.$ref);
                        return (
                            (t.export = 'reference'),
                            (t.type = e.type),
                            (t.base = e.base),
                            (t.template = e.template),
                            t.imports.push(...e.imports),
                            (t.default = E(n, t)),
                            t
                        );
                    }
                    if (n.enum) {
                        const e = v(b(n.enum), n);
                        if (e.length)
                            return (
                                (t.export = 'enum'),
                                (t.type = 'string'),
                                (t.base = 'string'),
                                t.enum.push(...e),
                                (t.default = E(n, t)),
                                t
                            );
                    }
                    if (('int' === n.type || 'integer' === n.type) && n.description) {
                        const e = O(n.description);
                        if (e.length)
                            return (
                                (t.export = 'enum'),
                                (t.type = 'number'),
                                (t.base = 'number'),
                                t.enum.push(...e),
                                (t.default = E(n, t)),
                                t
                            );
                    }
                    if ('array' === n.type && n.items) {
                        const e = w(n.items.type, n.items.format);
                        return (
                            (t.export = 'array'),
                            (t.type = e.type),
                            (t.base = e.base),
                            (t.template = e.template),
                            t.imports.push(...e.imports),
                            (t.default = E(n, t)),
                            t
                        );
                    }
                    if ('object' === n.type && n.items) {
                        const e = w(n.items.type, n.items.format);
                        return (
                            (t.export = 'dictionary'),
                            (t.type = e.type),
                            (t.base = e.base),
                            (t.template = e.template),
                            t.imports.push(...e.imports),
                            (t.default = E(n, t)),
                            t
                        );
                    }
                    let r = n.schema;
                    if (r) {
                        if (
                            (r.$ref?.startsWith('#/parameters/') && (r = A(e, r)),
                            r.$ref?.startsWith('#/params/') && (r = A(e, r)),
                            r.$ref)
                        ) {
                            const e = w(r.$ref);
                            return (
                                (t.export = 'reference'),
                                (t.type = e.type),
                                (t.base = e.base),
                                (t.template = e.template),
                                t.imports.push(...e.imports),
                                (t.default = E(n, t)),
                                t
                            );
                        }
                        {
                            const a = I(e, r);
                            return (
                                (t.export = a.export),
                                (t.type = a.type),
                                (t.base = a.base),
                                (t.template = a.template),
                                (t.link = a.link),
                                t.imports.push(...a.imports),
                                t.enum.push(...a.enum),
                                t.enums.push(...a.enums),
                                t.properties.push(...a.properties),
                                (t.default = E(n, t)),
                                t
                            );
                        }
                    }
                    if (n.type) {
                        const e = w(n.type, n.format);
                        return (
                            (t.export = 'generic'),
                            (t.type = e.type),
                            (t.base = e.base),
                            (t.template = e.template),
                            t.imports.push(...e.imports),
                            (t.default = E(n, t)),
                            t
                        );
                    }
                    return t;
                })(e, r);
            if ('api-version' !== a.prop)
                switch (a.in) {
                    case 'path':
                        t.parametersPath.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'query':
                        t.parametersQuery.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'header':
                        t.parametersHeader.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'formData':
                        t.parametersForm.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'body':
                        (t.parametersBody = a), t.parameters.push(a), t.imports.push(...a.imports);
                }
        }),
        t
    );
}
function N(e, n, t) {
    const r = {
        in: 'response',
        name: '',
        code: t,
        description: g(n.description),
        export: 'generic',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        isDefinition: !1,
        isReadOnly: !1,
        isRequired: !1,
        isNullable: !1,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    let a = n.schema;
    if (a) {
        if ((a.$ref?.startsWith('#/responses/') && (a = A(e, a)), a.$ref)) {
            const e = w(a.$ref);
            return (
                (r.export = 'reference'),
                (r.type = e.type),
                (r.base = e.base),
                (r.template = e.template),
                r.imports.push(...e.imports),
                r
            );
        }
        {
            const n = I(e, a);
            return (
                (r.export = n.export),
                (r.type = n.type),
                (r.base = n.base),
                (r.template = n.template),
                (r.link = n.link),
                (r.isReadOnly = n.isReadOnly),
                (r.isRequired = n.isRequired),
                (r.isNullable = n.isNullable),
                (r.format = n.format),
                (r.maximum = n.maximum),
                (r.exclusiveMaximum = n.exclusiveMaximum),
                (r.minimum = n.minimum),
                (r.exclusiveMinimum = n.exclusiveMinimum),
                (r.multipleOf = n.multipleOf),
                (r.maxLength = n.maxLength),
                (r.minLength = n.minLength),
                (r.maxItems = n.maxItems),
                (r.minItems = n.minItems),
                (r.uniqueItems = n.uniqueItems),
                (r.maxProperties = n.maxProperties),
                (r.minProperties = n.minProperties),
                (r.pattern = y(n.pattern)),
                r.imports.push(...n.imports),
                r.enum.push(...n.enum),
                r.enums.push(...n.enums),
                r.properties.push(...n.properties),
                r
            );
        }
    }
    if (n.headers)
        for (const e in n.headers)
            if (n.headers.hasOwnProperty(e))
                return (r.in = 'header'), (r.name = e), (r.type = 'string'), (r.base = 'string'), r;
    return r;
}
function B(e) {
    if ('default' === e) return 200;
    if (/[0-9]+/g.test(e)) {
        const n = parseInt(e);
        if (Number.isInteger(n)) return Math.abs(n);
    }
    return null;
}
function L(e, n) {
    const t = e.type === n.type && e.base === n.base && e.template === n.template;
    return t && e.link && n.link ? L(e.link, n.link) : t;
}
function M(e) {
    const n = [];
    return (
        e.forEach(e => {
            const { code: t } = e;
            t && 204 !== t && t >= 200 && t < 300 && n.push(e);
        }),
        n.length ||
            n.push({
                in: 'response',
                name: '',
                code: 200,
                description: '',
                export: 'generic',
                type: 'void',
                base: 'void',
                template: null,
                link: null,
                isDefinition: !1,
                isReadOnly: !1,
                isRequired: !1,
                isNullable: !1,
                imports: [],
                enum: [],
                enums: [],
                properties: [],
            }),
        n.filter((e, n, t) => t.findIndex(n => L(n, e)) === n)
    );
}
function F(e, n) {
    const t = e.isRequired && void 0 === e.default,
        r = n.isRequired && void 0 === n.default;
    return t && !r ? -1 : r && !t ? 1 : 0;
}
function U(e, n, t, r, a, o) {
    const l = (function (e) {
            const n = e
                .replace(/^[^a-zA-Z]+/g, '')
                .replace(/[^\w\-]+/g, '-')
                .trim();
            return c.default(n, { pascalCase: !0 });
        })(r),
        i = `${t}${l}`,
        s = (function (e) {
            const n = e
                .replace(/^[^a-zA-Z]+/g, '')
                .replace(/[^\w\-]+/g, '-')
                .trim();
            return c.default(n);
        })(a.operationId || i),
        u = (function (e) {
            return e.replace(/\{(.*?)\}/g, (e, n) => `\${${H(n)}}`).replace('${apiVersion}', '${OpenAPI.VERSION}');
        })(n),
        p = {
            service: l,
            name: s,
            hookName: `use${s[0].toUpperCase()}${s.slice(1)}`,
            summary: g(a.summary),
            description: g(a.description),
            deprecated: !0 === a.deprecated,
            method: t.toUpperCase(),
            path: u,
            parameters: [...o.parameters],
            params: [...o.parameters.filter(e => e.isRequired), ...o.parameters.filter(e => !e.isRequired)],
            parametersPath: [...o.parametersPath],
            parametersQuery: [...o.parametersQuery],
            parametersForm: [...o.parametersForm],
            parametersHeader: [...o.parametersHeader],
            parametersCookie: [...o.parametersCookie],
            parametersBody: o.parametersBody,
            imports: [],
            errors: [],
            results: [],
            responseHeader: null,
        };
    if (a.parameters) {
        const n = S(e, a.parameters);
        p.imports.push(...n.imports),
            p.parameters.push(...n.parameters),
            p.parametersPath.push(...n.parametersPath),
            p.parametersQuery.push(...n.parametersQuery),
            p.parametersForm.push(...n.parametersForm),
            p.parametersHeader.push(...n.parametersHeader),
            p.parametersCookie.push(...n.parametersCookie),
            (p.parametersBody = n.parametersBody);
    }
    if (a.responses) {
        const n = (function (e, n) {
                const t = [];
                for (const r in n)
                    if (n.hasOwnProperty(r)) {
                        const a = A(e, n[r]),
                            o = B(r);
                        if (o) {
                            const n = N(e, a, o);
                            t.push(n);
                        }
                    }
                return t.sort((e, n) => (e.code < n.code ? -1 : e.code > n.code ? 1 : 0));
            })(e, a.responses),
            t = M(n);
        (p.errors = (function (e) {
            return e
                .filter(e => e.code >= 300 && e.description)
                .map(e => {
                    return {
                        code: e.code,
                        description: ((n = e.description), n.replace(/([^\\])`/g, '$1\\`').replace(/(\*\/)/g, '*_/')),
                    };
                    var n;
                });
        })(n)),
            (p.responseHeader = (function (e) {
                const n = e.find(e => 'header' === e.in);
                return n ? n.name : null;
            })(t)),
            t.forEach(e => {
                p.results.push(e), p.imports.push(...e.imports);
            });
    }
    return (p.parameters = p.parameters.sort(F)), p;
}
function W(e) {
    const n = (function (e = '1.0') {
            return String(e).replace(/^v/gi, '');
        })(e.info.version),
        t = (function (e) {
            const n = e.schemes?.[0] || 'http',
                t = e.host,
                r = e.basePath || '';
            return (t ? `${n}://${t}${r}` : r).replace(/\/$/g, '');
        })(e),
        r = (function (e) {
            const n = [];
            for (const t in e.definitions)
                if (e.definitions.hasOwnProperty(t)) {
                    const r = I(e, e.definitions[t], !0, w(t).base);
                    n.push(r);
                }
            return n;
        })(e),
        a = (function (e) {
            const n = new Map();
            for (const t in e.paths)
                if (e.paths.hasOwnProperty(t)) {
                    const r = e.paths[t],
                        a = S(e, r.parameters || []);
                    for (const o in r)
                        if (r.hasOwnProperty(o))
                            switch (o) {
                                case 'get':
                                case 'put':
                                case 'post':
                                case 'delete':
                                case 'options':
                                case 'head':
                                case 'patch':
                                    const l = r[o];
                                    (l.tags?.filter(T) || ['Service']).forEach(r => {
                                        const i = U(e, t, o, r, l, a),
                                            s = n.get(i.service) || { name: i.service, operations: [], imports: [] };
                                        s.operations.push(i), s.imports.push(...i.imports), n.set(i.service, s);
                                    });
                            }
                }
            return Array.from(n.values());
        })(e);
    return { version: n, server: t, models: r, services: a };
}
function _(n) {
    return n ? n.replace(/(\*\/)/g, '*_/').replace(/\r?\n(.*)/g, (n, t) => `${e.EOL} * ${t.trim()}`) : null;
}
function V(e) {
    return e
        .trim()
        .replace(/^#\/components\/schemas\//, '')
        .replace(/^#\/components\/responses\//, '')
        .replace(/^#\/components\/parameters\//, '')
        .replace(/^#\/components\/examples\//, '')
        .replace(/^#\/components\/requestBodies\//, '')
        .replace(/^#\/components\/headers\//, '')
        .replace(/^#\/components\/securitySchemes\//, '')
        .replace(/^#\/components\/links\//, '')
        .replace(/^#\/components\/callbacks\//, '');
}
function Q(e, n) {
    if (e.mapping) {
        const t = (function (e) {
                const n = {};
                for (const t in e) n[e[t]] = t;
                return n;
            })(e.mapping),
            r = Object.keys(t).find(e => V(e) == n.name);
        if (r && t[r]) return t[r];
    }
    return n.name;
}
function z(e) {
    if (e) {
        if (!/^[a-zA-Z_$][\w$]+$/g.test(e)) return `'${e}'`;
    }
    return e;
}
const J = new Map([
    ['file', 'binary'],
    ['any', 'any'],
    ['object', 'any'],
    ['array', 'any[]'],
    ['boolean', 'boolean'],
    ['byte', 'number'],
    ['int', 'number'],
    ['integer', 'number'],
    ['float', 'number'],
    ['double', 'number'],
    ['short', 'number'],
    ['long', 'number'],
    ['number', 'number'],
    ['char', 'string'],
    ['date', 'string'],
    ['date-time', 'string'],
    ['password', 'string'],
    ['string', 'string'],
    ['void', 'void'],
    ['null', 'null'],
]);
function Z(e, n) {
    return 'binary' === n ? 'binary' : J.get(e);
}
function G(e) {
    return e.replace(/^[^a-zA-Z_$]+/g, '').replace(/[^\w$]+/g, '_');
}
function X(e = 'any', n) {
    const t = { type: 'any', base: 'any', template: null, imports: [], isNullable: !1 };
    if (Array.isArray(e)) {
        const r = e
            .filter(e => 'null' !== e)
            .map(e => Z(e, n))
            .filter(P)
            .join(' | ');
        return (t.type = r), (t.base = r), (t.isNullable = e.includes('null')), t;
    }
    const r = Z(e, n);
    if (r) return (t.type = r), (t.base = r), t;
    const a = decodeURIComponent(V(e));
    if (/\[.*\]$/g.test(a)) {
        const e = a.match(/(.*?)\[(.*)\]$/);
        if (e?.length) {
            const n = X(G(e[1])),
                r = X(G(e[2]));
            return (
                'any[]' === n.type
                    ? ((t.type = `${r.type}[]`), (t.base = `${r.type}`), (n.imports = []))
                    : r.type
                    ? ((t.type = `${n.type}<${r.type}>`), (t.base = n.type), (t.template = r.type))
                    : ((t.type = n.type), (t.base = n.type), (t.template = n.type)),
                t.imports.push(...n.imports),
                t.imports.push(...r.imports),
                t
            );
        }
    }
    if (a) {
        const e = G(a);
        return (t.type = e), (t.base = e), t.imports.push(e), t;
    }
    return t;
}
function K(e, n, t, r) {
    const a = [],
        o = (function (e, n) {
            if (e.components && n)
                for (const t in e.components.schemas)
                    if (e.components.schemas.hasOwnProperty(t)) {
                        const r = e.components.schemas[t];
                        if (r.discriminator && r.oneOf?.length && r.oneOf.some(e => e.$ref && V(e.$ref) == n.name))
                            return r.discriminator;
                    }
        })(e, r);
    for (const l in n.properties)
        if (n.properties.hasOwnProperty(l)) {
            const i = n.properties[l],
                s = !!n.required?.includes(l),
                u = {
                    name: z(l),
                    description: _(i.description),
                    isDefinition: !1,
                    isReadOnly: !0 === i.readOnly,
                    isRequired: s,
                    format: i.format,
                    maximum: i.maximum,
                    exclusiveMaximum: i.exclusiveMaximum,
                    minimum: i.minimum,
                    exclusiveMinimum: i.exclusiveMinimum,
                    multipleOf: i.multipleOf,
                    maxLength: i.maxLength,
                    minLength: i.minLength,
                    maxItems: i.maxItems,
                    minItems: i.minItems,
                    uniqueItems: i.uniqueItems,
                    maxProperties: i.maxProperties,
                    minProperties: i.minProperties,
                    pattern: y(i.pattern),
                };
            if (r && o?.propertyName == l)
                a.push({
                    export: 'reference',
                    type: 'string',
                    base: `'${Q(o, r)}'`,
                    template: null,
                    isNullable: !0 === i.nullable,
                    link: null,
                    imports: [],
                    enum: [],
                    enums: [],
                    properties: [],
                    ...u,
                });
            else if (i.$ref) {
                const e = X(i.$ref);
                a.push({
                    export: 'reference',
                    type: e.type,
                    base: e.base,
                    template: e.template,
                    link: null,
                    isNullable: e.isNullable || !0 === i.nullable,
                    imports: e.imports,
                    enum: [],
                    enums: [],
                    properties: [],
                    ...u,
                });
            } else {
                const n = t(e, i);
                a.push({
                    export: n.export,
                    type: n.type,
                    base: n.base,
                    template: n.template,
                    link: n.link,
                    isNullable: n.isNullable || !0 === i.nullable,
                    imports: n.imports,
                    enum: n.enum,
                    enums: n.enums,
                    properties: n.properties,
                    ...u,
                });
            }
        }
    return a;
}
const Y = /~1/g,
    ee = /~0/g;
function ne(e, n) {
    if (n.$ref) {
        const t = n.$ref
            .replace(/^#/g, '')
            .split('/')
            .filter(e => e);
        let r = e;
        return (
            t.forEach(e => {
                const t = decodeURIComponent(e.replace(Y, '/').replace(ee, '~'));
                if (!r.hasOwnProperty(t)) throw new Error(`Could not find reference: "${n.$ref}"`);
                r = r[t];
            }),
            r
        );
    }
    return n;
}
function te(e, n, t, r, a) {
    const o = { type: r, imports: [], enums: [], properties: [] },
        l = [];
    if (
        (t
            .map(n => a(e, n))
            .filter(e => {
                const n = e.properties.length,
                    t = e.enums.length;
                return !('any' === e.type && !n && !t);
            })
            .forEach(e => {
                o.imports.push(...e.imports), o.enums.push(...e.enums), o.properties.push(e);
            }),
        n.required)
    ) {
        const r = (function (e, n, t, r) {
            return t
                .reduce((n, t) => {
                    if (t.$ref) {
                        const a = ne(e, t);
                        return [...n, ...r(e, a).properties];
                    }
                    return [...n, ...r(e, t).properties];
                }, [])
                .filter(e => !e.isRequired && n.includes(e.name))
                .map(e => ({ ...e, isRequired: !0 }));
        })(e, n.required, t, a);
        r.forEach(e => {
            o.imports.push(...e.imports), o.enums.push(...e.enums);
        }),
            l.push(...r);
    }
    if (n.properties) {
        const t = K(e, n, a);
        t.forEach(e => {
            o.imports.push(...e.imports), o.enums.push(...e.enums), 'enum' === e.export && o.enums.push(e);
        }),
            l.push(...t);
    }
    return (
        l.length &&
            o.properties.push({
                name: 'properties',
                export: 'interface',
                type: 'any',
                base: 'any',
                template: null,
                link: null,
                description: '',
                isDefinition: !1,
                isReadOnly: !1,
                isNullable: !1,
                isRequired: !1,
                imports: [],
                enum: [],
                enums: [],
                properties: l,
            }),
        o
    );
}
function re(e, n) {
    if (void 0 === e.default) return;
    if (null === e.default) return 'null';
    switch (e.type || typeof e.default) {
        case 'int':
        case 'integer':
        case 'number':
            return 'enum' === n?.export && n.enum?.[e.default] ? n.enum[e.default].value : e.default;
        case 'boolean':
            return JSON.stringify(e.default);
        case 'string':
            return `'${e.default}'`;
        case 'object':
            try {
                return JSON.stringify(e.default, null, 4);
            } catch (e) {}
    }
}
function ae(e, n, t = !1, r = '') {
    const a = {
        name: r,
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: _(n.description),
        isDefinition: t,
        isReadOnly: !0 === n.readOnly,
        isNullable: !0 === n.nullable,
        isRequired: !1,
        format: n.format,
        maximum: n.maximum,
        exclusiveMaximum: n.exclusiveMaximum,
        minimum: n.minimum,
        exclusiveMinimum: n.exclusiveMinimum,
        multipleOf: n.multipleOf,
        maxLength: n.maxLength,
        minLength: n.minLength,
        maxItems: n.maxItems,
        minItems: n.minItems,
        uniqueItems: n.uniqueItems,
        maxProperties: n.maxProperties,
        minProperties: n.minProperties,
        pattern: y(n.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (n.$ref) {
        const e = X(n.$ref);
        return (
            (a.export = 'reference'),
            (a.type = e.type),
            (a.base = e.base),
            (a.template = e.template),
            a.imports.push(...e.imports),
            (a.default = re(n, a)),
            a
        );
    }
    if (n.enum && 'boolean' !== n.type) {
        const e =
                ((o = n.enum),
                Array.isArray(o)
                    ? o
                          .filter((e, n, t) => t.indexOf(e) === n)
                          .filter(P)
                          .map(e =>
                              'number' == typeof e
                                  ? { name: `'_${e}'`, value: String(e), type: 'number', description: null }
                                  : {
                                        name: String(e)
                                            .replace(/\W+/g, '_')
                                            .replace(/^(\d+)/g, '_$1')
                                            .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                                            .toUpperCase(),
                                        value: `'${e}'`,
                                        type: 'string',
                                        description: null,
                                    }
                          )
                    : []),
            t = (function (e, n) {
                const t = n['x-enum-varnames'],
                    r = n['x-enum-descriptions'];
                return e.map((e, n) => ({
                    name: t?.[n] || e.name,
                    description: r?.[n] || e.description,
                    value: e.value,
                    type: e.type,
                }));
            })(e, n);
        if (t.length)
            return (
                (a.export = 'enum'),
                (a.type = 'string'),
                (a.base = 'string'),
                a.enum.push(...t),
                (a.default = re(n, a)),
                a
            );
    }
    var o;
    if (('int' === n.type || 'integer' === n.type) && n.description) {
        const e = (function (e) {
            if (/^(\w+=[0-9]+)/g.test(e)) {
                const n = e.match(/(\w+=[0-9]+,?)/g);
                if (n) {
                    const e = [];
                    return (
                        n.forEach(n => {
                            const t = n.split('=')[0],
                                r = parseInt(n.split('=')[1].replace(/[^0-9]/g, ''));
                            t &&
                                Number.isInteger(r) &&
                                e.push({
                                    name: t
                                        .replace(/\W+/g, '_')
                                        .replace(/^(\d+)/g, '_$1')
                                        .replace(/([a-z])([A-Z]+)/g, '$1_$2')
                                        .toUpperCase(),
                                    value: String(r),
                                    type: 'number',
                                    description: null,
                                });
                        }),
                        e.filter((e, n, t) => t.map(e => e.name).indexOf(e.name) === n)
                    );
                }
            }
            return [];
        })(n.description);
        if (e.length)
            return (
                (a.export = 'enum'),
                (a.type = 'number'),
                (a.base = 'number'),
                a.enum.push(...e),
                (a.default = re(n, a)),
                a
            );
    }
    if ('array' === n.type && n.items) {
        if (n.items.$ref) {
            const e = X(n.items.$ref);
            return (
                (a.export = 'array'),
                (a.type = e.type),
                (a.base = e.base),
                (a.template = e.template),
                a.imports.push(...e.imports),
                (a.default = re(n, a)),
                a
            );
        }
        {
            const t = ae(e, n.items);
            return (
                (a.export = 'array'),
                (a.type = t.type),
                (a.base = t.base),
                (a.template = t.template),
                (a.link = t),
                a.imports.push(...t.imports),
                (a.default = re(n, a)),
                a
            );
        }
    }
    if ('object' === n.type && 'object' == typeof n.additionalProperties) {
        if (n.additionalProperties.$ref) {
            const e = X(n.additionalProperties.$ref);
            return (
                (a.export = 'dictionary'),
                (a.type = e.type),
                (a.base = e.base),
                (a.template = e.template),
                a.imports.push(...e.imports),
                (a.default = re(n, a)),
                a
            );
        }
        {
            const t = ae(e, n.additionalProperties);
            return (
                (a.export = 'dictionary'),
                (a.type = t.type),
                (a.base = t.base),
                (a.template = t.template),
                (a.link = t),
                a.imports.push(...t.imports),
                (a.default = re(n, a)),
                a
            );
        }
    }
    if (n.oneOf?.length) {
        const t = te(e, n, n.oneOf, 'one-of', ae);
        return (
            (a.export = t.type),
            a.imports.push(...t.imports),
            a.properties.push(...t.properties),
            a.enums.push(...t.enums),
            a
        );
    }
    if (n.anyOf?.length) {
        const t = te(e, n, n.anyOf, 'any-of', ae);
        return (
            (a.export = t.type),
            a.imports.push(...t.imports),
            a.properties.push(...t.properties),
            a.enums.push(...t.enums),
            a
        );
    }
    if (n.allOf?.length) {
        const t = te(e, n, n.allOf, 'all-of', ae);
        return (
            (a.export = t.type),
            a.imports.push(...t.imports),
            a.properties.push(...t.properties),
            a.enums.push(...t.enums),
            a
        );
    }
    if ('object' === n.type) {
        if (((a.export = 'interface'), (a.type = 'any'), (a.base = 'any'), (a.default = re(n, a)), n.properties)) {
            K(e, n, ae, a).forEach(e => {
                a.imports.push(...e.imports),
                    a.enums.push(...e.enums),
                    a.properties.push(e),
                    'enum' === e.export && a.enums.push(e);
            });
        }
        return a;
    }
    if (n.type) {
        const e = X(n.type, n.format);
        return (
            (a.export = 'generic'),
            (a.type = e.type),
            (a.base = e.base),
            (a.template = e.template),
            (a.isNullable = e.isNullable || a.isNullable),
            a.imports.push(...e.imports),
            (a.default = re(n, a)),
            a
        );
    }
    return a;
}
const oe =
    /^(arguments|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/g;
function le(e) {
    const n = e
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return c.default(n).replace(oe, '_$1');
}
function ie(e, n) {
    const t = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null,
    };
    return (
        n.forEach(n => {
            const r = ne(e, n),
                a = (function (e, n) {
                    const t = {
                        in: n.in,
                        prop: n.name,
                        export: 'interface',
                        name: le(n.name),
                        type: 'any',
                        base: 'any',
                        template: null,
                        link: null,
                        description: _(n.description),
                        isDefinition: !1,
                        isReadOnly: !1,
                        isRequired: !0 === n.required,
                        isNullable: !0 === n.nullable,
                        imports: [],
                        enum: [],
                        enums: [],
                        properties: [],
                        mediaType: null,
                    };
                    if (n.$ref) {
                        const e = X(n.$ref);
                        return (
                            (t.export = 'reference'),
                            (t.type = e.type),
                            (t.base = e.base),
                            (t.template = e.template),
                            t.imports.push(...e.imports),
                            t
                        );
                    }
                    let r = n.schema;
                    if (r) {
                        if ((r.$ref?.startsWith('#/components/parameters/') && (r = ne(e, r)), r.$ref)) {
                            const e = X(r.$ref);
                            return (
                                (t.export = 'reference'),
                                (t.type = e.type),
                                (t.base = e.base),
                                (t.template = e.template),
                                t.imports.push(...e.imports),
                                (t.default = re(r)),
                                t
                            );
                        }
                        {
                            const n = ae(e, r);
                            return (
                                (t.export = n.export),
                                (t.type = n.type),
                                (t.base = n.base),
                                (t.template = n.template),
                                (t.link = n.link),
                                (t.isReadOnly = n.isReadOnly),
                                (t.isRequired = t.isRequired || n.isRequired),
                                (t.isNullable = t.isNullable || n.isNullable),
                                (t.format = n.format),
                                (t.maximum = n.maximum),
                                (t.exclusiveMaximum = n.exclusiveMaximum),
                                (t.minimum = n.minimum),
                                (t.exclusiveMinimum = n.exclusiveMinimum),
                                (t.multipleOf = n.multipleOf),
                                (t.maxLength = n.maxLength),
                                (t.minLength = n.minLength),
                                (t.maxItems = n.maxItems),
                                (t.minItems = n.minItems),
                                (t.uniqueItems = n.uniqueItems),
                                (t.maxProperties = n.maxProperties),
                                (t.minProperties = n.minProperties),
                                (t.pattern = y(n.pattern)),
                                (t.default = n.default),
                                t.imports.push(...n.imports),
                                t.enum.push(...n.enum),
                                t.enums.push(...n.enums),
                                t.properties.push(...n.properties),
                                t
                            );
                        }
                    }
                    return t;
                })(e, r);
            if ('api-version' !== a.prop)
                switch (r.in) {
                    case 'path':
                        t.parametersPath.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'query':
                        t.parametersQuery.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'formData':
                        t.parametersForm.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'cookie':
                        t.parametersCookie.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                        break;
                    case 'header':
                        t.parametersHeader.push(a), t.parameters.push(a), t.imports.push(...a.imports);
                }
        }),
        t
    );
}
const se = [
    'application/json-patch+json',
    'application/json',
    'application/x-www-form-urlencoded',
    'text/json',
    'text/plain',
    'multipart/form-data',
    'multipart/mixed',
    'multipart/related',
    'multipart/batch',
];
function ue(e, n) {
    const t = Object.keys(n)
        .filter(e => {
            const n = e.split(';')[0].trim();
            return se.includes(n);
        })
        .find(e => P(n[e]?.schema));
    if (t) return { mediaType: t, schema: n[t].schema };
    const r = Object.keys(n).find(e => P(n[e]?.schema));
    return r ? { mediaType: r, schema: n[r].schema } : null;
}
function pe(e, n, t) {
    const r = {
        in: 'response',
        name: '',
        code: t,
        description: _(n.description),
        export: 'generic',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        isDefinition: !1,
        isReadOnly: !1,
        isRequired: !1,
        isNullable: !1,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    if (n.content) {
        const t = ue(0, n.content);
        if (t) {
            if ((t.schema.$ref?.startsWith('#/components/responses/') && (t.schema = ne(e, t.schema)), t.schema.$ref)) {
                const e = X(t.schema.$ref);
                return (
                    (r.export = 'reference'),
                    (r.type = e.type),
                    (r.base = e.base),
                    (r.template = e.template),
                    r.imports.push(...e.imports),
                    r
                );
            }
            {
                const n = ae(e, t.schema);
                return (
                    (r.export = n.export),
                    (r.type = n.type),
                    (r.base = n.base),
                    (r.template = n.template),
                    (r.link = n.link),
                    (r.isReadOnly = n.isReadOnly),
                    (r.isRequired = n.isRequired),
                    (r.isNullable = n.isNullable),
                    (r.format = n.format),
                    (r.maximum = n.maximum),
                    (r.exclusiveMaximum = n.exclusiveMaximum),
                    (r.minimum = n.minimum),
                    (r.exclusiveMinimum = n.exclusiveMinimum),
                    (r.multipleOf = n.multipleOf),
                    (r.maxLength = n.maxLength),
                    (r.minLength = n.minLength),
                    (r.maxItems = n.maxItems),
                    (r.minItems = n.minItems),
                    (r.uniqueItems = n.uniqueItems),
                    (r.maxProperties = n.maxProperties),
                    (r.minProperties = n.minProperties),
                    (r.pattern = y(n.pattern)),
                    r.imports.push(...n.imports),
                    r.enum.push(...n.enum),
                    r.enums.push(...n.enums),
                    r.properties.push(...n.properties),
                    r
                );
            }
        }
    }
    if (n.headers)
        for (const e in n.headers)
            if (n.headers.hasOwnProperty(e))
                return (r.in = 'header'), (r.name = e), (r.type = 'string'), (r.base = 'string'), r;
    return r;
}
function ce(e) {
    if ('default' === e) return 200;
    if (/[0-9]+/g.test(e)) {
        const n = parseInt(e);
        if (Number.isInteger(n)) return Math.abs(n);
    }
    return null;
}
function me(e, n) {
    const t = e.type === n.type && e.base === n.base && e.template === n.template;
    return t && e.link && n.link ? me(e.link, n.link) : t;
}
function de(e) {
    const n = [];
    return (
        e.forEach(e => {
            const { code: t } = e;
            t && 204 !== t && t >= 200 && t < 300 && n.push(e);
        }),
        n.length ||
            n.push({
                in: 'response',
                name: '',
                code: 200,
                description: '',
                export: 'generic',
                type: 'void',
                base: 'void',
                template: null,
                link: null,
                isDefinition: !1,
                isReadOnly: !1,
                isRequired: !1,
                isNullable: !1,
                imports: [],
                enum: [],
                enums: [],
                properties: [],
            }),
        n.filter((e, n, t) => t.findIndex(n => me(n, e)) === n)
    );
}
function fe(e, n) {
    const t = e.isRequired && void 0 === e.default,
        r = n.isRequired && void 0 === n.default;
    return t && !r ? -1 : r && !t ? 1 : 0;
}
function he(e, n, t, r, a, o) {
    const l = (function (e) {
            const n = e
                .replace(/^[^a-zA-Z]+/g, '')
                .replace(/[^\w\-]+/g, '-')
                .trim();
            return c.default(n, { pascalCase: !0 });
        })(r),
        i = `${t}${l}`,
        s = (function (e) {
            const n = e
                .replace(/^[^a-zA-Z]+/g, '')
                .replace(/[^\w\-]+/g, '-')
                .trim();
            return c.default(n);
        })(a.operationId || i),
        u = (function (e) {
            return e.replace(/\{(.*?)\}/g, (e, n) => `\${${le(n)}}`).replace('${apiVersion}', '${OpenAPI.VERSION}');
        })(n),
        p = {
            service: l,
            name: s,
            hookName: `use${s[0].toUpperCase()}${s.slice(1)}`,
            summary: _(a.summary),
            description: _(a.description),
            deprecated: !0 === a.deprecated,
            method: t.toUpperCase(),
            path: u,
            parameters: [...o.parameters],
            parametersPath: [...o.parametersPath],
            parametersQuery: [...o.parametersQuery],
            parametersForm: [...o.parametersForm],
            parametersHeader: [...o.parametersHeader],
            parametersCookie: [...o.parametersCookie],
            parametersBody: o.parametersBody,
            imports: [],
            errors: [],
            results: [],
            responseHeader: null,
        };
    if (a.parameters) {
        const n = ie(e, a.parameters);
        p.imports.push(...n.imports),
            p.parameters.push(...n.parameters),
            p.parametersPath.push(...n.parametersPath),
            p.parametersQuery.push(...n.parametersQuery),
            p.parametersForm.push(...n.parametersForm),
            p.parametersHeader.push(...n.parametersHeader),
            p.parametersCookie.push(...n.parametersCookie),
            (p.parametersBody = n.parametersBody);
    }
    if (a.requestBody) {
        const n = (function (e, n) {
            const t = {
                in: 'body',
                export: 'interface',
                prop: 'requestBody',
                name: 'requestBody',
                type: 'any',
                base: 'any',
                template: null,
                link: null,
                description: _(n.description),
                default: void 0,
                isDefinition: !1,
                isReadOnly: !1,
                isRequired: !0 === n.required,
                isNullable: !0 === n.nullable,
                imports: [],
                enum: [],
                enums: [],
                properties: [],
                mediaType: null,
            };
            if (n.content) {
                const r = ue(0, n.content);
                if (r) {
                    switch (((t.mediaType = r.mediaType), t.mediaType)) {
                        case 'application/x-www-form-urlencoded':
                        case 'multipart/form-data':
                            (t.in = 'formData'), (t.name = 'formData'), (t.prop = 'formData');
                    }
                    if (r.schema.$ref) {
                        const e = X(r.schema.$ref);
                        return (
                            (t.export = 'reference'),
                            (t.type = e.type),
                            (t.base = e.base),
                            (t.template = e.template),
                            t.imports.push(...e.imports),
                            t
                        );
                    }
                    {
                        const n = ae(e, r.schema);
                        return (
                            (t.export = n.export),
                            (t.type = n.type),
                            (t.base = n.base),
                            (t.template = n.template),
                            (t.link = n.link),
                            (t.isReadOnly = n.isReadOnly),
                            (t.isRequired = t.isRequired || n.isRequired),
                            (t.isNullable = t.isNullable || n.isNullable),
                            (t.format = n.format),
                            (t.maximum = n.maximum),
                            (t.exclusiveMaximum = n.exclusiveMaximum),
                            (t.minimum = n.minimum),
                            (t.exclusiveMinimum = n.exclusiveMinimum),
                            (t.multipleOf = n.multipleOf),
                            (t.maxLength = n.maxLength),
                            (t.minLength = n.minLength),
                            (t.maxItems = n.maxItems),
                            (t.minItems = n.minItems),
                            (t.uniqueItems = n.uniqueItems),
                            (t.maxProperties = n.maxProperties),
                            (t.minProperties = n.minProperties),
                            (t.pattern = y(n.pattern)),
                            t.imports.push(...n.imports),
                            t.enum.push(...n.enum),
                            t.enums.push(...n.enums),
                            t.properties.push(...n.properties),
                            t
                        );
                    }
                }
            }
            return t;
        })(e, ne(e, a.requestBody));
        p.imports.push(...n.imports), p.parameters.push(n), (p.parametersBody = n);
    }
    if (a.responses) {
        const n = (function (e, n) {
                const t = [];
                for (const r in n)
                    if (n.hasOwnProperty(r)) {
                        const a = ne(e, n[r]),
                            o = ce(r);
                        if (o) {
                            const n = pe(e, a, o);
                            t.push(n);
                        }
                    }
                return t.sort((e, n) => (e.code < n.code ? -1 : e.code > n.code ? 1 : 0));
            })(e, a.responses),
            t = de(n);
        (p.errors = (function (e) {
            return e
                .filter(e => e.code >= 300 && e.description)
                .map(e => {
                    return {
                        code: e.code,
                        description: ((n = e.description), n.replace(/([^\\])`/g, '$1\\`').replace(/(\*\/)/g, '*_/')),
                    };
                    var n;
                });
        })(n)),
            (p.responseHeader = (function (e) {
                const n = e.find(e => 'header' === e.in);
                return n ? n.name : null;
            })(t)),
            t.forEach(e => {
                p.results.push(e), p.imports.push(...e.imports);
            });
    }
    return (p.parameters = p.parameters.sort(fe)), p;
}
function ye(e) {
    const n = (function (e = '1.0') {
            return String(e).replace(/^v/gi, '');
        })(e.info.version),
        t = (function (e) {
            const n = e.servers?.[0],
                t = n?.variables || {};
            let r = n?.url || '';
            for (const e in t) t.hasOwnProperty(e) && (r = r.replace(`{${e}}`, t[e].default));
            return r.replace(/\/$/g, '');
        })(e),
        r = (function (e) {
            const n = [];
            if (e.components)
                for (const t in e.components.schemas)
                    if (e.components.schemas.hasOwnProperty(t)) {
                        const r = ae(e, e.components.schemas[t], !0, X(t).base);
                        n.push(r);
                    }
            return n;
        })(e),
        a = (function (e) {
            const n = new Map();
            for (const t in e.paths)
                if (e.paths.hasOwnProperty(t)) {
                    const r = e.paths[t],
                        a = ie(e, r.parameters || []);
                    for (const o in r)
                        if (r.hasOwnProperty(o))
                            switch (o) {
                                case 'get':
                                case 'put':
                                case 'post':
                                case 'delete':
                                case 'options':
                                case 'head':
                                case 'patch':
                                    const l = r[o];
                                    (l.tags?.filter(T) || ['Service']).forEach(r => {
                                        const i = he(e, t, o, r, l, a),
                                            s = n.get(i.service) || { name: i.service, operations: [], imports: [] };
                                        s.operations.push(i), s.imports.push(...i.imports), n.set(i.service, s);
                                    });
                            }
                }
            return Array.from(n.values());
        })(e);
    return { version: n, server: t, models: r, services: a };
}
var ve;
function ge(e) {
    return e.enum.filter((e, n, t) => t.findIndex(n => n.name === e.name) === n);
}
function Pe(e) {
    return e.enums.filter((e, n, t) => t.findIndex(n => n.name === e.name) === n);
}
function be(e, n) {
    const t = e.toLowerCase(),
        r = n.toLowerCase();
    return t.localeCompare(r, 'en');
}
function Oe(e) {
    return e.imports
        .filter(T)
        .sort(be)
        .filter(n => e.name !== n);
}
function xe(e, n) {
    const t = [];
    return (
        e.map(n).forEach(e => {
            t.push(...e);
        }),
        t
    );
}
function ke(e) {
    const n = { ...e };
    return (
        (n.operations = (function (e) {
            const n = new Map();
            return e.operations.map(e => {
                const t = { ...e };
                t.imports.push(...xe(t.parameters, e => e.imports)), t.imports.push(...xe(t.results, e => e.imports));
                const r = t.name,
                    a = n.get(r) || 0;
                return a > 0 && (t.name = `${r}${a}`), n.set(r, a + 1), t;
            });
        })(n)),
        n.operations.forEach(e => {
            n.imports.push(...e.imports);
        }),
        (n.imports = (function (e) {
            return e.imports.filter(T).sort(be);
        })(n)),
        n
    );
}
function Re(e) {
    return {
        ...e,
        models: e.models.map(e =>
            (function (e) {
                return { ...e, imports: Oe(e), enums: Pe(e), enum: ge(e) };
            })(e)
        ),
        services: e.services.map(e => ke(e)),
    };
}
!(function (e) {
    (e[(e.V2 = 2)] = 'V2'), (e[(e.V3 = 3)] = 'V3');
})(ve || (ve = {}));
var we = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nimport type { ApiResult } from './ApiResult';\n\nexport class ApiError extends Error {\n    public readonly url: string;\n    public readonly status: number;\n    public readonly statusText: string;\n    public readonly body: any;\n\n    constructor(response: ApiResult, message: string) {\n        super(message);\n\n        this.name = 'ApiError';\n        this.url = response.url;\n        this.status = response.status;\n        this.statusText = response.statusText;\n        this.body = response.body;\n    }\n}"
            );
        },
        usePartial: !0,
        useData: !0,
    },
    qe = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nexport type ApiRequestHttpMethod =  'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';\n\nexport type ApiRequestOptions = {\n    readonly method: ApiRequestHttpMethod;\n    readonly path: string;\n    readonly cookies?: Record<string, any>;\n    readonly headers?: Record<string, any>;\n    readonly query?: Record<string, any>;\n    readonly formData?: Record<string, any>;\n    readonly body?: any;\n    readonly mediaType?: string;\n    readonly responseHeader?: string;\n    readonly errors?: Record<number, string>;\n}"
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Ce = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\nexport type ApiResult = {\n    readonly url: string;\n    readonly ok: boolean;\n    readonly status: number;\n    readonly statusText: string;\n    readonly body: any;\n}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    je = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function getHeaders(options: ApiRequestOptions, formData?: FormData): Promise<Record<string, string>> {\n  const token = await resolve(options, OpenAPI.TOKEN);\n  const username = await resolve(options, OpenAPI.USERNAME);\n  const password = await resolve(options, OpenAPI.PASSWORD);\n  const additionalHeaders = await resolve(options, OpenAPI.HEADERS);\n  const formHeaders = typeof formData?.getHeaders === 'function' && formData?.getHeaders() || {}\n\n  const headers = {\n    Accept: 'application/json',\n    ...additionalHeaders,\n    ...options.headers,\n    ...formHeaders,\n  };\n\n  if (isStringWithValue(token)) {\n    headers['Authorization'] = `Bearer ${token}`;\n  }\n\n  if (isStringWithValue(username) && isStringWithValue(password)) {\n    const credentials = base64(`${username}:${password}`);\n    headers['Authorization'] = `Basic ${credentials}`;\n  }\n\n  if (options.body) {\n    if (options.mediaType) {\n      headers['Content-Type'] = options.mediaType;\n    } else if (isBlob(options.body)) {\n      headers['Content-Type'] = options.body.type || 'application/octet-stream';\n    } else if (isString(options.body)) {\n      headers['Content-Type'] = 'text/plain';\n    } else if (!isFormData(options.body)) {\n      headers['Content-Type'] = 'application/json';\n    }\n  }\n\n  return headers;\n}";
        },
        useData: !0,
    },
    Ae = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getRequestBody(options: ApiRequestOptions): any {\n    if (options.body) {\n        return options.body;\n    }\n    return;\n}';
        },
        useData: !0,
    },
    De = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getResponseBody(response: AxiosResponse<any>): any {\n    if (response.status !== 204) {\n        return response.data;\n    }\n    return;\n}';
        },
        useData: !0,
    },
    Ie = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getResponseHeader(response: AxiosResponse<any>, responseHeader?: string): string | undefined {\n    if (responseHeader) {\n        const content = response.headers[responseHeader];\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return;\n}';
        },
        useData: !0,
    },
    Te = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nimport axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';\nimport FormData from 'form-data';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport { OpenAPI } from './OpenAPI';\n\n" +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isDefined'), n, {
                    name: 'functions/isDefined',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isString'), n, {
                    name: 'functions/isString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isStringWithValue'), n, {
                    name: 'functions/isStringWithValue',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isBlob'), n, {
                    name: 'functions/isBlob',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isSuccess'), n, {
                    name: 'functions/isSuccess',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/base64'), n, {
                    name: 'functions/base64',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getQueryString'), n, {
                    name: 'functions/getQueryString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getUrl'), n, {
                    name: 'functions/getUrl',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getFormData'), n, {
                    name: 'functions/getFormData',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/resolve'), n, {
                    name: 'functions/resolve',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'axios/getHeaders'), n, {
                    name: 'axios/getHeaders',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'axios/getRequestBody'), n, {
                    name: 'axios/getRequestBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'axios/sendRequest'), n, {
                    name: 'axios/sendRequest',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'axios/getResponseHeader'), n, {
                    name: 'axios/getResponseHeader',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'axios/getResponseBody'), n, {
                    name: 'axios/getResponseBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/catchErrors'), n, {
                    name: 'functions/catchErrors',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n/**\n * Request using axios client\n * @param options The request options from the the service\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport function request<T>(options: ApiRequestOptions): CancelablePromise<T> {\n    return new CancelablePromise(async (resolve, reject, onCancel) => {\n        try {\n            const url = getUrl(options);\n            const formData = getFormData(options);\n            const body = getRequestBody(options);\n            const headers = await getHeaders(options, formData);\n\n            if (!onCancel.isCancelled) {\n                const response = await sendRequest(options, url, formData, body, headers, onCancel);\n                const responseBody = getResponseBody(response);\n                const responseHeader = getResponseHeader(response, options.responseHeader);\n\n                const result: ApiResult = {\n                    url,\n                    ok: isSuccess(response.status),\n                    status: response.status,\n                    statusText: response.statusText,\n                    body: responseHeader || responseBody,\n                };\n\n                catchErrors(options, result);\n\n                resolve(result.body);\n            }\n        } catch (error) {\n            reject(error);\n        }\n    });\n}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Ee = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function sendRequest(\n    options: ApiRequestOptions,\n    url: string,\n    formData: FormData | undefined,\n    body: any,\n    headers: Record<string, string>,\n    onCancel: OnCancel\n): Promise<AxiosResponse<any>> {\n    const source = axios.CancelToken.source();\n\n    const config: AxiosRequestConfig = {\n        url,\n        headers,\n        data: body || formData,\n        method: options.method,\n        withCredentials: OpenAPI.WITH_CREDENTIALS,\n        cancelToken: source.token,\n    };\n\n    onCancel(() => source.cancel('The user aborted a request.'));\n\n    try {\n        return await axios.request(config);\n    } catch (error) {\n        const axiosError = error as AxiosError;\n        if (axiosError.response) {\n            return axiosError.response;\n        }\n        throw error;\n    }\n}";
        },
        useData: !0,
    },
    $e = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nexport class CancelError extends Error {\n\n    constructor(reason: string = 'Promise was canceled') {\n        super(reason);\n        this.name = 'CancelError';\n    }\n\n    public get isCancelled(): boolean {\n        return true;\n    }\n}\n\nexport interface OnCancel {\n    readonly isPending: boolean;\n    readonly isCancelled: boolean;\n\n    (cancelHandler: () => void): void;\n}\n\nexport class CancelablePromise<T> implements Promise<T> {\n    readonly [Symbol.toStringTag]: string;\n\n    #isPending: boolean;\n    #isCancelled: boolean;\n    readonly #cancelHandlers: (() => void)[];\n    readonly #promise: Promise<T>;\n    #resolve?: (value: T | PromiseLike<T>) => void;\n    #reject?: (reason?: any) => void;\n\n    constructor(\n        executor: (\n            resolve: (value: T | PromiseLike<T>) => void,\n            reject: (reason?: any) => void,\n            onCancel: OnCancel\n        ) => void\n    ) {\n        this.#isPending = true;\n        this.#isCancelled = false;\n        this.#cancelHandlers = [];\n        this.#promise = new Promise<T>((resolve, reject) => {\n            this.#resolve = resolve;\n            this.#reject = reject;\n\n            const onResolve = (value: T | PromiseLike<T>): void => {\n                if (!this.#isCancelled) {\n                    this.#isPending = false;\n                    this.#resolve?.(value);\n                }\n            };\n\n            const onReject = (reason?: any): void => {\n                this.#isPending = false;\n                this.#reject?.(reason);\n            };\n\n            const onCancel = (cancelHandler: () => void): void => {\n                if (this.#isPending) {\n                    this.#cancelHandlers.push(cancelHandler);\n                }\n            };\n\n            Object.defineProperty(onCancel, 'isPending', {\n                get: (): boolean => this.#isPending,\n            });\n\n            Object.defineProperty(onCancel, 'isCancelled', {\n                get: (): boolean => this.#isCancelled,\n            });\n\n            return executor(onResolve, onReject, onCancel as OnCancel);\n        });\n    }\n\n    public then<TResult1 = T, TResult2 = never>(\n        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,\n        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null\n    ): Promise<TResult1 | TResult2> {\n        return this.#promise.then(onFulfilled, onRejected);\n    }\n\n    public catch<TResult = never>(\n        onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null\n    ): Promise<T | TResult> {\n        return this.#promise.catch(onRejected);\n    }\n\n    public finally(onFinally?: (() => void) | null): Promise<T> {\n        return this.#promise.finally(onFinally);\n    }\n\n    public cancel(): void {\n        if (!this.#isPending || this.#isCancelled) {\n            return;\n        }\n        this.#isCancelled = true;\n        if (this.#cancelHandlers.length) {\n            try {\n                for (const cancelHandler of this.#cancelHandlers) {\n                    cancelHandler();\n                }\n            } catch (error) {\n                this.#reject?.(error);\n                return;\n            }\n        }\n    }\n\n    public get isCancelled(): boolean {\n        return this.#isCancelled;\n    }\n}"
            );
        },
        usePartial: !0,
        useData: !0,
    },
    He = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function getHeaders(\n  options: ApiRequestOptions,\n): Promise<Record<string, string>> {\n  const token = await resolve(options, OpenAPI.TOKEN);\n  const username = await resolve(options, OpenAPI.USERNAME);\n  const password = await resolve(options, OpenAPI.PASSWORD);\n  const additionalHeaders = await resolve(options, OpenAPI.HEADERS);\n\n  const headers = {\n    Accept: 'application/json',\n    ...additionalHeaders,\n    ...options.headers,\n  };\n\n  if (isStringWithValue(token)) {\n    headers['Authorization'] = `Bearer ${token}`;\n  }\n\n  if (isStringWithValue(username) && isStringWithValue(password)) {\n    const credentials = base64(`${username}:${password}`);\n    headers['Authorization'] = `Basic ${credentials}`;\n  }\n\n  if (options.body) {\n    if (options.mediaType) {\n      headers['Content-Type'] = options.mediaType;\n    } else if (isBlob(options.body)) {\n      headers['Content-Type'] = options.body.type || 'application/octet-stream';\n    } else if (isString(options.body)) {\n      headers['Content-Type'] = 'text/plain';\n    } else if (!isFormData(options.body)) {\n      headers['Content-Type'] = 'application/json';\n    }\n  }\n\n  return headers;\n}";
        },
        useData: !0,
    },
    Se = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function getRequestBody(options: ApiRequestOptions): BodyInit | undefined {\n    if (options.body) {\n        if (options.mediaType?.includes('/json')) {\n            return JSON.stringify(options.body)\n        } else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n            return options.body;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n    return;\n}";
        },
        useData: !0,
    },
    Ne = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function getResponseBody(response: Response): Promise<any> {\n    if (response.status !== 204) {\n        try {\n            const contentType = response.headers.get('Content-Type');\n            if (contentType) {\n                const isJSON = contentType.toLowerCase().startsWith('application/json');\n                if (isJSON) {\n                    return await response.json();\n                } else {\n                    return await response.text();\n                }\n            }\n        } catch (error) {\n            console.error(error);\n        }\n    }\n    return;\n}";
        },
        useData: !0,
    },
    Be = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getResponseHeader(response: Response, responseHeader?: string): string | undefined {\n    if (responseHeader) {\n        const content = response.headers.get(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return;\n}';
        },
        useData: !0,
    },
    Le = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport { OpenAPI } from './OpenAPI';\n\n" +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isDefined'), n, {
                    name: 'functions/isDefined',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isString'), n, {
                    name: 'functions/isString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isStringWithValue'), n, {
                    name: 'functions/isStringWithValue',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isBlob'), n, {
                    name: 'functions/isBlob',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isFormData'), n, {
                    name: 'functions/isFormData',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/base64'), n, {
                    name: 'functions/base64',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getQueryString'), n, {
                    name: 'functions/getQueryString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getUrl'), n, {
                    name: 'functions/getUrl',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getFormData'), n, {
                    name: 'functions/getFormData',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/resolve'), n, {
                    name: 'functions/resolve',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'fetch/getHeaders'), n, {
                    name: 'fetch/getHeaders',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'fetch/getRequestBody'), n, {
                    name: 'fetch/getRequestBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'fetch/sendRequest'), n, {
                    name: 'fetch/sendRequest',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'fetch/getResponseHeader'), n, {
                    name: 'fetch/getResponseHeader',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'fetch/getResponseBody'), n, {
                    name: 'fetch/getResponseBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/catchErrors'), n, {
                    name: 'functions/catchErrors',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n/**\n * Request using fetch client\n * @param options The request options from the the service\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport function request<T>(options: ApiRequestOptions): CancelablePromise<T> {\n    return new CancelablePromise(async (resolve, reject, onCancel) => {\n        try {\n            const url = getUrl(options);\n            const formData = getFormData(options);\n            const body = getRequestBody(options);\n            const headers = await getHeaders(options);\n\n            if (!onCancel.isCancelled) {\n                const response = await sendRequest(options, url, formData, body, headers, onCancel);\n                const responseBody = await getResponseBody(response);\n                const responseHeader = getResponseHeader(response, options.responseHeader);\n\n                const result: ApiResult = {\n                    url,\n                    ok: response.ok,\n                    status: response.status,\n                    statusText: response.statusText,\n                    body: responseHeader || responseBody,\n                };\n\n                catchErrors(options, result);\n\n                resolve(result.body);\n            }\n        } catch (error) {\n            reject(error);\n        }\n    });\n}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Me = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'async function sendRequest(\n    options: ApiRequestOptions,\n    url: string,\n    formData: FormData | undefined,\n    body: BodyInit | undefined,\n    headers: Headers,\n    onCancel: OnCancel\n): Promise<Response> {\n    const controller = new AbortController();\n\n    const request: RequestInit = {\n        headers,\n        body: body || formData,\n        method: options.method,\n        signal: controller.signal,\n    };\n\n    if (OpenAPI.WITH_CREDENTIALS) {\n        request.credentials = OpenAPI.CREDENTIALS;\n    }\n\n    if (OpenAPI.CORS) {\n        request.mode = OpenAPI.CORS;\n    }\n\n    onCancel(() => controller.abort());\n\n    return await fetch(url, request);\n}';
        },
        useData: !0,
    },
    Fe = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function base64(str: string): string {\n    try {\n        return btoa(str);\n    } catch (err) {\n        // @ts-ignore\n        return Buffer.from(str).toString('base64');\n    }\n}";
        },
        useData: !0,
    },
    Ue = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function catchErrors(options: ApiRequestOptions, result: ApiResult): void {\n    const errors: Record<number, string> = {\n        400: 'Bad Request',\n        401: 'Unauthorized',\n        403: 'Forbidden',\n        404: 'Not Found',\n        500: 'Internal Server Error',\n        502: 'Bad Gateway',\n        503: 'Service Unavailable',\n        ...options.errors,\n    }\n\n    const error = errors[result.status];\n    if (error) {\n        throw new ApiError(result, error);\n    }\n\n    if (!result.ok) {\n        throw new ApiError(result, 'Generic Error');\n    }\n}";
        },
        useData: !0,
    },
    We = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getFormData(options: ApiRequestOptions): FormData | undefined {\n    if (options.formData) {\n        const formData = new FormData();\n\n        const append = (key: string, value: any) => {\n            if (isString(value) || isBlob(value)) {\n                formData.append(key, value);\n            } else {\n                formData.append(key, JSON.stringify(value));\n            }\n        };\n\n        Object.entries(options.formData)\n            .filter(([_, value]) => isDefined(value))\n            .forEach(([key, value]) => {\n                if (Array.isArray(value)) {\n                    value.forEach(v => append(key, v));\n                } else {\n                    append(key, value);\n                }\n            });\n\n        return formData;\n    }\n    return;\n}';
        },
        useData: !0,
    },
    _e = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function getQueryString(params: Record<string, any>): string {\n    const qs: string[] = [];\n\n    const append = (key: string, value: any) => {\n        qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);\n    };\n\n    Object.entries(params)\n        .filter(([_, value]) => isDefined(value))\n        .forEach(([key, value]) => {\n            if (Array.isArray(value)) {\n                value.forEach(v => append(key, v));\n            } else {\n                append(key, value);\n            }\n        });\n\n    if (qs.length > 0) {\n        return `?${qs.join('&')}`;\n    }\n\n    return '';\n}";
        },
        useData: !0,
    },
    Ve = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getUrl(options: ApiRequestOptions): string {\n    const path = OpenAPI.ENCODE_PATH ? OpenAPI.ENCODE_PATH(options.path) : options.path;\n    const url = `${OpenAPI.BASE}${path}`;\n    if (options.query) {\n        return `${url}${getQueryString(options.query)}`;\n    }\n\n    return url;\n}';
        },
        useData: !0,
    },
    Qe = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function isBlob(value: any): value is Blob {\n    return (\n        typeof value === 'object' &&\n        typeof value.type === 'string' &&\n        typeof value.stream === 'function' &&\n        typeof value.arrayBuffer === 'function' &&\n        typeof value.constructor === 'function' &&\n        typeof value.constructor.name === 'string' &&\n        /^(Blob|File)$/.test(value.constructor.name) &&\n        /^(Blob|File)$/.test(value[Symbol.toStringTag])\n    );\n}";
        },
        useData: !0,
    },
    ze = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function isDefined<T>(value: T | null | undefined): value is Exclude<T, null | undefined> {\n    return value !== undefined && value !== null;\n}';
        },
        useData: !0,
    },
    Je = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function isFormData(value: any): value is FormData {\n    return value instanceof FormData;\n}';
        },
        useData: !0,
    },
    Ze = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function isString(value: any): value is string {\n    return typeof value === 'string';\n}";
        },
        useData: !0,
    },
    Ge = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function isStringWithValue(value: any): value is string {\n    return isString(value) && value !== '';\n}";
        },
        useData: !0,
    },
    Xe = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function isSuccess(status: number): boolean {\n    return status >= 200 && status < 300;\n}';
        },
        useData: !0,
    },
    Ke = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;\n\nasync function resolve<T>(options: ApiRequestOptions, resolver?: T | Resolver<T>): Promise<T | undefined> {\n    if (typeof resolver === 'function') {\n        return (resolver as Resolver<T>)(options);\n    }\n    return resolver;\n}";
        },
        useData: !0,
    },
    Ye = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function getHeaders(\n  options: ApiRequestOptions,\n): Promise<Record<string, string>> {\n  const token = await resolve(options, OpenAPI.TOKEN);\n  const username = await resolve(options, OpenAPI.USERNAME);\n  const password = await resolve(options, OpenAPI.PASSWORD);\n  const additionalHeaders = await resolve(options, OpenAPI.HEADERS);\n\n  const headers = {\n    Accept: 'application/json',\n    ...additionalHeaders,\n    ...options.headers,\n  };\n\n  if (isStringWithValue(token)) {\n    headers['Authorization'] = `Bearer ${token}`;\n  }\n\n  if (isStringWithValue(username) && isStringWithValue(password)) {\n    const credentials = base64(`${username}:${password}`);\n    headers['Authorization'] = `Basic ${credentials}`;\n  }\n\n  if (options.body) {\n    if (options.mediaType) {\n      headers['Content-Type'] = options.mediaType;\n    } else if (isBlob(options.body)) {\n      headers['Content-Type'] = options.body.type || 'application/octet-stream';\n    } else if (isString(options.body)) {\n      headers['Content-Type'] = 'text/plain';\n    } else if (!isFormData(options.body)) {\n      headers['Content-Type'] = 'application/json';\n    }\n  }\n\n  return headers;\n}";
        },
        useData: !0,
    },
    en = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function getRequestBody(options: ApiRequestOptions): BodyInit | undefined {\n    if (options.body) {\n        if (options.mediaType?.includes('/json')) {\n            return JSON.stringify(options.body)\n        } else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n            return options.body as any;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n    return;\n}";
        },
        useData: !0,
    },
    nn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function getResponseBody(response: Response): Promise<any> {\n    if (response.status !== 204) {\n        try {\n            const contentType = response.headers.get('Content-Type');\n            if (contentType) {\n                const isJSON = contentType.toLowerCase().startsWith('application/json');\n                if (isJSON) {\n                    return await response.json();\n                } else {\n                    return await response.text();\n                }\n            }\n        } catch (error) {\n            console.error(error);\n        }\n    }\n    return;\n}";
        },
        useData: !0,
    },
    tn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getResponseHeader(response: Response, responseHeader?: string): string | undefined {\n    if (responseHeader) {\n        const content = response.headers.get(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return;\n}';
        },
        useData: !0,
    },
    rn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nimport { AbortController } from 'abort-controller';\nimport FormData from 'form-data';\nimport fetch, { BodyInit, Headers, RequestInit, Response } from 'node-fetch';\n\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport { OpenAPI } from './OpenAPI';\n\n" +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isDefined'), n, {
                    name: 'functions/isDefined',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isString'), n, {
                    name: 'functions/isString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isStringWithValue'), n, {
                    name: 'functions/isStringWithValue',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isBlob'), n, {
                    name: 'functions/isBlob',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isFormData'), n, {
                    name: 'functions/isFormData',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/base64'), n, {
                    name: 'functions/base64',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getQueryString'), n, {
                    name: 'functions/getQueryString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getUrl'), n, {
                    name: 'functions/getUrl',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getFormData'), n, {
                    name: 'functions/getFormData',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/resolve'), n, {
                    name: 'functions/resolve',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'node/getHeaders'), n, {
                    name: 'node/getHeaders',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'node/getRequestBody'), n, {
                    name: 'node/getRequestBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'node/sendRequest'), n, {
                    name: 'node/sendRequest',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'node/getResponseHeader'), n, {
                    name: 'node/getResponseHeader',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'node/getResponseBody'), n, {
                    name: 'node/getResponseBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/catchErrors'), n, {
                    name: 'functions/catchErrors',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n/**\n * Request using node-fetch client\n * @param options The request options from the the service\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport function request<T>(options: ApiRequestOptions): CancelablePromise<T> {\n    return new CancelablePromise(async (resolve, reject, onCancel) => {\n        try {\n            const url = getUrl(options);\n            const formData = getFormData(options);\n            const body = getRequestBody(options);\n            const headers = await getHeaders(options);\n\n            if (!onCancel.isCancelled) {\n                const response = await sendRequest(options, url, formData, body, headers, onCancel);\n                const responseBody = await getResponseBody(response);\n                const responseHeader = getResponseHeader(response, options.responseHeader);\n\n                const result: ApiResult = {\n                    url,\n                    ok: response.ok,\n                    status: response.status,\n                    statusText: response.statusText,\n                    body: responseHeader || responseBody,\n                };\n\n                catchErrors(options, result);\n\n                resolve(result.body);\n            }\n        } catch (error) {\n            reject(error);\n        }\n    });\n}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    an = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'async function sendRequest(\n    options: ApiRequestOptions,\n    url: string,\n    formData: FormData | undefined,\n    body: BodyInit | undefined,\n    headers: Headers,\n    onCancel: OnCancel\n): Promise<Response> {\n    const controller = new AbortController();\n\n    const request: RequestInit = {\n        headers,\n        method: options.method,\n        body: body || formData,\n        signal: controller.signal,\n    };\n\n    onCancel(() => controller.abort());\n\n    return await fetch(url, request);\n}';
        },
        useData: !0,
    },
    on = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda,
                s =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(s(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nimport type { ApiRequestOptions } from './ApiRequestOptions';\n\ntype Resolver<T> = (options: ApiRequestOptions) => Promise<T>;\ntype Headers = Record<string, string>;\n\ntype Config = {\n    BASE: string;\n    CORS?: 'no-cors' | 'cors';\n    VERSION: string;\n    WITH_CREDENTIALS: boolean;\n    CREDENTIALS: 'include' | 'omit' | 'same-origin';\n    TOKEN?: string | Resolver<string>;\n    USERNAME?: string | Resolver<string>;\n    PASSWORD?: string | Resolver<string>;\n    HEADERS?: Headers | Resolver<Headers>;\n    ENCODE_PATH?: (path: string) => string;\n}\n\nexport const OpenAPI: Config = {\n    BASE: '" +
                (null != (o = i(l(n, 'server', { start: { line: 22, column: 14 }, end: { line: 22, column: 20 } }), n))
                    ? o
                    : '') +
                "',\n    VERSION: '" +
                (null != (o = i(l(n, 'version', { start: { line: 23, column: 17 }, end: { line: 23, column: 24 } }), n))
                    ? o
                    : '') +
                "',\n    WITH_CREDENTIALS: false,\n    CREDENTIALS: 'include',\n    TOKEN: undefined,\n    USERNAME: undefined,\n    PASSWORD: undefined,\n    HEADERS: undefined,\n    ENCODE_PATH: undefined,\n};"
            );
        },
        usePartial: !0,
        useData: !0,
    },
    ln = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'fetch/request'), n, {
                    name: 'fetch/request',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'xhr/request'), n, {
                    name: 'xhr/request',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        5: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'axios/request'), n, {
                    name: 'axios/request',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        7: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'node/request'), n, {
                    name: 'node/request',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'fetch', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 67 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'xhr', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 63 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'axios', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 67 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'node', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 65 } },
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    sn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function getHeaders(\n  options: ApiRequestOptions,\n): Promise<Record<string, string>> {\n  const token = await resolve(options, OpenAPI.TOKEN);\n  const username = await resolve(options, OpenAPI.USERNAME);\n  const password = await resolve(options, OpenAPI.PASSWORD);\n  const additionalHeaders = await resolve(options, OpenAPI.HEADERS);\n\n  const headers = {\n    Accept: 'application/json',\n    ...additionalHeaders,\n    ...options.headers,\n  };\n\n  if (isStringWithValue(token)) {\n    headers['Authorization'] = `Bearer ${token}`;\n  }\n\n  if (isStringWithValue(username) && isStringWithValue(password)) {\n    const credentials = base64(`${username}:${password}`);\n    headers['Authorization'] = `Basic ${credentials}`;\n  }\n\n  if (options.body) {\n    if (options.mediaType) {\n      headers['Content-Type'] = options.mediaType;\n    } else if (isBlob(options.body)) {\n      headers['Content-Type'] = options.body.type || 'application/octet-stream';\n    } else if (isString(options.body)) {\n      headers['Content-Type'] = 'text/plain';\n    } else if (!isFormData(options.body)) {\n      headers['Content-Type'] = 'application/json';\n    }\n  }\n\n  return headers;\n}";
        },
        useData: !0,
    },
    un = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function getRequestBody(options: ApiRequestOptions): any {\n    if (options.body) {\n        if (options.mediaType?.includes('/json')) {\n            return JSON.stringify(options.body)\n        } else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n            return options.body;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n\n    return;\n}";
        },
        useData: !0,
    },
    pn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "function getResponseBody(xhr: XMLHttpRequest): any {\n    if (xhr.status !== 204) {\n        try {\n            const contentType = xhr.getResponseHeader('Content-Type');\n            if (contentType) {\n                const isJSON = contentType.toLowerCase().startsWith('application/json');\n                if (isJSON) {\n                    return JSON.parse(xhr.responseText);\n                } else {\n                    return xhr.responseText;\n                }\n            }\n        } catch (error) {\n            console.error(error);\n        }\n    }\n    return;\n}";
        },
        useData: !0,
    },
    cn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return 'function getResponseHeader(xhr: XMLHttpRequest, responseHeader?: string): string | undefined {\n    if (responseHeader) {\n        const content = xhr.getResponseHeader(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return;\n}';
        },
        useData: !0,
    },
    mn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\nimport { CancelablePromise } from './CancelablePromise';\nimport type { OnCancel } from './CancelablePromise';\nimport { OpenAPI } from './OpenAPI';\n\n" +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isDefined'), n, {
                    name: 'functions/isDefined',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isString'), n, {
                    name: 'functions/isString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isStringWithValue'), n, {
                    name: 'functions/isStringWithValue',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isBlob'), n, {
                    name: 'functions/isBlob',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isFormData'), n, {
                    name: 'functions/isFormData',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/isSuccess'), n, {
                    name: 'functions/isSuccess',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/base64'), n, {
                    name: 'functions/base64',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getQueryString'), n, {
                    name: 'functions/getQueryString',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getUrl'), n, {
                    name: 'functions/getUrl',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/getFormData'), n, {
                    name: 'functions/getFormData',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/resolve'), n, {
                    name: 'functions/resolve',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'fetch/getHeaders'), n, {
                    name: 'fetch/getHeaders',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'xhr/getRequestBody'), n, {
                    name: 'xhr/getRequestBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'xhr/sendRequest'), n, {
                    name: 'xhr/sendRequest',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'xhr/getResponseHeader'), n, {
                    name: 'xhr/getResponseHeader',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'xhr/getResponseBody'), n, {
                    name: 'xhr/getResponseBody',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = e.invokePartial(l(r, 'functions/catchErrors'), n, {
                    name: 'functions/catchErrors',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n\n/**\n * Request using XHR client\n * @param options The request options from the the service\n * @returns CancelablePromise<T>\n * @throws ApiError\n */\nexport function request<T>(options: ApiRequestOptions): CancelablePromise<T> {\n    return new CancelablePromise(async (resolve, reject, onCancel) => {\n        try {\n            const url = getUrl(options);\n            const formData = getFormData(options);\n            const body = getRequestBody(options);\n            const headers = await getHeaders(options);\n\n            if (!onCancel.isCancelled) {\n                const response = await sendRequest(options, url, formData, body, headers, onCancel);\n                const responseBody = getResponseBody(response);\n                const responseHeader = getResponseHeader(response, options.responseHeader);\n\n                const result: ApiResult = {\n                    url,\n                    ok: isSuccess(response.status),\n                    status: response.status,\n                    statusText: response.statusText,\n                    body: responseHeader || responseBody,\n                };\n\n                catchErrors(options, result);\n\n                resolve(result.body);\n            }\n        } catch (error) {\n            reject(error);\n        }\n    });\n}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    dn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return "async function sendRequest(\n    options: ApiRequestOptions,\n    url: string,\n    formData: FormData | undefined,\n    body: any,\n    headers: Headers,\n    onCancel: OnCancel\n): Promise<XMLHttpRequest> {\n    const xhr = new XMLHttpRequest();\n    xhr.open(options.method, url, true);\n    xhr.withCredentials = OpenAPI.WITH_CREDENTIALS;\n\n    headers.forEach((value, key) => {\n        xhr.setRequestHeader(key, value);\n    });\n\n    return new Promise<XMLHttpRequest>((resolve, reject) => {\n        xhr.onload = () => resolve(xhr);\n        xhr.onabort = () => reject(new Error('The user aborted a request.'));\n        xhr.onerror = () => reject(new Error('Network error.'));\n        xhr.send(body || formData);\n\n        onCancel(() => xhr.abort());\n    });\n}";
        },
        useData: !0,
    },
    fn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'imports'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 5, column: 0 }, end: { line: 7, column: 9 } },
                }))
                    ? o
                    : '')
            );
        },
        2: function (e, n, t, r, a) {
            var o,
                l = e.lambda;
            return (
                'import type { ' +
                (null != (o = l(n, n)) ? o : '') +
                " } from './" +
                (null != (o = l(n, n)) ? o : '') +
                "';\n"
            );
        },
        4: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'exportInterface'), n, {
                    name: 'exportInterface',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        6: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'one-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.program(9, a, 0),
                    data: a,
                    loc: { start: { line: 12, column: 0 }, end: { line: 26, column: 0 } },
                }))
                ? o
                : '';
        },
        7: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'exportComposition'), n, {
                    name: 'exportComposition',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        9: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'any-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.program(10, a, 0),
                    data: a,
                    loc: { start: { line: 14, column: 0 }, end: { line: 26, column: 0 } },
                }))
                ? o
                : '';
        },
        10: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'all-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.program(11, a, 0),
                    data: a,
                    loc: { start: { line: 16, column: 0 }, end: { line: 26, column: 0 } },
                }))
                ? o
                : '';
        },
        11: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'enum', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(12, a, 0),
                    inverse: e.program(13, a, 0),
                    data: a,
                    loc: { start: { line: 18, column: 0 }, end: { line: 26, column: 0 } },
                }))
                ? o
                : '';
        },
        12: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(l(a, 'root'), 'useUnionTypes'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.program(15, a, 0),
                    data: a,
                    loc: { start: { line: 19, column: 0 }, end: { line: 23, column: 7 } },
                }))
                ? o
                : '';
        },
        13: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'exportType'), n, {
                    name: 'exportType',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        15: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'exportEnum'), n, {
                    name: 'exportEnum',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(i(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'imports'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 8, column: 7 } },
                }))
                    ? o
                    : '') +
                '\n' +
                (null !=
                (o = i(t, 'equals').call(l, i(n, 'export'), 'interface', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.program(6, a, 0),
                    data: a,
                    loc: { start: { line: 10, column: 0 }, end: { line: 26, column: 11 } },
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    hn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\nexport const $' +
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 3, column: 17 }, end: { line: 3, column: 21 } }), n))
                    ? o
                    : '') +
                ' = ' +
                (null !=
                (o = e.invokePartial(l(r, 'schema'), n, {
                    name: 'schema',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ' as const;'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    yn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'imports'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 0 }, end: { line: 6, column: 9 } },
                }))
                ? o
                : '';
        },
        2: function (e, n, t, r, a) {
            var o,
                l = e.lambda;
            return (
                'import type { ' +
                (null != (o = l(n, n)) ? o : '') +
                " } from '../models/" +
                (null != (o = l(n, n)) ? o : '') +
                "';\n"
            );
        },
        4: function (e, n, t, r, a) {
            return "import { OpenAPI } from '../core/OpenAPI';\n";
        },
        6: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i = e.strict,
                s = e.lambda,
                u =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '    /**\n' +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'deprecated'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 20, column: 4 }, end: { line: 22, column: 11 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'summary'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 23, column: 4 }, end: { line: 25, column: 11 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(11, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 26, column: 4 }, end: { line: 28, column: 11 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'unless').call(l, u(u(a, 'root'), 'useOptions'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 29, column: 4 }, end: { line: 35, column: 15 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'each').call(l, u(n, 'results'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(17, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 36, column: 4 }, end: { line: 38, column: 13 } },
                }))
                    ? o
                    : '') +
                '     * @throws ApiError\n     */\n  export const ' +
                (null != (o = s(i(n, 'name', { start: { line: 41, column: 18 }, end: { line: 41, column: 22 } }), n))
                    ? o
                    : '') +
                ' = (' +
                (null !=
                (o = e.invokePartial(u(r, 'parameters'), n, {
                    name: 'parameters',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '): CancelablePromise<' +
                (null !=
                (o = e.invokePartial(u(r, 'result'), n, {
                    name: 'result',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                "> => {\n        return __request({\n            method: '" +
                (null != (o = s(i(n, 'method', { start: { line: 43, column: 24 }, end: { line: 43, column: 30 } }), n))
                    ? o
                    : '') +
                "',\n            path: `" +
                (null != (o = s(i(n, 'path', { start: { line: 44, column: 22 }, end: { line: 44, column: 26 } }), n))
                    ? o
                    : '') +
                '`,\n' +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'parametersCookie'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(19, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 45, column: 12 }, end: { line: 51, column: 19 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'parametersHeader'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(22, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 52, column: 12 }, end: { line: 58, column: 19 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'parametersQuery'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(24, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 59, column: 12 }, end: { line: 65, column: 19 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'parametersForm'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(26, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 66, column: 12 }, end: { line: 72, column: 19 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'parametersBody'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(28, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 73, column: 12 }, end: { line: 83, column: 19 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'responseHeader'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(35, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 84, column: 12 }, end: { line: 86, column: 19 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = u(t, 'if').call(l, u(n, 'errors'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(37, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 87, column: 12 }, end: { line: 93, column: 19 } },
                }))
                    ? o
                    : '') +
                '        });\n    }\n\n'
            );
        },
        7: function (e, n, t, r, a) {
            return '     * @deprecated\n';
        },
        9: function (e, n, t, r, a) {
            var o;
            return (
                '     * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'summary', { start: { line: 24, column: 10 }, end: { line: 24, column: 17 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n'
            );
        },
        11: function (e, n, t, r, a) {
            var o;
            return (
                '     * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 27, column: 10 }, end: { line: 27, column: 21 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n'
            );
        },
        13: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'parameters'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(14, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 30, column: 4 }, end: { line: 34, column: 11 } },
                }))
                ? o
                : '';
        },
        14: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'parameters'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(15, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 31, column: 4 }, end: { line: 33, column: 13 } },
                }))
                ? o
                : '';
        },
        15: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                '     * @param ' +
                (null != (o = i(l(n, 'name', { start: { line: 32, column: 17 }, end: { line: 32, column: 21 } }), n))
                    ? o
                    : '') +
                ' ' +
                (null !=
                (o = i(l(n, 'description', { start: { line: 32, column: 28 }, end: { line: 32, column: 39 } }), n))
                    ? o
                    : '') +
                '\n'
            );
        },
        17: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                '     * @returns ' +
                (null != (o = i(l(n, 'type', { start: { line: 37, column: 19 }, end: { line: 37, column: 23 } }), n))
                    ? o
                    : '') +
                ' ' +
                (null !=
                (o = i(l(n, 'description', { start: { line: 37, column: 30 }, end: { line: 37, column: 41 } }), n))
                    ? o
                    : '') +
                '\n'
            );
        },
        19: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '            cookies: {\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'parametersCookie'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(20, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 47, column: 16 }, end: { line: 49, column: 25 } },
                }))
                    ? o
                    : '') +
                '            },\n'
            );
        },
        20: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                "                '" +
                (null != (o = i(l(n, 'prop', { start: { line: 48, column: 20 }, end: { line: 48, column: 24 } }), n))
                    ? o
                    : '') +
                "': " +
                (null != (o = i(l(n, 'name', { start: { line: 48, column: 33 }, end: { line: 48, column: 37 } }), n))
                    ? o
                    : '') +
                ',\n'
            );
        },
        22: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '            headers: {\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'parametersHeader'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(20, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 54, column: 16 }, end: { line: 56, column: 25 } },
                }))
                    ? o
                    : '') +
                '            },\n'
            );
        },
        24: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '            query: {\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'parametersQuery'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(20, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 61, column: 16 }, end: { line: 63, column: 25 } },
                }))
                    ? o
                    : '') +
                '            },\n'
            );
        },
        26: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '            formData: {\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'parametersForm'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(20, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 68, column: 16 }, end: { line: 70, column: 25 } },
                }))
                    ? o
                    : '') +
                '            },\n'
            );
        },
        28: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'equals').call(l, i(i(n, 'parametersBody'), 'in'), 'formData', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(29, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 74, column: 12 }, end: { line: 76, column: 23 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'equals').call(l, i(i(n, 'parametersBody'), 'in'), 'body', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(31, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 77, column: 12 }, end: { line: 79, column: 23 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(i(n, 'parametersBody'), 'mediaType'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(33, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 80, column: 12 }, end: { line: 82, column: 19 } },
                }))
                    ? o
                    : '')
            );
        },
        29: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '            formData: ' +
                (null !=
                (o = e.lambda(
                    e.strict(l(n, 'parametersBody'), 'name', {
                        start: { line: 75, column: 25 },
                        end: { line: 75, column: 44 },
                    }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        31: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '            body: ' +
                (null !=
                (o = e.lambda(
                    e.strict(l(n, 'parametersBody'), 'name', {
                        start: { line: 78, column: 21 },
                        end: { line: 78, column: 40 },
                    }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        33: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                "            mediaType: '" +
                (null !=
                (o = e.lambda(
                    e.strict(l(n, 'parametersBody'), 'mediaType', {
                        start: { line: 81, column: 27 },
                        end: { line: 81, column: 51 },
                    }),
                    n
                ))
                    ? o
                    : '') +
                "',\n"
            );
        },
        35: function (e, n, t, r, a) {
            var o;
            return (
                "            responseHeader: '" +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'responseHeader', { start: { line: 85, column: 32 }, end: { line: 85, column: 46 } }),
                    n
                ))
                    ? o
                    : '') +
                "',\n"
            );
        },
        37: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '            errors: {\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'errors'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(38, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 89, column: 16 }, end: { line: 91, column: 25 } },
                }))
                    ? o
                    : '') +
                '            },\n'
            );
        },
        38: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                '                ' +
                (null != (o = i(l(n, 'code', { start: { line: 90, column: 19 }, end: { line: 90, column: 23 } }), n))
                    ? o
                    : '') +
                ': `' +
                (null !=
                (o = i(l(n, 'description', { start: { line: 90, column: 32 }, end: { line: 90, column: 43 } }), n))
                    ? o
                    : '') +
                '`,\n'
            );
        },
        40: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda,
                s =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                ' \nexport const ' +
                (null !=
                (o = i(l(n, 'hookName', { start: { line: 102, column: 16 }, end: { line: 102, column: 24 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = i(
                    l(s(a, 'root'), 'postfix', { start: { line: 102, column: 30 }, end: { line: 102, column: 43 } }),
                    n
                ))
                    ? o
                    : '') +
                " = ({method =  '" +
                (null !=
                (o = i(l(n, 'method', { start: { line: 102, column: 65 }, end: { line: 102, column: 71 } }), n))
                    ? o
                    : '') +
                "', ...options}:UseRequestOption) : {\n    run: (" +
                (null !=
                (o = e.invokePartial(s(r, 'params'), n, {
                    name: 'params',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ') => void;\n    data: ' +
                (null !=
                (o = e.invokePartial(s(r, 'result'), n, {
                    name: 'result',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ';\n    loading: boolean;\n    error?: Error;\n    params?: any;\n    method?: ApiRequestHttpMethod;\n}=> {\n    \n    return useRequest(' +
                (null != (o = i(l(n, 'name', { start: { line: 111, column: 25 }, end: { line: 111, column: 29 } }), n))
                    ? o
                    : '') +
                ',{ method, ...options});\n}\n\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(i(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'imports'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 7, column: 7 } },
                }))
                    ? o
                    : '') +
                "import type { CancelablePromise } from '../core/CancelablePromise';\nimport { request as __request } from '../core/request';\nimport { useRequest,UseRequestOption } from '@app-studio/react-request';\nimport type { ApiRequestHttpMethod } from '../core/ApiRequestOptions';\n\n" +
                (null !=
                (o = i(t, 'if').call(l, i(i(a, 'root'), 'useVersion'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 13, column: 0 }, end: { line: 15, column: 7 } },
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'operations'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 18, column: 4 }, end: { line: 97, column: 13 } },
                }))
                    ? o
                    : '') +
                '\n\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'operations'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(40, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 100, column: 0 }, end: { line: 114, column: 9 } },
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    vn = {
        1: function (e, n, t, r, a) {
            return "\nexport { ApiError } from './core/ApiError';\nexport { CancelablePromise, CancelError } from './core/CancelablePromise';\nexport { OpenAPI } from './core/OpenAPI';\n";
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'models'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 9, column: 0 }, end: { line: 22, column: 7 } },
                }))
                ? o
                : '';
        },
        4: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'models'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 11, column: 0 }, end: { line: 21, column: 9 } },
                }))
                    ? o
                    : '')
            );
        },
        5: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(l(a, 'root'), 'useUnionTypes'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.program(8, a, 0),
                    data: a,
                    loc: { start: { line: 12, column: 0 }, end: { line: 20, column: 7 } },
                }))
                ? o
                : '';
        },
        6: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                'export type { ' +
                (null != (o = i(l(n, 'name', { start: { line: 13, column: 17 }, end: { line: 13, column: 21 } }), n))
                    ? o
                    : '') +
                " } from './models/" +
                (null != (o = i(l(n, 'name', { start: { line: 13, column: 45 }, end: { line: 13, column: 49 } }), n))
                    ? o
                    : '') +
                "';\n"
            );
        },
        8: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'enum'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.program(11, a, 0),
                    data: a,
                    loc: { start: { line: 14, column: 0 }, end: { line: 20, column: 0 } },
                }))
                ? o
                : '';
        },
        9: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                'export { ' +
                (null != (o = i(l(n, 'name', { start: { line: 15, column: 12 }, end: { line: 15, column: 16 } }), n))
                    ? o
                    : '') +
                " } from './models/" +
                (null != (o = i(l(n, 'name', { start: { line: 15, column: 40 }, end: { line: 15, column: 44 } }), n))
                    ? o
                    : '') +
                "';\n"
            );
        },
        11: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'enums'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.program(6, a, 0),
                    data: a,
                    loc: { start: { line: 16, column: 0 }, end: { line: 20, column: 0 } },
                }))
                ? o
                : '';
        },
        13: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'models'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(14, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 25, column: 0 }, end: { line: 30, column: 7 } },
                }))
                ? o
                : '';
        },
        14: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'models'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(15, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 27, column: 0 }, end: { line: 29, column: 9 } },
                }))
                    ? o
                    : '')
            );
        },
        15: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                'export { $' +
                (null != (o = i(l(n, 'name', { start: { line: 28, column: 13 }, end: { line: 28, column: 17 } }), n))
                    ? o
                    : '') +
                " } from './schemas/$" +
                (null != (o = i(l(n, 'name', { start: { line: 28, column: 43 }, end: { line: 28, column: 47 } }), n))
                    ? o
                    : '') +
                "';\n"
            );
        },
        17: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'services'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(18, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 33, column: 0 }, end: { line: 38, column: 7 } },
                }))
                ? o
                : '';
        },
        18: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'services'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(19, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 35, column: 0 }, end: { line: 37, column: 9 } },
                }))
                    ? o
                    : '')
            );
        },
        19: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda,
                s =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                'export * as ' +
                (null != (o = i(l(n, 'name', { start: { line: 36, column: 15 }, end: { line: 36, column: 19 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = i(
                    l(s(a, 'root'), 'postfix', { start: { line: 36, column: 25 }, end: { line: 36, column: 38 } }),
                    n
                ))
                    ? o
                    : '') +
                " from './services/" +
                (null != (o = i(l(n, 'name', { start: { line: 36, column: 62 }, end: { line: 36, column: 66 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = i(
                    l(s(a, 'root'), 'postfix', { start: { line: 36, column: 72 }, end: { line: 36, column: 85 } }),
                    n
                ))
                    ? o
                    : '') +
                "';\n"
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(i(r, 'header'), n, {
                    name: 'header',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(i(a, 'root'), 'exportCore'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 7, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(i(a, 'root'), 'exportModels'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 8, column: 0 }, end: { line: 23, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(i(a, 'root'), 'exportSchemas'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 24, column: 0 }, end: { line: 31, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(i(a, 'root'), 'exportServices'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(17, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 32, column: 0 }, end: { line: 39, column: 7 } },
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    gn = {
        1: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'fetch', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 53 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'xhr', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 51 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'axios', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 53 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'equals').call(l, i(i(a, 'root'), 'httpClient'), 'node', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 52 } },
                }))
                    ? o
                    : '')
            );
        },
        2: function (e, n, t, r, a) {
            return 'Blob';
        },
        4: function (e, n, t, r, a) {
            var o;
            return null !=
                (o = e.lambda(e.strict(n, 'base', { start: { line: 7, column: 3 }, end: { line: 7, column: 7 } }), n))
                ? o
                : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'base'), 'binary', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(4, a, 0),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 13 } },
                }))
                ? o
                : '';
        },
        useData: !0,
    },
    Pn = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                '/**\n * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 3, column: 6 }, end: { line: 3, column: 17 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n */\n'
            );
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'unless').call(null != n ? n : e.nullContext || {}, l(l(a, 'root'), 'useUnionTypes'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 8, column: 0 }, end: { line: 27, column: 11 } },
                }))
                ? o
                : '';
        },
        4: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\nexport namespace ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'name', { start: { line: 10, column: 20 }, end: { line: 10, column: 24 } }),
                    n
                ))
                    ? o
                    : '') +
                ' {\n\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'enums'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 12, column: 4 }, end: { line: 24, column: 13 } },
                }))
                    ? o
                    : '') +
                '\n}\n'
            );
        },
        5: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 13, column: 4 }, end: { line: 17, column: 11 } },
                }))
                    ? o
                    : '') +
                '    export enum ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'name', { start: { line: 18, column: 19 }, end: { line: 18, column: 23 } }),
                    n
                ))
                    ? o
                    : '') +
                ' {\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'enum'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(8, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 19, column: 8 }, end: { line: 21, column: 17 } },
                }))
                    ? o
                    : '') +
                '    }\n\n'
            );
        },
        6: function (e, n, t, r, a) {
            var o;
            return (
                '    /**\n     * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 15, column: 10 }, end: { line: 15, column: 21 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n     */\n'
            );
        },
        8: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                '        ' +
                (null != (o = i(l(n, 'name', { start: { line: 20, column: 11 }, end: { line: 20, column: 15 } }), n))
                    ? o
                    : '') +
                ' = ' +
                (null != (o = i(l(n, 'value', { start: { line: 20, column: 24 }, end: { line: 20, column: 29 } }), n))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 7 } },
                }))
                    ? o
                    : '') +
                'export type ' +
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 6, column: 15 }, end: { line: 6, column: 19 } }), n))
                    ? o
                    : '') +
                ' = ' +
                (null !=
                (o = e.invokePartial(i(r, 'type'), n, {
                    name: 'type',
                    hash: { parent: i(n, 'name') },
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ';\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'enums'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 7, column: 0 }, end: { line: 28, column: 7 } },
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    bn = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                '/**\n * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 3, column: 6 }, end: { line: 3, column: 17 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n */\n'
            );
        },
        3: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 8, column: 4 }, end: { line: 12, column: 11 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'containsSpaces').call(l, i(n, 'name'), {
                    name: 'containsSpaces',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.program(8, a, 0),
                    data: a,
                    loc: { start: { line: 13, column: 4 }, end: { line: 17, column: 23 } },
                }))
                    ? o
                    : '')
            );
        },
        4: function (e, n, t, r, a) {
            var o;
            return (
                '    /**\n     * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 10, column: 10 }, end: { line: 10, column: 21 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n     */\n'
            );
        },
        6: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                '    "' +
                (null != (o = i(l(n, 'name', { start: { line: 14, column: 8 }, end: { line: 14, column: 12 } }), n))
                    ? o
                    : '') +
                '" = ' +
                (null != (o = i(l(n, 'value', { start: { line: 14, column: 22 }, end: { line: 14, column: 27 } }), n))
                    ? o
                    : '') +
                ',\n'
            );
        },
        8: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                '    ' +
                (null != (o = i(l(n, 'name', { start: { line: 16, column: 7 }, end: { line: 16, column: 11 } }), n))
                    ? o
                    : '') +
                ' = ' +
                (null != (o = i(l(n, 'value', { start: { line: 16, column: 20 }, end: { line: 16, column: 25 } }), n))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 7 } },
                }))
                    ? o
                    : '') +
                'export enum ' +
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 6, column: 15 }, end: { line: 6, column: 19 } }), n))
                    ? o
                    : '') +
                ' {\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'enum'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 7, column: 4 }, end: { line: 18, column: 13 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        useData: !0,
    },
    On = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                '/**\n * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 3, column: 6 }, end: { line: 3, column: 17 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n */\n'
            );
        },
        3: function (e, n, t, r, a, o, l) {
            var i,
                s =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (i = s(t, 'if').call(null != n ? n : e.nullContext || {}, s(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(4, a, 0, o, l),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 8, column: 4 }, end: { line: 12, column: 11 } },
                }))
                    ? i
                    : '') +
                '    ' +
                (null !=
                (i = e.invokePartial(s(r, 'isReadOnly'), n, {
                    name: 'isReadOnly',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? i
                    : '') +
                (null !=
                (i = e.lambda(
                    e.strict(n, 'name', { start: { line: 13, column: 22 }, end: { line: 13, column: 26 } }),
                    n
                ))
                    ? i
                    : '') +
                (null !=
                (i = e.invokePartial(s(r, 'isRequired'), n, {
                    name: 'isRequired',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? i
                    : '') +
                ': ' +
                (null !=
                (i = e.invokePartial(s(r, 'type'), n, {
                    name: 'type',
                    hash: { parent: s(l[1], 'name') },
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? i
                    : '') +
                ';\n'
            );
        },
        4: function (e, n, t, r, a) {
            var o;
            return (
                '    /**\n     * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 10, column: 10 }, end: { line: 10, column: 21 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n     */\n'
            );
        },
        6: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'unless').call(null != n ? n : e.nullContext || {}, l(l(a, 'root'), 'useUnionTypes'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 17, column: 0 }, end: { line: 36, column: 11 } },
                }))
                ? o
                : '';
        },
        7: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\nexport namespace ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'name', { start: { line: 19, column: 20 }, end: { line: 19, column: 24 } }),
                    n
                ))
                    ? o
                    : '') +
                ' {\n\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'enums'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(8, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 21, column: 4 }, end: { line: 33, column: 13 } },
                }))
                    ? o
                    : '') +
                '\n}\n'
            );
        },
        8: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 22, column: 4 }, end: { line: 26, column: 11 } },
                }))
                    ? o
                    : '') +
                '    export enum ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'name', { start: { line: 27, column: 19 }, end: { line: 27, column: 23 } }),
                    n
                ))
                    ? o
                    : '') +
                ' {\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'enum'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 28, column: 8 }, end: { line: 30, column: 17 } },
                }))
                    ? o
                    : '') +
                '    }\n\n'
            );
        },
        9: function (e, n, t, r, a) {
            var o,
                l = e.strict,
                i = e.lambda;
            return (
                '        ' +
                (null != (o = i(l(n, 'name', { start: { line: 29, column: 11 }, end: { line: 29, column: 15 } }), n))
                    ? o
                    : '') +
                ' = ' +
                (null != (o = i(l(n, 'value', { start: { line: 29, column: 24 }, end: { line: 29, column: 29 } }), n))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a, o, l) {
            var i,
                s = null != n ? n : e.nullContext || {},
                u =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (i = u(t, 'if').call(s, u(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0, o, l),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 7 } },
                }))
                    ? i
                    : '') +
                'export type ' +
                (null !=
                (i = e.lambda(e.strict(n, 'name', { start: { line: 6, column: 15 }, end: { line: 6, column: 19 } }), n))
                    ? i
                    : '') +
                ' = {\n' +
                (null !=
                (i = u(t, 'each').call(s, u(n, 'properties'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(3, a, 0, o, l),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 7, column: 4 }, end: { line: 14, column: 13 } },
                }))
                    ? i
                    : '') +
                '}\n' +
                (null !=
                (i = u(t, 'if').call(s, u(n, 'enums'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(6, a, 0, o, l),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 16, column: 0 }, end: { line: 37, column: 7 } },
                }))
                    ? i
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
        useDepths: !0,
    },
    xn = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                '/**\n * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 3, column: 6 }, end: { line: 3, column: 17 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n */\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 7 } },
                }))
                    ? o
                    : '') +
                'export type ' +
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 6, column: 15 }, end: { line: 6, column: 19 } }), n))
                    ? o
                    : '') +
                ' = ' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), n, {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ';'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    kn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            return '/* istanbul ignore file */\n/* tslint:disable */\n/* eslint-disable */';
        },
        useData: !0,
    },
    Rn = {
        1: function (e, n, t, r, a) {
            return ' | null';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'isNullable'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 32 } },
                }))
                ? o
                : '';
        },
        useData: !0,
    },
    wn = {
        1: function (e, n, t, r, a) {
            return 'readonly ';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'isReadOnly'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 34 } },
                }))
                ? o
                : '';
        },
        useData: !0,
    },
    qn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'unless').call(null != n ? n : e.nullContext || {}, l(n, 'isRequired'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.program(4, a, 0),
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 54 } },
                }))
                ? o
                : '';
        },
        2: function (e, n, t, r, a) {
            return '?';
        },
        4: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'default'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 23 }, end: { line: 2, column: 43 } },
                }))
                ? o
                : '';
        },
        6: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'unless').call(null != n ? n : e.nullContext || {}, l(n, 'isRequired'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 64 } },
                }))
                ? o
                : '';
        },
        7: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'unless').call(null != n ? n : e.nullContext || {}, l(n, 'default'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 22 }, end: { line: 4, column: 53 } },
                }))
                ? o
                : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(l(a, 'root'), 'useOptions'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(6, a, 0),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 9 } },
                }))
                ? o
                : '';
        },
        useData: !0,
    },
    Cn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(l(a, 'root'), 'useOptions'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.program(9, a, 0),
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 20, column: 7 } },
                }))
                ? o
                : '';
        },
        2: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '{\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'parameters'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 0 }, end: { line: 6, column: 9 } },
                }))
                    ? o
                    : '') +
                '}: {\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'parameters'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 9 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 5, column: 3 }, end: { line: 5, column: 7 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'default'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 48 } },
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        4: function (e, n, t, r, a) {
            var o;
            return (
                ' = ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'default', { start: { line: 5, column: 31 }, end: { line: 5, column: 38 } }),
                    n
                ))
                    ? o
                    : '')
            );
        },
        6: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 9, column: 0 }, end: { line: 11, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 12, column: 3 }, end: { line: 12, column: 7 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isRequired'), n, {
                    name: 'isRequired',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ': ' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), n, {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        7: function (e, n, t, r, a) {
            var o;
            return (
                '/** ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 10, column: 7 }, end: { line: 10, column: 18 } }),
                    n
                ))
                    ? o
                    : '') +
                ' **/\n'
            );
        },
        9: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'parameters'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(10, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 17, column: 0 }, end: { line: 19, column: 9 } },
                }))
                    ? o
                    : '')
            );
        },
        10: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 18, column: 3 }, end: { line: 18, column: 7 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isRequired'), n, {
                    name: 'isRequired',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ': ' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), n, {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                (null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'default'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 18, column: 36 }, end: { line: 18, column: 74 } },
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'parameters'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 21, column: 7 } },
                }))
                ? o
                : '';
        },
        usePartial: !0,
        useData: !0,
    },
    jn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(l(a, 'root'), 'useOptions'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.program(8, a, 0),
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 20, column: 7 } },
                }))
                ? o
                : '';
        },
        2: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '{\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'parameters'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 0 }, end: { line: 6, column: 9 } },
                }))
                    ? o
                    : '') +
                '}: {\n' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'parameters'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 9 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        3: function (e, n, t, r, a) {
            var o;
            return (
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 5, column: 3 }, end: { line: 5, column: 7 } }), n))
                    ? o
                    : '') + ',\n'
            );
        },
        5: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 9, column: 0 }, end: { line: 11, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 12, column: 3 }, end: { line: 12, column: 7 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isRequired'), n, {
                    name: 'isRequired',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ': ' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), n, {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        6: function (e, n, t, r, a) {
            var o;
            return (
                '/** ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 10, column: 7 }, end: { line: 10, column: 18 } }),
                    n
                ))
                    ? o
                    : '') +
                ' **/\n'
            );
        },
        8: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '\n' +
                (null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'parameters'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 17, column: 0 }, end: { line: 19, column: 9 } },
                }))
                    ? o
                    : '')
            );
        },
        9: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 18, column: 3 }, end: { line: 18, column: 7 } }), n))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isRequired'), n, {
                    name: 'isRequired',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ': ' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), n, {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'parameters'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 21, column: 7 } },
                }))
                ? o
                : '';
        },
        usePartial: !0,
        useData: !0,
    },
    An = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'results'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(2, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 66 } },
                }))
                ? o
                : '';
        },
        2: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'type'), n, {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                (null !=
                (o = l(t, 'unless').call(null != n ? n : e.nullContext || {}, l(a, 'last'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 26 }, end: { line: 2, column: 57 } },
                }))
                    ? o
                    : '')
            );
        },
        3: function (e, n, t, r, a) {
            return ' | ';
        },
        5: function (e, n, t, r, a) {
            return 'void';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'results'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(5, a, 0),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 9 } },
                }))
                ? o
                : '';
        },
        usePartial: !0,
        useData: !0,
    },
    Dn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'schemaInterface'), n, {
                    name: 'schemaInterface',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'enum', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.program(6, a, 0),
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 17, column: 0 } },
                }))
                ? o
                : '';
        },
        4: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'schemaEnum'), n, {
                    name: 'schemaEnum',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        6: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'array', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.program(9, a, 0),
                    data: a,
                    loc: { start: { line: 5, column: 0 }, end: { line: 17, column: 0 } },
                }))
                ? o
                : '';
        },
        7: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'schemaArray'), n, {
                    name: 'schemaArray',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        9: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'dictionary', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(10, a, 0),
                    inverse: e.program(12, a, 0),
                    data: a,
                    loc: { start: { line: 7, column: 0 }, end: { line: 17, column: 0 } },
                }))
                ? o
                : '';
        },
        10: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'schemaDictionary'), n, {
                    name: 'schemaDictionary',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        12: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'any-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.program(15, a, 0),
                    data: a,
                    loc: { start: { line: 9, column: 0 }, end: { line: 17, column: 0 } },
                }))
                ? o
                : '';
        },
        13: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'schemaComposition'), n, {
                    name: 'schemaComposition',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        15: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'all-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.program(16, a, 0),
                    data: a,
                    loc: { start: { line: 11, column: 0 }, end: { line: 17, column: 0 } },
                }))
                ? o
                : '';
        },
        16: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'one-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.program(17, a, 0),
                    data: a,
                    loc: { start: { line: 13, column: 0 }, end: { line: 17, column: 0 } },
                }))
                ? o
                : '';
        },
        17: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'schemaGeneric'), n, {
                    name: 'schemaGeneric',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'interface', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(3, a, 0),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 17, column: 11 } },
                }))
                ? o
                : '';
        },
        usePartial: !0,
        useData: !0,
    },
    In = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '    contains: ' +
                (null !=
                (o = e.invokePartial(l(r, 'schema'), l(n, 'link'), {
                    name: 'schema',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        3: function (e, n, t, r, a) {
            var o;
            return (
                "    contains: {\n        type: '" +
                (null !=
                (o = e.lambda(e.strict(n, 'base', { start: { line: 7, column: 18 }, end: { line: 7, column: 22 } }), n))
                    ? o
                    : '') +
                "',\n    },\n"
            );
        },
        5: function (e, n, t, r, a) {
            var o;
            return (
                '    isReadOnly: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isReadOnly', { start: { line: 11, column: 19 }, end: { line: 11, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        7: function (e, n, t, r, a) {
            var o;
            return (
                '    isRequired: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isRequired', { start: { line: 14, column: 19 }, end: { line: 14, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        9: function (e, n, t, r, a) {
            var o;
            return (
                '    isNullable: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isNullable', { start: { line: 17, column: 19 }, end: { line: 17, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                "{\n    type: 'array',\n" +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'link'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(3, a, 0),
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 9, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isReadOnly'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isRequired'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 13, column: 0 }, end: { line: 15, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isNullable'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 16, column: 0 }, end: { line: 18, column: 7 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Tn = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                '    description: `' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 4, column: 21 }, end: { line: 4, column: 32 } }),
                    n
                ))
                    ? o
                    : '') +
                '`,\n'
            );
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'schema'), n, {
                    name: 'schema',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                (null !=
                (o = l(t, 'unless').call(null != n ? n : e.nullContext || {}, l(a, 'last'), {
                    name: 'unless',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 6, column: 46 }, end: { line: 6, column: 76 } },
                }))
                    ? o
                    : '')
            );
        },
        4: function (e, n, t, r, a) {
            return ', ';
        },
        6: function (e, n, t, r, a) {
            var o;
            return (
                '    isReadOnly: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isReadOnly', { start: { line: 8, column: 19 }, end: { line: 8, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        8: function (e, n, t, r, a) {
            var o;
            return (
                '    isRequired: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isRequired', { start: { line: 11, column: 19 }, end: { line: 11, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        10: function (e, n, t, r, a) {
            var o;
            return (
                '    isNullable: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isNullable', { start: { line: 14, column: 19 }, end: { line: 14, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                "{\n    type: '" +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'export', { start: { line: 2, column: 13 }, end: { line: 2, column: 19 } }),
                    n
                ))
                    ? o
                    : '') +
                "',\n" +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 7 } },
                }))
                    ? o
                    : '') +
                '    contains: [' +
                (null !=
                (o = i(t, 'each').call(l, i(n, 'properties'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 6, column: 15 }, end: { line: 6, column: 85 } },
                }))
                    ? o
                    : '') +
                '],\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isReadOnly'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 7, column: 0 }, end: { line: 9, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isRequired'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(8, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isNullable'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(10, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 13, column: 0 }, end: { line: 15, column: 7 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    En = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '    contains: ' +
                (null !=
                (o = e.invokePartial(l(r, 'schema'), l(n, 'link'), {
                    name: 'schema',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        3: function (e, n, t, r, a) {
            var o;
            return (
                "    contains: {\n        type: '" +
                (null !=
                (o = e.lambda(e.strict(n, 'base', { start: { line: 7, column: 18 }, end: { line: 7, column: 22 } }), n))
                    ? o
                    : '') +
                "',\n    },\n"
            );
        },
        5: function (e, n, t, r, a) {
            var o;
            return (
                '    isReadOnly: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isReadOnly', { start: { line: 11, column: 19 }, end: { line: 11, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        7: function (e, n, t, r, a) {
            var o;
            return (
                '    isRequired: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isRequired', { start: { line: 14, column: 19 }, end: { line: 14, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        9: function (e, n, t, r, a) {
            var o;
            return (
                '    isNullable: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isNullable', { start: { line: 17, column: 19 }, end: { line: 17, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                "{\n    type: 'dictionary',\n" +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'link'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(3, a, 0),
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 9, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isReadOnly'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isRequired'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 13, column: 0 }, end: { line: 15, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isNullable'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 16, column: 0 }, end: { line: 18, column: 7 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    $n = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                '    isReadOnly: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isReadOnly', { start: { line: 4, column: 19 }, end: { line: 4, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        3: function (e, n, t, r, a) {
            var o;
            return (
                '    isRequired: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isRequired', { start: { line: 7, column: 19 }, end: { line: 7, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        5: function (e, n, t, r, a) {
            var o;
            return (
                '    isNullable: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isNullable', { start: { line: 10, column: 19 }, end: { line: 10, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                "{\n    type: 'Enum',\n" +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isReadOnly'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isRequired'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 6, column: 0 }, end: { line: 8, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isNullable'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 9, column: 0 }, end: { line: 11, column: 7 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        useData: !0,
    },
    Hn = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                "    type: '" +
                (null !=
                (o = e.lambda(e.strict(n, 'type', { start: { line: 3, column: 14 }, end: { line: 3, column: 18 } }), n))
                    ? o
                    : '') +
                "',\n"
            );
        },
        3: function (e, n, t, r, a) {
            var o;
            return (
                '    description: `' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 6, column: 21 }, end: { line: 6, column: 32 } }),
                    n
                ))
                    ? o
                    : '') +
                '`,\n'
            );
        },
        5: function (e, n, t, r, a) {
            var o;
            return (
                '    isReadOnly: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isReadOnly', { start: { line: 9, column: 19 }, end: { line: 9, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        7: function (e, n, t, r, a) {
            var o;
            return (
                '    isRequired: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isRequired', { start: { line: 12, column: 19 }, end: { line: 12, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        9: function (e, n, t, r, a) {
            var o;
            return (
                '    isNullable: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isNullable', { start: { line: 15, column: 19 }, end: { line: 15, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        11: function (e, n, t, r, a) {
            var o;
            return (
                "    format: '" +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'format', { start: { line: 18, column: 16 }, end: { line: 18, column: 22 } }),
                    n
                ))
                    ? o
                    : '') +
                "',\n"
            );
        },
        13: function (e, n, t, r, a) {
            var o;
            return (
                '    maximum: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'maximum', { start: { line: 21, column: 16 }, end: { line: 21, column: 23 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        15: function (e, n, t, r, a) {
            var o;
            return (
                '    exclusiveMaximum: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'exclusiveMaximum', { start: { line: 24, column: 25 }, end: { line: 24, column: 41 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        17: function (e, n, t, r, a) {
            var o;
            return (
                '    minimum: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'minimum', { start: { line: 27, column: 16 }, end: { line: 27, column: 23 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        19: function (e, n, t, r, a) {
            var o;
            return (
                '    exclusiveMinimum: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'exclusiveMinimum', { start: { line: 30, column: 25 }, end: { line: 30, column: 41 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        21: function (e, n, t, r, a) {
            var o;
            return (
                '    multipleOf: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'multipleOf', { start: { line: 33, column: 19 }, end: { line: 33, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        23: function (e, n, t, r, a) {
            var o;
            return (
                '    maxLength: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'maxLength', { start: { line: 36, column: 18 }, end: { line: 36, column: 27 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        25: function (e, n, t, r, a) {
            var o;
            return (
                '    minLength: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'minLength', { start: { line: 39, column: 18 }, end: { line: 39, column: 27 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        27: function (e, n, t, r, a) {
            var o;
            return (
                "    pattern: '" +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'pattern', { start: { line: 42, column: 17 }, end: { line: 42, column: 24 } }),
                    n
                ))
                    ? o
                    : '') +
                "',\n"
            );
        },
        29: function (e, n, t, r, a) {
            var o;
            return (
                '    maxItems: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'maxItems', { start: { line: 45, column: 17 }, end: { line: 45, column: 25 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        31: function (e, n, t, r, a) {
            var o;
            return (
                '    minItems: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'minItems', { start: { line: 48, column: 17 }, end: { line: 48, column: 25 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        33: function (e, n, t, r, a) {
            var o;
            return (
                '    uniqueItems: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'uniqueItems', { start: { line: 51, column: 20 }, end: { line: 51, column: 31 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        35: function (e, n, t, r, a) {
            var o;
            return (
                '    maxProperties: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'maxProperties', { start: { line: 54, column: 22 }, end: { line: 54, column: 35 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        37: function (e, n, t, r, a) {
            var o;
            return (
                '    minProperties: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'minProperties', { start: { line: 57, column: 22 }, end: { line: 57, column: 35 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '{\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'type'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 4, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 5, column: 0 }, end: { line: 7, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isReadOnly'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(5, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 8, column: 0 }, end: { line: 10, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isRequired'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 11, column: 0 }, end: { line: 13, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isNullable'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(9, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 14, column: 0 }, end: { line: 16, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'format'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(11, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 17, column: 0 }, end: { line: 19, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'maximum'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 20, column: 0 }, end: { line: 22, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'exclusiveMaximum'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(15, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 23, column: 0 }, end: { line: 25, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'minimum'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(17, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 26, column: 0 }, end: { line: 28, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'exclusiveMinimum'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(19, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 29, column: 0 }, end: { line: 31, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'multipleOf'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(21, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 32, column: 0 }, end: { line: 34, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'maxLength'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(23, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 35, column: 0 }, end: { line: 37, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'minLength'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(25, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 38, column: 0 }, end: { line: 40, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'pattern'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(27, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 41, column: 0 }, end: { line: 43, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'maxItems'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(29, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 44, column: 0 }, end: { line: 46, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'minItems'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(31, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 47, column: 0 }, end: { line: 49, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'uniqueItems'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(33, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 50, column: 0 }, end: { line: 52, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'maxProperties'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(35, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 53, column: 0 }, end: { line: 55, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'minProperties'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(37, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 56, column: 0 }, end: { line: 58, column: 7 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        useData: !0,
    },
    Sn = {
        1: function (e, n, t, r, a) {
            var o;
            return (
                '    description: `' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 3, column: 21 }, end: { line: 3, column: 32 } }),
                    n
                ))
                    ? o
                    : '') +
                '`,\n'
            );
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'each').call(null != n ? n : e.nullContext || {}, l(n, 'properties'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 7, column: 4 }, end: { line: 9, column: 13 } },
                }))
                ? o
                : '';
        },
        4: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '        ' +
                (null !=
                (o = e.lambda(e.strict(n, 'name', { start: { line: 8, column: 11 }, end: { line: 8, column: 15 } }), n))
                    ? o
                    : '') +
                ': ' +
                (null !=
                (o = e.invokePartial(l(r, 'schema'), n, {
                    name: 'schema',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ',\n'
            );
        },
        6: function (e, n, t, r, a) {
            var o;
            return (
                '    isReadOnly: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isReadOnly', { start: { line: 13, column: 19 }, end: { line: 13, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        8: function (e, n, t, r, a) {
            var o;
            return (
                '    isRequired: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isRequired', { start: { line: 16, column: 19 }, end: { line: 16, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        10: function (e, n, t, r, a) {
            var o;
            return (
                '    isNullable: ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'isNullable', { start: { line: 19, column: 19 }, end: { line: 19, column: 29 } }),
                    n
                ))
                    ? o
                    : '') +
                ',\n'
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l = null != n ? n : e.nullContext || {},
                i =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '{\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 2, column: 0 }, end: { line: 4, column: 7 } },
                }))
                    ? o
                    : '') +
                '    properties: {\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'properties'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(3, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 6, column: 0 }, end: { line: 10, column: 7 } },
                }))
                    ? o
                    : '') +
                '    },\n' +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isReadOnly'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(6, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 12, column: 0 }, end: { line: 14, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isRequired'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(8, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 15, column: 0 }, end: { line: 17, column: 7 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = i(t, 'if').call(l, i(n, 'isNullable'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(10, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 18, column: 0 }, end: { line: 20, column: 7 } },
                }))
                    ? o
                    : '') +
                '}'
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Nn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeInterface'), n, {
                    name: 'typeInterface',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'reference', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(4, a, 0),
                    inverse: e.program(6, a, 0),
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 19, column: 0 } },
                }))
                ? o
                : '';
        },
        4: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeReference'), n, {
                    name: 'typeReference',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        6: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'enum', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(7, a, 0),
                    inverse: e.program(9, a, 0),
                    data: a,
                    loc: { start: { line: 5, column: 0 }, end: { line: 19, column: 0 } },
                }))
                ? o
                : '';
        },
        7: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeEnum'), n, {
                    name: 'typeEnum',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        9: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'array', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(10, a, 0),
                    inverse: e.program(12, a, 0),
                    data: a,
                    loc: { start: { line: 7, column: 0 }, end: { line: 19, column: 0 } },
                }))
                ? o
                : '';
        },
        10: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeArray'), n, {
                    name: 'typeArray',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        12: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'dictionary', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(13, a, 0),
                    inverse: e.program(15, a, 0),
                    data: a,
                    loc: { start: { line: 9, column: 0 }, end: { line: 19, column: 0 } },
                }))
                ? o
                : '';
        },
        13: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeDictionary'), n, {
                    name: 'typeDictionary',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        15: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'one-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(16, a, 0),
                    inverse: e.program(18, a, 0),
                    data: a,
                    loc: { start: { line: 11, column: 0 }, end: { line: 19, column: 0 } },
                }))
                ? o
                : '';
        },
        16: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeUnion'), n, {
                    name: 'typeUnion',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        18: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'any-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(16, a, 0),
                    inverse: e.program(19, a, 0),
                    data: a,
                    loc: { start: { line: 13, column: 0 }, end: { line: 19, column: 0 } },
                }))
                ? o
                : '';
        },
        19: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'all-of', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(20, a, 0),
                    inverse: e.program(22, a, 0),
                    data: a,
                    loc: { start: { line: 15, column: 0 }, end: { line: 19, column: 0 } },
                }))
                ? o
                : '';
        },
        20: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeIntersection'), n, {
                    name: 'typeIntersection',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        22: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = e.invokePartial(l(r, 'typeGeneric'), n, {
                    name: 'typeGeneric',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                ? o
                : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'equals').call(null != n ? n : e.nullContext || {}, l(n, 'export'), 'interface', {
                    name: 'equals',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(3, a, 0),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 19, column: 11 } },
                }))
                ? o
                : '';
        },
        usePartial: !0,
        useData: !0,
    },
    Bn = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                'Array<' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), l(n, 'link'), {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '>' +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                'Array<' +
                (null !=
                (o = e.invokePartial(l(r, 'base'), n, {
                    name: 'base',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '>' +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'link'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(3, a, 0),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 9 } },
                }))
                ? o
                : '';
        },
        usePartial: !0,
        useData: !0,
    },
    Ln = {
        1: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                'Record<string, ' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), l(n, 'link'), {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '>' +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        3: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                'Record<string, ' +
                (null !=
                (o = e.invokePartial(l(r, 'base'), n, {
                    name: 'base',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                '>' +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (o = l(t, 'if').call(null != n ? n : e.nullContext || {}, l(n, 'link'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.program(3, a, 0),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 9 } },
                }))
                ? o
                : '';
        },
        usePartial: !0,
        useData: !0,
    },
    Mn = {
        1: function (e, n, t, r, a) {
            var o;
            return null != (o = e.lambda(n, n)) ? o : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = l(t, 'enumerator').call(
                    null != n ? n : e.nullContext || {},
                    l(n, 'enum'),
                    l(n, 'parent'),
                    l(n, 'name'),
                    {
                        name: 'enumerator',
                        hash: {},
                        fn: e.program(1, a, 0),
                        inverse: e.noop,
                        data: a,
                        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 55 } },
                    }
                ))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Fn = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'base'), n, {
                    name: 'base',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Un = {
        1: function (e, n, t, r, a, o, l) {
            var i,
                s =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                '{\n' +
                (null !=
                (i = s(t, 'each').call(null != n ? n : e.nullContext || {}, s(n, 'properties'), {
                    name: 'each',
                    hash: {},
                    fn: e.program(2, a, 0, o, l),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 3, column: 0 }, end: { line: 14, column: 9 } },
                }))
                    ? i
                    : '') +
                '}' +
                (null !=
                (i = e.invokePartial(s(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? i
                    : '')
            );
        },
        2: function (e, n, t, r, a, o, l) {
            var i,
                s = null != n ? n : e.nullContext || {},
                u =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (i = u(t, 'if').call(s, u(n, 'description'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(3, a, 0, o, l),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 4, column: 0 }, end: { line: 8, column: 7 } },
                }))
                    ? i
                    : '') +
                (null !=
                (i = u(t, 'if').call(s, u(l[1], 'parent'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(5, a, 0, o, l),
                    inverse: e.program(7, a, 0, o, l),
                    data: a,
                    loc: { start: { line: 9, column: 0 }, end: { line: 13, column: 7 } },
                }))
                    ? i
                    : '')
            );
        },
        3: function (e, n, t, r, a) {
            var o;
            return (
                '/**\n * ' +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'description', { start: { line: 6, column: 6 }, end: { line: 6, column: 17 } }),
                    n
                ))
                    ? o
                    : '') +
                '\n */\n'
            );
        },
        5: function (e, n, t, r, a, o, l) {
            var i,
                s =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (i = e.invokePartial(s(r, 'isReadOnly'), n, {
                    name: 'isReadOnly',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? i
                    : '') +
                (null !=
                (i = e.lambda(
                    e.strict(n, 'name', { start: { line: 10, column: 18 }, end: { line: 10, column: 22 } }),
                    n
                ))
                    ? i
                    : '') +
                (null !=
                (i = e.invokePartial(s(r, 'isRequired'), n, {
                    name: 'isRequired',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? i
                    : '') +
                ': ' +
                (null !=
                (i = e.invokePartial(s(r, 'type'), n, {
                    name: 'type',
                    hash: { parent: s(l[1], 'parent') },
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? i
                    : '') +
                ';\n'
            );
        },
        7: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'isReadOnly'), n, {
                    name: 'isReadOnly',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                (null !=
                (o = e.lambda(
                    e.strict(n, 'name', { start: { line: 12, column: 18 }, end: { line: 12, column: 22 } }),
                    n
                ))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isRequired'), n, {
                    name: 'isRequired',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ': ' +
                (null !=
                (o = e.invokePartial(l(r, 'type'), n, {
                    name: 'type',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                ';\n'
            );
        },
        9: function (e, n, t, r, a) {
            return 'any';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a, o, l) {
            var i,
                s =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return null !=
                (i = s(t, 'if').call(null != n ? n : e.nullContext || {}, s(n, 'properties'), {
                    name: 'if',
                    hash: {},
                    fn: e.program(1, a, 0, o, l),
                    inverse: e.program(9, a, 0, o, l),
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 18, column: 9 } },
                }))
                ? i
                : '';
        },
        usePartial: !0,
        useData: !0,
        useDepths: !0,
    },
    Wn = {
        1: function (e, n, t, r, a) {
            var o;
            return null != (o = e.lambda(n, n)) ? o : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = l(t, 'intersection').call(
                    null != n ? n : e.nullContext || {},
                    l(n, 'properties'),
                    l(n, 'parent'),
                    {
                        name: 'intersection',
                        hash: {},
                        fn: e.program(1, a, 0),
                        inverse: e.noop,
                        data: a,
                        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
                    }
                ))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    _n = {
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = e.invokePartial(l(r, 'base'), n, {
                    name: 'base',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    },
    Vn = {
        1: function (e, n, t, r, a) {
            var o;
            return null != (o = e.lambda(n, n)) ? o : '';
        },
        compiler: [8, '>= 4.3.0'],
        main: function (e, n, t, r, a) {
            var o,
                l =
                    e.lookupProperty ||
                    function (e, n) {
                        if (Object.prototype.hasOwnProperty.call(e, n)) return e[n];
                    };
            return (
                (null !=
                (o = l(t, 'union').call(null != n ? n : e.nullContext || {}, l(n, 'properties'), l(n, 'parent'), {
                    name: 'union',
                    hash: {},
                    fn: e.program(1, a, 0),
                    inverse: e.noop,
                    data: a,
                    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 46 } },
                }))
                    ? o
                    : '') +
                (null !=
                (o = e.invokePartial(l(r, 'isNullable'), n, {
                    name: 'isNullable',
                    data: a,
                    helpers: t,
                    partials: r,
                    decorators: e.decorators,
                }))
                    ? o
                    : '')
            );
        },
        usePartial: !0,
        useData: !0,
    };
function Qn(e) {
    !(function (e) {
        d.default.registerHelper('equals', function (e, n, t) {
            return e === n ? t.fn(this) : t.inverse(this);
        }),
            d.default.registerHelper('notEquals', function (e, n, t) {
                return e !== n ? t.fn(this) : t.inverse(this);
            }),
            d.default.registerHelper('containsSpaces', function (e, n) {
                return /\s+/.test(e) ? n.fn(this) : n.inverse(this);
            }),
            d.default.registerHelper('union', function (n, t, r) {
                const a = d.default.partials.type,
                    o = n.map(n => a({ ...e, ...n, parent: t })).filter(T);
                let l = o.join(' | ');
                return o.length > 1 && (l = `(${l})`), r.fn(l);
            }),
            d.default.registerHelper('intersection', function (n, t, r) {
                const a = d.default.partials.type,
                    o = n.map(n => a({ ...e, ...n, parent: t })).filter(T);
                let l = o.join(' & ');
                return o.length > 1 && (l = `(${l})`), r.fn(l);
            }),
            d.default.registerHelper('enumerator', function (n, t, r, a) {
                return !e.useUnionTypes && t && r
                    ? `${t}.${r}`
                    : a.fn(
                          n
                              .map(e => e.value)
                              .filter(T)
                              .join(' | ')
                      );
            });
    })(e);
    const n = {
        index: d.default.template(vn),
        exports: { model: d.default.template(fn), schema: d.default.template(hn), service: d.default.template(yn) },
        core: {
            settings: d.default.template(on),
            apiError: d.default.template(we),
            apiRequestOptions: d.default.template(qe),
            apiResult: d.default.template(Ce),
            cancelablePromise: d.default.template($e),
            request: d.default.template(ln),
        },
    };
    return (
        d.default.registerPartial('exportEnum', d.default.template(bn)),
        d.default.registerPartial('exportInterface', d.default.template(On)),
        d.default.registerPartial('exportComposition', d.default.template(Pn)),
        d.default.registerPartial('exportType', d.default.template(xn)),
        d.default.registerPartial('header', d.default.template(kn)),
        d.default.registerPartial('isNullable', d.default.template(Rn)),
        d.default.registerPartial('isReadOnly', d.default.template(wn)),
        d.default.registerPartial('isRequired', d.default.template(qn)),
        d.default.registerPartial('parameters', d.default.template(Cn)),
        d.default.registerPartial('params', d.default.template(jn)),
        d.default.registerPartial('result', d.default.template(An)),
        d.default.registerPartial('schema', d.default.template(Dn)),
        d.default.registerPartial('schemaArray', d.default.template(In)),
        d.default.registerPartial('schemaDictionary', d.default.template(En)),
        d.default.registerPartial('schemaEnum', d.default.template($n)),
        d.default.registerPartial('schemaGeneric', d.default.template(Hn)),
        d.default.registerPartial('schemaInterface', d.default.template(Sn)),
        d.default.registerPartial('schemaComposition', d.default.template(Tn)),
        d.default.registerPartial('type', d.default.template(Nn)),
        d.default.registerPartial('typeArray', d.default.template(Bn)),
        d.default.registerPartial('typeDictionary', d.default.template(Ln)),
        d.default.registerPartial('typeEnum', d.default.template(Mn)),
        d.default.registerPartial('typeGeneric', d.default.template(Fn)),
        d.default.registerPartial('typeInterface', d.default.template(Un)),
        d.default.registerPartial('typeReference', d.default.template(_n)),
        d.default.registerPartial('typeUnion', d.default.template(Vn)),
        d.default.registerPartial('typeIntersection', d.default.template(Wn)),
        d.default.registerPartial('base', d.default.template(gn)),
        d.default.registerPartial('functions/catchErrors', d.default.template(Ue)),
        d.default.registerPartial('functions/getFormData', d.default.template(We)),
        d.default.registerPartial('functions/getQueryString', d.default.template(_e)),
        d.default.registerPartial('functions/getUrl', d.default.template(Ve)),
        d.default.registerPartial('functions/isBlob', d.default.template(Qe)),
        d.default.registerPartial('functions/isDefined', d.default.template(ze)),
        d.default.registerPartial('functions/isFormData', d.default.template(Je)),
        d.default.registerPartial('functions/isString', d.default.template(Ze)),
        d.default.registerPartial('functions/isStringWithValue', d.default.template(Ge)),
        d.default.registerPartial('functions/isSuccess', d.default.template(Xe)),
        d.default.registerPartial('functions/base64', d.default.template(Fe)),
        d.default.registerPartial('functions/resolve', d.default.template(Ke)),
        d.default.registerPartial('fetch/getHeaders', d.default.template(He)),
        d.default.registerPartial('fetch/getRequestBody', d.default.template(Se)),
        d.default.registerPartial('fetch/getResponseBody', d.default.template(Ne)),
        d.default.registerPartial('fetch/getResponseHeader', d.default.template(Be)),
        d.default.registerPartial('fetch/sendRequest', d.default.template(Me)),
        d.default.registerPartial('fetch/request', d.default.template(Le)),
        d.default.registerPartial('xhr/getHeaders', d.default.template(sn)),
        d.default.registerPartial('xhr/getRequestBody', d.default.template(un)),
        d.default.registerPartial('xhr/getResponseBody', d.default.template(pn)),
        d.default.registerPartial('xhr/getResponseHeader', d.default.template(cn)),
        d.default.registerPartial('xhr/sendRequest', d.default.template(dn)),
        d.default.registerPartial('xhr/request', d.default.template(mn)),
        d.default.registerPartial('node/getHeaders', d.default.template(Ye)),
        d.default.registerPartial('node/getRequestBody', d.default.template(en)),
        d.default.registerPartial('node/getResponseBody', d.default.template(nn)),
        d.default.registerPartial('node/getResponseHeader', d.default.template(tn)),
        d.default.registerPartial('node/sendRequest', d.default.template(an)),
        d.default.registerPartial('node/request', d.default.template(rn)),
        d.default.registerPartial('axios/getHeaders', d.default.template(je)),
        d.default.registerPartial('axios/getRequestBody', d.default.template(Ae)),
        d.default.registerPartial('axios/getResponseBody', d.default.template(De)),
        d.default.registerPartial('axios/getResponseHeader', d.default.template(Ie)),
        d.default.registerPartial('axios/sendRequest', d.default.template(Ee)),
        d.default.registerPartial('axios/request', d.default.template(Te)),
        n
    );
}
l.promisify(o.readFile);
const zn = l.promisify(o.writeFile),
    Jn = l.promisify(o.copyFile),
    Zn = l.promisify(o.exists),
    Gn = e =>
        new Promise((n, t) => {
            o.mkdir(e, { recursive: !0 }, e => {
                e ? t(e) : n();
            });
        }),
    Xn = e =>
        new Promise((n, t) => {
            o.rm(e, { recursive: !0, force: !0 }, e => {
                e ? t(e) : n();
            });
        });
function Kn(n) {
    return f.default.format(n, { parser: 'typescript', plugins: [h.default] }) + e.EOL;
}
async function Yn(e, n, t, r, o, l, i, s, u, p, c, m) {
    const d = a.resolve(process.cwd(), t),
        f = a.resolve(d, 'core'),
        h = a.resolve(d, 'models'),
        y = a.resolve(d, 'schemas'),
        v = a.resolve(d, 'services');
    if (((g = process.cwd()), (P = t), !a.relative(P, g).startsWith('..')))
        throw new Error('Output folder is not a subdirectory of the current working directory');
    var g, P;
    i &&
        (await Xn(f),
        await Gn(f),
        await (async function (e, n, t, r, o) {
            const l = { httpClient: r, server: e.server, version: e.version };
            if (
                (await zn(a.resolve(t, 'OpenAPI.ts'), n.core.settings(l)),
                await zn(a.resolve(t, 'ApiError.ts'), n.core.apiError({})),
                await zn(a.resolve(t, 'ApiRequestOptions.ts'), n.core.apiRequestOptions({})),
                await zn(a.resolve(t, 'ApiResult.ts'), n.core.apiResult({})),
                await zn(a.resolve(t, 'CancelablePromise.ts'), n.core.cancelablePromise({})),
                await zn(a.resolve(t, 'request.ts'), n.core.request(l)),
                o)
            ) {
                const e = a.resolve(process.cwd(), o);
                if (!(await Zn(e))) throw new Error(`Custom request file "${e}" does not exists`);
                await Jn(e, a.resolve(t, 'request.ts'));
            }
        })(e, n, f, r, m)),
        s &&
            (await Xn(v),
            await Gn(v),
            await (async function (e, n, t, r, o, l, i) {
                for (const s of e) {
                    const e = a.resolve(t, `${s.name}${i}.ts`),
                        u = s.operations.some(e => e.path.includes('OpenAPI.VERSION')),
                        p = n.exports.service({
                            ...s,
                            httpClient: r,
                            useUnionTypes: o,
                            useVersion: u,
                            useOptions: l,
                            postfix: i,
                        });
                    await zn(e, Kn(p));
                }
            })(e.services, n, v, r, l, o, c)),
        p &&
            (await Xn(y),
            await Gn(y),
            await (async function (e, n, t, r, o) {
                for (const l of e) {
                    const e = a.resolve(t, `$${l.name}.ts`),
                        i = n.exports.schema({ ...l, httpClient: r, useUnionTypes: o });
                    await zn(e, Kn(i));
                }
            })(e.models, n, y, r, l)),
        u &&
            (await Xn(h),
            await Gn(h),
            await (async function (e, n, t, r, o) {
                for (const l of e) {
                    const e = a.resolve(t, `${l.name}.ts`),
                        i = n.exports.model({ ...l, httpClient: r, useUnionTypes: o });
                    await zn(e, Kn(i));
                }
            })(e.models, n, h, r, l)),
        (i || s || p || u) &&
            (await Gn(d),
            await (async function (e, n, t, r, o, l, i, s, u) {
                var p, c;
                await zn(
                    a.resolve(t, 'index.ts'),
                    n.index({
                        exportCore: o,
                        exportServices: l,
                        exportModels: i,
                        exportSchemas: s,
                        useUnionTypes: r,
                        postfix: u,
                        server: e.server,
                        version: e.version,
                        models:
                            ((c = e.models),
                            c.sort((e, n) => {
                                const t = e.name.toLowerCase(),
                                    r = n.name.toLowerCase();
                                return t.localeCompare(r, 'en');
                            })),
                        services:
                            ((p = e.services),
                            p.sort((e, n) => {
                                const t = e.name.toLowerCase(),
                                    r = n.name.toLowerCase();
                                return t.localeCompare(r, 'en');
                            })),
                    })
                );
            })(e, n, d, l, i, s, u, p, c));
}
async function et({
    input: e,
    output: n,
    httpClient: t = exports.HttpClient.FETCH,
    useOptions: r = !1,
    useUnionTypes: a = !1,
    exportCore: o = !0,
    exportServices: l = !0,
    exportModels: i = !0,
    exportSchemas: s = !1,
    postfix: u = 'Service',
    request: p,
    write: c = !0,
}) {
    const d =
        'string' == typeof e
            ? await (async function (e) {
                  return await m.default.bundle(e, e, {});
              })(e)
            : e;
    const f = (function (e) {
            const n = e.swagger || e.openapi;
            if ('string' == typeof n) {
                const e = n.charAt(0),
                    t = Number.parseInt(e);
                if (t === ve.V2 || t === ve.V3) return t;
            }
            throw new Error(`Unsupported Open API version: "${String(n)}"`);
        })(d),
        h = Qn({ httpClient: t, useUnionTypes: a, useOptions: r });
    switch (f) {
        case ve.V2: {
            const e = Re(W(d));
            if (!c) break;
            await Yn(e, h, n, t, r, a, o, l, i, s, u, p);
            break;
        }
        case ve.V3: {
            const e = Re(ye(d));
            if (!c) break;
            await Yn(e, h, n, t, r, a, o, l, i, s, u, p);
            break;
        }
    }
}
var nt = { HttpClient: exports.HttpClient, generate: et };
(exports.default = nt), (exports.generate = et);
