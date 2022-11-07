/**
 * 2q.js version 1.0.1 beta
 * By Malthe Laursen
 */

(() => {

  window.QConfig = Object.assign({
    q: {
      functionName: 'q',
      methodName: 'q',
      hookOntoDOMClasses: true
    },
    qget: {
      qnFunctionName: 'qn',
      methodName: 'qget',
      enabled: true
    },
    varns: '_q_',
    aliases: {
      class: 'className',
      css: 'style',
      text: 'innerText',
      html: 'innerHTML'
    },
    validCSSProps: Object.keys(document.body.style),
    cssAutoUnits: {
      width: 'px',
      height: 'px',
      top: 'px',
      left: 'px',
      right: 'px',
      bottom: 'px'
    } // Add units to numbers, NOT strings. Only for props outside style/css.
  }, typeof window.QConfig === 'object' ? window.QConfig : {});

  /**
   * q method
   */

  const q = window[window.QConfig.q.functionName] = function () {
    // Extract arguments
    const args = {
      selectorString: '',
      blueprint: {},
      children: []
    };

    const argl = {strings: 0};

    for (const arg of arguments) {
      switch (typeof arg) {
        // Strings: 1st -> selector, 2nd -> text, 3rd -> 2q name
        case 'string':
          switch (argl.strings++) {
            case 0:
              args.selectorString = arg;
              break;
            case 1:
              args.innerText = arg;
              break;
            case 2:
              args.qname = arg;
              break;
          }
          break;
        // Objects: 1st -> "blueprint", Array -> children
        case 'object':
          if (Array.isArray(arg)) args.children.push(...arg);
          else Object.assign(args.blueprint, arg);
          break;
      }
    }

    // Extract "selector"
    let extract = {
      tag: [],
      id: [],
      class: [],
      state: []
    };
    let etyp = 'tag';
    let n = 0;
    for (let i = 0; i < args.selectorString.length; i++) {
      const char = args.selectorString[i];
      switch (char) {
        case '#':
          n = extract.id.length;
          etyp = 'id';
          break;
        case '.':
          n = extract.class.length;
          etyp = 'class';
          break;
        case ':':
          n = extract.state.length;
          etyp = 'state';
          break;
        default:
          if (!extract[etyp][n]) extract[etyp][n] = [];
          extract[etyp][n] += char;
          break;
      }
    }
    if (extract.tag[0]) args.tag = extract.tag[0];
    if (extract.id[0]) args.id = extract.id[0];
    if (extract.class.length) args.classes ? args.classes.push(...extract.class) : (args.classes = extract.class);
    for (const state of extract.state) {
      args[state] = true;
    }

    // Aliases
    for (const key in args.blueprint)
      if (args.blueprint.hasOwnProperty(key) && window.QConfig.aliases[key]) {
        args.blueprint[window.QConfig.aliases[key]] = args.blueprint[key];
        delete args.blueprint[key];
      }

    if (args.blueprint.children) {
      args.children.push(...args.blueprint.children);
      delete args.blueprint.children;
    }

    // Generate DOM
    const qel = document.createElement(args.tag || args.blueprint.tag || 'div');

    Object.assign(qel, args.blueprint);

    if (args.id) qel.id = args.id;
    if (args.className) qel.className = args.className;
    if (args.classes) qel.classList.add(...args.classes);

    if (args.innerText) qel.innerText = args.innerText;

    // Workaround for adding styles
    if (args.blueprint.style) Object.assign(qel.style, args.blueprint.style);

    // Add styles without css or style object
    for (const key in args.blueprint) {
      if (args.blueprint.hasOwnProperty(key) && window.QConfig.validCSSProps.includes(key)) {
        if ((key === 'width' || key === 'height') && (qel.tagName === 'CANVAS' || qel.tagName === 'IMAGE')) continue;
        qel.style[key] = typeof args.blueprint[key] === 'number' ? args.blueprint[key] + (window.QConfig.cssAutoUnits[key] || '') : args.blueprint[key];
      }
    }

    // Add children + qget
    if (window.QConfig.qget && window.QConfig.qget.enabled) {
      let varns = window.QConfig.varns;

      qel[varns + 'names'] = {};
      qel[varns + 'name'] = args.qname || args.blueprint.qn || args.blueprint.named;
      qel[varns + 'names'][qel[varns + 'name']] = qel;
      qel[window.QConfig.qget.methodName] = function (qname) {
        return qel[varns + 'names'][qname];
      };

      for (const child of args.children) {
        if (child[varns + 'name']) qel[varns + 'names'][child[varns + 'name']] = child;
        if (child[varns + 'names']) Object.assign(qel[varns + 'names'], child[varns + 'names']);
        qel.appendChild(child);
      }
    }
    // Or just add children if qget is disabled.
    else
      for (const child of args.children) {
        qel.appendChild(child);
      }

    return qel;
  };

  if (window.QConfig.q.hookOntoDOMClasses) HTMLElement.prototype[window.QConfig.q.methodName] = function () {
    const a = q(...arguments);
    if (window.QConfig.qget && window.QConfig.qget.enabled) Object.assign(a[window.QConfig.varns + 'names'], this[window.QConfig.varns + 'names']);
    this.appendChild(a);
    return a;
  };

  if (window.QConfig.qget && window.QConfig.qget.enabled && window.QConfig.qget.qnFunctionName)
    window[window.QConfig.qget.qnFunctionName] = function (name) {
      return q(...Array.from(arguments).splice(1), {qn: name});
    };

})();
