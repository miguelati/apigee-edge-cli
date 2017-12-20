const XmlLive = require("./XmlLive");
const SimpleTag = require("./SimpleTag");
const _ = require("lodash");
const fs = require("fs-plus");

class TagFactory {
    constructor (tagName, opts) {
        if (TagFactory.existsClass(tagName)) {
            let classes = TagFactory.requireClass(tagName);
            let tag = new classes(opts);
            return this.setTagProxy(tag);
        } else {
            let tag = new SimpleTag(tagName);
            return this.setTagProxy(tag);
        }
    }

    static existsClass(className) {
        return fs.existsSync(`${__dirname}/policies/${className}.js`) || fs.existsSync(`${__dirname}/flows/${className}.js`);
    }

    static requireClass(className) {
        if (fs.existsSync(`${__dirname}/policies/${className}.js`)) {
            return require(`${__dirname}/policies/${className}.js`);
        } else if(fs.existsSync(`${__dirname}/flows/${className}.js`)) {
            return require(`${__dirname}/flows/${className}.js`);
        }
    }

    static generateTag(name, opts) {
        let tag = new TagFactory(name);
        if(_.isString(opts)) {
            tag.content = opts;
        } else if(_.isNull(opts) || _.isUndefined(opts)){
            tag.content = null;
        } else if (_.isObjectLike(opts)) {
            for(let key in opts.attr) {
                tag.attributes[key] = opts.attr[key];
            }
            if(opts.content instanceof XmlLive) {
                tag.addTag(opts.content);
            } else if(_.isString(opts.content)) {
                tag.content = opts.content;
            } else if(_.isNull(opts.content) || _.isUndefined(opts.content)){
                tag.content = null;
            } else if(_.isArray(opts.content)) {
                for(let index in opts.content) {
                    if(opts.content[index] instanceof XmlLive) {
                        tag.addTag(opts.content[index]);
                    }
                }
            }
        }
        return tag;
    }

    static setAddParam(target, name, args) {
        let main = target.findTag(name);
        if (main === null) {
            main = new TagFactory(name);
        }
        
        let wasMain = false;
        for(let index in args) {
            if (args[index] instanceof XmlLive) {
                main.addTag(args[index]);
                wasMain = true;
            } else {
                let tag = TagFactory.generateTag(name, args[index]);
                target.addTag(tag);
            }
        }
        if(wasMain) {
            target.addTag(main);
        }
    }

    static setNestedParams(target, baseTagName, mainTagName, args) {
        let baseTag = target.findTag(baseTagName);
        if (baseTag === null) {
            baseTag = new TagFactory(baseTagName);
        }

        for(let index in args) {
            if(args[index] instanceof XmlLive) {
                let mainTag = new TagFactory(mainTagName);
                mainTag.addTag(args[index])
                baseTag.addTag(mainTag);
                if (!target.replaceTag(baseTagName, baseTag)) {
                    target.addTag(baseTag);
                }
            } else {
                let mainTag = TagFactory.generateTag(mainTagName, args[index]);
                baseTag.addTag(mainTag);
                if (!target.replaceTag(baseTagName, baseTag)) {
                    target.addTag(baseTag);
                }
            }
        }
    }

    setTagProxy(objTag) {
        var proxy = new Proxy(objTag, {
            get(target, propKey, receiver) {
                if (!(propKey in target)) {
                    if(_.isString(propKey) && propKey.match(/^add(.+)In(.+)$/) !== null) {
                        let matches = propKey.match(/^add(.+)In(.+)$/);
                        return function (...args) {
                            TagFactory.setNestedParams(target, matches[2], matches[1], args)
                        };
                    } else if(_.isString(propKey) && /^add/.test(propKey)) {
                        return function (...args) {
                            let name = propKey.replace(/^add/, "");
                            TagFactory.setAddParam(target, name, args)
                        };
                    } else {
                        return target.attributes[propKey];
                    }
                } else {
                    return target[propKey];
                }
            },
            set(target, name, value) {
                if (!(name in target)) {
                    target.attributes[name] = value   
                } else {
                    target[name] = value;    
                }
                return true;
            }
        });

        return proxy;
    }
}

module.exports = TagFactory;
