var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node_modules/marked/lib/marked.esm.js
function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}
function escape$1(html, encode) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html;
}
function edit(regex, opt) {
  let source = typeof regex === "string" ? regex : regex.source;
  opt = opt || "";
  const obj = {
    replace: (name, val) => {
      let valSource = typeof val === "string" ? val : val.source;
      valSource = valSource.replace(caret, "$1");
      source = source.replace(name, valSource);
      return obj;
    },
    getRegex: () => {
      return new RegExp(source, opt);
    }
  };
  return obj;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(/%25/g, "%");
  } catch {
    return null;
  }
  return href;
}
function splitCells(tableRow, count) {
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\")
      escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(/ \|/);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells[cells.length - 1].trim()) {
    cells.pop();
  }
  if (count) {
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count)
        cells.push("");
    }
  }
  for (;i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(/\\\|/g, "|");
  }
  return cells;
}
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0;i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}
function outputLink(cap, link, raw, lexer) {
  const href = link.href;
  const title = link.title ? escape$1(link.title) : null;
  const text = cap[1].replace(/\\([\[\]])/g, "$1");
  if (cap[0].charAt(0) !== "!") {
    lexer.state.inLink = true;
    const token = {
      type: "link",
      raw,
      href,
      title,
      text,
      tokens: lexer.inlineTokens(text)
    };
    lexer.state.inLink = false;
    return token;
  }
  return {
    type: "image",
    raw,
    href,
    title,
    text: escape$1(text)
  };
}
function indentCodeCompensation(raw, text) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split(`
`).map((node) => {
    const matchIndentInNode = node.match(/^\s+/);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join(`
`);
}

class _Tokenizer {
  options;
  rules;
  lexer;
  constructor(options) {
    this.options = options || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(/^(?: {1,4}| {0,3}\t)/gm, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, `
`) : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "");
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (/#$/.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || / $/.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: rtrim(cap[0], `
`)
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      let lines = rtrim(cap[0], `
`).split(`
`);
      let raw = "";
      let text = "";
      const tokens = [];
      while (lines.length > 0) {
        let inBlockquote = false;
        const currentLines = [];
        let i;
        for (i = 0;i < lines.length; i++) {
          if (/^ {0,3}>/.test(lines[i])) {
            currentLines.push(lines[i]);
            inBlockquote = true;
          } else if (!inBlockquote) {
            currentLines.push(lines[i]);
          } else {
            break;
          }
        }
        lines = lines.slice(i);
        const currentRaw = currentLines.join(`
`);
        const currentText = currentRaw.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g, `
    $1`).replace(/^ {0,3}>[ \t]?/gm, "");
        raw = raw ? `${raw}
${currentRaw}` : currentRaw;
        text = text ? `${text}
${currentText}` : currentText;
        const top = this.lexer.state.top;
        this.lexer.state.top = true;
        this.lexer.blockTokens(currentText, tokens, true);
        this.lexer.state.top = top;
        if (lines.length === 0) {
          break;
        }
        const lastToken = tokens[tokens.length - 1];
        if (lastToken?.type === "code") {
          break;
        } else if (lastToken?.type === "blockquote") {
          const oldToken = lastToken;
          const newText = oldToken.raw + `
` + lines.join(`
`);
          const newToken = this.blockquote(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
          break;
        } else if (lastToken?.type === "list") {
          const oldToken = lastToken;
          const newText = oldToken.raw + `
` + lines.join(`
`);
          const newToken = this.list(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
          lines = newText.substring(tokens[tokens.length - 1].raw.length).split(`
`);
          continue;
        }
      }
      return {
        type: "blockquote",
        raw,
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`);
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        let raw = "";
        let itemContents = "";
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split(`
`, 1)[0].replace(/^\t+/, (t) => " ".repeat(3 * t.length));
        let nextLine = src.split(`
`, 1)[0];
        let blankLine = !line.trim();
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimStart();
        } else if (blankLine) {
          indent = cap[1].length + 1;
        } else {
          indent = cap[2].search(/[^ ]/);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        if (blankLine && /^[ \t]*$/.test(nextLine)) {
          raw += nextLine + `
`;
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`);
          const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
          const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
          const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
          const htmlBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, "i");
          while (src) {
            const rawLine = src.split(`
`, 1)[0];
            let nextLineWithoutTabs;
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ");
              nextLineWithoutTabs = nextLine;
            } else {
              nextLineWithoutTabs = nextLine.replace(/\t/g, "    ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (htmlBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(nextLine)) {
              break;
            }
            if (nextLineWithoutTabs.search(/[^ ]/) >= indent || !nextLine.trim()) {
              itemContents += `
` + nextLineWithoutTabs.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.replace(/\t/g, "    ").search(/[^ ]/) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += `
` + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + `
`;
            src = src.substring(rawLine.length + 1);
            line = nextLineWithoutTabs.slice(indent);
          }
        }
        if (!list.loose) {
          if (endsWithBlankLine) {
            list.loose = true;
          } else if (/\n[ \t]*\n[ \t]*$/.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = /^\[[ xX]\] /.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(/^\[[ xX]\] +/, "");
          }
        }
        list.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list.raw += raw;
      }
      list.items[list.items.length - 1].raw = list.items[list.items.length - 1].raw.trimEnd();
      list.items[list.items.length - 1].text = list.items[list.items.length - 1].text.trimEnd();
      list.raw = list.raw.trimEnd();
      for (let i = 0;i < list.items.length; i++) {
        this.lexer.state.top = false;
        list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
        if (!list.loose) {
          const spacers = list.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => /\n.*\n/.test(t.raw));
          list.loose = hasMultipleLineBreaks;
        }
      }
      if (list.loose) {
        for (let i = 0;i < list.items.length; i++) {
          list.items[i].loose = true;
        }
      }
      return list;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag = cap[1].toLowerCase().replace(/\s+/g, " ");
      const href = cap[2] ? cap[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : cap[3];
      return {
        type: "def",
        tag,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (!cap) {
      return;
    }
    if (!/[:|]/.test(cap[2])) {
      return;
    }
    const headers = splitCells(cap[1]);
    const aligns = cap[2].replace(/^\||\| *$/g, "").split("|");
    const rows = cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, "").split(`
`) : [];
    const item = {
      type: "table",
      raw: cap[0],
      header: [],
      align: [],
      rows: []
    };
    if (headers.length !== aligns.length) {
      return;
    }
    for (const align of aligns) {
      if (/^ *-+: *$/.test(align)) {
        item.align.push("right");
      } else if (/^ *:-+: *$/.test(align)) {
        item.align.push("center");
      } else if (/^ *:-+ *$/.test(align)) {
        item.align.push("left");
      } else {
        item.align.push(null);
      }
    }
    for (let i = 0;i < headers.length; i++) {
      item.header.push({
        text: headers[i],
        tokens: this.lexer.inline(headers[i]),
        header: true,
        align: item.align[i]
      });
    }
    for (const row of rows) {
      item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
        return {
          text: cell,
          tokens: this.lexer.inline(cell),
          header: false,
          align: item.align[i]
        };
      }));
    }
    return item;
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === `
` ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: escape$1(cap[1])
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && /^</.test(trimmedUrl)) {
        if (!/>$/.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
        if (link) {
          href = link[1];
          title = link[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (/^</.test(href)) {
        if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline.anyPunctuation, "$1") : href,
        title: title ? title.replace(this.rules.inline.anyPunctuation, "$1") : title
      }, cap[0], this.lexer);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      const linkString = (cap[2] || cap[1]).replace(/\s+/g, " ");
      const link = links[linkString.toLowerCase()];
      if (!link) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link, cap[0], this.lexer);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrongLDelim.exec(src);
    if (!match)
      return;
    if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
      return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim)
          continue;
        rLength = [...rDelim].length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0)
          continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const lastCharLength = [...match[0]][0].length;
        const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(/\n/g, " ");
      const hasNonSpaceChars = /[^ ]/.test(text);
      const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      text = escape$1(text, true);
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = escape$1(cap[1]);
        href = "mailto:" + text;
      } else {
        text = escape$1(cap[1]);
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = escape$1(cap[0]);
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? "";
        } while (prevCapZero !== cap[0]);
        text = escape$1(cap[0]);
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      let text;
      if (this.lexer.state.inRawBlock) {
        text = cap[0];
      } else {
        text = escape$1(cap[0]);
      }
      return {
        type: "text",
        raw: cap[0],
        text
      };
    }
  }
}

class _Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options) {
    this.tokens = [];
    this.tokens.links = Object.create(null);
    this.options = options || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer;
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  static get rules() {
    return {
      block,
      inline
    };
  }
  static lex(src, options) {
    const lexer = new _Lexer(options);
    return lexer.lex(src);
  }
  static lexInline(src, options) {
    const lexer = new _Lexer(options);
    return lexer.inlineTokens(src);
  }
  lex(src) {
    src = src.replace(/\r\n|\r/g, `
`);
    this.blockTokens(src, this.tokens);
    for (let i = 0;i < this.inlineQueue.length; i++) {
      const next = this.inlineQueue[i];
      this.inlineTokens(next.src, next.tokens);
    }
    this.inlineQueue = [];
    return this.tokens;
  }
  blockTokens(src, tokens = [], lastParagraphClipped = false) {
    if (this.options.pedantic) {
      src = src.replace(/\t/g, "    ").replace(/^ +$/gm, "");
    }
    let token;
    let lastToken;
    let cutSrc;
    while (src) {
      if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        if (token.raw.length === 1 && tokens.length > 0) {
          tokens[tokens.length - 1].raw += `
`;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.text;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.raw;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        lastToken = tokens[tokens.length - 1];
        if (lastParagraphClipped && lastToken?.type === "paragraph") {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  inlineTokens(src, tokens = []) {
    let token, lastToken, cutSrc;
    let maskedSrc = src;
    let match;
    let keepPrevChar, prevChar;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
}

class _Renderer {
  options;
  parser;
  constructor(options) {
    this.options = options || _defaults;
  }
  space(token) {
    return "";
  }
  code({ text, lang, escaped }) {
    const langString = (lang || "").match(/^\S*/)?.[0];
    const code = text.replace(/\n$/, "") + `
`;
    if (!langString) {
      return "<pre><code>" + (escaped ? code : escape$1(code, true)) + `</code></pre>
`;
    }
    return '<pre><code class="language-' + escape$1(langString) + '">' + (escaped ? code : escape$1(code, true)) + `</code></pre>
`;
  }
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens);
    return `<blockquote>
${body}</blockquote>
`;
  }
  html({ text }) {
    return text;
  }
  heading({ tokens, depth }) {
    return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>
`;
  }
  hr(token) {
    return `<hr>
`;
  }
  list(token) {
    const ordered = token.ordered;
    const start = token.start;
    let body = "";
    for (let j = 0;j < token.items.length; j++) {
      const item = token.items[j];
      body += this.listitem(item);
    }
    const type = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startAttr + `>
` + body + "</" + type + `>
`;
  }
  listitem(item) {
    let itemBody = "";
    if (item.task) {
      const checkbox = this.checkbox({ checked: !!item.checked });
      if (item.loose) {
        if (item.tokens.length > 0 && item.tokens[0].type === "paragraph") {
          item.tokens[0].text = checkbox + " " + item.tokens[0].text;
          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
            item.tokens[0].tokens[0].text = checkbox + " " + item.tokens[0].tokens[0].text;
          }
        } else {
          item.tokens.unshift({
            type: "text",
            raw: checkbox + " ",
            text: checkbox + " "
          });
        }
      } else {
        itemBody += checkbox + " ";
      }
    }
    itemBody += this.parser.parse(item.tokens, !!item.loose);
    return `<li>${itemBody}</li>
`;
  }
  checkbox({ checked }) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>
`;
  }
  table(token) {
    let header = "";
    let cell = "";
    for (let j = 0;j < token.header.length; j++) {
      cell += this.tablecell(token.header[j]);
    }
    header += this.tablerow({ text: cell });
    let body = "";
    for (let j = 0;j < token.rows.length; j++) {
      const row = token.rows[j];
      cell = "";
      for (let k = 0;k < row.length; k++) {
        cell += this.tablecell(row[k]);
      }
      body += this.tablerow({ text: cell });
    }
    if (body)
      body = `<tbody>${body}</tbody>`;
    return `<table>
` + `<thead>
` + header + `</thead>
` + body + `</table>
`;
  }
  tablerow({ text }) {
    return `<tr>
${text}</tr>
`;
  }
  tablecell(token) {
    const content = this.parser.parseInline(token.tokens);
    const type = token.header ? "th" : "td";
    const tag2 = token.align ? `<${type} align="${token.align}">` : `<${type}>`;
    return tag2 + content + `</${type}>
`;
  }
  strong({ tokens }) {
    return `<strong>${this.parser.parseInline(tokens)}</strong>`;
  }
  em({ tokens }) {
    return `<em>${this.parser.parseInline(tokens)}</em>`;
  }
  codespan({ text }) {
    return `<code>${text}</code>`;
  }
  br(token) {
    return "<br>";
  }
  del({ tokens }) {
    return `<del>${this.parser.parseInline(tokens)}</del>`;
  }
  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image({ href, title, text }) {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += ">";
    return out;
  }
  text(token) {
    return "tokens" in token && token.tokens ? this.parser.parseInline(token.tokens) : token.text;
  }
}

class _TextRenderer {
  strong({ text }) {
    return text;
  }
  em({ text }) {
    return text;
  }
  codespan({ text }) {
    return text;
  }
  del({ text }) {
    return text;
  }
  html({ text }) {
    return text;
  }
  text({ text }) {
    return text;
  }
  link({ text }) {
    return "" + text;
  }
  image({ text }) {
    return "" + text;
  }
  br() {
    return "";
  }
}

class _Parser {
  options;
  renderer;
  textRenderer;
  constructor(options) {
    this.options = options || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer;
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer;
  }
  static parse(tokens, options) {
    const parser = new _Parser(options);
    return parser.parse(tokens);
  }
  static parseInline(tokens, options) {
    const parser = new _Parser(options);
    return parser.parseInline(tokens);
  }
  parse(tokens, top = true) {
    let out = "";
    for (let i = 0;i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[anyToken.type]) {
        const genericToken = anyToken;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "space": {
          out += this.renderer.space(token);
          continue;
        }
        case "hr": {
          out += this.renderer.hr(token);
          continue;
        }
        case "heading": {
          out += this.renderer.heading(token);
          continue;
        }
        case "code": {
          out += this.renderer.code(token);
          continue;
        }
        case "table": {
          out += this.renderer.table(token);
          continue;
        }
        case "blockquote": {
          out += this.renderer.blockquote(token);
          continue;
        }
        case "list": {
          out += this.renderer.list(token);
          continue;
        }
        case "html": {
          out += this.renderer.html(token);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(token);
          continue;
        }
        case "text": {
          let textToken = token;
          let body = this.renderer.text(textToken);
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += `
` + this.renderer.text(textToken);
          }
          if (top) {
            out += this.renderer.paragraph({
              type: "paragraph",
              raw: body,
              text: body,
              tokens: [{ type: "text", raw: body, text: body }]
            });
          } else {
            out += body;
          }
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  parseInline(tokens, renderer) {
    renderer = renderer || this.renderer;
    let out = "";
    for (let i = 0;i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(anyToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "escape": {
          out += renderer.text(token);
          break;
        }
        case "html": {
          out += renderer.html(token);
          break;
        }
        case "link": {
          out += renderer.link(token);
          break;
        }
        case "image": {
          out += renderer.image(token);
          break;
        }
        case "strong": {
          out += renderer.strong(token);
          break;
        }
        case "em": {
          out += renderer.em(token);
          break;
        }
        case "codespan": {
          out += renderer.codespan(token);
          break;
        }
        case "br": {
          out += renderer.br(token);
          break;
        }
        case "del": {
          out += renderer.del(token);
          break;
        }
        case "text": {
          out += renderer.text(token);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
}

class Marked {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = _Parser;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  walkTokens(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          const tableToken = token;
          for (const cell of tableToken.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token;
          values = values.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              const tokens2 = genericToken[childTokens].flat(Infinity);
              values = values.concat(this.walkTokens(tokens2, callback));
            });
          } else if (genericToken.tokens) {
            values = values.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          if (!(prop in renderer)) {
            throw new Error(`renderer '${prop}' does not exist`);
          }
          if (["options", "parser"].includes(prop)) {
            continue;
          }
          const rendererProp = prop;
          const rendererFunc = pack.renderer[rendererProp];
          const prevRenderer = renderer[rendererProp];
          renderer[rendererProp] = (...args2) => {
            let ret = rendererFunc.apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          if (!(prop in tokenizer)) {
            throw new Error(`tokenizer '${prop}' does not exist`);
          }
          if (["options", "rules", "lexer"].includes(prop)) {
            continue;
          }
          const tokenizerProp = prop;
          const tokenizerFunc = pack.tokenizer[tokenizerProp];
          const prevTokenizer = tokenizer[tokenizerProp];
          tokenizer[tokenizerProp] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks;
        for (const prop in pack.hooks) {
          if (!(prop in hooks)) {
            throw new Error(`hook '${prop}' does not exist`);
          }
          if (["options", "block"].includes(prop)) {
            continue;
          }
          const hooksProp = prop;
          const hooksFunc = pack.hooks[hooksProp];
          const prevHook = hooks[hooksProp];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksProp] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksProp] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(packWalktokens.call(this, token));
          if (walkTokens) {
            values = values.concat(walkTokens.call(this, token));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  lexer(src, options) {
    return _Lexer.lex(src, options ?? this.defaults);
  }
  parser(tokens, options) {
    return _Parser.parse(tokens, options ?? this.defaults);
  }
  parseMarkdown(blockType) {
    const parse = (src, options) => {
      const origOpt = { ...options };
      const opt = { ...this.defaults, ...origOpt };
      const throwError = this.onError(!!opt.silent, !!opt.async);
      if (this.defaults.async === true && origOpt.async === false) {
        return throwError(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      }
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
        opt.hooks.block = blockType;
      }
      const lexer = opt.hooks ? opt.hooks.provideLexer() : blockType ? _Lexer.lex : _Lexer.lexInline;
      const parser = opt.hooks ? opt.hooks.provideParser() : blockType ? _Parser.parse : _Parser.parseInline;
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer(src2, opt)).then((tokens) => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser(tokens, opt)).then((html2) => opt.hooks ? opt.hooks.postprocess(html2) : html2).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        let tokens = lexer(src, opt);
        if (opt.hooks) {
          tokens = opt.hooks.processAllTokens(tokens);
        }
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html2 = parser(tokens, opt);
        if (opt.hooks) {
          html2 = opt.hooks.postprocess(html2);
        }
        return html2;
      } catch (e) {
        return throwError(e);
      }
    };
    return parse;
  }
  onError(silent, async) {
    return (e) => {
      e.message += `
Please report this to https://github.com/markedjs/marked.`;
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape$1(e.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e);
      }
      throw e;
    };
  }
}
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
var _defaults, escapeTest, escapeReplace, escapeTestNoEncode, escapeReplaceNoEncode, escapeReplacements, getEscapeReplacement = (ch) => escapeReplacements[ch], caret, noopTest, newline, blockCode, fences, hr, heading, bullet, lheading, _paragraph, blockText, _blockLabel, def, list, _tag, _comment, html, paragraph, blockquote, blockNormal, gfmTable, blockGfm, blockPedantic, escape, inlineCode, br, inlineText, _punctuation = "\\p{P}\\p{S}", punctuation, blockSkip, emStrongLDelim, emStrongRDelimAst, emStrongRDelimUnd, anyPunctuation, autolink, _inlineComment, tag, _inlineLabel, link, reflink, nolink, reflinkSearch, inlineNormal, inlinePedantic, inlineGfm, inlineBreaks, block, inline, _Hooks, markedInstance, options, setOptions, use, walkTokens, parseInline, parser, lexer;
var init_marked_esm = __esm(() => {
  _defaults = _getDefaults();
  escapeTest = /[&<>"']/;
  escapeReplace = new RegExp(escapeTest.source, "g");
  escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
  escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
  escapeReplacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  caret = /(^|[^\[])\^/g;
  noopTest = { exec: () => null };
  newline = /^(?:[ \t]*(?:\n|$))+/;
  blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
  fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
  hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
  heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
  bullet = /(?:[*+-]|\d{1,9}[.)])/;
  lheading = edit(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).getRegex();
  _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
  blockText = /^[^\n]+/;
  _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
  def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _blockLabel).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
  list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, bullet).getRegex();
  _tag = "address|article|aside|base|basefont|blockquote|body|caption" + "|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption" + "|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe" + "|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option" + "|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title" + "|tr|track|ul";
  _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
  html = edit("^ {0,3}(?:" + "<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)" + "|comment[^\\n]*(\\n+|$)" + "|<\\?[\\s\\S]*?(?:\\?>\\n*|$)" + "|<![A-Z][\\s\\S]*?(?:>\\n*|$)" + "|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)" + "|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)" + "|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)" + "|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)" + ")", "i").replace("comment", _comment).replace("tag", _tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  paragraph = edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
  blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", paragraph).getRegex();
  blockNormal = {
    blockquote,
    code: blockCode,
    def,
    fences,
    heading,
    hr,
    html,
    lheading,
    list,
    newline,
    paragraph,
    table: noopTest,
    text: blockText
  };
  gfmTable = edit("^ *([^\\n ].*)\\n" + " {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)" + "(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
  blockGfm = {
    ...blockNormal,
    table: gfmTable,
    paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", gfmTable).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex()
  };
  blockPedantic = {
    ...blockNormal,
    html: edit("^ *(?:comment *(?:\\n|\\s*$)" + "|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)" + `|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", _comment).replace(/tag/g, "(?!(?:" + "a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub" + "|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)" + "\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noopTest,
    lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    paragraph: edit(_paragraph).replace("hr", hr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", lheading).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
  };
  escape = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
  inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
  br = /^( {2,}|\\)\n(?!\s*$)/;
  inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
  punctuation = edit(/^((?![*_])[\spunctuation])/, "u").replace(/punctuation/g, _punctuation).getRegex();
  blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
  emStrongLDelim = edit(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/, "u").replace(/punct/g, _punctuation).getRegex();
  emStrongRDelimAst = edit("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)" + "|[^*]+(?=[^*])" + "|(?!\\*)[punct](\\*+)(?=[\\s]|$)" + "|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)" + "|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])" + "|[\\s](\\*+)(?!\\*)(?=[punct])" + "|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])" + "|[^punct\\s](\\*+)(?=[^punct\\s])", "gu").replace(/punct/g, _punctuation).getRegex();
  emStrongRDelimUnd = edit("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)" + "|[^_]+(?=[^_])" + "|(?!_)[punct](_+)(?=[\\s]|$)" + "|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)" + "|(?!_)[punct\\s](_+)(?=[^punct\\s])" + "|[\\s](_+)(?!_)(?=[punct])" + "|(?!_)[punct](_+)(?!_)(?=[punct])", "gu").replace(/punct/g, _punctuation).getRegex();
  anyPunctuation = edit(/\\([punct])/, "gu").replace(/punct/g, _punctuation).getRegex();
  autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
  _inlineComment = edit(_comment).replace("(?:-->|$)", "-->").getRegex();
  tag = edit("^comment" + "|^</[a-zA-Z][\\w:-]*\\s*>" + "|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>" + "|^<\\?[\\s\\S]*?\\?>" + "|^<![a-zA-Z]+\\s[\\s\\S]*?>" + "|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", _inlineComment).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
  _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  link = edit(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label", _inlineLabel).replace("href", /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
  reflink = edit(/^!?\[(label)\]\[(ref)\]/).replace("label", _inlineLabel).replace("ref", _blockLabel).getRegex();
  nolink = edit(/^!?\[(ref)\](?:\[\])?/).replace("ref", _blockLabel).getRegex();
  reflinkSearch = edit("reflink|nolink(?!\\()", "g").replace("reflink", reflink).replace("nolink", nolink).getRegex();
  inlineNormal = {
    _backpedal: noopTest,
    anyPunctuation,
    autolink,
    blockSkip,
    br,
    code: inlineCode,
    del: noopTest,
    emStrongLDelim,
    emStrongRDelimAst,
    emStrongRDelimUnd,
    escape,
    link,
    nolink,
    punctuation,
    reflink,
    reflinkSearch,
    tag,
    text: inlineText,
    url: noopTest
  };
  inlinePedantic = {
    ...inlineNormal,
    link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", _inlineLabel).getRegex(),
    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", _inlineLabel).getRegex()
  };
  inlineGfm = {
    ...inlineNormal,
    escape: edit(escape).replace("])", "~|])").getRegex(),
    url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
    _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
  };
  inlineBreaks = {
    ...inlineGfm,
    br: edit(br).replace("{2,}", "*").getRegex(),
    text: edit(inlineGfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
  };
  block = {
    normal: blockNormal,
    gfm: blockGfm,
    pedantic: blockPedantic
  };
  inline = {
    normal: inlineNormal,
    gfm: inlineGfm,
    breaks: inlineBreaks,
    pedantic: inlinePedantic
  };
  _Hooks = class _Hooks {
    options;
    block;
    constructor(options) {
      this.options = options || _defaults;
    }
    static passThroughHooks = new Set([
      "preprocess",
      "postprocess",
      "processAllTokens"
    ]);
    preprocess(markdown) {
      return markdown;
    }
    postprocess(html2) {
      return html2;
    }
    processAllTokens(tokens) {
      return tokens;
    }
    provideLexer() {
      return this.block ? _Lexer.lex : _Lexer.lexInline;
    }
    provideParser() {
      return this.block ? _Parser.parse : _Parser.parseInline;
    }
  };
  markedInstance = new Marked;
  marked.options = marked.setOptions = function(options) {
    markedInstance.setOptions(options);
    marked.defaults = markedInstance.defaults;
    changeDefaults(marked.defaults);
    return marked;
  };
  marked.getDefaults = _getDefaults;
  marked.defaults = _defaults;
  marked.use = function(...args) {
    markedInstance.use(...args);
    marked.defaults = markedInstance.defaults;
    changeDefaults(marked.defaults);
    return marked;
  };
  marked.walkTokens = function(tokens, callback) {
    return markedInstance.walkTokens(tokens, callback);
  };
  marked.parseInline = markedInstance.parseInline;
  marked.Parser = _Parser;
  marked.parser = _Parser.parse;
  marked.Renderer = _Renderer;
  marked.TextRenderer = _TextRenderer;
  marked.Lexer = _Lexer;
  marked.lexer = _Lexer.lex;
  marked.Tokenizer = _Tokenizer;
  marked.Hooks = _Hooks;
  marked.parse = marked;
  options = marked.options;
  setOptions = marked.setOptions;
  use = marked.use;
  walkTokens = marked.walkTokens;
  parseInline = marked.parseInline;
  parser = _Parser.parse;
  lexer = _Lexer.lex;
});

// node:path
function assertPath(path) {
  if (typeof path !== "string")
    throw TypeError("Path must be a string. Received " + JSON.stringify(path));
}
function normalizeStringPosix(path, allowAboveRoot) {
  var res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, code;
  for (var i = 0;i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47)
      break;
    else
      code = 47;
    if (code === 47) {
      if (lastSlash === i - 1 || dots === 1)
        ;
      else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1)
                res = "", lastSegmentLength = 0;
              else
                res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              lastSlash = i, dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "", lastSegmentLength = 0, lastSlash = i, dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += "/..";
          else
            res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += "/" + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i, dots = 0;
    } else if (code === 46 && dots !== -1)
      ++dots;
    else
      dots = -1;
  }
  return res;
}
function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root, base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
  if (!dir)
    return base;
  if (dir === pathObject.root)
    return dir + base;
  return dir + sep + base;
}
function resolve() {
  var resolvedPath = "", resolvedAbsolute = false, cwd;
  for (var i = arguments.length - 1;i >= -1 && !resolvedAbsolute; i--) {
    var path;
    if (i >= 0)
      path = arguments[i];
    else {
      if (cwd === undefined)
        cwd = process.cwd();
      path = cwd;
    }
    if (assertPath(path), path.length === 0)
      continue;
    resolvedPath = path + "/" + resolvedPath, resolvedAbsolute = path.charCodeAt(0) === 47;
  }
  if (resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute), resolvedAbsolute)
    if (resolvedPath.length > 0)
      return "/" + resolvedPath;
    else
      return "/";
  else if (resolvedPath.length > 0)
    return resolvedPath;
  else
    return ".";
}
function normalize2(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var isAbsolute = path.charCodeAt(0) === 47, trailingSeparator = path.charCodeAt(path.length - 1) === 47;
  if (path = normalizeStringPosix(path, !isAbsolute), path.length === 0 && !isAbsolute)
    path = ".";
  if (path.length > 0 && trailingSeparator)
    path += "/";
  if (isAbsolute)
    return "/" + path;
  return path;
}
function isAbsolute(path) {
  return assertPath(path), path.length > 0 && path.charCodeAt(0) === 47;
}
function join() {
  if (arguments.length === 0)
    return ".";
  var joined;
  for (var i = 0;i < arguments.length; ++i) {
    var arg = arguments[i];
    if (assertPath(arg), arg.length > 0)
      if (joined === undefined)
        joined = arg;
      else
        joined += "/" + arg;
  }
  if (joined === undefined)
    return ".";
  return normalize2(joined);
}
function relative(from, to) {
  if (assertPath(from), assertPath(to), from === to)
    return "";
  if (from = resolve(from), to = resolve(to), from === to)
    return "";
  var fromStart = 1;
  for (;fromStart < from.length; ++fromStart)
    if (from.charCodeAt(fromStart) !== 47)
      break;
  var fromEnd = from.length, fromLen = fromEnd - fromStart, toStart = 1;
  for (;toStart < to.length; ++toStart)
    if (to.charCodeAt(toStart) !== 47)
      break;
  var toEnd = to.length, toLen = toEnd - toStart, length = fromLen < toLen ? fromLen : toLen, lastCommonSep = -1, i = 0;
  for (;i <= length; ++i) {
    if (i === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i) === 47)
          return to.slice(toStart + i + 1);
        else if (i === 0)
          return to.slice(toStart + i);
      } else if (fromLen > length) {
        if (from.charCodeAt(fromStart + i) === 47)
          lastCommonSep = i;
        else if (i === 0)
          lastCommonSep = 0;
      }
      break;
    }
    var fromCode = from.charCodeAt(fromStart + i), toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode)
      break;
    else if (fromCode === 47)
      lastCommonSep = i;
  }
  var out = "";
  for (i = fromStart + lastCommonSep + 1;i <= fromEnd; ++i)
    if (i === fromEnd || from.charCodeAt(i) === 47)
      if (out.length === 0)
        out += "..";
      else
        out += "/..";
  if (out.length > 0)
    return out + to.slice(toStart + lastCommonSep);
  else {
    if (toStart += lastCommonSep, to.charCodeAt(toStart) === 47)
      ++toStart;
    return to.slice(toStart);
  }
}
function _makeLong(path) {
  return path;
}
function dirname(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var code = path.charCodeAt(0), hasRoot = code === 47, end = -1, matchedSlash = true;
  for (var i = path.length - 1;i >= 1; --i)
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else
      matchedSlash = false;
  if (end === -1)
    return hasRoot ? "/" : ".";
  if (hasRoot && end === 1)
    return "//";
  return path.slice(0, end);
}
function basename(path, ext) {
  if (ext !== undefined && typeof ext !== "string")
    throw TypeError('"ext" argument must be a string');
  assertPath(path);
  var start = 0, end = -1, matchedSlash = true, i;
  if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
    if (ext.length === path.length && ext === path)
      return "";
    var extIdx = ext.length - 1, firstNonSlashEnd = -1;
    for (i = path.length - 1;i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1)
          matchedSlash = false, firstNonSlashEnd = i + 1;
        if (extIdx >= 0)
          if (code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1)
              end = i;
          } else
            extIdx = -1, end = firstNonSlashEnd;
      }
    }
    if (start === end)
      end = firstNonSlashEnd;
    else if (end === -1)
      end = path.length;
    return path.slice(start, end);
  } else {
    for (i = path.length - 1;i >= 0; --i)
      if (path.charCodeAt(i) === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1)
        matchedSlash = false, end = i + 1;
    if (end === -1)
      return "";
    return path.slice(start, end);
  }
}
function extname(path) {
  assertPath(path);
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, preDotState = 0;
  for (var i = path.length - 1;i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    return "";
  return path.slice(startDot, end);
}
function format(pathObject) {
  if (pathObject === null || typeof pathObject !== "object")
    throw TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
  return _format("/", pathObject);
}
function parse(path) {
  assertPath(path);
  var ret = { root: "", dir: "", base: "", ext: "", name: "" };
  if (path.length === 0)
    return ret;
  var code = path.charCodeAt(0), isAbsolute2 = code === 47, start;
  if (isAbsolute2)
    ret.root = "/", start = 1;
  else
    start = 0;
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, i = path.length - 1, preDotState = 0;
  for (;i >= start; --i) {
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    if (end !== -1)
      if (startPart === 0 && isAbsolute2)
        ret.base = ret.name = path.slice(1, end);
      else
        ret.base = ret.name = path.slice(startPart, end);
  } else {
    if (startPart === 0 && isAbsolute2)
      ret.name = path.slice(1, startDot), ret.base = path.slice(1, end);
    else
      ret.name = path.slice(startPart, startDot), ret.base = path.slice(startPart, end);
    ret.ext = path.slice(startDot, end);
  }
  if (startPart > 0)
    ret.dir = path.slice(0, startPart - 1);
  else if (isAbsolute2)
    ret.dir = "/";
  return ret;
}
var sep = "/", delimiter = ":", posix;
var init_path = __esm(() => {
  posix = ((p) => (p.posix = p, p))({ resolve, normalize: normalize2, isAbsolute, join, relative, _makeLong, dirname, basename, extname, format, parse, sep, delimiter, win32: null, posix: null });
});

// markdown.ts
var exports_markdown = {};
__export(exports_markdown, {
  loadMarkdownFromDocs: () => loadMarkdownFromDocs,
  loadMarkdownFile: () => loadMarkdownFile
});
var {readFile} = (() => ({}));
function extractMetaDescription(markdown, defaultDesc = "Mithril.js Documentation") {
  const match = markdown.match(metaDescriptionRegex);
  return match ? match[1].trim() : defaultDesc;
}
function extractTitle(markdown) {
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1] : "Mithril.js";
}
async function loadMarkdownFile(filePath) {
  const markdown = await readFile(filePath, "utf-8");
  const html2 = marked.parse(markdown);
  const title = extractTitle(markdown);
  const metaDescription = extractMetaDescription(markdown);
  return {
    title,
    content: html2,
    metaDescription
  };
}
async function loadMarkdownFromDocs(docName) {
  if (typeof window !== "undefined") {
    return null;
  }
  try {
    const docsPath = join(import.meta.dir, "content", `${docName}.md`);
    return await loadMarkdownFile(docsPath);
  } catch {
    return null;
  }
}
var metaDescriptionRegex;
var init_markdown = __esm(() => {
  init_marked_esm();
  init_path();
  marked.setOptions({
    gfm: true,
    breaks: false
  });
  metaDescriptionRegex = /<!--meta-description\n([\s\S]+?)\n-->/m;
});

// nav.ts
var exports_nav = {};
__export(exports_nav, {
  getNavMethodsStructure: () => getNavMethodsStructure,
  getNavMethods: () => getNavMethods,
  getNavGuidesStructure: () => getNavGuidesStructure,
  getNavGuides: () => getNavGuides
});
var {readFile: readFile2} = (() => ({}));
async function getNavGuides() {
  if (typeof window !== "undefined")
    return "";
  try {
    const content = await readFile2(join(import.meta.dir, "content", "nav-guides.md"), "utf-8");
    return marked.parse(content);
  } catch {
    return "";
  }
}
async function getNavMethods() {
  if (typeof window !== "undefined")
    return "";
  try {
    const content = await readFile2(join(import.meta.dir, "content", "nav-methods.md"), "utf-8");
    return marked.parse(content);
  } catch {
    return "";
  }
}
function parseNavToStructure(markdown) {
  const sections = [];
  let currentSection = null;
  for (const line of markdown.split(`
`)) {
    const trimmed = line.trim();
    if (!trimmed)
      continue;
    const linkMatch = trimmed.match(linkRegex);
    const isNested = line.startsWith("\t") || line.startsWith("  ");
    if (linkMatch) {
      const [, text, href] = linkMatch;
      const external = href.startsWith("http");
      if (isNested && currentSection) {
        currentSection.links.push({ text, href, external });
      } else {
        currentSection = { title: text, links: [{ text, href, external }] };
        sections.push(currentSection);
      }
    } else if (!isNested && trimmed.startsWith("- ")) {
      const title = trimmed.slice(2).trim();
      currentSection = { title, links: [] };
      sections.push(currentSection);
    }
  }
  return sections;
}
async function getNavGuidesStructure() {
  if (typeof window !== "undefined")
    return [];
  try {
    const content = await readFile2(join(import.meta.dir, "content", "nav-guides.md"), "utf-8");
    return parseNavToStructure(content);
  } catch {
    return [];
  }
}
async function getNavMethodsStructure() {
  if (typeof window !== "undefined")
    return [];
  try {
    const content = await readFile2(join(import.meta.dir, "content", "nav-methods.md"), "utf-8");
    return parseNavToStructure(content);
  } catch {
    return [];
  }
}
var linkRegex;
var init_nav = __esm(() => {
  init_path();
  init_marked_esm();
  linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
});

// ../../util/hasOwn.ts
var hasOwn_default = {}.hasOwnProperty;

// ../../render/vnode.ts
class MithrilComponent {
  __tsx_attrs;
}
function Vnode(tag, key, attrs, children, text, dom) {
  return { tag, key: key ?? undefined, attrs: attrs ?? undefined, children: children ?? undefined, text: text ?? undefined, dom: dom ?? undefined, is: undefined, domSize: undefined, state: undefined, events: undefined, instance: undefined };
}
var normalize = function(node) {
  if (Array.isArray(node))
    return Vnode("[", undefined, undefined, normalizeChildren(node), undefined, undefined);
  if (node == null || typeof node === "boolean")
    return null;
  if (typeof node === "object")
    return node;
  return Vnode("#", undefined, undefined, String(node), undefined, undefined);
};
var normalizeChildren = function(input) {
  const children = new Array(input.length);
  let numKeyed = 0;
  for (let i = 0;i < input.length; i++) {
    children[i] = normalize(input[i]);
    if (children[i] !== null && children[i].key != null)
      numKeyed++;
  }
  if (numKeyed !== 0 && numKeyed !== input.length) {
    throw new TypeError(children.includes(null) ? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole." : "In fragments, vnodes must either all have keys or none have keys.");
  }
  return children;
};
Vnode.normalize = normalize;
Vnode.normalizeChildren = normalizeChildren;
var vnode_default = Vnode;

// ../../render/hyperscriptVnode.ts
function hyperscriptVnode(attrs, children) {
  if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
    if (children.length === 1 && Array.isArray(children[0]))
      children = children[0];
  } else {
    children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children];
    attrs = undefined;
  }
  return vnode_default("", attrs && attrs.key, attrs, children, null, null);
}

// ../../render/emptyAttrs.ts
var emptyAttrs_default = {};

// ../../render/cachedAttrsIsStaticMap.ts
var cachedAttrsIsStaticMap_default = new Map([[emptyAttrs_default, true]]);

// ../../render/trust.ts
function trust(html) {
  if (html == null)
    html = "";
  return vnode_default("<", undefined, undefined, html, undefined, undefined);
}

// ../../render/fragment.ts
function fragment(attrs, ...children) {
  const vnode = hyperscriptVnode(attrs, children);
  if (vnode.attrs == null)
    vnode.attrs = {};
  vnode.tag = "[";
  vnode.children = vnode_default.normalizeChildren(vnode.children);
  return vnode;
}

// ../../render/hyperscript.ts
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
var selectorCache = Object.create(null);
function isEmpty(object) {
  for (const key in object)
    if (hasOwn_default.call(object, key))
      return false;
  return true;
}
function isFormAttributeKey(key) {
  return key === "value" || key === "checked" || key === "selectedIndex" || key === "selected";
}
function compileSelector(selector) {
  let match;
  let tag = "div";
  const classes = [];
  let attrs = {};
  let isStatic = true;
  while ((match = selectorParser.exec(selector)) !== null) {
    const type = match[1];
    const value = match[2];
    if (type === "" && value !== "")
      tag = value;
    else if (type === "#")
      attrs.id = value;
    else if (type === ".")
      classes.push(value);
    else if (match[3][0] === "[") {
      let attrValue = match[6];
      if (attrValue)
        attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
      if (match[4] === "class")
        classes.push(attrValue);
      else {
        attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
        if (isFormAttributeKey(match[4]))
          isStatic = false;
      }
    }
  }
  if (classes.length > 0)
    attrs.className = classes.join(" ");
  if (isEmpty(attrs))
    attrs = emptyAttrs_default;
  else
    cachedAttrsIsStaticMap_default.set(attrs, isStatic);
  return selectorCache[selector] = { tag, attrs, is: attrs.is };
}
function execSelector(state, vnode) {
  vnode.tag = state.tag;
  let attrs = vnode.attrs;
  if (attrs == null) {
    vnode.attrs = state.attrs;
    vnode.is = state.is;
    return vnode;
  }
  if (hasOwn_default.call(attrs, "class")) {
    if (attrs.class != null)
      attrs.className = attrs.class;
    attrs.class = null;
  }
  if (state.attrs !== emptyAttrs_default) {
    const className = attrs.className;
    attrs = Object.assign({}, state.attrs, attrs);
    if (state.attrs.className != null)
      attrs.className = className != null ? String(state.attrs.className) + " " + String(className) : state.attrs.className;
  }
  if (state.tag === "input" && hasOwn_default.call(attrs, "type")) {
    attrs = Object.assign({ type: attrs.type }, attrs);
  }
  vnode.is = attrs.is;
  vnode.attrs = attrs;
  return vnode;
}
function hyperscript(selector, attrs, ...children) {
  if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
    throw Error("The selector must be either a string or a component.");
  }
  const vnode = hyperscriptVnode(attrs, children);
  if (typeof selector === "string") {
    vnode.children = vnode_default.normalizeChildren(vnode.children);
    if (selector !== "[")
      return execSelector(selectorCache[selector] || compileSelector(selector), vnode);
  }
  if (vnode.attrs == null)
    vnode.attrs = {};
  vnode.tag = selector;
  return vnode;
}
hyperscript.trust = trust;
hyperscript.fragment = fragment;
hyperscript.Fragment = "[";
var hyperscript_default = hyperscript;

// ../../ssrContext.ts
var ssrStorage;
try {
  const { AsyncLocalStorage } = (()=>{throw new Error("Cannot require module "+"node:async_hooks");})();
  ssrStorage = new AsyncLocalStorage;
} catch {
  ssrStorage = {
    getStore: () => {
      return;
    },
    run: (_context, fn) => fn()
  };
}
function getSSRContext() {
  return ssrStorage.getStore();
}
function runWithContext(context, fn) {
  return ssrStorage.run(context, fn);
}

// ../../signal.ts
var currentEffect = null;
var componentSignalMap = new WeakMap;
var signalComponentMap = new WeakMap;
var currentComponent = null;
function setCurrentComponent(component) {
  currentComponent = component;
}
function clearCurrentComponent() {
  currentComponent = null;
}
function trackComponentSignal(component, signal) {
  if (!componentSignalMap.has(component)) {
    componentSignalMap.set(component, new Set);
  }
  componentSignalMap.get(component).add(signal);
  if (!signalComponentMap.has(signal)) {
    signalComponentMap.set(signal, new Set);
  }
  signalComponentMap.get(signal).add(component);
}
function getSignalComponents(signal) {
  return signalComponentMap.get(signal);
}
function clearComponentDependencies(component) {
  const signals = componentSignalMap.get(component);
  if (signals) {
    signals.forEach((signal) => {
      const components = signalComponentMap.get(signal);
      if (components) {
        components.delete(component);
        if (components.size === 0) {
          signalComponentMap.delete(signal);
        }
      }
    });
    componentSignalMap.delete(component);
  }
}
function setSignalRedrawCallback(callback) {
  signal.__redrawCallback = callback;
}

class Signal {
  _value;
  _subscribers = new Set;
  constructor(initial) {
    this._value = initial;
  }
  get value() {
    if (!this._subscribers) {
      this._subscribers = new Set;
    }
    if (currentEffect) {
      this._subscribers.add(currentEffect);
    }
    if (currentComponent) {
      trackComponentSignal(currentComponent, this);
    }
    return this._value;
  }
  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      if (!this._subscribers) {
        this._subscribers = new Set;
      }
      const context = getSSRContext();
      this._subscribers.forEach((fn) => {
        try {
          if (context) {
            runWithContext(context, () => {
              fn();
            });
          } else {
            fn();
          }
        } catch (e) {
          console.error("Error in signal subscriber:", e);
        }
      });
      if (signal.__redrawCallback) {
        signal.__redrawCallback(this);
      }
    }
  }
  subscribe(callback) {
    if (!this._subscribers) {
      this._subscribers = new Set;
    }
    this._subscribers.add(callback);
    return () => {
      if (this._subscribers) {
        this._subscribers.delete(callback);
      }
    };
  }
  watch(callback) {
    let oldValue = this._value;
    const unsubscribe = this.subscribe(() => {
      const newValue = this._value;
      callback(newValue, oldValue);
      oldValue = newValue;
    });
    return unsubscribe;
  }
  peek() {
    return this._value;
  }
}

class ComputedSignal extends Signal {
  _compute;
  _dependencies = new Set;
  _isDirty = true;
  _cachedValue;
  constructor(compute) {
    super(null);
    this._compute = compute;
  }
  get value() {
    if (currentEffect) {
      if (!this._subscribers) {
        this._subscribers = new Set;
      }
      this._subscribers.add(currentEffect);
    }
    if (this._isDirty) {
      this._dependencies.forEach((dep) => {
        dep.subscribe(() => this._markDirty())?.();
      });
      this._dependencies.clear();
      const previousEffect = currentEffect;
      currentEffect = () => {
        this._markDirty();
      };
      try {
        this._cachedValue = this._compute();
      } finally {
        currentEffect = previousEffect;
      }
      this._isDirty = false;
    }
    return this._cachedValue;
  }
  _markDirty() {
    if (!this._isDirty) {
      this._isDirty = true;
      if (!this._subscribers) {
        this._subscribers = new Set;
      }
      const context = getSSRContext();
      this._subscribers.forEach((fn) => {
        try {
          if (context) {
            runWithContext(context, () => {
              fn();
            });
          } else {
            fn();
          }
        } catch (e) {
          console.error("Error in computed signal subscriber:", e);
        }
      });
    }
  }
  markDirty() {
    this._markDirty();
  }
  set value(_newValue) {
    throw new Error("Computed signals are read-only");
  }
}
function signal(initial) {
  return new Signal(initial);
}
function computed(compute) {
  return new ComputedSignal(compute);
}

// ../../api/mount-redraw.ts
function mountRedrawFactory(render, schedule, console2) {
  const subscriptions = [];
  const componentToElement = new WeakMap;
  let pending = false;
  let offset = -1;
  function sync() {
    for (offset = 0;offset < subscriptions.length; offset += 2) {
      try {
        render(subscriptions[offset], vnode_default(subscriptions[offset + 1], null, null, null, null, null), redraw);
      } catch (e) {
        console2.error(e);
      }
    }
    offset = -1;
  }
  function redrawComponent(componentOrState) {
    let component = componentOrState;
    const stateToComponentMap = globalThis.__mithrilStateToComponent;
    if (stateToComponentMap && stateToComponentMap.has(componentOrState)) {
      component = stateToComponentMap.get(componentOrState);
    }
    const element = componentToElement.get(component);
    if (element) {
      try {
        render(element, vnode_default(component, null, null, null, null, null), redraw);
        return;
      } catch (e) {
        console2.error(e);
      }
    }
    const stateToDomMap = globalThis.__mithrilStateToDom;
    if (stateToDomMap && stateToDomMap.has(componentOrState)) {
      if (!pending) {
        pending = true;
        schedule(function() {
          pending = false;
          sync();
        });
        return;
      }
    }
    const index = subscriptions.indexOf(component);
    if (index >= 0 && index % 2 === 1) {
      const rootElement = subscriptions[index - 1];
      try {
        render(rootElement, vnode_default(component, null, null, null, null, null), redraw);
        return;
      } catch (e) {
        console2.error(e);
      }
    }
    if (!pending) {
      pending = true;
      schedule(function() {
        pending = false;
        sync();
      });
    }
  }
  function redraw(component) {
    if (component !== undefined) {
      redrawComponent(component);
      return;
    }
    if (!pending) {
      pending = true;
      schedule(function() {
        pending = false;
        sync();
      });
    }
  }
  redraw.sync = sync;
  redraw.signal = function(signal2) {
    const components = getSignalComponents(signal2);
    if (components) {
      components.forEach((component) => {
        redrawComponent(component);
      });
    }
  };
  function mount(root, component) {
    if (component != null && component.view == null && typeof component !== "function") {
      throw new TypeError("m.mount expects a component, not a vnode.");
    }
    const index = subscriptions.indexOf(root);
    if (index >= 0) {
      const oldComponent = subscriptions[index + 1];
      if (oldComponent) {
        componentToElement.delete(oldComponent);
      }
      subscriptions.splice(index, 2);
      if (index <= offset)
        offset -= 2;
      render(root, []);
    }
    if (component != null) {
      subscriptions.push(root, component);
      componentToElement.set(component, root);
      render(root, vnode_default(component, null, null, null, null, null), redraw);
    }
  }
  return { mount, redraw };
}

// ../../util/decodeURIComponentSafe.ts
var validUtf8Encodings = /%(?:[0-7]|(?!c[01]|e0%[89]|ed%[ab]|f0%8|f4%[9ab])(?:c|d|(?:e|f[0-4]%[89ab])[\da-f]%[89ab])[\da-f]%[89ab])[\da-f]/gi;
function decodeURIComponentSafe(str) {
  return String(str).replace(validUtf8Encodings, decodeURIComponent);
}

// ../../querystring/build.ts
function buildQueryString(object) {
  if (Object.prototype.toString.call(object) !== "[object Object]")
    return "";
  const args = [];
  function destructure(key, value) {
    if (Array.isArray(value)) {
      for (let i = 0;i < value.length; i++) {
        destructure(key + "[" + i + "]", value[i]);
      }
    } else if (Object.prototype.toString.call(value) === "[object Object]") {
      for (const i in value) {
        destructure(key + "[" + i + "]", value[i]);
      }
    } else
      args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
  }
  for (const key in object) {
    destructure(key, object[key]);
  }
  return args.join("&");
}

// ../../pathname/build.ts
function buildPathname(template, params) {
  if (/:([^\/\.-]+)(\.{3})?:/.test(template)) {
    throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.");
  }
  if (params == null)
    return template;
  const queryIndex = template.indexOf("?");
  const hashIndex = template.indexOf("#");
  const queryEnd = hashIndex < 0 ? template.length : hashIndex;
  const pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  const path = template.slice(0, pathEnd);
  const query = {};
  Object.assign(query, params);
  const resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
    delete query[key];
    if (params[key] == null)
      return m;
    return variadic ? params[key] : encodeURIComponent(String(params[key]));
  });
  const newQueryIndex = resolved.indexOf("?");
  const newHashIndex = resolved.indexOf("#");
  const newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
  const newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
  let result = resolved.slice(0, newPathEnd);
  if (queryIndex >= 0)
    result += template.slice(queryIndex, queryEnd);
  if (newQueryIndex >= 0)
    result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
  const querystring = buildQueryString(query);
  if (querystring)
    result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
  if (hashIndex >= 0)
    result += template.slice(hashIndex);
  if (newHashIndex >= 0)
    result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
  return result;
}

// ../../querystring/parse.ts
function parseQueryString(string) {
  if (string === "" || string == null)
    return {};
  if (string.charAt(0) === "?")
    string = string.slice(1);
  const entries = string.split("&");
  const counters = {};
  const data = {};
  for (let i = 0;i < entries.length; i++) {
    const entry = entries[i].split("=");
    const key = decodeURIComponentSafe(entry[0]);
    let value = entry.length === 2 ? decodeURIComponentSafe(entry[1]) : "";
    if (value === "true")
      value = true;
    else if (value === "false")
      value = false;
    const levels = key.split(/\]\[?|\[/);
    let cursor = data;
    if (key.indexOf("[") > -1)
      levels.pop();
    for (let j = 0;j < levels.length; j++) {
      const level = levels[j];
      const nextLevel = levels[j + 1];
      const isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
      let finalLevel;
      if (level === "") {
        const key2 = levels.slice(0, j).join();
        if (counters[key2] == null) {
          counters[key2] = Array.isArray(cursor) ? cursor.length : 0;
        }
        finalLevel = counters[key2]++;
      } else if (level === "__proto__")
        break;
      else {
        finalLevel = level;
      }
      if (j === levels.length - 1)
        cursor[finalLevel] = value;
      else {
        const desc = Object.getOwnPropertyDescriptor(cursor, finalLevel);
        let descValue = desc != null ? desc.value : undefined;
        if (descValue == null)
          cursor[finalLevel] = descValue = isNumber ? [] : {};
        cursor = descValue;
      }
    }
  }
  return data;
}

// ../../pathname/parse.ts
function parsePathname(url) {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const queryEnd = hashIndex < 0 ? url.length : hashIndex;
  const pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  let path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");
  if (!path)
    path = "/";
  else {
    if (path[0] !== "/")
      path = "/" + path;
  }
  return {
    path,
    params: queryIndex < 0 ? {} : parseQueryString(url.slice(queryIndex + 1, queryEnd))
  };
}

// ../../pathname/compileTemplate.ts
function compileTemplate(template) {
  const templateData = parsePathname(template);
  const templateKeys = Object.keys(templateData.params);
  const keys = [];
  const regexp = new RegExp("^" + templateData.path.replace(/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g, function(m, key, extra) {
    if (key == null)
      return "\\" + m;
    keys.push({ k: key, r: extra === "..." });
    if (extra === "...")
      return "(.*)";
    if (extra === ".")
      return "([^/]+)\\.";
    return "([^/]+)" + (extra || "");
  }) + "\\/?$");
  return function(data) {
    for (let i = 0;i < templateKeys.length; i++) {
      if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]])
        return false;
    }
    if (!keys.length)
      return regexp.test(data.path);
    const values = regexp.exec(data.path);
    if (values == null)
      return false;
    for (let i = 0;i < keys.length; i++) {
      data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
    }
    return true;
  };
}

// ../../util/censor.ts
var magic = /^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$/;
function censor(attrs, extras) {
  const result = {};
  if (extras != null) {
    for (const key in attrs) {
      if (hasOwn_default.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
        result[key] = attrs[key];
      }
    }
  } else {
    for (const key in attrs) {
      if (hasOwn_default.call(attrs, key) && !magic.test(key)) {
        result[key] = attrs[key];
      }
    }
  }
  return result;
}

// ../../util/uri.ts
function getCurrentUrl() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.href;
  }
  if (typeof globalThis !== "undefined" && globalThis.__SSR_URL__) {
    return globalThis.__SSR_URL__;
  }
  return "";
}
function parseUrl(url) {
  try {
    return new URL(url);
  } catch {
    return new URL(url, "http://localhost");
  }
}
function getPathname() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.pathname || "/";
  }
  const url = getCurrentUrl();
  if (!url)
    return "/";
  const parsed = parseUrl(url);
  return parsed.pathname || "/";
}
function getSearch() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.search || "";
  }
  const url = getCurrentUrl();
  if (!url)
    return "";
  const parsed = parseUrl(url);
  return parsed.search || "";
}
function getHash() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.hash || "";
  }
  const url = getCurrentUrl();
  if (!url)
    return "";
  const parsed = parseUrl(url);
  return parsed.hash || "";
}

// ../../server/logger.ts
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
var colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  bgBlack: "\x1B[40m",
  bgRed: "\x1B[41m",
  bgGreen: "\x1B[42m",
  bgYellow: "\x1B[43m",
  bgBlue: "\x1B[44m",
  bgMagenta: "\x1B[45m",
  bgCyan: "\x1B[46m",
  bgWhite: "\x1B[47m"
};
var enableColors = !isBrowser && typeof process !== "undefined" && process.env && process.env.NO_COLOR !== "1" && process.env.NO_COLOR !== "true";
function colorize(text, color) {
  return enableColors ? `${color}${text}${colors.reset}` : text;
}
function getTimestamp() {
  const now = new Date;
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${ms}`;
}
function formatLevel(level) {
  const levelMap = {
    info: colorize("INFO", colors.bright + colors.cyan),
    debug: colorize("DEBUG", colors.bright + colors.blue),
    warn: colorize("WARN", colors.bright + colors.yellow),
    error: colorize("ERROR", colors.bright + colors.red)
  };
  return levelMap[level];
}

class Logger {
  prefix = "[SSR]";
  setPrefix(prefix) {
    this.prefix = prefix;
  }
  formatMessage(level, message, context) {
    const timestamp = colorize(getTimestamp(), colors.dim + colors.white);
    const levelStr = formatLevel(level);
    const prefixStr = colorize(this.prefix, this.prefix === "[SSR]" ? colors.bright + colors.magenta : colors.bright + colors.cyan);
    let displayMessage = message;
    if (context?.module) {
      displayMessage = `[${context.module}] ${message}`;
    }
    let contextStr = "";
    if (context) {
      const contextParts = [];
      if (context.method) {
        contextParts.push(colorize(context.method, colors.cyan));
      }
      if (context.pathname) {
        contextParts.push(colorize(context.pathname, colors.green));
      }
      if (context.route) {
        contextParts.push(colorize(`route:${context.route}`, colors.blue));
      }
      if (context.sessionId) {
        contextParts.push(colorize(`session:${context.sessionId.slice(0, 8)}...`, colors.dim + colors.white));
      }
      for (const [key, value] of Object.entries(context)) {
        if (!["method", "pathname", "route", "sessionId", "module"].includes(key)) {
          contextParts.push(colorize(`${key}:${value}`, colors.dim + colors.white));
        }
      }
      if (contextParts.length > 0) {
        contextStr = " " + contextParts.join(" ");
      }
    }
    return `${timestamp} ${prefixStr} ${levelStr}${contextStr} ${displayMessage}`;
  }
  formatContextForBrowser(context) {
    if (!context)
      return [];
    const parts = [];
    if (context.method)
      parts.push(`Method: ${context.method}`);
    if (context.pathname)
      parts.push(`Path: ${context.pathname}`);
    if (context.route)
      parts.push(`Route: ${context.route}`);
    if (context.sessionId)
      parts.push(`Session: ${context.sessionId.slice(0, 8)}...`);
    for (const [key, value] of Object.entries(context)) {
      if (!["method", "pathname", "route", "sessionId", "module"].includes(key)) {
        parts.push(`${key}: ${value}`);
      }
    }
    return parts;
  }
  getDisplayPrefix(context) {
    return this.prefix;
  }
  getDisplayMessage(message, context) {
    if (context?.module) {
      return `[${context.module}] ${message}`;
    }
    return message;
  }
  info(message, context) {
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const displayMessage = this.getDisplayMessage(message, context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #22d3ee; font-weight: bold";
      if (contextParts.length > 0) {
        console.group(`%c${displayPrefix}%c INFO%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        contextParts.forEach((part) => console.log(`  ${part}`));
        console.groupEnd();
      } else {
        console.log(`%c${displayPrefix}%c INFO%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.log(this.formatMessage("info", message, context));
    }
  }
  debug(message, context) {
    const shouldLog = globalThis.__SSR_MODE__ || isBrowser && typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
    if (!shouldLog)
      return;
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const displayMessage = this.getDisplayMessage(message, context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #4ade80; font-weight: bold";
      if (contextParts.length > 0) {
        console.group(`%c${displayPrefix}%c DEBUG%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        contextParts.forEach((part) => console.log(`  ${part}`));
        console.groupEnd();
      } else {
        console.log(`%c${displayPrefix}%c DEBUG%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.log(this.formatMessage("debug", message, context));
    }
  }
  warn(message, context) {
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const displayMessage = this.getDisplayMessage(message, context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #fbbf24; font-weight: bold";
      if (contextParts.length > 0) {
        console.group(`%c${displayPrefix}%c WARN%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        contextParts.forEach((part) => console.warn(`  ${part}`));
        console.groupEnd();
      } else {
        console.warn(`%c${displayPrefix}%c WARN%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.warn(this.formatMessage("warn", message, context));
    }
  }
  error(message, error, context) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const baseMessage = error ? `${message}: ${errorMessage}` : message;
    const displayMessage = this.getDisplayMessage(baseMessage, context);
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #ef4444; font-weight: bold";
      if (contextParts.length > 0 || error) {
        console.group(`%c${displayPrefix}%c ERROR%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        if (contextParts.length > 0) {
          contextParts.forEach((part) => console.error(`  ${part}`));
        }
        if (error instanceof Error && error.stack) {
          console.error("Stack trace:", error.stack);
        }
        console.groupEnd();
      } else {
        console.error(`%c${displayPrefix}%c ERROR%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.error(this.formatMessage("error", baseMessage, context));
      if (error instanceof Error && error.stack) {
        const stackTrace = colorize(error.stack, colors.dim + colors.red);
        console.error(stackTrace);
      }
    }
  }
}
var logger = new Logger;

// ../../server/ssrLogger.ts
var logger2 = new Logger;
logger2.setPrefix("[SSR]");

// ../../api/router.ts
function router($window, mountRedraw) {
  let p = Promise.resolve();
  let scheduled = false;
  let ready = false;
  let hasBeenResolved = false;
  let dom;
  let compiled;
  let fallbackRoute;
  let currentResolver = null;
  let component = "div";
  let attrs = {};
  let currentPath;
  let lastUpdate = null;
  const RouterRoot = {
    onremove: function() {
      ready = hasBeenResolved = false;
      $window.removeEventListener("popstate", fireAsync, false);
    },
    view: function() {
      const routeAttrs = { ...attrs, routePath: currentPath || attrs.routePath };
      const vnode = vnode_default(component, attrs.key, routeAttrs, null, null, null);
      if (currentResolver)
        return currentResolver.render(vnode);
      return [vnode];
    }
  };
  const SKIP = route.SKIP = {};
  const REDIRECT = route.REDIRECT = Symbol("REDIRECT");
  route.redirect = function(path) {
    return { [REDIRECT]: path };
  };
  function isRedirect(value) {
    if (value == null || typeof value !== "object")
      return false;
    if (REDIRECT in value)
      return true;
    const symbolKeys = Object.getOwnPropertySymbols(value);
    if (symbolKeys.length > 0) {
      for (const sym of symbolKeys) {
        const desc = sym.description || "";
        if (desc.includes("REDIRECT") || desc === "REDIRECT") {
          const path = value[sym];
          if (typeof path === "string" && path.startsWith("/")) {
            return true;
          }
        }
      }
    }
    return false;
  }
  function getRedirectPath(redirectObj) {
    if (REDIRECT in redirectObj) {
      return redirectObj[REDIRECT];
    }
    const symbolKeys = Object.getOwnPropertySymbols(redirectObj);
    for (const sym of symbolKeys) {
      const path = redirectObj[sym];
      if (typeof path === "string" && path.startsWith("/")) {
        return path;
      }
    }
    throw new Error("Invalid redirect object: no redirect path found");
  }
  function resolveRoute() {
    scheduled = false;
    const hash = getHash();
    let prefix = hash;
    if (route.prefix[0] !== "#") {
      const search = getSearch();
      prefix = search + prefix;
      if (route.prefix[0] !== "?") {
        const pathname = getPathname();
        prefix = pathname + prefix;
        if (prefix[0] !== "/")
          prefix = "/" + prefix;
      }
    }
    const path = decodeURIComponentSafe(prefix).slice(route.prefix.length);
    const data = parsePathname(path);
    Object.assign(data.params, $window.history.state || {});
    function reject(e) {
      console.error(e);
      route.set(fallbackRoute, null, { replace: true });
    }
    loop(0);
    function loop(i) {
      if (!compiled)
        return;
      for (;i < compiled.length; i++) {
        if (compiled[i].check(data)) {
          let payload = compiled[i].component;
          const matchedRoute = compiled[i].route;
          const localComp = payload;
          const resolverWithRender = payload && typeof payload === "object" && payload.onmatch && payload.render && !payload.view && typeof payload !== "function" ? payload : null;
          const update = lastUpdate = function(comp) {
            if (update !== lastUpdate)
              return;
            if (comp === SKIP)
              return loop(i + 1);
            if (isRedirect(comp)) {
              const redirectPath = comp[REDIRECT];
              route.set(redirectPath, null);
              return;
            }
            if (resolverWithRender) {
              currentResolver = resolverWithRender;
              component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div";
            } else if (comp && typeof comp === "object" && comp.render && !comp.view && typeof comp !== "function") {
              currentResolver = comp;
              component = "div";
            } else {
              currentResolver = null;
              component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div";
            }
            attrs = data.params;
            currentPath = path;
            lastUpdate = null;
            if (hasBeenResolved)
              mountRedraw.redraw();
            else {
              hasBeenResolved = true;
              mountRedraw.mount(dom, RouterRoot);
            }
          };
          if (payload.view || typeof payload === "function") {
            payload = {};
            update(localComp);
          } else if (payload.onmatch) {
            p.then(function() {
              return payload.onmatch(data.params, path, matchedRoute);
            }).then(update, path === fallbackRoute ? null : reject);
          } else if (payload.render) {
            update(payload);
          } else
            update("div");
          return;
        }
      }
      if (path === fallbackRoute) {
        throw new Error("Could not resolve default route " + fallbackRoute + ".");
      }
      route.set(fallbackRoute, null, { replace: true });
    }
  }
  function fireAsync() {
    if (!scheduled) {
      scheduled = true;
      setTimeout(resolveRoute);
    }
  }
  function route(root, defaultRoute, routes) {
    if (!root)
      throw new TypeError("DOM element being rendered to does not exist.");
    compiled = Object.keys(routes).map(function(routePath) {
      if (routePath[0] !== "/")
        throw new SyntaxError("Routes must start with a '/'.");
      if (/:([^\/\.-]+)(\.{3})?:/.test(routePath)) {
        throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");
      }
      return {
        route: routePath,
        component: routes[routePath],
        check: compileTemplate(routePath)
      };
    });
    fallbackRoute = defaultRoute;
    if (defaultRoute != null) {
      const defaultData = parsePathname(defaultRoute);
      if (!compiled.some(function(i) {
        return i.check(defaultData);
      })) {
        throw new ReferenceError("Default route doesn't match any known routes.");
      }
    }
    dom = root;
    $window.addEventListener("popstate", fireAsync, false);
    ready = true;
    resolveRoute();
  }
  route.set = function(path, data, options) {
    if (lastUpdate != null) {
      options = options || {};
      options.replace = true;
    }
    lastUpdate = null;
    path = buildPathname(path, data || {});
    if (ready) {
      fireAsync();
      const state = options ? options.state : null;
      const title = options ? options.title : null;
      if ($window?.history) {
        if (options && options.replace)
          $window.history.replaceState(state, title, route.prefix + path);
        else
          $window.history.pushState(state, title, route.prefix + path);
      }
    } else {
      if ($window?.location) {
        $window.location.href = route.prefix + path;
      }
    }
  };
  route.get = function() {
    if (currentPath === undefined) {
      return getPathname();
    }
    return currentPath ?? "";
  };
  route.prefix = "#!";
  route.link = function(vnode) {
    return route.Link.view(vnode);
  };
  route.Link = {
    view: function(vnode) {
      const child = hyperscript_default(vnode.attrs?.selector || "a", censor(vnode.attrs || {}, ["options", "params", "selector", "onclick"]), vnode.children);
      let options;
      let onclick;
      let href;
      if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
        child.attrs.href = null;
        child.attrs["aria-disabled"] = "true";
      } else {
        options = vnode.attrs?.options;
        onclick = vnode.attrs?.onclick;
        href = buildPathname(child.attrs.href || "", vnode.attrs?.params || {});
        const linkPrefix = $window == null ? "" : route.prefix;
        child.attrs.href = linkPrefix + href;
        child.attrs.onclick = function(e) {
          let result;
          if (typeof onclick === "function") {
            result = onclick.call(e.currentTarget, e);
          } else if (onclick == null || typeof onclick !== "object") {} else if (typeof onclick.handleEvent === "function") {
            onclick.handleEvent(e);
          }
          if (result !== false && !e.defaultPrevented && (e.button === 0 || e.which === 0 || e.which === 1) && (!e.currentTarget.target || e.currentTarget.target === "_self") && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
            if (typeof e.preventDefault === "function") {
              e.preventDefault();
            } else if (e.originalEvent && typeof e.originalEvent.preventDefault === "function") {
              e.originalEvent.preventDefault();
            }
            e.redraw = false;
            route.set(href, null, options);
          }
        };
      }
      return child;
    }
  };
  route.param = function(key) {
    return attrs && key != null ? attrs[key] : attrs;
  };
  route.params = attrs;
  route.resolve = async function(pathname, routes, renderToString, prefix = "", redirectDepth = 0) {
    const MAX_REDIRECT_DEPTH = 5;
    if (redirectDepth > MAX_REDIRECT_DEPTH) {
      throw new Error(`Maximum redirect depth (${MAX_REDIRECT_DEPTH}) exceeded. Possible redirect loop.`);
    }
    const savedPrefix = route.prefix;
    route.prefix = prefix;
    const savedCurrentPath = currentPath;
    currentPath = pathname || "/";
    try {
      const compiled2 = Object.keys(routes).map(function(routePath) {
        if (routePath[0] !== "/")
          throw new SyntaxError("Routes must start with a '/'.");
        if (/:([^\/\.-]+)(\.{3})?:/.test(routePath)) {
          throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");
        }
        const routeValue = routes[routePath];
        const component2 = routeValue && typeof routeValue === "object" && "component" in routeValue ? routeValue.component : routeValue;
        return {
          route: routePath,
          component: component2,
          check: compileTemplate(routePath)
        };
      });
      const path = decodeURIComponentSafe(pathname || "/").slice(prefix.length);
      const data = parsePathname(path);
      attrs = data.params;
      for (const { route: matchedRoute, component: component2, check } of compiled2) {
        if (check(data)) {
          let payload = component2;
          if (payload && typeof payload === "object" && (("onmatch" in payload) || ("render" in payload))) {
            const resolver = payload;
            if (resolver.onmatch) {
              const result = resolver.onmatch(data.params, pathname, matchedRoute);
              if (result instanceof Promise) {
                payload = await result;
              } else if (result !== undefined) {
                payload = result;
              }
            }
            if (isRedirect(payload)) {
              const redirectPath = getRedirectPath(payload);
              logger2.info(`Redirecting to ${redirectPath}`, {
                pathname,
                route: matchedRoute,
                redirectPath
              });
              const originalSSRUrl = globalThis.__SSR_URL__;
              try {
                if (originalSSRUrl && typeof originalSSRUrl === "string") {
                  try {
                    const originalUrl = new URL(originalSSRUrl);
                    const redirectUrl = new URL(redirectPath, originalUrl.origin);
                    globalThis.__SSR_URL__ = redirectUrl.href;
                  } catch {
                    globalThis.__SSR_URL__ = redirectPath;
                  }
                } else {
                  globalThis.__SSR_URL__ = redirectPath;
                }
                const redirectResult = await route.resolve(redirectPath, routes, renderToString, prefix, redirectDepth + 1);
                const redirectHtml = typeof redirectResult === "string" ? redirectResult : redirectResult.html;
                if (!redirectHtml || redirectHtml.length === 0) {
                  logger2.warn("Empty redirect result", {
                    pathname,
                    redirectPath,
                    route: matchedRoute
                  });
                } else {
                  logger2.debug("Redirect resolved", {
                    pathname,
                    redirectPath,
                    htmlSize: redirectHtml.length
                  });
                }
                return redirectResult;
              } finally {
                globalThis.__SSR_URL__ = originalSSRUrl;
              }
            }
            if (resolver.render) {
              const isComponentType2 = payload != null && payload !== resolver && (typeof payload === "function" || typeof payload === "object" && ("view" in payload) && typeof payload.view === "function");
              if (isComponentType2) {
                try {
                  const componentVnode = hyperscript_default(payload, data.params);
                  const renderedVnode = resolver.render(componentVnode);
                  const result = await renderToString(renderedVnode);
                  const html = typeof result === "string" ? result : result.html;
                  if (html) {
                    logger2.info(`Rendered route component`, {
                      pathname,
                      route: matchedRoute,
                      htmlSize: html.length
                    });
                  }
                  return result;
                } catch (error) {
                  logger2.error("Route render failed", error, {
                    pathname,
                    route: matchedRoute
                  });
                  throw error;
                }
              }
              if (!resolver.onmatch || payload === resolver) {
                try {
                  logger2.debug("Calling render-only resolver", {
                    pathname,
                    route: matchedRoute
                  });
                  const resolverVnode = vnode_default(resolver, pathname, {
                    ...data.params,
                    routePath: pathname
                  }, null, null, null);
                  const renderedVnode = resolver.render(resolverVnode);
                  const result = await renderToString(renderedVnode);
                  const html = typeof result === "string" ? result : result.html;
                  if (html) {
                    logger2.info(`Rendered route with render-only resolver`, {
                      pathname,
                      route: matchedRoute,
                      htmlSize: html.length
                    });
                  }
                  return result;
                } catch (error) {
                  logger2.error("Route render-only resolver failed", error, {
                    pathname,
                    route: matchedRoute
                  });
                  throw error;
                }
              }
            }
          }
          const isComponentType = payload != null && (typeof payload === "function" || typeof payload === "object" && ("view" in payload) && typeof payload.view === "function");
          if (isComponentType) {
            const vnode2 = hyperscript_default(payload, data.params);
            const result = await renderToString(vnode2);
            return typeof result === "string" ? result : result;
          }
          const vnode = hyperscript_default("div", data.params);
          return await renderToString(vnode);
        }
      }
      throw new Error(`No route found for ${pathname}`);
    } finally {
      route.prefix = savedPrefix;
      currentPath = savedCurrentPath;
    }
  };
  return route;
}

// ../../util/ssr.ts
var HYDRATION_DEBUG = typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
var hydrationErrorCount = 0;
var MAX_HYDRATION_ERRORS = 10;
function resetHydrationErrorCount() {
  hydrationErrorCount = 0;
}
function getComponentName(vnode) {
  if (!vnode)
    return "Unknown";
  if (typeof vnode.tag === "string")
    return vnode.tag;
  if (vnode.tag?.name)
    return vnode.tag.name;
  if (vnode.tag?.displayName)
    return vnode.tag.displayName;
  if (vnode.state?.constructor?.name)
    return vnode.state.constructor.name;
  return "Unknown";
}
function formatDOMElement(el) {
  const tagName = el.tagName.toLowerCase();
  let openTag = `<${tagName}`;
  if (el.id) {
    openTag += ` id="${el.id}"`;
  }
  if (el.className && typeof el.className === "string") {
    const classes = el.className.split(" ").filter((c) => c).slice(0, 3).join(" ");
    if (classes) {
      openTag += ` className="${classes}${el.className.split(" ").length > 3 ? "..." : ""}"`;
    }
  }
  openTag += ">";
  return { tagName, openTag, closeTag: `</${tagName}>` };
}
function formatVDOMTree(vnode, maxDepth = 6, currentDepth = 0, showComponentInstance = true) {
  if (!vnode || currentDepth >= maxDepth)
    return "";
  const indent = "  ".repeat(currentDepth);
  if (vnode.tag === "#") {
    const text = String(vnode.children || vnode.text || "").substring(0, 50);
    return `${indent}"${text}${String(vnode.children || vnode.text || "").length > 50 ? "..." : ""}"`;
  }
  if (vnode.tag === "[") {
    if (!vnode.children || !Array.isArray(vnode.children) || vnode.children.length === 0) {
      return `${indent}[fragment]`;
    }
    const validChildren = vnode.children.filter((c) => c != null).slice(0, 8);
    let result2 = `${indent}[fragment]
`;
    for (const child of validChildren) {
      result2 += formatVDOMTree(child, maxDepth, currentDepth + 1, showComponentInstance) + `
`;
    }
    if (vnode.children.filter((c) => c != null).length > 8) {
      result2 += `${indent}  ... (${vnode.children.filter((c) => c != null).length - 8} more)
`;
    }
    return result2.trimEnd();
  }
  const isComponent = typeof vnode.tag !== "string";
  const tagName = isComponent ? getComponentName(vnode) : vnode.tag;
  let result = `${indent}<${tagName}`;
  if (vnode.attrs?.key) {
    result += ` key="${vnode.attrs.key}"`;
  }
  if (vnode.attrs) {
    const importantAttrs = ["id", "class", "className"];
    for (const attr of importantAttrs) {
      if (vnode.attrs[attr]) {
        const value = typeof vnode.attrs[attr] === "string" ? vnode.attrs[attr] : String(vnode.attrs[attr]);
        result += ` ${attr}="${value.substring(0, 30)}${value.length > 30 ? "..." : ""}"`;
        break;
      }
    }
  }
  result += ">";
  if (isComponent && showComponentInstance && vnode.instance && currentDepth < maxDepth - 1) {
    const instanceTree = formatVDOMTree(vnode.instance, maxDepth, currentDepth + 1, showComponentInstance);
    if (instanceTree) {
      result += `
` + instanceTree;
    }
  }
  if (vnode.children && Array.isArray(vnode.children) && currentDepth < maxDepth - 1) {
    const validChildren = vnode.children.filter((c) => c != null).slice(0, 10);
    if (validChildren.length > 0) {
      result += `
`;
      for (const child of validChildren) {
        if (typeof child === "string" || typeof child === "number") {
          const text = String(child).substring(0, 50);
          result += `${indent}  "${text}${String(child).length > 50 ? "..." : ""}"
`;
        } else {
          const childTree = formatVDOMTree(child, maxDepth, currentDepth + 1, showComponentInstance);
          if (childTree) {
            result += childTree + `
`;
          }
        }
      }
      if (vnode.children.filter((c) => c != null).length > 10) {
        result += `${indent}  ... (${vnode.children.filter((c) => c != null).length - 10} more children)
`;
      }
    }
  } else if (vnode.text != null) {
    const text = String(vnode.text).substring(0, 50);
    result += ` "${text}${String(vnode.text).length > 50 ? "..." : ""}"`;
  }
  result += `${indent}</${tagName}>`;
  return result;
}
function formatCombinedStructure(parent, vnode, maxParents = 4) {
  if (!parent && !vnode)
    return "";
  const domElements = [];
  let current = parent;
  let depth = 0;
  while (current && depth < maxParents) {
    if (current.nodeType === 1) {
      const el = current;
      if (el.tagName !== "HTML" && el.tagName !== "BODY") {
        domElements.unshift(formatDOMElement(el));
      }
    }
    current = current.parentElement || current.parentNode;
    depth++;
  }
  const lines = [];
  domElements.forEach((el, i) => {
    lines.push("  ".repeat(i) + el.openTag);
  });
  if (vnode) {
    const vdomIndent = domElements.length;
    const vdomTree = formatVDOMTree(vnode, 4, 0, true);
    if (vdomTree) {
      const vdomLines = vdomTree.split(`
`);
      vdomLines.forEach((line) => {
        lines.push("  ".repeat(vdomIndent) + line);
      });
    }
  }
  for (let i = domElements.length - 1;i >= 0; i--) {
    lines.push("  ".repeat(i) + domElements[i].closeTag);
  }
  return lines.join(`
`);
}
function buildComponentPath(vnode, context) {
  const path = [];
  const traverseVnode = (v, depth = 0) => {
    if (!v || depth > 10)
      return false;
    const name = getComponentName(v);
    const isComponent = typeof v.tag !== "string" && name !== "Unknown" && name !== "Component" && name !== "AnonymousComponent";
    if (isComponent) {
      path.push(name);
    }
    if (v.instance && depth < 2) {
      if (traverseVnode(v.instance, depth + 1))
        return true;
    }
    if (v.children && Array.isArray(v.children) && depth < 2) {
      for (let i = 0;i < Math.min(v.children.length, 3); i++) {
        const child = v.children[i];
        if (child && traverseVnode(child, depth + 1))
          return true;
      }
    }
    return false;
  };
  if (context?.newVnode) {
    traverseVnode(context.newVnode);
    if (path.length > 0)
      return path;
  }
  if (context?.oldVnode) {
    traverseVnode(context.oldVnode);
    if (path.length > 0)
      return path;
  }
  if (vnode) {
    traverseVnode(vnode);
  }
  return path;
}
function formatComponentHierarchy(vnode, context) {
  if (!vnode)
    return "Unknown";
  const path = buildComponentPath(vnode, context);
  const immediateName = getComponentName(vnode);
  const isElement = typeof vnode.tag === "string";
  if (path.length > 0) {
    const pathStr = path.join(" → ");
    if (isElement && immediateName !== path[path.length - 1]) {
      return `${immediateName} in ${pathStr}`;
    } else {
      return pathStr;
    }
  }
  return immediateName;
}
function logHydrationError(operation, vnode, _element, error, context) {
  updateHydrationStats(vnode);
  hydrationErrorCount++;
  if (hydrationErrorCount > MAX_HYDRATION_ERRORS) {
    if (hydrationErrorCount === MAX_HYDRATION_ERRORS + 1) {
      const topComponents = Array.from(hydrationStats.componentMismatches.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => `${name}: ${count}`).join(", ");
      logger.warn(`Hydration errors throttled: More than ${MAX_HYDRATION_ERRORS} errors detected. Suppressing further logs to improve performance.`, {
        totalMismatches: hydrationStats.totalMismatches,
        topComponents: topComponents || "none"
      });
    }
    return;
  }
  const componentHierarchy = formatComponentHierarchy(vnode, context);
  const logContext = {
    componentPath: componentHierarchy,
    operation
  };
  if (context?.node) {
    logContext.affectedNode = context.node.nodeType === 1 ? `${context.node.tagName.toLowerCase()}` : "text";
  }
  if (HYDRATION_DEBUG) {
    const vnodeToShow = context?.oldVnode || vnode || context?.newVnode;
    try {
      const combinedStructure = formatCombinedStructure(context?.parent || null, vnodeToShow, 4);
      if (combinedStructure) {
        logContext.structure = combinedStructure;
      }
    } catch (_e) {
      if (vnodeToShow) {
        try {
          const vdomTree = formatVDOMTree(vnodeToShow, 4, 0, true);
          if (vdomTree) {
            logContext.vdomStructure = vdomTree;
          }
        } catch (_e2) {
          logContext.component = getComponentName(vnodeToShow);
        }
      }
    }
    if (context?.oldVnode && context?.newVnode) {
      try {
        const oldTree = formatVDOMTree(context.oldVnode, 3);
        const newTree = formatVDOMTree(context.newVnode, 3);
        if (oldTree)
          logContext.removing = oldTree;
        if (newTree)
          logContext.replacingWith = newTree;
      } catch (_e) {}
    }
  }
  if (operation.includes("removeChild") || operation.includes("removeDOM")) {
    logContext.handledGracefully = true;
  }
  logger.error(`Hydration error: ${operation}`, error, logContext);
}
var hydrationStats = {
  totalMismatches: 0,
  componentMismatches: new Map,
  lastMismatchTime: 0
};
function updateHydrationStats(vnode) {
  hydrationStats.totalMismatches++;
  hydrationStats.lastMismatchTime = Date.now();
  const componentName = getComponentName(vnode);
  const currentCount = hydrationStats.componentMismatches.get(componentName) || 0;
  hydrationStats.componentMismatches.set(componentName, currentCount + 1);
}

// ../../render/delayedRemoval.ts
var delayedRemoval_default = new WeakMap;

// ../../render/domFor.ts
function* domFor(vnode) {
  let dom = vnode.dom;
  let domSize = vnode.domSize;
  const generation = delayedRemoval_default.get(dom);
  do {
    const nextSibling = dom.nextSibling;
    if (delayedRemoval_default.get(dom) === generation) {
      yield dom;
      domSize--;
    }
    dom = nextSibling;
  } while (domSize);
}
var domFor_default = domFor;

// ../../render/render.ts
function renderFactory() {
  const nameSpace = {
    svg: "http://www.w3.org/2000/svg",
    math: "http://www.w3.org/1998/Math/MathML"
  };
  let currentRedraw;
  let currentRender;
  let hydrationMismatchCount = 0;
  const MAX_HYDRATION_MISMATCHES = 5;
  function getDocument(dom) {
    return dom.ownerDocument;
  }
  function getNameSpace(vnode) {
    return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag];
  }
  function checkState(vnode, original) {
    if (vnode.state !== original)
      throw new Error("'vnode.state' must not be modified.");
  }
  function callHook(vnode, ...args) {
    if (this == null || typeof this.apply !== "function") {
      const tagName = typeof vnode?.tag === "function" ? vnode.tag?.name : vnode?.tag;
      throw new TypeError(`callHook: expected a function with .apply (e.g. component.view), got ${tagName ?? vnode?.tag}. Check that the component has a view.`);
    }
    const original = vnode.state;
    try {
      return this.apply(original, [vnode, ...args]);
    } finally {
      checkState(vnode, original);
    }
  }
  function activeElement(dom) {
    try {
      return getDocument(dom).activeElement;
    } catch (_e) {
      return null;
    }
  }
  function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns, isHydrating = false, matchedNodes = null) {
    const createdMatchedNodes = matchedNodes == null && isHydrating && nextSibling == null;
    if (createdMatchedNodes) {
      matchedNodes = new Set;
    }
    for (let i = start;i < end; i++) {
      const vnode = vnodes[i];
      if (vnode != null) {
        createNode(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
      }
    }
    if (createdMatchedNodes && matchedNodes && parent.firstChild && nextSibling == null) {
      let node = parent.firstChild;
      while (node) {
        const next = node.nextSibling;
        if (!matchedNodes.has(node)) {
          try {
            parent.removeChild(node);
          } catch (e) {
            const error = e;
            logHydrationError("removeChild (root level cleanup)", null, parent instanceof Element ? parent : null, error, { parent: parent instanceof Element ? parent : undefined, node, matchedNodes });
          }
        }
        node = next;
      }
    }
  }
  function createNode(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    const tag = vnode.tag;
    if (typeof tag === "string") {
      vnode.state = {};
      if (vnode.attrs != null)
        initLifecycle(vnode.attrs, vnode, hooks, isHydrating);
      switch (tag) {
        case "#":
          createText(parent, vnode, nextSibling, isHydrating, matchedNodes);
          break;
        case "<":
          createHTML(parent, vnode, ns, nextSibling);
          break;
        case "[":
          createFragment(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
          break;
        default:
          createElement(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
      }
    } else
      createComponent(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
  }
  function createText(parent, vnode, nextSibling, isHydrating = false, matchedNodes = null) {
    let textNode;
    if (isHydrating && parent.firstChild && nextSibling == null && matchedNodes) {
      const expectedText = String(vnode.children || "").trim();
      let candidate = parent.firstChild;
      while (candidate) {
        if (candidate.nodeType === 3 && !matchedNodes.has(candidate)) {
          const candidateText = candidate;
          const candidateValue = candidateText.nodeValue || "";
          if (candidateValue === String(vnode.children) || expectedText && candidateValue.trim() === expectedText) {
            textNode = candidateText;
            matchedNodes.add(textNode);
            if (candidateValue !== String(vnode.children)) {
              textNode.nodeValue = String(vnode.children);
            }
            break;
          }
        }
        candidate = candidate.nextSibling;
      }
      if (!textNode) {
        textNode = getDocument(parent).createTextNode(vnode.children);
        insertDOM(parent, textNode, nextSibling);
      }
    } else {
      textNode = getDocument(parent).createTextNode(vnode.children);
      insertDOM(parent, textNode, nextSibling);
    }
    vnode.dom = textNode;
  }
  const possibleParents = { caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup" };
  function createHTML(parent, vnode, ns, nextSibling) {
    const match = vnode.children.match(/^\s*?<(\w+)/im) || [];
    let temp = getDocument(parent).createElement(possibleParents[match[1]] || "div");
    if (ns === "http://www.w3.org/2000/svg") {
      temp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + vnode.children + "</svg>";
      temp = temp.firstChild;
    } else {
      temp.innerHTML = vnode.children;
    }
    vnode.dom = temp.firstChild;
    vnode.domSize = temp.childNodes.length;
    const fragment2 = getDocument(parent).createDocumentFragment();
    let child;
    while ((child = temp.firstChild) != null) {
      fragment2.appendChild(child);
    }
    insertDOM(parent, fragment2, nextSibling);
  }
  function createFragment(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    const fragment2 = getDocument(parent).createDocumentFragment();
    if (vnode.children != null) {
      const children = vnode.children;
      createNodes(fragment2, children, 0, children.length, hooks, null, ns, isHydrating, matchedNodes);
    }
    vnode.dom = fragment2.firstChild;
    vnode.domSize = fragment2.childNodes.length;
    insertDOM(parent, fragment2, nextSibling);
  }
  function createElement(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    const tag = vnode.tag;
    const attrs = vnode.attrs;
    const is = vnode.is;
    ns = getNameSpace(vnode) || ns;
    let element;
    if (isHydrating && parent.firstChild && nextSibling == null && matchedNodes) {
      let candidate = parent.firstChild;
      let fallbackCandidate = null;
      while (candidate) {
        if (candidate.nodeType === 1 && !matchedNodes.has(candidate)) {
          const candidateEl = candidate;
          const candidateTag = candidateEl.tagName || candidateEl.nodeName;
          if (candidateTag && candidateTag.toLowerCase() === tag.toLowerCase()) {
            if (!is || candidateEl.getAttribute("is") === is) {
              element = candidateEl;
              matchedNodes.add(element);
              break;
            }
            if (!fallbackCandidate) {
              fallbackCandidate = candidateEl;
            }
          }
        }
        candidate = candidate.nextSibling;
      }
      if (!element && fallbackCandidate) {
        element = fallbackCandidate;
        matchedNodes.add(element);
      }
      if (!element) {
        element = ns ? is ? getDocument(parent).createElementNS(ns, tag, { is }) : getDocument(parent).createElementNS(ns, tag) : is ? getDocument(parent).createElement(tag, { is }) : getDocument(parent).createElement(tag);
        insertDOM(parent, element, nextSibling);
      }
    } else {
      element = ns ? is ? getDocument(parent).createElementNS(ns, tag, { is }) : getDocument(parent).createElementNS(ns, tag) : is ? getDocument(parent).createElement(tag, { is }) : getDocument(parent).createElement(tag);
      insertDOM(parent, element, nextSibling);
    }
    vnode.dom = element;
    if (attrs != null) {
      setAttrs(vnode, attrs, ns);
    }
    if (!maybeSetContentEditable(vnode)) {
      if (vnode.children != null) {
        const children = vnode.children;
        const childMatchedNodes = isHydrating && element.firstChild ? new Set : null;
        createNodes(element, children, 0, children.length, hooks, null, ns, isHydrating, childMatchedNodes);
        if (isHydrating && childMatchedNodes && element.firstChild && childMatchedNodes.size > 0) {
          let node = element.firstChild;
          while (node) {
            const next = node.nextSibling;
            if (!childMatchedNodes.has(node)) {
              if (element.contains && element.contains(node)) {
                try {
                  element.removeChild(node);
                  hydrationMismatchCount++;
                } catch (e) {
                  const error = e;
                  if (!element.contains || !element.contains(node)) {
                    node = next;
                    continue;
                  }
                  hydrationMismatchCount++;
                  logHydrationError("removeChild (element children cleanup)", vnode, element, error, { parent: element, node, matchedNodes: childMatchedNodes });
                }
              }
            }
            node = next;
          }
        }
        if (vnode.tag === "select" && attrs != null)
          setLateSelectAttrs(vnode, attrs);
      }
    }
  }
  function initComponent(vnode, hooks, isHydrating = false) {
    let sentinel;
    if (typeof vnode.tag.view === "function") {
      vnode.state = Object.create(vnode.tag);
      sentinel = vnode.state.view;
      if (sentinel.$$reentrantLock$$ != null)
        return;
      sentinel.$$reentrantLock$$ = true;
    } else {
      vnode.state = undefined;
      sentinel = vnode.tag;
      if (sentinel.$$reentrantLock$$ != null)
        return;
      sentinel.$$reentrantLock$$ = true;
      vnode.state = vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function" ? new vnode.tag(vnode) : vnode.tag(vnode);
    }
    initLifecycle(vnode.state, vnode, hooks, isHydrating);
    if (vnode.attrs != null)
      initLifecycle(vnode.attrs, vnode, hooks, isHydrating);
    if (vnode.state && vnode.tag && !isHydrating) {
      globalThis.__mithrilStateToComponent = globalThis.__mithrilStateToComponent || new WeakMap;
      globalThis.__mithrilStateToComponent.set(vnode.state, vnode.tag);
    }
    if (vnode.state != null) {
      setCurrentComponent(vnode.state);
    }
    try {
      vnode.instance = vnode_default.normalize(callHook.call(vnode.state.view, vnode));
    } finally {
      if (vnode.state != null) {
        clearCurrentComponent();
      }
    }
    if (vnode.instance === vnode)
      throw Error("A view cannot return the vnode it received as argument");
    sentinel.$$reentrantLock$$ = null;
  }
  function createComponent(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    initComponent(vnode, hooks, isHydrating);
    if (vnode.instance != null) {
      createNode(parent, vnode.instance, hooks, ns, nextSibling, isHydrating, matchedNodes);
      vnode.dom = vnode.instance.dom;
      vnode.domSize = vnode.instance.domSize;
      if (vnode.state && vnode.dom && !isHydrating) {
        globalThis.__mithrilStateToDom = globalThis.__mithrilStateToDom || new WeakMap;
        globalThis.__mithrilStateToDom.set(vnode.state, vnode.dom);
      }
    } else {
      vnode.domSize = 0;
    }
  }
  function updateNodes(parent, old, vnodes, hooks, nextSibling, ns, isHydrating = false) {
    if (old === vnodes || old == null && vnodes == null)
      return;
    else if (old == null || old.length === 0)
      createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns, isHydrating);
    else if (vnodes == null || vnodes.length === 0)
      removeNodes(parent, old, 0, old.length);
    else {
      const isOldKeyed = old[0] != null && old[0].key != null;
      const isKeyed = vnodes[0] != null && vnodes[0].key != null;
      let start = 0, oldStart = 0, o, v;
      if (isOldKeyed !== isKeyed) {
        removeNodes(parent, old, 0, old.length);
        createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns, isHydrating);
      } else if (!isKeyed) {
        const commonLength = old.length < vnodes.length ? old.length : vnodes.length;
        while (oldStart < old.length && old[oldStart] == null)
          oldStart++;
        while (start < vnodes.length && vnodes[start] == null)
          start++;
        start = start < oldStart ? start : oldStart;
        for (;start < commonLength; start++) {
          o = old[start];
          v = vnodes[start];
          if (o === v || o == null && v == null)
            continue;
          else if (o == null)
            createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, old.length, nextSibling), isHydrating);
          else if (v == null)
            removeNode(parent, o);
          else
            updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, old.length, nextSibling), ns, isHydrating);
        }
        if (old.length > commonLength)
          removeNodes(parent, old, start, old.length);
        if (vnodes.length > commonLength)
          createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns, isHydrating);
      } else {
        let oldEnd = old.length - 1, end = vnodes.length - 1, oe, ve, topSibling;
        while (oldEnd >= oldStart && end >= start) {
          oe = old[oldEnd];
          ve = vnodes[end];
          if (oe == null || ve == null || oe.key !== ve.key)
            break;
          if (oe !== ve)
            updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating);
          if (ve.dom != null)
            nextSibling = ve.dom;
          oldEnd--, end--;
        }
        while (oldEnd >= oldStart && end >= start) {
          o = old[oldStart];
          v = vnodes[start];
          if (o == null || v == null || o.key !== v.key)
            break;
          oldStart++, start++;
          if (o !== v)
            updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, oldEnd + 1, nextSibling), ns, isHydrating);
        }
        while (oldEnd >= oldStart && end >= start) {
          if (start === end)
            break;
          o = old[oldStart];
          ve = vnodes[end];
          oe = old[oldEnd];
          v = vnodes[start];
          if (o == null || ve == null || oe == null || v == null || o.key !== ve.key || oe.key !== v.key)
            break;
          topSibling = getNextSibling(old, oldStart, oldEnd, nextSibling);
          moveDOM(parent, oe, topSibling);
          if (oe !== v)
            updateNode(parent, oe, v, hooks, topSibling, ns, isHydrating);
          if (++start <= --end)
            moveDOM(parent, o, nextSibling);
          if (o !== ve)
            updateNode(parent, o, ve, hooks, nextSibling, ns, isHydrating);
          if (ve.dom != null)
            nextSibling = ve.dom;
          oldStart++;
          oldEnd--;
          oe = old[oldEnd];
          ve = vnodes[end];
          o = old[oldStart];
          v = vnodes[start];
        }
        while (oldEnd >= oldStart && end >= start) {
          oe = old[oldEnd];
          ve = vnodes[end];
          if (oe == null || ve == null || oe.key !== ve.key)
            break;
          if (oe !== ve)
            updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating);
          if (ve.dom != null)
            nextSibling = ve.dom;
          oldEnd--, end--;
          oe = old[oldEnd];
          ve = vnodes[end];
        }
        if (start > end)
          removeNodes(parent, old, oldStart, oldEnd + 1);
        else if (oldStart > oldEnd)
          createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns, isHydrating);
        else {
          const originalNextSibling = nextSibling;
          let pos = 2147483647, matched = 0;
          const oldIndices = new Array(end - start + 1).fill(-1);
          const map = Object.create(null);
          for (let i = start;i <= end; i++) {
            if (vnodes[i] != null)
              map[vnodes[i].key] = i;
          }
          for (let i = oldEnd;i >= oldStart; i--) {
            oe = old[i];
            if (oe == null)
              continue;
            const newIndex = map[oe.key];
            if (newIndex != null) {
              pos = newIndex < pos ? newIndex : -1;
              oldIndices[newIndex - start] = i;
              ve = vnodes[newIndex];
              old[i] = null;
              if (oe !== ve)
                updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating);
              if (ve != null && ve.dom != null)
                nextSibling = ve.dom;
              matched++;
            }
          }
          nextSibling = originalNextSibling;
          if (matched !== oldEnd - oldStart + 1)
            removeNodes(parent, old, oldStart, oldEnd + 1);
          if (matched === 0)
            createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns, isHydrating);
          else {
            if (pos === -1) {
              const lisIndices = makeLisIndices(oldIndices);
              let li = lisIndices.length - 1;
              for (let i = end;i >= start; i--) {
                ve = vnodes[i];
                if (ve == null)
                  continue;
                if (oldIndices[i - start] === -1)
                  createNode(parent, ve, hooks, ns, nextSibling, isHydrating);
                else {
                  if (lisIndices[li] === i - start)
                    li--;
                  else
                    moveDOM(parent, ve, nextSibling);
                }
                if (ve.dom != null)
                  nextSibling = ve.dom;
              }
            } else {
              for (let i = end;i >= start; i--) {
                ve = vnodes[i];
                if (ve == null)
                  continue;
                if (oldIndices[i - start] === -1)
                  createNode(parent, ve, hooks, ns, nextSibling, isHydrating);
                if (ve.dom != null)
                  nextSibling = ve.dom;
              }
            }
          }
        }
      }
    }
  }
  function updateNode(parent, old, vnode, hooks, nextSibling, ns, isHydrating = false) {
    const oldTag = old.tag, tag = vnode.tag;
    if (oldTag === tag && old.is === vnode.is) {
      vnode.state = old.state;
      vnode.events = old.events;
      if (shouldNotUpdate(vnode, old))
        return;
      if (typeof oldTag === "string") {
        if (vnode.attrs != null) {
          updateLifecycle(vnode.attrs, vnode, hooks);
        }
        switch (oldTag) {
          case "#":
            updateText(old, vnode);
            break;
          case "<":
            updateHTML(parent, old, vnode, ns, nextSibling);
            break;
          case "[":
            updateFragment(parent, old, vnode, hooks, nextSibling, ns, isHydrating);
            break;
          default:
            updateElement(old, vnode, hooks, ns, isHydrating);
        }
      } else
        updateComponent(parent, old, vnode, hooks, nextSibling, ns, isHydrating);
    } else {
      removeNode(parent, old, vnode);
      createNode(parent, vnode, hooks, ns, nextSibling, isHydrating);
    }
  }
  function updateText(old, vnode) {
    if (old.children.toString() !== vnode.children.toString()) {
      old.dom.nodeValue = vnode.children;
    }
    vnode.dom = old.dom;
  }
  function updateHTML(parent, old, vnode, ns, nextSibling) {
    if (old.children !== vnode.children) {
      removeDOM(parent, old);
      createHTML(parent, vnode, ns, nextSibling);
    } else {
      vnode.dom = old.dom;
      vnode.domSize = old.domSize;
    }
  }
  function updateFragment(parent, old, vnode, hooks, nextSibling, ns, isHydrating = false) {
    updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns, isHydrating);
    let domSize = 0;
    const children = vnode.children;
    vnode.dom = null;
    if (children != null) {
      for (let i = 0;i < children.length; i++) {
        const child = children[i];
        if (child != null && child.dom != null) {
          if (vnode.dom == null)
            vnode.dom = child.dom;
          domSize += child.domSize || 1;
        }
      }
    }
    vnode.domSize = domSize;
  }
  function updateElement(old, vnode, hooks, ns, isHydrating = false) {
    const element = vnode.dom = old.dom;
    ns = getNameSpace(vnode) || ns;
    if (old.attrs != vnode.attrs || vnode.attrs != null && !cachedAttrsIsStaticMap_default.get(vnode.attrs)) {
      updateAttrs(vnode, old.attrs, vnode.attrs, ns);
    }
    if (!maybeSetContentEditable(vnode)) {
      updateNodes(element, old.children, vnode.children, hooks, null, ns, isHydrating);
    }
  }
  function updateComponent(parent, old, vnode, hooks, nextSibling, ns, isHydrating = false) {
    if (vnode.state && vnode.tag && !isHydrating) {
      globalThis.__mithrilStateToComponent = globalThis.__mithrilStateToComponent || new WeakMap;
      globalThis.__mithrilStateToComponent.set(vnode.state, vnode.tag);
    }
    if (vnode.state != null) {
      setCurrentComponent(vnode.state);
    }
    try {
      vnode.instance = vnode_default.normalize(callHook.call(vnode.state.view, vnode));
    } finally {
      if (vnode.state != null) {
        clearCurrentComponent();
      }
    }
    if (vnode.instance === vnode)
      throw Error("A view cannot return the vnode it received as argument");
    updateLifecycle(vnode.state, vnode, hooks);
    if (vnode.attrs != null)
      updateLifecycle(vnode.attrs, vnode, hooks);
    if (vnode.instance != null) {
      if (old.instance == null)
        createNode(parent, vnode.instance, hooks, ns, nextSibling, isHydrating);
      else
        updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns, isHydrating);
      vnode.dom = vnode.instance.dom;
      vnode.domSize = vnode.instance.domSize;
      if (vnode.state && vnode.dom && !isHydrating) {
        globalThis.__mithrilStateToDom = globalThis.__mithrilStateToDom || new WeakMap;
        globalThis.__mithrilStateToDom.set(vnode.state, vnode.dom);
      }
    } else {
      if (old.instance != null)
        removeNode(parent, old.instance);
      vnode.domSize = 0;
    }
  }
  const lisTemp = [];
  function makeLisIndices(a) {
    const result = [0];
    let u = 0, v = 0;
    const il = lisTemp.length = a.length;
    for (let i = 0;i < il; i++)
      lisTemp[i] = a[i];
    for (let i = 0;i < il; ++i) {
      if (a[i] === -1)
        continue;
      const j = result[result.length - 1];
      if (a[j] < a[i]) {
        lisTemp[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        const c = (u >>> 1) + (v >>> 1) + (u & v & 1);
        if (a[result[c]] < a[i]) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (a[i] < a[result[u]]) {
        if (u > 0)
          lisTemp[i] = result[u - 1];
        result[u] = i;
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = lisTemp[v];
    }
    lisTemp.length = 0;
    return result;
  }
  function getNextSibling(vnodes, i, end, nextSibling) {
    for (;i < end; i++) {
      if (vnodes[i] != null && vnodes[i].dom != null)
        return vnodes[i].dom;
    }
    return nextSibling;
  }
  function moveDOM(parent, vnode, nextSibling) {
    if (vnode.dom != null) {
      let target;
      if (vnode.domSize == null || vnode.domSize === 1) {
        target = vnode.dom;
      } else {
        target = getDocument(parent).createDocumentFragment();
        for (const dom of domFor_default(vnode))
          target.appendChild(dom);
      }
      insertDOM(parent, target, nextSibling);
    }
  }
  function insertDOM(parent, dom, nextSibling) {
    if (nextSibling != null)
      parent.insertBefore(dom, nextSibling);
    else
      parent.appendChild(dom);
  }
  function maybeSetContentEditable(vnode) {
    if (vnode.attrs == null || vnode.attrs.contenteditable == null && vnode.attrs.contentEditable == null)
      return false;
    const children = vnode.children;
    if (children != null && children.length === 1 && children[0].tag === "<") {
      const content = children[0].children;
      if (vnode.dom.innerHTML !== content)
        vnode.dom.innerHTML = content;
    } else if (children != null && children.length !== 0)
      throw new Error("Child node of a contenteditable must be trusted.");
    return true;
  }
  function removeNodes(parent, vnodes, start, end) {
    for (let i = start;i < end; i++) {
      const vnode = vnodes[i];
      if (vnode != null)
        removeNode(parent, vnode);
    }
  }
  function tryBlockRemove(parent, vnode, source, counter) {
    const original = vnode.state;
    const result = callHook.call(source.onbeforeremove, vnode);
    if (result == null)
      return;
    const generation = currentRender;
    for (const dom of domFor_default(vnode))
      delayedRemoval_default.set(dom, generation);
    counter.v++;
    Promise.resolve(result).finally(function() {
      checkState(vnode, original);
      tryResumeRemove(parent, vnode, counter);
    });
  }
  function tryResumeRemove(parent, vnode, counter, newVnode) {
    if (--counter.v === 0) {
      onremove(vnode);
      removeDOM(parent, vnode, newVnode);
    }
  }
  function removeNode(parent, vnode, newVnode) {
    const counter = { v: 1 };
    if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function")
      tryBlockRemove(parent, vnode, vnode.state, counter);
    if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function")
      tryBlockRemove(parent, vnode, vnode.attrs, counter);
    tryResumeRemove(parent, vnode, counter, newVnode);
  }
  function removeDOM(parent, vnode, newVnode) {
    if (vnode.dom == null)
      return;
    if (vnode.domSize == null || vnode.domSize === 1) {
      const node = vnode.dom;
      if (parent.contains && parent.contains(node)) {
        try {
          parent.removeChild(node);
        } catch (e) {
          const error = e;
          if (!parent.contains || !parent.contains(node)) {
            return;
          }
          logHydrationError("removeDOM (single node)", vnode, parent instanceof Element ? parent : null, error, { parent: parent instanceof Element ? parent : undefined, node: vnode.dom, oldVnode: vnode, newVnode });
        }
      }
    } else {
      for (const dom of domFor_default(vnode)) {
        if (parent.contains && parent.contains(dom)) {
          try {
            parent.removeChild(dom);
          } catch (e) {
            const error = e;
            if (!parent.contains || !parent.contains(dom)) {
              continue;
            }
            logHydrationError("removeDOM (multiple nodes)", vnode, parent instanceof Element ? parent : null, error, { parent: parent instanceof Element ? parent : undefined, node: dom, oldVnode: vnode, newVnode });
          }
        }
      }
    }
  }
  function onremove(vnode) {
    if (typeof vnode.tag !== "string" && vnode.state != null) {
      clearComponentDependencies(vnode.state);
    }
    if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function")
      callHook.call(vnode.state.onremove, vnode);
    if (vnode.attrs && typeof vnode.attrs.onremove === "function")
      callHook.call(vnode.attrs.onremove, vnode);
    if (typeof vnode.tag !== "string") {
      if (vnode.instance != null)
        onremove(vnode.instance);
    } else {
      if (vnode.events != null)
        vnode.events._ = null;
      const children = vnode.children;
      if (Array.isArray(children)) {
        for (let i = 0;i < children.length; i++) {
          const child = children[i];
          if (child != null)
            onremove(child);
        }
      }
    }
  }
  function setAttrs(vnode, attrs, ns) {
    for (const key in attrs) {
      setAttr(vnode, key, null, attrs[key], ns);
    }
  }
  function setAttr(vnode, key, old, value, ns) {
    if (key === "key" || value == null || isLifecycleMethod(key) || old === value && !isFormAttribute(vnode, key) && typeof value !== "object")
      return;
    if (key[0] === "o" && key[1] === "n")
      return updateEvent(vnode, key, value);
    if (key.slice(0, 6) === "xlink:")
      vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
    else if (key === "style")
      updateStyle(vnode.dom, old, value);
    else if (hasPropertyKey(vnode, key, ns)) {
      if (key === "value") {
        if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value)
          return;
        if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value)
          return;
        if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value)
          return;
        if (vnode.tag === "input" && vnode.attrs.type === "file" && "" + value !== "") {
          console.error("`value` is read-only on file inputs!");
          return;
        }
      }
      if (vnode.tag === "input" && key === "type")
        vnode.dom.setAttribute(key, value);
      else
        vnode.dom[key] = value;
    } else {
      if (typeof value === "boolean") {
        if (value)
          vnode.dom.setAttribute(key, "");
        else
          vnode.dom.removeAttribute(key);
      } else
        vnode.dom.setAttribute(key === "className" ? "class" : key, value);
    }
  }
  function removeAttr(vnode, key, old, ns) {
    if (key === "key" || old == null || isLifecycleMethod(key))
      return;
    if (key[0] === "o" && key[1] === "n")
      updateEvent(vnode, key, undefined);
    else if (key === "style")
      updateStyle(vnode.dom, old, null);
    else if (hasPropertyKey(vnode, key, ns) && key !== "className" && key !== "title" && !(key === "value" && (vnode.tag === "option" || vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement(vnode.dom))) && !(vnode.tag === "input" && key === "type")) {
      vnode.dom[key] = null;
    } else {
      const nsLastIndex = key.indexOf(":");
      if (nsLastIndex !== -1)
        key = key.slice(nsLastIndex + 1);
      if (old !== false)
        vnode.dom.removeAttribute(key === "className" ? "class" : key);
    }
  }
  function setLateSelectAttrs(vnode, attrs) {
    if ("value" in attrs) {
      if (attrs.value === null) {
        if (vnode.dom.selectedIndex !== -1)
          vnode.dom.value = null;
      } else {
        const normalized = "" + attrs.value;
        if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
          vnode.dom.value = normalized;
        }
      }
    }
    if ("selectedIndex" in attrs)
      setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined);
  }
  function updateAttrs(vnode, old, attrs, ns) {
    let val;
    if (old != null) {
      if (old === attrs && !cachedAttrsIsStaticMap_default.has(attrs)) {
        console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major");
      }
      for (const key in old) {
        if ((val = old[key]) != null && (attrs == null || attrs[key] == null)) {
          removeAttr(vnode, key, val, ns);
        }
      }
    }
    if (attrs != null) {
      for (const key in attrs) {
        setAttr(vnode, key, old && old[key], attrs[key], ns);
      }
    }
  }
  function isFormAttribute(vnode, attr) {
    return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && (vnode.dom === activeElement(vnode.dom) || vnode.tag === "option" && vnode.dom.parentNode === activeElement(vnode.dom));
  }
  function isLifecycleMethod(attr) {
    return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate";
  }
  function hasPropertyKey(vnode, key, ns) {
    return ns === undefined && (vnode.tag.indexOf("-") > -1 || vnode.is || key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height") && key in vnode.dom;
  }
  function updateStyle(element, old, style) {
    if (old === style) {} else if (style == null) {
      element.style.cssText = "";
    } else if (typeof style !== "object") {
      element.style.cssText = style;
    } else if (old == null || typeof old !== "object") {
      element.style.cssText = "";
      for (const key in style) {
        const value = style[key];
        if (value != null) {
          if (key.includes("-"))
            element.style.setProperty(key, String(value));
          else
            element.style[key] = String(value);
        }
      }
    } else {
      for (const key in old) {
        if (old[key] != null && style[key] == null) {
          if (key.includes("-"))
            element.style.removeProperty(key);
          else
            element.style[key] = "";
        }
      }
      for (const key in style) {
        let value = style[key];
        if (value != null && (value = String(value)) !== String(old[key])) {
          if (key.includes("-"))
            element.style.setProperty(key, value);
          else
            element.style[key] = value;
        }
      }
    }
  }
  function EventDict() {
    this._ = currentRedraw;
  }
  EventDict.prototype = Object.create(null);
  EventDict.prototype.handleEvent = function(ev) {
    const handler = this["on" + ev.type];
    let result;
    if (typeof handler === "function")
      result = handler.call(ev.currentTarget, ev);
    else if (typeof handler.handleEvent === "function")
      handler.handleEvent(ev);
    const self = this;
    if (self._ != null) {
      if (ev.redraw !== false)
        (0, self._)();
      if (result != null && typeof result.then === "function") {
        Promise.resolve(result).then(function() {
          if (self._ != null && ev.redraw !== false)
            (0, self._)();
        });
      }
    }
    if (result === false) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  };
  function updateEvent(vnode, key, value) {
    if (vnode.events != null) {
      vnode.events._ = currentRedraw;
      if (vnode.events[key] === value)
        return;
      if (value != null && (typeof value === "function" || typeof value === "object")) {
        if (vnode.events[key] == null)
          vnode.dom.addEventListener(key.slice(2), vnode.events, false);
        vnode.events[key] = value;
      } else {
        if (vnode.events[key] != null)
          vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
        vnode.events[key] = undefined;
      }
    } else if (value != null && (typeof value === "function" || typeof value === "object")) {
      vnode.events = new EventDict;
      vnode.dom.addEventListener(key.slice(2), vnode.events, false);
      vnode.events[key] = value;
    }
  }
  function initLifecycle(source, vnode, hooks, isHydrating = false) {
    if (typeof source.oninit === "function") {
      const context = {
        isSSR: false,
        isHydrating
      };
      const result = callHook.call(source.oninit, vnode, context);
      if (result != null && typeof result.then === "function" && currentRedraw != null) {
        Promise.resolve(result).then(function() {
          if (currentRedraw != null) {
            (0, currentRedraw)();
          }
        });
      }
    }
    if (typeof source.oncreate === "function")
      hooks.push(callHook.bind(source.oncreate, vnode));
  }
  function updateLifecycle(source, vnode, hooks) {
    if (typeof source.onupdate === "function")
      hooks.push(callHook.bind(source.onupdate, vnode));
  }
  function shouldNotUpdate(vnode, old) {
    do {
      if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
        const force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
        if (force !== undefined && !force)
          break;
      }
      if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
        const force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
        if (force !== undefined && !force)
          break;
      }
      return false;
    } while (false);
    vnode.dom = old.dom;
    vnode.domSize = old.domSize;
    vnode.instance = old.instance;
    vnode.attrs = old.attrs;
    vnode.children = old.children;
    vnode.text = old.text;
    return true;
  }
  let currentDOM = null;
  return function(dom, vnodes, redraw) {
    if (!dom)
      throw new TypeError("DOM element being rendered to does not exist.");
    if (currentDOM != null && dom.contains(currentDOM)) {
      throw new TypeError("Node is currently being rendered to and thus is locked.");
    }
    const prevRedraw = currentRedraw;
    const prevDOM = currentDOM;
    const hooks = [];
    const active = activeElement(dom);
    const namespace = dom.namespaceURI;
    currentDOM = dom;
    currentRedraw = typeof redraw === "function" ? redraw : undefined;
    currentRender = {};
    resetHydrationErrorCount();
    hydrationMismatchCount = 0;
    try {
      let isHydrating = dom.vnodes == null && dom.nodeType === 1 && "children" in dom && dom.children.length > 0;
      if (!isHydrating && dom.vnodes == null)
        dom.textContent = "";
      const normalized = vnode_default.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
      updateNodes(dom, dom.vnodes, normalized, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace, isHydrating);
      if (isHydrating && hydrationMismatchCount > MAX_HYDRATION_MISMATCHES) {
        logger.warn(`Hydration mismatch threshold exceeded. Clearing parent and re-rendering from client VDOM.`, {
          mismatchCount: hydrationMismatchCount,
          threshold: MAX_HYDRATION_MISMATCHES
        });
        dom.textContent = "";
        hydrationMismatchCount = 0;
        dom.vnodes = null;
        const overrideHooks = [];
        updateNodes(dom, null, normalized, overrideHooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace, false);
        for (let i = 0;i < overrideHooks.length; i++)
          overrideHooks[i]();
      }
      dom.vnodes = normalized;
      if (active != null && activeElement(dom) !== active && typeof active.focus === "function")
        active.focus();
      for (let i = 0;i < hooks.length; i++)
        hooks[i]();
    } finally {
      currentRedraw = prevRedraw;
      currentDOM = prevDOM;
    }
  };
}

// ../../util/next_tick.ts
async function next_tick() {
  if (typeof globalThis !== "undefined" && globalThis.__SSR_MODE__) {
    return Promise.resolve();
  }
  if (typeof queueMicrotask !== "undefined") {
    return new Promise((resolve) => {
      queueMicrotask(resolve);
    });
  }
  if (typeof Promise !== "undefined" && Promise.resolve) {
    return Promise.resolve();
  }
  if (typeof setTimeout !== "undefined") {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
  return Promise.resolve();
}
var next_tick_default = next_tick;

// ../../state.ts
var arrayParentSignalMap = new WeakMap;
var stateDeferredFlags = new WeakMap;
var stateRootMap = new WeakMap;
function getDeferredAllowed(stateObj) {
  const root = stateObj && (stateRootMap.get(stateObj) ?? stateObj) || stateObj;
  const flags = root ? stateDeferredFlags.get(root) : undefined;
  return !flags || flags.allowed;
}
function createStateComputed(wrapped, computeFn, shouldDefer) {
  if (!shouldDefer)
    return computed(computeFn);
  return computed(() => {
    if (!getDeferredAllowed(wrapped))
      return;
    return computeFn();
  });
}
function markAllComputedsDirty(stateObj) {
  if (!stateObj || !stateObj.__isState)
    return;
  const signalMap = stateObj.__signalMap;
  if (!signalMap || !(signalMap instanceof Map))
    return;
  signalMap.forEach((sig) => {
    if (sig instanceof ComputedSignal) {
      sig.markDirty();
    } else if (sig && typeof sig === "object" && sig.value && sig.value.__isState) {
      markAllComputedsDirty(sig.value);
    }
  });
}
function isSignal(value) {
  return value instanceof Signal || value instanceof ComputedSignal;
}
function isState(value) {
  return value && typeof value === "object" && value.__isState === true;
}
function isGetSetDescriptor(value) {
  return value && typeof value === "object" && (typeof value.get === "function" || typeof value.set === "function");
}
function toSignal(value) {
  if (isSignal(value)) {
    return value;
  }
  if (typeof value === "function") {
    return computed(value);
  }
  return signal(value);
}
var globalStateRegistry = new Map;
function getCurrentStateRegistry() {
  const ctx = getSSRContext();
  if (ctx?.stateRegistry) {
    return ctx.stateRegistry;
  }
  return globalStateRegistry;
}
function registerState(name, stateInstance, initial) {
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("State name is required and must be a non-empty string");
  }
  const registry = getCurrentStateRegistry();
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    if (registry.has(name)) {
      console.warn(`State name collision detected: "${name}". Last registered state will be used.`);
    }
  }
  registry.set(name, { state: stateInstance, initial });
}
function getRegisteredStates() {
  return getCurrentStateRegistry();
}
function state(initial, name, options) {
  const signalMap = new Map;
  const stateCache = new WeakMap;
  const deferComputed = !!options?.deferComputed;
  function initializeSignals(obj, parentSignalMap, context) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (isState(obj)) {
      return obj;
    }
    if (stateCache.has(obj)) {
      return stateCache.get(obj);
    }
    if (Array.isArray(obj)) {
      const signals = obj.map((item) => {
        if (typeof item === "object" && item !== null) {
          return initializeSignals(item, undefined, context);
        }
        return toSignal(item);
      });
      const mutatingMethods = ["splice", "push", "pop", "shift", "unshift", "reverse", "sort", "fill", "copyWithin"];
      const wrapped3 = new Proxy(signals, {
        get(target, prop) {
          if (prop === "__isState")
            return true;
          if (prop === "__signals")
            return signals;
          if (prop === "__parentSignal") {
            return arrayParentSignalMap.get(wrapped3) || wrapped3._parentSignal;
          }
          if (prop === Symbol.toStringTag)
            return "Array";
          if (prop === Symbol.iterator) {
            return function* () {
              for (let i = 0;i < signals.length; i++) {
                const sig = signals[i];
                yield isSignal(sig) ? sig.value : sig;
              }
            };
          }
          if (prop === "length")
            return signals.length;
          const propStr = String(prop);
          if (propStr.startsWith("$") && propStr.length > 1) {
            const indexStr = propStr.slice(1);
            if (!isNaN(Number(indexStr))) {
              const index = Number(indexStr);
              if (index >= 0 && index < signals.length) {
                const sig = signals[index];
                return isSignal(sig) ? sig : sig;
              }
            }
            return;
          }
          if (typeof prop === "string" && !isNaN(Number(prop))) {
            const index = Number(prop);
            if (index >= 0 && index < signals.length) {
              const sig = signals[index];
              return isSignal(sig) ? sig.value : sig;
            }
          }
          const value = Reflect.get(target, prop);
          if (typeof value === "function" && Array.isArray(target)) {
            const iterationMethods = ["map", "filter", "forEach", "some", "every", "find", "findIndex", "reduce", "reduceRight"];
            const searchMethods = ["includes", "indexOf", "lastIndexOf"];
            const returnMethods = ["slice", "concat", "flat", "flatMap", "join", "toString", "toLocaleString"];
            const iteratorMethods = ["entries", "keys", "values"];
            if (iterationMethods.includes(propStr) || searchMethods.includes(propStr) || returnMethods.includes(propStr) || iteratorMethods.includes(propStr)) {
              return value.bind(wrapped3);
            }
          }
          if (typeof value === "function" && mutatingMethods.includes(propStr)) {
            return function(...args) {
              if (propStr === "splice") {
                const start = args[0] ?? 0;
                const deleteCount = args[1] ?? signals.length - start;
                const newItems = args.slice(2);
                const newSignals = newItems.map((item) => {
                  if (typeof item === "object" && item !== null) {
                    return initializeSignals(item, undefined, context);
                  }
                  return toSignal(item);
                });
                const removed = signals.splice(start, deleteCount, ...newSignals);
                const parentSignal = arrayParentSignalMap.get(wrapped3) || wrapped3._parentSignal;
                if (parentSignal) {
                  const subscribers = parentSignal._subscribers;
                  if (subscribers) {
                    subscribers.forEach((fn) => {
                      try {
                        fn();
                      } catch (e) {
                        console.error("Error in signal subscriber:", e);
                      }
                    });
                  }
                  if (signal.__redrawCallback) {
                    signal.__redrawCallback(parentSignal);
                  }
                }
                return removed.map((sig) => isSignal(sig) ? sig.value : sig);
              } else {
                let result;
                if (propStr === "push" || propStr === "unshift") {
                  const newItems = args;
                  const newSignals = newItems.map((item) => {
                    if (typeof item === "object" && item !== null) {
                      return initializeSignals(item, undefined, context);
                    }
                    return toSignal(item);
                  });
                  if (propStr === "push") {
                    result = signals.push(...newSignals);
                  } else {
                    result = signals.unshift(...newSignals);
                  }
                } else if (propStr === "pop" || propStr === "shift") {
                  if (propStr === "pop") {
                    const sig = signals.pop();
                    result = sig !== undefined ? isSignal(sig) ? sig.value : sig : undefined;
                  } else {
                    const sig = signals.shift();
                    result = sig !== undefined ? isSignal(sig) ? sig.value : sig : undefined;
                  }
                } else if (propStr === "reverse" || propStr === "sort") {
                  if (propStr === "reverse") {
                    signals.reverse();
                  } else {
                    const comparator = args[0];
                    if (comparator) {
                      signals.sort((a, b) => {
                        const aVal = isSignal(a) ? a.value : a;
                        const bVal = isSignal(b) ? b.value : b;
                        return comparator(aVal, bVal);
                      });
                    } else {
                      signals.sort((a, b) => {
                        const aVal = isSignal(a) ? a.value : a;
                        const bVal = isSignal(b) ? b.value : b;
                        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                      });
                    }
                  }
                  result = wrapped3;
                } else if (propStr === "fill") {
                  const fillValue = args[0];
                  const start = args[1] ?? 0;
                  const end = args[2] ?? signals.length;
                  const fillSignal = toSignal(fillValue);
                  for (let i = start;i < end; i++) {
                    signals[i] = fillSignal;
                  }
                  result = signals.length;
                } else {
                  result = value.apply(target, args);
                }
                const currentParentSignal = arrayParentSignalMap.get(wrapped3) || wrapped3._parentSignal;
                if (currentParentSignal) {
                  const subscribers = currentParentSignal._subscribers;
                  if (subscribers) {
                    subscribers.forEach((fn) => {
                      try {
                        fn();
                      } catch (e) {
                        console.error("Error in signal subscriber:", e);
                      }
                    });
                  }
                  if (signal.__redrawCallback) {
                    signal.__redrawCallback(currentParentSignal);
                  }
                }
                return result;
              }
            };
          }
          if (typeof value === "function") {
            return value.bind(target);
          }
          return value;
        },
        set(target, prop, value) {
          if (typeof prop === "string" && !isNaN(Number(prop))) {
            const index = Number(prop);
            if (index >= 0 && index < signals.length) {
              const sig = signals[index];
              if (isSignal(sig)) {
                sig.value = value;
              } else {
                signals[index] = toSignal(value);
              }
              const parentSignal = arrayParentSignalMap.get(wrapped3) || wrapped3._parentSignal;
              if (parentSignal) {
                const subscribers = parentSignal._subscribers;
                if (subscribers) {
                  subscribers.forEach((fn) => {
                    try {
                      fn();
                    } catch (e) {
                      console.error("Error in signal subscriber:", e);
                    }
                  });
                }
                if (signal.__redrawCallback) {
                  signal.__redrawCallback(parentSignal);
                }
              }
              return true;
            } else if (prop === "length") {
              signals.length = Number(value);
              const parentSignal = arrayParentSignalMap.get(wrapped3) || wrapped3._parentSignal;
              if (parentSignal) {
                const subscribers = parentSignal._subscribers;
                if (subscribers) {
                  subscribers.forEach((fn) => {
                    try {
                      fn();
                    } catch (e) {
                      console.error("Error in signal subscriber:", e);
                    }
                  });
                }
                if (signal.__redrawCallback) {
                  signal.__redrawCallback(parentSignal);
                }
              }
              return true;
            }
          }
          return Reflect.set(target, prop, value);
        },
        ownKeys(_target) {
          const keys = [];
          for (let i = 0;i < signals.length; i++) {
            keys.push(String(i));
          }
          keys.push("length");
          return keys;
        },
        getOwnPropertyDescriptor(target, prop) {
          if (typeof prop === "string" && !isNaN(Number(prop))) {
            const index = Number(prop);
            if (index >= 0 && index < signals.length) {
              return {
                enumerable: true,
                configurable: true,
                value: (() => {
                  const sig = signals[index];
                  return isSignal(sig) ? sig.value : sig;
                })(),
                writable: true
              };
            }
          }
          if (prop === "length") {
            return {
              enumerable: false,
              configurable: false,
              value: signals.length,
              writable: true
            };
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
        }
      });
      stateCache.set(obj, wrapped3);
      return wrapped3;
    }
    const originalKeys = new Set(Object.keys(obj));
    const nestedSignalMap = parentSignalMap || new Map;
    const wrapped2 = new Proxy(obj, {
      get(target, prop) {
        if (prop === "__originalKeys")
          return originalKeys;
        if (prop === "__isState")
          return true;
        if (prop === "__signalMap") {
          const explicitValue = Reflect.get(target, "__signalMap");
          return explicitValue !== undefined ? explicitValue : nestedSignalMap;
        }
        if (prop === "__rootState")
          return stateRootMap.get(wrapped2) ?? wrapped2;
        if (prop === "allowComputed") {
          return function allowComputed() {
            const root = this && (stateRootMap.get(this) ?? this) || this;
            const flags = root ? stateDeferredFlags.get(root) : undefined;
            if (flags)
              flags.allowed = true;
            markAllComputedsDirty(root);
          };
        }
        const propStr = String(prop);
        if (propStr.startsWith("$") && propStr.length > 1) {
          const key2 = propStr.slice(1);
          if (!nestedSignalMap.has(key2)) {
            const originalValue = Reflect.get(target, key2);
            if (originalValue !== undefined) {
              if (typeof originalValue === "function") {
                const computedSig = createStateComputed(wrapped2, () => originalValue.call(wrapped2), !!context?.deferComputed);
                nestedSignalMap.set(key2, computedSig);
              } else if (isGetSetDescriptor(originalValue)) {
                if (typeof originalValue.get === "function") {
                  const computedSig = createStateComputed(wrapped2, () => originalValue.get.call(wrapped2), !!context?.deferComputed);
                  nestedSignalMap.set(key2, computedSig);
                } else {
                  const sig2 = signal(undefined);
                  nestedSignalMap.set(key2, sig2);
                }
              } else if (typeof originalValue === "object" && originalValue !== null) {
                const nestedState = wrapped2[key2];
                if (nestedState === undefined) {
                  const childContext = context ? { ...context, rootState: stateRootMap.get(wrapped2) ?? wrapped2 } : undefined;
                  const initialized = initializeSignals(originalValue, undefined, childContext);
                  const sig2 = signal(initialized);
                  if (Array.isArray(initialized)) {
                    arrayParentSignalMap.set(initialized, sig2);
                  }
                  nestedSignalMap.set(key2, sig2);
                } else {
                  const sig2 = signal(nestedState);
                  if (Array.isArray(nestedState)) {
                    arrayParentSignalMap.set(nestedState, sig2);
                  }
                  nestedSignalMap.set(key2, sig2);
                }
              } else {
                const sig2 = toSignal(originalValue);
                nestedSignalMap.set(key2, sig2);
              }
            } else {
              return;
            }
          }
          return nestedSignalMap.get(key2);
        }
        const key = propStr;
        if (!nestedSignalMap.has(key)) {
          const originalValue = Reflect.get(target, prop);
          if (originalValue !== undefined) {
            if (typeof originalValue === "function") {
              const computedSig = createStateComputed(wrapped2, () => originalValue.call(wrapped2), !!context?.deferComputed);
              nestedSignalMap.set(key, computedSig);
            } else if (isGetSetDescriptor(originalValue)) {
              if (typeof originalValue.get === "function") {
                const computedSig = createStateComputed(wrapped2, () => originalValue.get.call(wrapped2), !!context?.deferComputed);
                nestedSignalMap.set(key, computedSig);
              } else {
                const sig2 = signal(undefined);
                nestedSignalMap.set(key, sig2);
              }
            } else if (typeof originalValue === "object" && originalValue !== null) {
              const childContext = context ? { ...context, rootState: stateRootMap.get(wrapped2) ?? wrapped2 } : undefined;
              const nestedState = initializeSignals(originalValue, undefined, childContext);
              const sig2 = signal(nestedState);
              if (Array.isArray(nestedState)) {
                arrayParentSignalMap.set(nestedState, sig2);
              }
              nestedSignalMap.set(key, sig2);
            } else {
              const sig2 = toSignal(originalValue);
              nestedSignalMap.set(key, sig2);
            }
          } else {}
        }
        const sig = nestedSignalMap.get(key);
        if (sig) {
          const value = sig.value;
          if (value && typeof value === "object") {
            if (value.__isState === true && Array.isArray(value.__signals)) {
              arrayParentSignalMap.set(value, sig);
              value._parentSignal = sig;
            } else if (Array.isArray(value)) {
              arrayParentSignalMap.set(value, sig);
            }
          }
          return value;
        }
        return Reflect.get(target, prop);
      },
      set(target, prop, value) {
        const key = String(prop);
        if (key === "__signalMap") {
          Reflect.set(target, prop, value);
          return true;
        }
        if (key === "__isState" || key === "__originalKeys" || key === "__signals") {
          return true;
        }
        const originalValue = Reflect.get(target, prop);
        if (isGetSetDescriptor(originalValue)) {
          if (typeof originalValue.set === "function") {
            originalValue.set.call(wrapped2, value);
            return true;
          } else if (typeof originalValue.get === "function") {
            throw new Error(`Cannot set read-only computed property "${key}"`);
          }
        }
        if (isGetSetDescriptor(value)) {
          if (typeof value.get === "function") {
            const computedSig = createStateComputed(wrapped2, () => value.get.call(wrapped2), !!context?.deferComputed);
            nestedSignalMap.set(key, computedSig);
            Reflect.set(target, prop, value);
            return true;
          } else {
            const sig = signal(undefined);
            nestedSignalMap.set(key, sig);
            Reflect.set(target, prop, value);
            return true;
          }
        }
        if (typeof value === "function") {
          const computedSig = createStateComputed(wrapped2, () => value.call(wrapped2), !!context?.deferComputed);
          nestedSignalMap.set(key, computedSig);
          return true;
        }
        if (nestedSignalMap.has(key)) {
          const sig = nestedSignalMap.get(key);
          if (sig && !(sig instanceof ComputedSignal)) {
            if (typeof value === "object" && value !== null) {
              const childContext = context ? { ...context, rootState: stateRootMap.get(wrapped2) ?? wrapped2 } : undefined;
              const nestedState = initializeSignals(value, undefined, childContext);
              if (Array.isArray(nestedState)) {
                arrayParentSignalMap.set(nestedState, sig);
              }
              sig.value = nestedState;
            } else {
              sig.value = value;
            }
          } else {
            if (typeof value === "object" && value !== null && Array.isArray(value)) {
              const childContext = context ? { ...context, rootState: stateRootMap.get(wrapped2) ?? wrapped2 } : undefined;
              const nestedState = initializeSignals(value, undefined, childContext);
              const sig2 = signal(nestedState);
              arrayParentSignalMap.set(nestedState, sig2);
              nestedSignalMap.set(key, sig2);
            } else {
              nestedSignalMap.set(key, toSignal(value));
            }
          }
        } else {
          if (typeof value === "object" && value !== null) {
            const childContext = context ? { ...context, rootState: stateRootMap.get(wrapped2) ?? wrapped2 } : undefined;
            const nestedState = initializeSignals(value, undefined, childContext);
            const sig = signal(nestedState);
            if (Array.isArray(nestedState)) {
              arrayParentSignalMap.set(nestedState, sig);
            }
            nestedSignalMap.set(key, sig);
          } else {
            nestedSignalMap.set(key, toSignal(value));
          }
        }
        return true;
      },
      has(target, prop) {
        if (prop === "__isState" || prop === "__signalMap")
          return true;
        const propStr = String(prop);
        if (propStr.startsWith("$") && propStr.length > 1) {
          const key = propStr.slice(1);
          return nestedSignalMap.has(key) || Reflect.has(target, key);
        }
        return nestedSignalMap.has(propStr) || Reflect.has(target, prop);
      },
      ownKeys(target) {
        const keys = new Set(Reflect.ownKeys(target));
        nestedSignalMap.forEach((_, key) => {
          keys.add(key);
          keys.add("$" + key);
        });
        return Array.from(keys);
      },
      getOwnPropertyDescriptor(target, prop) {
        const propStr = String(prop);
        if (propStr.startsWith("$") && propStr.length > 1) {
          const key = propStr.slice(1);
          if (nestedSignalMap.has(key)) {
            return {
              enumerable: false,
              configurable: true
            };
          }
        }
        if (nestedSignalMap.has(propStr)) {
          return {
            enumerable: true,
            configurable: true
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
      deleteProperty(target, prop) {
        const key = String(prop);
        if (nestedSignalMap.has(key)) {
          const sig = nestedSignalMap.get(key);
          if (sig && !(sig instanceof ComputedSignal)) {
            sig.value = undefined;
          }
          nestedSignalMap.delete(key);
        }
        return Reflect.deleteProperty(target, prop);
      }
    });
    stateRootMap.set(wrapped2, context?.rootState ?? wrapped2);
    stateCache.set(obj, wrapped2);
    return wrapped2;
  }
  const initContext = deferComputed ? { deferComputed: true } : undefined;
  const wrapped = initializeSignals(initial, undefined, initContext);
  stateRootMap.set(wrapped, wrapped);
  if (deferComputed) {
    stateDeferredFlags.set(wrapped, { allowed: false });
  }
  if (typeof initial === "object" && initial !== null && !Array.isArray(initial)) {
    for (const key in initial) {
      if (Object.prototype.hasOwnProperty.call(initial, key)) {
        if (!signalMap.has(key)) {
          const value = initial[key];
          if (typeof value === "function") {
            const computedSig = createStateComputed(wrapped, () => value.call(wrapped), deferComputed);
            signalMap.set(key, computedSig);
          } else if (isGetSetDescriptor(value)) {
            if (typeof value.get === "function") {
              const computedSig = createStateComputed(wrapped, () => value.get.call(wrapped), deferComputed);
              signalMap.set(key, computedSig);
            } else {
              const sig = signal(undefined);
              signalMap.set(key, sig);
            }
          } else if (typeof value === "object" && value !== null) {
            const preInitContext = initContext ? { ...initContext, rootState: wrapped } : undefined;
            const nestedState = stateCache.has(value) ? stateCache.get(value) : initializeSignals(value, undefined, preInitContext);
            if (nestedState && nestedState.__isState)
              stateRootMap.set(nestedState, wrapped);
            const sig = signal(nestedState);
            if (nestedState && typeof nestedState === "object" && (nestedState.__isState === true && Array.isArray(nestedState.__signals))) {
              arrayParentSignalMap.set(nestedState, sig);
              nestedState._parentSignal = sig;
            } else if (Array.isArray(nestedState)) {
              arrayParentSignalMap.set(nestedState, sig);
            }
            signalMap.set(key, sig);
          } else {
            const sig = toSignal(value);
            signalMap.set(key, sig);
          }
        }
      }
    }
  }
  if (name && typeof name === "string" && name.trim() !== "") {
    registerState(name, wrapped, initial);
  }
  return wrapped;
}

// ../../render/ssrState.ts
function isState2(value) {
  return value && typeof value === "object" && value.__isState === true;
}
function deserializeStore(state2, serialized) {
  if (!isState2(state2)) {
    throw new Error("Value is not a state");
  }
  if (!serialized || typeof serialized !== "object") {
    return;
  }
  const signalMap = state2.__signalMap;
  if (!signalMap || !(signalMap instanceof Map)) {
    throw new Error("State signalMap is null, undefined, or not a Map instance");
  }
  function deserializeValue(value) {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value !== "object") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => deserializeValue(item));
    }
    const objResult = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        objResult[key] = deserializeValue(value[key]);
      }
    }
    return objResult;
  }
  for (const key in serialized) {
    if (Object.prototype.hasOwnProperty.call(serialized, key)) {
      const serializedValue = serialized[key];
      const deserializedValue = deserializeValue(serializedValue);
      if (signalMap && signalMap.has(key)) {
        const signal2 = signalMap.get(key);
        if (signal2 && !(signal2 instanceof ComputedSignal)) {
          signal2.value = deserializedValue;
        }
      } else {
        if (signalMap) {
          state2[key] = deserializedValue;
        }
      }
    }
  }
}
function restoreComputedProperties(state2, initial) {
  if (!initial || typeof initial !== "object") {
    return;
  }
  function isObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }
  function restore(obj, target, prefix = "") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === "function") {
          const keys = prefix ? prefix.split(".").filter((k) => k) : [];
          let targetState = target;
          for (let i = 0;i < keys.length; i++) {
            if (!targetState[keys[i]]) {
              return;
            }
            targetState = targetState[keys[i]];
          }
          if (targetState && typeof targetState === "object" && targetState.__isState) {
            const signalMap = targetState.__signalMap;
            if (signalMap && signalMap instanceof Map) {
              signalMap.delete(key);
            }
          }
          targetState[key] = value;
        } else if (isObject(value)) {
          const nestedPrefix = prefix ? `${prefix}.${key}` : key;
          restore(value, target, nestedPrefix);
        }
      }
    }
  }
  restore(initial, state2);
}
function deserializeAllStates(serialized) {
  if (!serialized || typeof serialized !== "object") {
    return;
  }
  const registeredStates = getRegisteredStates();
  for (const [name, serializedState] of Object.entries(serialized)) {
    const entry = registeredStates.get(name);
    if (!entry) {
      if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
        logger2.warn(`State not found in registry. Skipping deserialization.`, { stateName: name });
      }
      continue;
    }
    try {
      deserializeStore(entry.state, serializedState);
    } catch (error) {
      logger2.error(`Error deserializing state`, error, { stateName: name });
    }
  }
  for (const [name, entry] of registeredStates.entries()) {
    try {
      restoreComputedProperties(entry.state, entry.initial);
    } catch (error) {
      logger2.error(`Error restoring computed properties for state`, error, { stateName: name });
    }
  }
}

// ../../store.ts
var DEFAULT_LOOKUP_VERIFY_INTERVAL = 1000 * 10;
var DEFAULT_LOOKUP_TTL = 1000 * 60 * 60 * 24;

// ../../index.ts
var mountRedrawInstance = mountRedrawFactory(renderFactory(), typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame.bind(window) : setTimeout, console);
var router2 = router(typeof window !== "undefined" ? window : null, mountRedrawInstance);
var m = function m2() {
  return hyperscript_default.apply(this, arguments);
};
m.m = hyperscript_default;
m.trust = hyperscript_default.trust;
m.fragment = hyperscript_default.fragment;
m.Fragment = "[";
m.mount = mountRedrawInstance.mount;
m.route = router2;
m.render = renderFactory();
m.redraw = mountRedrawInstance.redraw;
m.parseQueryString = parseQueryString;
m.buildQueryString = buildQueryString;
m.parsePathname = parsePathname;
m.buildPathname = buildPathname;
m.vnode = vnode_default;
m.censor = censor;
m.next_tick = next_tick_default;
m.domFor = domFor_default;
setSignalRedrawCallback((sig) => {
  const components = getSignalComponents(sig);
  if (components) {
    components.forEach((component) => {
      m.redraw(component);
    });
  }
});
var mithril_default = m;

// store.ts
var $docs = state({
  page: null,
  navGuides: [],
  navMethods: [],
  loading: true,
  error: null,
  routePath: "/"
}, "docs");

// components/nav-sections.tsx
function navLink(link) {
  const path = link.href.startsWith("/") ? link.href : `/${link.href}`;
  return link.external ? mithril_default("a", { href: link.href, target: "_blank", rel: "noreferrer noopener" }, link.text) : mithril_default(mithril_default.route.Link, { href: path }, link.text);
}

class NavSections extends MithrilComponent {
  view(vnode) {
    const { sections = [] } = vnode.attrs ?? {};
    if (!sections?.length)
      return null;
    return mithril_default("ul", sections.map((section) => {
      if (section.links.length === 0) {
        return mithril_default("li", section.title);
      }
      if (section.links.length === 1) {
        return mithril_default("li", navLink(section.links[0]));
      }
      return mithril_default("li", [
        section.title,
        mithril_default("ul", section.links.map((link) => mithril_default("li", navLink(link))))
      ]);
    }));
  }
}

// components/layout.tsx
var apiPagePatterns = ["hyperscript", "render", "mount", "route", "request", "parseQueryString", "buildQueryString", "buildPathname", "parsePathname", "trust", "fragment", "redraw", "censor", "stream"];

class Layout extends MithrilComponent {
  view(vnode) {
    const attrs = vnode.attrs ?? {};
    const { page, navGuides = [], navMethods = [], version = "2.3.8" } = attrs;
    if (!page || !page.content) {
      return mithril_default("div", "Loading...");
    }
    let currentPath = attrs.routePath || "/";
    if (currentPath === "/" && typeof window !== "undefined" && mithril_default.route?.get) {
      try {
        currentPath = mithril_default.route.get() || currentPath;
      } catch {}
    }
    const isApiPage = currentPath.startsWith("/api") || apiPagePatterns.some((p) => currentPath.includes(p));
    const navSections = isApiPage ? navMethods : navGuides;
    return /* @__PURE__ */ mithril_default(mithril_default.Fragment, null, /* @__PURE__ */ mithril_default("header", null, /* @__PURE__ */ mithril_default("section", null, /* @__PURE__ */ mithril_default("a", {
      class: "hamburger",
      href: "javascript:;"
    }, "≡"), /* @__PURE__ */ mithril_default("h1", null, /* @__PURE__ */ mithril_default("img", {
      src: "/logo.svg",
      alt: "Mithril"
    }), "Mithril ", /* @__PURE__ */ mithril_default("span", {
      class: "version"
    }, "v", version)), /* @__PURE__ */ mithril_default("nav", null, mithril_default(mithril_default.route.Link, { href: "/" }, "Guide"), mithril_default(mithril_default.route.Link, { href: "/api.html" }, "API"), /* @__PURE__ */ mithril_default("a", {
      href: "https://mithril.zulipchat.com/"
    }, "Chat"), /* @__PURE__ */ mithril_default("a", {
      href: "https://github.com/MithrilJS/mithril.js"
    }, "GitHub")), navSections?.length ? mithril_default(NavSections, { sections: navSections }) : null)), /* @__PURE__ */ mithril_default("main", null, /* @__PURE__ */ mithril_default("div", {
      class: "body"
    }, mithril_default.trust(page.content), /* @__PURE__ */ mithril_default("div", {
      class: "footer"
    }, /* @__PURE__ */ mithril_default("div", null, "License: MIT. © Mithril Contributors."), /* @__PURE__ */ mithril_default("div", null, /* @__PURE__ */ mithril_default("a", {
      href: `https://github.com/MithrilJS/docs/edit/main/docs/${currentPath.replace(".html", ".md").replace(/^\//, "")}`
    }, "Edit"))))));
  }
  oncreate(_vnode) {
    const hamburger = document.querySelector(".hamburger");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        document.body.className = document.body.className === "navigating" ? "" : "navigating";
      });
    }
    const navList = document.querySelector("h1 + ul");
    if (navList) {
      navList.addEventListener("click", () => {
        document.body.className = "";
      });
    }
  }
}

// components/doc-page.tsx
class DocPageComponent extends MithrilComponent {
  view(vnode) {
    if (!vnode.attrs.page) {
      return mithril_default("div", "No page data");
    }
    return mithril_default(Layout, {
      page: vnode.attrs.page,
      routePath: vnode.attrs.routePath,
      navGuides: vnode.attrs.navGuides,
      navMethods: vnode.attrs.navMethods,
      version: vnode.attrs.version
    });
  }
}

// components/doc-loader.tsx
class DocLoader extends MithrilComponent {
  async oninit(vnode) {
    const attrs = vnode.attrs;
    const isServer = typeof window === "undefined";
    if (isServer) {
      const { loadMarkdownFromDocs: loadMarkdownFromDocs2 } = await Promise.resolve().then(() => (init_markdown(), exports_markdown));
      const {
        getNavGuides: getNavGuides2,
        getNavMethods: getNavMethods2,
        getNavGuidesStructure: getNavGuidesStructure2,
        getNavMethodsStructure: getNavMethodsStructure2
      } = await Promise.resolve().then(() => (init_nav(), exports_nav));
      try {
        const [page, , , navGuidesStructure, navMethodsStructure] = await Promise.all([
          loadMarkdownFromDocs2(attrs.docName),
          getNavGuides2(),
          getNavMethods2(),
          getNavGuidesStructure2(),
          getNavMethodsStructure2()
        ]);
        if (!page) {
          $docs.error = `Page "${attrs.routePath}" not found`;
        } else {
          $docs.page = page;
          $docs.navGuides = navGuidesStructure;
          $docs.navMethods = navMethodsStructure;
          $docs.routePath = attrs.routePath;
        }
      } catch (err) {
        $docs.error = err instanceof Error ? err.message : "Unknown error";
      } finally {
        $docs.loading = false;
      }
    } else {
      if ($docs.routePath === attrs.routePath && $docs.page && !$docs.loading) {
        return;
      }
      $docs.loading = true;
      $docs.error = null;
      try {
        const res = await fetch(`/api/docs/${attrs.docName}`);
        if (!res.ok) {
          $docs.error = `Page "${attrs.routePath}" not found`;
        } else {
          const { page, navGuidesStructure, navMethodsStructure } = await res.json();
          $docs.page = page;
          $docs.navGuides = navGuidesStructure ?? [];
          $docs.navMethods = navMethodsStructure ?? [];
          $docs.routePath = attrs.routePath;
        }
      } catch (err) {
        $docs.error = err instanceof Error ? err.message : "Unknown error";
      } finally {
        $docs.loading = false;
      }
    }
  }
  view() {
    if ($docs.loading) {
      return mithril_default("div", "Loading...");
    }
    if ($docs.error || !$docs.page) {
      return mithril_default("div", [
        mithril_default("h1", "404 - Page Not Found"),
        mithril_default("p", $docs.error || `The page "${$docs.routePath}" could not be found.`)
      ]);
    }
    return mithril_default(DocPageComponent, {
      page: $docs.page,
      routePath: $docs.routePath,
      navGuides: $docs.navGuides,
      navMethods: $docs.navMethods
    });
  }
}

// routes.ts
var routeMap = {
  "/": "index",
  "/installation.html": "installation",
  "/simple-application.html": "simple-application",
  "/learning-mithril.html": "learning-mithril",
  "/support.html": "support",
  "/jsx.html": "jsx",
  "/es6.html": "es6",
  "/animation.html": "animation",
  "/testing.html": "testing",
  "/examples.html": "examples",
  "/integrating-libs.html": "integrating-libs",
  "/paths.html": "paths",
  "/vnodes.html": "vnodes",
  "/components.html": "components",
  "/lifecycle-methods.html": "lifecycle-methods",
  "/keys.html": "keys",
  "/autoredraw.html": "autoredraw",
  "/contributing.html": "contributing",
  "/credits.html": "credits",
  "/code-of-conduct.html": "code-of-conduct",
  "/framework-comparison.html": "framework-comparison",
  "/archives.html": "archives",
  "/api.html": "api",
  "/hyperscript.html": "hyperscript",
  "/render.html": "render",
  "/mount.html": "mount",
  "/route.html": "route",
  "/request.html": "request",
  "/parseQueryString.html": "parseQueryString",
  "/buildQueryString.html": "buildQueryString",
  "/buildPathname.html": "buildPathname",
  "/parsePathname.html": "parsePathname",
  "/trust.html": "trust",
  "/fragment.html": "fragment",
  "/redraw.html": "redraw",
  "/censor.html": "censor",
  "/stream.html": "stream"
};
function createRoute(routePath, docName) {
  return {
    render: (vnode) => {
      const actualRoutePath = vnode.attrs?.routePath || routePath;
      const result = mithril_default(DocLoader, {
        key: actualRoutePath,
        routePath: actualRoutePath,
        docName
      });
      if (!result || !result.tag) {
        return mithril_default("div", `Error loading route: ${routePath}`);
      }
      return result;
    }
  };
}
function getRoutes() {
  const routes = {};
  for (const [path, docName] of Object.entries(routeMap)) {
    routes[path] = createRoute(path, docName);
    if (path !== "/" && path.endsWith(".html")) {
      routes[path.replace(/\.html$/, ".md")] = createRoute(path, docName);
    }
  }
  return routes;
}

// client.tsx
var app = document.getElementById("app");
if (!app)
  throw new Error("Missing #app element");
var ssrStateScript = document.getElementById("__SSR_STATE__");
if (ssrStateScript?.textContent) {
  try {
    deserializeAllStates(JSON.parse(ssrStateScript.textContent));
  } catch (err) {
    console.warn("Failed to deserialize SSR state:", err);
  }
}
var routes = getRoutes();
mithril_default.route.prefix = "";
try {
  mithril_default.route(app, "/", routes);
} catch (err) {
  app.innerHTML = `<div style="padding:20px;font-family:sans-serif">
		<h1>Error loading docs</h1>
		<pre style="background:#f5f5f5;padding:10px;overflow:auto">${String(err instanceof Error ? err.message : err)}</pre>
	</div>`;
  throw err;
}

//# debugId=862F0C1EE724925064756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmVzbS5qcyIsICJub2RlOnBhdGgiLCAiLi4vbWFya2Rvd24udHMiLCAiLi4vbmF2LnRzIiwgIi4uLy4uLy4uL3V0aWwvaGFzT3duLnRzIiwgIi4uLy4uLy4uL3JlbmRlci92bm9kZS50cyIsICIuLi8uLi8uLi9yZW5kZXIvaHlwZXJzY3JpcHRWbm9kZS50cyIsICIuLi8uLi8uLi9yZW5kZXIvZW1wdHlBdHRycy50cyIsICIuLi8uLi8uLi9yZW5kZXIvY2FjaGVkQXR0cnNJc1N0YXRpY01hcC50cyIsICIuLi8uLi8uLi9yZW5kZXIvdHJ1c3QudHMiLCAiLi4vLi4vLi4vcmVuZGVyL2ZyYWdtZW50LnRzIiwgIi4uLy4uLy4uL3JlbmRlci9oeXBlcnNjcmlwdC50cyIsICIuLi8uLi8uLi9zc3JDb250ZXh0LnRzIiwgIi4uLy4uLy4uL3NpZ25hbC50cyIsICIuLi8uLi8uLi9hcGkvbW91bnQtcmVkcmF3LnRzIiwgIi4uLy4uLy4uL3V0aWwvZGVjb2RlVVJJQ29tcG9uZW50U2FmZS50cyIsICIuLi8uLi8uLi9xdWVyeXN0cmluZy9idWlsZC50cyIsICIuLi8uLi8uLi9wYXRobmFtZS9idWlsZC50cyIsICIuLi8uLi8uLi9xdWVyeXN0cmluZy9wYXJzZS50cyIsICIuLi8uLi8uLi9wYXRobmFtZS9wYXJzZS50cyIsICIuLi8uLi8uLi9wYXRobmFtZS9jb21waWxlVGVtcGxhdGUudHMiLCAiLi4vLi4vLi4vdXRpbC9jZW5zb3IudHMiLCAiLi4vLi4vLi4vdXRpbC91cmkudHMiLCAiLi4vLi4vLi4vc2VydmVyL2xvZ2dlci50cyIsICIuLi8uLi8uLi9zZXJ2ZXIvc3NyTG9nZ2VyLnRzIiwgIi4uLy4uLy4uL2FwaS9yb3V0ZXIudHMiLCAiLi4vLi4vLi4vdXRpbC9zc3IudHMiLCAiLi4vLi4vLi4vcmVuZGVyL2RlbGF5ZWRSZW1vdmFsLnRzIiwgIi4uLy4uLy4uL3JlbmRlci9kb21Gb3IudHMiLCAiLi4vLi4vLi4vcmVuZGVyL3JlbmRlci50cyIsICIuLi8uLi8uLi91dGlsL25leHRfdGljay50cyIsICIuLi8uLi8uLi9zdGF0ZS50cyIsICIuLi8uLi8uLi9yZW5kZXIvc3NyU3RhdGUudHMiLCAiLi4vLi4vLi4vc3RvcmUudHMiLCAiLi4vLi4vLi4vaW5kZXgudHMiLCAiLi4vc3RvcmUudHMiLCAiLi4vY29tcG9uZW50cy9uYXYtc2VjdGlvbnMudHN4IiwgIi4uL2NvbXBvbmVudHMvbGF5b3V0LnRzeCIsICIuLi9jb21wb25lbnRzL2RvYy1wYWdlLnRzeCIsICIuLi9jb21wb25lbnRzL2RvYy1sb2FkZXIudHN4IiwgIi4uL3JvdXRlcy50cyIsICIuLi9jbGllbnQudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogbWFya2VkIHYxNC4xLjQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMjQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkXG4gKi9cblxuLyoqXG4gKiBETyBOT1QgRURJVCBUSElTIEZJTEVcbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgZnJvbSBmaWxlcyBpbiAuL3NyYy9cbiAqL1xuXG4vKipcbiAqIEdldHMgdGhlIG9yaWdpbmFsIG1hcmtlZCBkZWZhdWx0IG9wdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIF9nZXREZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgIGJyZWFrczogZmFsc2UsXG4gICAgICAgIGV4dGVuc2lvbnM6IG51bGwsXG4gICAgICAgIGdmbTogdHJ1ZSxcbiAgICAgICAgaG9va3M6IG51bGwsXG4gICAgICAgIHBlZGFudGljOiBmYWxzZSxcbiAgICAgICAgcmVuZGVyZXI6IG51bGwsXG4gICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICAgIHRva2VuaXplcjogbnVsbCxcbiAgICAgICAgd2Fsa1Rva2VuczogbnVsbCxcbiAgICB9O1xufVxubGV0IF9kZWZhdWx0cyA9IF9nZXREZWZhdWx0cygpO1xuZnVuY3Rpb24gY2hhbmdlRGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBfZGVmYXVsdHMgPSBuZXdEZWZhdWx0cztcbn1cblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cbmNvbnN0IGVzY2FwZVRlc3QgPSAvWyY8PlwiJ10vO1xuY29uc3QgZXNjYXBlUmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdC5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVUZXN0Tm9FbmNvZGUgPSAvWzw+XCInXXwmKD8hKCNcXGR7MSw3fXwjW1h4XVthLWZBLUYwLTldezEsNn18XFx3Kyk7KS87XG5jb25zdCBlc2NhcGVSZXBsYWNlTm9FbmNvZGUgPSBuZXcgUmVnRXhwKGVzY2FwZVRlc3ROb0VuY29kZS5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVSZXBsYWNlbWVudHMgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxufTtcbmNvbnN0IGdldEVzY2FwZVJlcGxhY2VtZW50ID0gKGNoKSA9PiBlc2NhcGVSZXBsYWNlbWVudHNbY2hdO1xuZnVuY3Rpb24gZXNjYXBlJDEoaHRtbCwgZW5jb2RlKSB7XG4gICAgaWYgKGVuY29kZSkge1xuICAgICAgICBpZiAoZXNjYXBlVGVzdC50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2UsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGVzY2FwZVRlc3ROb0VuY29kZS50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2VOb0VuY29kZSwgZ2V0RXNjYXBlUmVwbGFjZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBodG1sO1xufVxuY29uc3QgY2FyZXQgPSAvKF58W15cXFtdKVxcXi9nO1xuZnVuY3Rpb24gZWRpdChyZWdleCwgb3B0KSB7XG4gICAgbGV0IHNvdXJjZSA9IHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgPyByZWdleCA6IHJlZ2V4LnNvdXJjZTtcbiAgICBvcHQgPSBvcHQgfHwgJyc7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgICByZXBsYWNlOiAobmFtZSwgdmFsKSA9PiB7XG4gICAgICAgICAgICBsZXQgdmFsU291cmNlID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgPyB2YWwgOiB2YWwuc291cmNlO1xuICAgICAgICAgICAgdmFsU291cmNlID0gdmFsU291cmNlLnJlcGxhY2UoY2FyZXQsICckMScpO1xuICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmFtZSwgdmFsU291cmNlKTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFJlZ2V4OiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIG9wdCk7XG4gICAgICAgIH0sXG4gICAgfTtcbiAgICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gY2xlYW5VcmwoaHJlZikge1xuICAgIHRyeSB7XG4gICAgICAgIGhyZWYgPSBlbmNvZGVVUkkoaHJlZikucmVwbGFjZSgvJTI1L2csICclJyk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBocmVmO1xufVxuY29uc3Qgbm9vcFRlc3QgPSB7IGV4ZWM6ICgpID0+IG51bGwgfTtcbmZ1bmN0aW9uIHNwbGl0Q2VsbHModGFibGVSb3csIGNvdW50KSB7XG4gICAgLy8gZW5zdXJlIHRoYXQgZXZlcnkgY2VsbC1kZWxpbWl0aW5nIHBpcGUgaGFzIGEgc3BhY2VcbiAgICAvLyBiZWZvcmUgaXQgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSBhbiBlc2NhcGVkIHBpcGVcbiAgICBjb25zdCByb3cgPSB0YWJsZVJvdy5yZXBsYWNlKC9cXHwvZywgKG1hdGNoLCBvZmZzZXQsIHN0cikgPT4ge1xuICAgICAgICBsZXQgZXNjYXBlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgY3VyciA9IG9mZnNldDtcbiAgICAgICAgd2hpbGUgKC0tY3VyciA+PSAwICYmIHN0cltjdXJyXSA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAgICAgLy8gb2RkIG51bWJlciBvZiBzbGFzaGVzIG1lYW5zIHwgaXMgZXNjYXBlZFxuICAgICAgICAgICAgLy8gc28gd2UgbGVhdmUgaXQgYWxvbmVcbiAgICAgICAgICAgIHJldHVybiAnfCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBhZGQgc3BhY2UgYmVmb3JlIHVuZXNjYXBlZCB8XG4gICAgICAgICAgICByZXR1cm4gJyB8JztcbiAgICAgICAgfVxuICAgIH0pLCBjZWxscyA9IHJvdy5zcGxpdCgvIFxcfC8pO1xuICAgIGxldCBpID0gMDtcbiAgICAvLyBGaXJzdC9sYXN0IGNlbGwgaW4gYSByb3cgY2Fubm90IGJlIGVtcHR5IGlmIGl0IGhhcyBubyBsZWFkaW5nL3RyYWlsaW5nIHBpcGVcbiAgICBpZiAoIWNlbGxzWzBdLnRyaW0oKSkge1xuICAgICAgICBjZWxscy5zaGlmdCgpO1xuICAgIH1cbiAgICBpZiAoY2VsbHMubGVuZ3RoID4gMCAmJiAhY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0udHJpbSgpKSB7XG4gICAgICAgIGNlbGxzLnBvcCgpO1xuICAgIH1cbiAgICBpZiAoY291bnQpIHtcbiAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCA+IGNvdW50KSB7XG4gICAgICAgICAgICBjZWxscy5zcGxpY2UoY291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGNlbGxzLmxlbmd0aCA8IGNvdW50KVxuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goJycpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGlzIGlnbm9yZWQgcGVyIHRoZSBnZm0gc3BlY1xuICAgICAgICBjZWxsc1tpXSA9IGNlbGxzW2ldLnRyaW0oKS5yZXBsYWNlKC9cXFxcXFx8L2csICd8Jyk7XG4gICAgfVxuICAgIHJldHVybiBjZWxscztcbn1cbi8qKlxuICogUmVtb3ZlIHRyYWlsaW5nICdjJ3MuIEVxdWl2YWxlbnQgdG8gc3RyLnJlcGxhY2UoL2MqJC8sICcnKS5cbiAqIC9jKiQvIGlzIHZ1bG5lcmFibGUgdG8gUkVET1MuXG4gKlxuICogQHBhcmFtIHN0clxuICogQHBhcmFtIGNcbiAqIEBwYXJhbSBpbnZlcnQgUmVtb3ZlIHN1ZmZpeCBvZiBub24tYyBjaGFycyBpbnN0ZWFkLiBEZWZhdWx0IGZhbHNleS5cbiAqL1xuZnVuY3Rpb24gcnRyaW0oc3RyLCBjLCBpbnZlcnQpIHtcbiAgICBjb25zdCBsID0gc3RyLmxlbmd0aDtcbiAgICBpZiAobCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIC8vIExlbmd0aCBvZiBzdWZmaXggbWF0Y2hpbmcgdGhlIGludmVydCBjb25kaXRpb24uXG4gICAgbGV0IHN1ZmZMZW4gPSAwO1xuICAgIC8vIFN0ZXAgbGVmdCB1bnRpbCB3ZSBmYWlsIHRvIG1hdGNoIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICAgIHdoaWxlIChzdWZmTGVuIDwgbCkge1xuICAgICAgICBjb25zdCBjdXJyQ2hhciA9IHN0ci5jaGFyQXQobCAtIHN1ZmZMZW4gLSAxKTtcbiAgICAgICAgaWYgKGN1cnJDaGFyID09PSBjICYmICFpbnZlcnQpIHtcbiAgICAgICAgICAgIHN1ZmZMZW4rKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdXJyQ2hhciAhPT0gYyAmJiBpbnZlcnQpIHtcbiAgICAgICAgICAgIHN1ZmZMZW4rKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHIuc2xpY2UoMCwgbCAtIHN1ZmZMZW4pO1xufVxuZnVuY3Rpb24gZmluZENsb3NpbmdCcmFja2V0KHN0ciwgYikge1xuICAgIGlmIChzdHIuaW5kZXhPZihiWzFdKSA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBsZXQgbGV2ZWwgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzdHJbaV0gPT09ICdcXFxcJykge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0cltpXSA9PT0gYlswXSkge1xuICAgICAgICAgICAgbGV2ZWwrKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdHJbaV0gPT09IGJbMV0pIHtcbiAgICAgICAgICAgIGxldmVsLS07XG4gICAgICAgICAgICBpZiAobGV2ZWwgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBvdXRwdXRMaW5rKGNhcCwgbGluaywgcmF3LCBsZXhlcikge1xuICAgIGNvbnN0IGhyZWYgPSBsaW5rLmhyZWY7XG4gICAgY29uc3QgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlJDEobGluay50aXRsZSkgOiBudWxsO1xuICAgIGNvbnN0IHRleHQgPSBjYXBbMV0ucmVwbGFjZSgvXFxcXChbXFxbXFxdXSkvZywgJyQxJyk7XG4gICAgaWYgKGNhcFswXS5jaGFyQXQoMCkgIT09ICchJykge1xuICAgICAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB0b2tlbnM6IGxleGVyLmlubGluZVRva2Vucyh0ZXh0KSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcmF3LFxuICAgICAgICBocmVmLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgdGV4dDogZXNjYXBlJDEodGV4dCksXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGluZGVudENvZGVDb21wZW5zYXRpb24ocmF3LCB0ZXh0KSB7XG4gICAgY29uc3QgbWF0Y2hJbmRlbnRUb0NvZGUgPSByYXcubWF0Y2goL14oXFxzKykoPzpgYGApLyk7XG4gICAgaWYgKG1hdGNoSW5kZW50VG9Db2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnRUb0NvZGUgPSBtYXRjaEluZGVudFRvQ29kZVsxXTtcbiAgICByZXR1cm4gdGV4dFxuICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoSW5kZW50SW5Ob2RlID0gbm9kZS5tYXRjaCgvXlxccysvKTtcbiAgICAgICAgaWYgKG1hdGNoSW5kZW50SW5Ob2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbaW5kZW50SW5Ob2RlXSA9IG1hdGNoSW5kZW50SW5Ob2RlO1xuICAgICAgICBpZiAoaW5kZW50SW5Ob2RlLmxlbmd0aCA+PSBpbmRlbnRUb0NvZGUubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5zbGljZShpbmRlbnRUb0NvZGUubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9KVxuICAgICAgICAuam9pbignXFxuJyk7XG59XG4vKipcbiAqIFRva2VuaXplclxuICovXG5jbGFzcyBfVG9rZW5pemVyIHtcbiAgICBvcHRpb25zO1xuICAgIHJ1bGVzOyAvLyBzZXQgYnkgdGhlIGxleGVyXG4gICAgbGV4ZXI7IC8vIHNldCBieSB0aGUgbGV4ZXJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgX2RlZmF1bHRzO1xuICAgIH1cbiAgICBzcGFjZShzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5uZXdsaW5lLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCAmJiBjYXBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3BhY2UnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2RlKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmNvZGUuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14oPzogezEsNH18IHswLDN9XFx0KS9nbSwgJycpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICAgICAgY29kZUJsb2NrU3R5bGU6ICdpbmRlbnRlZCcsXG4gICAgICAgICAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgICAgICAgICA/IHJ0cmltKHRleHQsICdcXG4nKVxuICAgICAgICAgICAgICAgICAgICA6IHRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZlbmNlcyhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5mZW5jZXMuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBjb25zdCByYXcgPSBjYXBbMF07XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gaW5kZW50Q29kZUNvbXBlbnNhdGlvbihyYXcsIGNhcFszXSB8fCAnJyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgICAgICAgICByYXcsXG4gICAgICAgICAgICAgICAgbGFuZzogY2FwWzJdID8gY2FwWzJdLnRyaW0oKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLCAnJDEnKSA6IGNhcFsyXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBoZWFkaW5nKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhlYWRpbmcuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNhcFsyXS50cmltKCk7XG4gICAgICAgICAgICAvLyByZW1vdmUgdHJhaWxpbmcgI3NcbiAgICAgICAgICAgIGlmICgvIyQvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmltbWVkID0gcnRyaW0odGV4dCwgJyMnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXRyaW1tZWQgfHwgLyAkLy50ZXN0KHRyaW1tZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbW1vbk1hcmsgcmVxdWlyZXMgc3BhY2UgYmVmb3JlIHRyYWlsaW5nICNzXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGhyKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhyLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnaHInLFxuICAgICAgICAgICAgICAgIHJhdzogcnRyaW0oY2FwWzBdLCAnXFxuJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGJsb2NrcXVvdGUoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suYmxvY2txdW90ZS5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCBsaW5lcyA9IHJ0cmltKGNhcFswXSwgJ1xcbicpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgIGxldCByYXcgPSAnJztcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgICAgICBjb25zdCB0b2tlbnMgPSBbXTtcbiAgICAgICAgICAgIHdoaWxlIChsaW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGluQmxvY2txdW90ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBpO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgbGluZXMgdXAgdG8gYSBjb250aW51YXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eIHswLDN9Pi8udGVzdChsaW5lc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRMaW5lcy5wdXNoKGxpbmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluQmxvY2txdW90ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWluQmxvY2txdW90ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudExpbmVzLnB1c2gobGluZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGluZXMgPSBsaW5lcy5zbGljZShpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50UmF3ID0gY3VycmVudExpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUZXh0ID0gY3VycmVudFJhd1xuICAgICAgICAgICAgICAgICAgICAvLyBwcmVjZWRlIHNldGV4dCBjb250aW51YXRpb24gd2l0aCA0IHNwYWNlcyBzbyBpdCBpc24ndCBhIHNldGV4dFxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuIHswLDN9KCg/Oj0rfC0rKSAqKSg/PVxcbnwkKS9nLCAnXFxuICAgICQxJylcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14gezAsM30+WyBcXHRdPy9nbSwgJycpO1xuICAgICAgICAgICAgICAgIHJhdyA9IHJhdyA/IGAke3Jhd31cXG4ke2N1cnJlbnRSYXd9YCA6IGN1cnJlbnRSYXc7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQgPyBgJHt0ZXh0fVxcbiR7Y3VycmVudFRleHR9YCA6IGN1cnJlbnRUZXh0O1xuICAgICAgICAgICAgICAgIC8vIHBhcnNlIGJsb2NrcXVvdGUgbGluZXMgYXMgdG9wIGxldmVsIHRva2Vuc1xuICAgICAgICAgICAgICAgIC8vIG1lcmdlIHBhcmFncmFwaHMgaWYgdGhpcyBpcyBhIGNvbnRpbnVhdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcCA9IHRoaXMubGV4ZXIuc3RhdGUudG9wO1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLmJsb2NrVG9rZW5zKGN1cnJlbnRUZXh0LCB0b2tlbnMsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdG9wO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGNvbnRpbnVhdGlvbiB0aGVuIHdlIGFyZSBkb25lXG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuPy50eXBlID09PSAnY29kZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYmxvY2txdW90ZSBjb250aW51YXRpb24gY2Fubm90IGJlIHByZWNlZGVkIGJ5IGEgY29kZSBibG9ja1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobGFzdFRva2VuPy50eXBlID09PSAnYmxvY2txdW90ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jbHVkZSBjb250aW51YXRpb24gaW4gbmVzdGVkIGJsb2NrcXVvdGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkVG9rZW4gPSBsYXN0VG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RleHQgPSBvbGRUb2tlbi5yYXcgKyAnXFxuJyArIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdUb2tlbiA9IHRoaXMuYmxvY2txdW90ZShuZXdUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IG5ld1Rva2VuO1xuICAgICAgICAgICAgICAgICAgICByYXcgPSByYXcuc3Vic3RyaW5nKDAsIHJhdy5sZW5ndGggLSBvbGRUb2tlbi5yYXcubGVuZ3RoKSArIG5ld1Rva2VuLnJhdztcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoIC0gb2xkVG9rZW4udGV4dC5sZW5ndGgpICsgbmV3VG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxhc3RUb2tlbj8udHlwZSA9PT0gJ2xpc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluY2x1ZGUgY29udGludWF0aW9uIGluIG5lc3RlZCBsaXN0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFRva2VuID0gbGFzdFRva2VuO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdUZXh0ID0gb2xkVG9rZW4ucmF3ICsgJ1xcbicgKyBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VG9rZW4gPSB0aGlzLmxpc3QobmV3VGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0gPSBuZXdUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgcmF3ID0gcmF3LnN1YnN0cmluZygwLCByYXcubGVuZ3RoIC0gbGFzdFRva2VuLnJhdy5sZW5ndGgpICsgbmV3VG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGggLSBvbGRUb2tlbi5yYXcubGVuZ3RoKSArIG5ld1Rva2VuLnJhdztcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBuZXdUZXh0LnN1YnN0cmluZyh0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLnJhdy5sZW5ndGgpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2txdW90ZScsXG4gICAgICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgICAgIHRva2VucyxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsaXN0KHNyYykge1xuICAgICAgICBsZXQgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saXN0LmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgbGV0IGJ1bGwgPSBjYXBbMV0udHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgaXNvcmRlcmVkID0gYnVsbC5sZW5ndGggPiAxO1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgICAgICAgICAgcmF3OiAnJyxcbiAgICAgICAgICAgICAgICBvcmRlcmVkOiBpc29yZGVyZWQsXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGlzb3JkZXJlZCA/ICtidWxsLnNsaWNlKDAsIC0xKSA6ICcnLFxuICAgICAgICAgICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGBcXFxcZHsxLDl9XFxcXCR7YnVsbC5zbGljZSgtMSl9YCA6IGBcXFxcJHtidWxsfWA7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGJ1bGwgOiAnWyorLV0nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gR2V0IG5leHQgbGlzdCBpdGVtXG4gICAgICAgICAgICBjb25zdCBpdGVtUmVnZXggPSBuZXcgUmVnRXhwKGBeKCB7MCwzfSR7YnVsbH0pKCg/OltcXHQgXVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgICBsZXQgZW5kc1dpdGhCbGFua0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGN1cnJlbnQgYnVsbGV0IHBvaW50IGNhbiBzdGFydCBhIG5ldyBMaXN0IEl0ZW1cbiAgICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgICAgICBsZXQgZW5kRWFybHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsZXQgcmF3ID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW1Db250ZW50cyA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICghKGNhcCA9IGl0ZW1SZWdleC5leGVjKHNyYykpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ydWxlcy5ibG9jay5oci50ZXN0KHNyYykpIHsgLy8gRW5kIGxpc3QgaWYgYnVsbGV0IHdhcyBhY3R1YWxseSBIUiAocG9zc2libHkgbW92ZSBpbnRvIGl0ZW1SZWdleD8pXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYXcgPSBjYXBbMF07XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQgbGluZSA9IGNhcFsyXS5zcGxpdCgnXFxuJywgMSlbMF0ucmVwbGFjZSgvXlxcdCsvLCAodCkgPT4gJyAnLnJlcGVhdCgzICogdC5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dExpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgICAgIGxldCBibGFua0xpbmUgPSAhbGluZS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSAyO1xuICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnRyaW1TdGFydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChibGFua0xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gY2FwWzFdLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBjYXBbMl0uc2VhcmNoKC9bXiBdLyk7IC8vIEZpbmQgZmlyc3Qgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gaW5kZW50ID4gNCA/IDEgOiBpbmRlbnQ7IC8vIFRyZWF0IGluZGVudGVkIGNvZGUgYmxvY2tzICg+IDQgc3BhY2VzKSBhcyBoYXZpbmcgb25seSAxIGluZGVudFxuICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCArPSBjYXBbMV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lICYmIC9eWyBcXHRdKiQvLnRlc3QobmV4dExpbmUpKSB7IC8vIEl0ZW1zIGJlZ2luIHdpdGggYXQgbW9zdCBvbmUgYmxhbmsgbGluZVxuICAgICAgICAgICAgICAgICAgICByYXcgKz0gbmV4dExpbmUgKyAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhuZXh0TGluZS5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kRWFybHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVuZEVhcmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRCdWxsZXRSZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86WyorLV18XFxcXGR7MSw5fVsuKV0pKCg/OlsgXFx0XVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhyUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSgoPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlbmNlc0JlZ2luUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlxcYFxcYFxcYHx+fn4pYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRpbmdCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0jYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX08KD86W2Etel0uKj58IS0tKWAsICdpJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGZvbGxvd2luZyBsaW5lcyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gTGlzdCBJdGVtXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0xpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5leHRMaW5lV2l0aG91dFRhYnM7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0TGluZSA9IHJhd0xpbmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZS1hbGlnbiB0byBmb2xsb3cgY29tbW9ubWFyayBuZXN0aW5nIHJ1bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dExpbmUgPSBuZXh0TGluZS5yZXBsYWNlKC9eIHsxLDR9KD89KCB7NH0pKlteIF0pL2csICcgICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRMaW5lV2l0aG91dFRhYnMgPSBuZXh0TGluZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRMaW5lV2l0aG91dFRhYnMgPSBuZXh0TGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgY29kZSBmZW5jZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBoZWFkaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgaHRtbCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWxCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBidWxsZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0QnVsbGV0UmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhvcml6b250YWwgcnVsZSBmb3VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhyUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0TGluZVdpdGhvdXRUYWJzLnNlYXJjaCgvW14gXS8pID49IGluZGVudCB8fCAhbmV4dExpbmUudHJpbSgpKSB7IC8vIERlZGVudCBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lV2l0aG91dFRhYnMuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBlbm91Z2ggaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwYXJhZ3JhcGggY29udGludWF0aW9uIHVubGVzcyBsYXN0IGxpbmUgd2FzIGEgZGlmZmVyZW50IGJsb2NrIGxldmVsIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKS5zZWFyY2goL1teIF0vKSA+PSA0KSB7IC8vIGluZGVudGVkIGNvZGUgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFkaW5nQmVnaW5SZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgKz0gJ1xcbicgKyBuZXh0TGluZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmxhbmtMaW5lICYmICFuZXh0TGluZS50cmltKCkpIHsgLy8gQ2hlY2sgaWYgY3VycmVudCBsaW5lIGlzIGJsYW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdyArPSByYXdMaW5lICsgJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHJhd0xpbmUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV4dExpbmVXaXRob3V0VGFicy5zbGljZShpbmRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghbGlzdC5sb29zZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgaXRlbSBlbmRlZCB3aXRoIGEgYmxhbmsgbGluZSwgdGhlIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoQmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Lmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICgvXFxuWyBcXHRdKlxcblsgXFx0XSokLy50ZXN0KHJhdykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNXaXRoQmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaXN0YXNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsZXQgaXNjaGVja2VkO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciB0YXNrIGxpc3QgaXRlbXNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgICAgICAgICAgICAgICBpc3Rhc2sgPSAvXlxcW1sgeFhdXFxdIC8uZXhlYyhpdGVtQ29udGVudHMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXN0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc2NoZWNrZWQgPSBpc3Rhc2tbMF0gIT09ICdbIF0gJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGl0ZW1Db250ZW50cy5yZXBsYWNlKC9eXFxbWyB4WF1cXF0gKy8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsaXN0Lml0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgICAgICAgICB0YXNrOiAhIWlzdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogaXNjaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICBsb29zZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW1Db250ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zOiBbXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsaXN0LnJhdyArPSByYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEbyBub3QgY29uc3VtZSBuZXdsaW5lcyBhdCBlbmQgb2YgZmluYWwgaXRlbS4gQWx0ZXJuYXRpdmVseSwgbWFrZSBpdGVtUmVnZXggKnN0YXJ0KiB3aXRoIGFueSBuZXdsaW5lcyB0byBzaW1wbGlmeS9zcGVlZCB1cCBlbmRzV2l0aEJsYW5rTGluZSBsb2dpY1xuICAgICAgICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnJhdyA9IGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS5yYXcudHJpbUVuZCgpO1xuICAgICAgICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnRleHQgPSBsaXN0Lml0ZW1zW2xpc3QuaXRlbXMubGVuZ3RoIC0gMV0udGV4dC50cmltRW5kKCk7XG4gICAgICAgICAgICBsaXN0LnJhdyA9IGxpc3QucmF3LnRyaW1FbmQoKTtcbiAgICAgICAgICAgIC8vIEl0ZW0gY2hpbGQgdG9rZW5zIGhhbmRsZWQgaGVyZSBhdCBlbmQgYmVjYXVzZSB3ZSBuZWVkZWQgdG8gaGF2ZSB0aGUgZmluYWwgaXRlbSB0byB0cmltIGl0IGZpcnN0XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxpc3QuaXRlbXNbaV0udG9rZW5zID0gdGhpcy5sZXhlci5ibG9ja1Rva2VucyhsaXN0Lml0ZW1zW2ldLnRleHQsIFtdKTtcbiAgICAgICAgICAgICAgICBpZiAoIWxpc3QubG9vc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgbGlzdCBzaG91bGQgYmUgbG9vc2VcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BhY2VycyA9IGxpc3QuaXRlbXNbaV0udG9rZW5zLmZpbHRlcih0ID0+IHQudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc011bHRpcGxlTGluZUJyZWFrcyA9IHNwYWNlcnMubGVuZ3RoID4gMCAmJiBzcGFjZXJzLnNvbWUodCA9PiAvXFxuLipcXG4vLnRlc3QodC5yYXcpKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5sb29zZSA9IGhhc011bHRpcGxlTGluZUJyZWFrcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZXQgYWxsIGl0ZW1zIHRvIGxvb3NlIGlmIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICAgIGlmIChsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuaXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGh0bWwoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHRtbC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICBibG9jazogdHJ1ZSxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBwcmU6IGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScsXG4gICAgICAgICAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWYoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suZGVmLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdGFnID0gY2FwWzFdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGNhcFsyXSA/IGNhcFsyXS5yZXBsYWNlKC9ePCguKik+JC8sICckMScpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogJyc7XG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGNhcFszXSA/IGNhcFszXS5zdWJzdHJpbmcoMSwgY2FwWzNdLmxlbmd0aCAtIDEpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogY2FwWzNdO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGVmJyxcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICAgICAgaHJlZixcbiAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGFibGUoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGFibGUuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoIWNhcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghL1s6fF0vLnRlc3QoY2FwWzJdKSkge1xuICAgICAgICAgICAgLy8gZGVsaW1pdGVyIHJvdyBtdXN0IGhhdmUgYSBwaXBlICh8KSBvciBjb2xvbiAoOikgb3RoZXJ3aXNlIGl0IGlzIGEgc2V0ZXh0IGhlYWRpbmdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJzID0gc3BsaXRDZWxscyhjYXBbMV0pO1xuICAgICAgICBjb25zdCBhbGlnbnMgPSBjYXBbMl0ucmVwbGFjZSgvXlxcfHxcXHwgKiQvZywgJycpLnNwbGl0KCd8Jyk7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBjYXBbM10gJiYgY2FwWzNdLnRyaW0oKSA/IGNhcFszXS5yZXBsYWNlKC9cXG5bIFxcdF0qJC8sICcnKS5zcGxpdCgnXFxuJykgOiBbXTtcbiAgICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgIGhlYWRlcjogW10sXG4gICAgICAgICAgICBhbGlnbjogW10sXG4gICAgICAgICAgICByb3dzOiBbXSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGhlYWRlcnMubGVuZ3RoICE9PSBhbGlnbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBoZWFkZXIgYW5kIGFsaWduIGNvbHVtbnMgbXVzdCBiZSBlcXVhbCwgcm93cyBjYW4gYmUgZGlmZmVyZW50LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgYWxpZ24gb2YgYWxpZ25zKSB7XG4gICAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ3JpZ2h0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ2NlbnRlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ2xlZnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW0uYWxpZ24ucHVzaChudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZW0uaGVhZGVyLnB1c2goe1xuICAgICAgICAgICAgICAgIHRleHQ6IGhlYWRlcnNbaV0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShoZWFkZXJzW2ldKSxcbiAgICAgICAgICAgICAgICBoZWFkZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgYWxpZ246IGl0ZW0uYWxpZ25baV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICBpdGVtLnJvd3MucHVzaChzcGxpdENlbGxzKHJvdywgaXRlbS5oZWFkZXIubGVuZ3RoKS5tYXAoKGNlbGwsIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjZWxsLFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNlbGwpLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbjogaXRlbS5hbGlnbltpXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbiAgICBsaGVhZGluZyhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saGVhZGluZy5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIGRlcHRoOiBjYXBbMl0uY2hhckF0KDApID09PSAnPScgPyAxIDogMixcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXBbMV0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShjYXBbMV0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJhZ3JhcGgoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sucGFyYWdyYXBoLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgICAgICAgIDogY2FwWzFdO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHRleHQoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGV4dC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIHRleHQ6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFswXSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGVzY2FwZShzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZXNjYXBlLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBlc2NhcGUkMShjYXBbMV0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0YWcoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnRhZy5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluTGluayA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmxleGVyLnN0YXRlLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjwocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjxcXC8ocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBpbkxpbms6IHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLFxuICAgICAgICAgICAgICAgIGluUmF3QmxvY2s6IHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayxcbiAgICAgICAgICAgICAgICBibG9jazogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsaW5rKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5saW5rLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZFVybCA9IGNhcFsyXS50cmltKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAvXjwvLnRlc3QodHJpbW1lZFVybCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjb21tb25tYXJrIHJlcXVpcmVzIG1hdGNoaW5nIGFuZ2xlIGJyYWNrZXRzXG4gICAgICAgICAgICAgICAgaWYgKCEoLz4kLy50ZXN0KHRyaW1tZWRVcmwpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVuZGluZyBhbmdsZSBicmFja2V0IGNhbm5vdCBiZSBlc2NhcGVkXG4gICAgICAgICAgICAgICAgY29uc3QgcnRyaW1TbGFzaCA9IHJ0cmltKHRyaW1tZWRVcmwuc2xpY2UoMCwgLTEpLCAnXFxcXCcpO1xuICAgICAgICAgICAgICAgIGlmICgodHJpbW1lZFVybC5sZW5ndGggLSBydHJpbVNsYXNoLmxlbmd0aCkgJSAyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmaW5kIGNsb3NpbmcgcGFyZW50aGVzaXNcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0UGFyZW5JbmRleCA9IGZpbmRDbG9zaW5nQnJhY2tldChjYXBbMl0sICcoKScpO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0UGFyZW5JbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gY2FwWzBdLmluZGV4T2YoJyEnKSA9PT0gMCA/IDUgOiA0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5rTGVuID0gc3RhcnQgKyBjYXBbMV0ubGVuZ3RoICsgbGFzdFBhcmVuSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBjYXBbMF0gPSBjYXBbMF0uc3Vic3RyaW5nKDAsIGxpbmtMZW4pLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgY2FwWzNdID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGhyZWYgPSBjYXBbMl07XG4gICAgICAgICAgICBsZXQgdGl0bGUgPSAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICAgICAgICAvLyBzcGxpdCBwZWRhbnRpYyBocmVmIGFuZCB0aXRsZVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmsgPSAvXihbXidcIl0qW15cXHNdKVxccysoWydcIl0pKC4qKVxcMi8uZXhlYyhocmVmKTtcbiAgICAgICAgICAgICAgICBpZiAobGluaykge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gbGlua1sxXTtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBsaW5rWzNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHJlZiA9IGhyZWYudHJpbSgpO1xuICAgICAgICAgICAgaWYgKC9ePC8udGVzdChocmVmKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBlZGFudGljIGFsbG93cyBzdGFydGluZyBhbmdsZSBicmFja2V0IHdpdGhvdXQgZW5kaW5nIGFuZ2xlIGJyYWNrZXRcbiAgICAgICAgICAgICAgICAgICAgaHJlZiA9IGhyZWYuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gaHJlZi5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZiA/IGhyZWYucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbiwgJyQxJykgOiBocmVmLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSA/IHRpdGxlLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogdGl0bGUsXG4gICAgICAgICAgICB9LCBjYXBbMF0sIHRoaXMubGV4ZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlZmxpbmsoc3JjLCBsaW5rcykge1xuICAgICAgICBsZXQgY2FwO1xuICAgICAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5rU3RyaW5nID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBsaW5rc1tsaW5rU3RyaW5nLnRvTG93ZXJDYXNlKCldO1xuICAgICAgICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXRMaW5rKGNhcCwgbGluaywgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbVN0cm9uZyhzcmMsIG1hc2tlZFNyYywgcHJldkNoYXIgPSAnJykge1xuICAgICAgICBsZXQgbWF0Y2ggPSB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ0xEZWxpbS5leGVjKHNyYyk7XG4gICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIF8gY2FuJ3QgYmUgYmV0d2VlbiB0d28gYWxwaGFudW1lcmljcy4gXFxwe0x9XFxwe059IGluY2x1ZGVzIG5vbi1lbmdsaXNoIGFscGhhYmV0L251bWJlcnMgYXMgd2VsbFxuICAgICAgICBpZiAobWF0Y2hbM10gJiYgcHJldkNoYXIubWF0Y2goL1tcXHB7TH1cXHB7Tn1dL3UpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBuZXh0Q2hhciA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8ICcnO1xuICAgICAgICBpZiAoIW5leHRDaGFyIHx8ICFwcmV2Q2hhciB8fCB0aGlzLnJ1bGVzLmlubGluZS5wdW5jdHVhdGlvbi5leGVjKHByZXZDaGFyKSkge1xuICAgICAgICAgICAgLy8gdW5pY29kZSBSZWdleCBjb3VudHMgZW1vamkgYXMgMSBjaGFyOyBzcHJlYWQgaW50byBhcnJheSBmb3IgcHJvcGVyIGNvdW50ICh1c2VkIG11bHRpcGxlIHRpbWVzIGJlbG93KVxuICAgICAgICAgICAgY29uc3QgbExlbmd0aCA9IFsuLi5tYXRjaFswXV0ubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGxldCByRGVsaW0sIHJMZW5ndGgsIGRlbGltVG90YWwgPSBsTGVuZ3RoLCBtaWREZWxpbVRvdGFsID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGVuZFJlZyA9IG1hdGNoWzBdWzBdID09PSAnKicgPyB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ1JEZWxpbUFzdCA6IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nUkRlbGltVW5kO1xuICAgICAgICAgICAgZW5kUmVnLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAvLyBDbGlwIG1hc2tlZFNyYyB0byBzYW1lIHNlY3Rpb24gb2Ygc3RyaW5nIGFzIHNyYyAobW92ZSB0byBsZXhlcj8pXG4gICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoLTEgKiBzcmMubGVuZ3RoICsgbExlbmd0aCk7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gZW5kUmVnLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJEZWxpbSA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8IG1hdGNoWzNdIHx8IG1hdGNoWzRdIHx8IG1hdGNoWzVdIHx8IG1hdGNoWzZdO1xuICAgICAgICAgICAgICAgIGlmICghckRlbGltKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gc2tpcCBzaW5nbGUgKiBpbiBfX2FiYyphYmNfX1xuICAgICAgICAgICAgICAgIHJMZW5ndGggPSBbLi4uckRlbGltXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoWzNdIHx8IG1hdGNoWzRdKSB7IC8vIGZvdW5kIGFub3RoZXIgTGVmdCBEZWxpbVxuICAgICAgICAgICAgICAgICAgICBkZWxpbVRvdGFsICs9IHJMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtYXRjaFs1XSB8fCBtYXRjaFs2XSkgeyAvLyBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbVxuICAgICAgICAgICAgICAgICAgICBpZiAobExlbmd0aCAlIDMgJiYgISgobExlbmd0aCArIHJMZW5ndGgpICUgMykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZERlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBDb21tb25NYXJrIEVtcGhhc2lzIFJ1bGVzIDktMTBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxpbVRvdGFsIC09IHJMZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGRlbGltVG90YWwgPiAwKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gSGF2ZW4ndCBmb3VuZCBlbm91Z2ggY2xvc2luZyBkZWxpbWl0ZXJzXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGV4dHJhIGNoYXJhY3RlcnMuICphKioqIC0+ICphKlxuICAgICAgICAgICAgICAgIHJMZW5ndGggPSBNYXRoLm1pbihyTGVuZ3RoLCByTGVuZ3RoICsgZGVsaW1Ub3RhbCArIG1pZERlbGltVG90YWwpO1xuICAgICAgICAgICAgICAgIC8vIGNoYXIgbGVuZ3RoIGNhbiBiZSA+MSBmb3IgdW5pY29kZSBjaGFyYWN0ZXJzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RDaGFyTGVuZ3RoID0gWy4uLm1hdGNoWzBdXVswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gc3JjLnNsaWNlKDAsIGxMZW5ndGggKyBtYXRjaC5pbmRleCArIGxhc3RDaGFyTGVuZ3RoICsgckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGBlbWAgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBvZGQgY2hhciBjb3VudC4gKmEqKipcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5taW4obExlbmd0aCwgckxlbmd0aCkgJSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgJ3N0cm9uZycgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBldmVuIGNoYXIgY291bnQuICoqYSoqKlxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMiwgLTIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJvbmcnLFxuICAgICAgICAgICAgICAgICAgICByYXcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnModGV4dCksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2Rlc3BhbihzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuY29kZS5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnJlcGxhY2UoL1xcbi9nLCAnICcpO1xuICAgICAgICAgICAgY29uc3QgaGFzTm9uU3BhY2VDaGFycyA9IC9bXiBdLy50ZXN0KHRleHQpO1xuICAgICAgICAgICAgY29uc3QgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMgPSAvXiAvLnRlc3QodGV4dCkgJiYgLyAkLy50ZXN0KHRleHQpO1xuICAgICAgICAgICAgaWYgKGhhc05vblNwYWNlQ2hhcnMgJiYgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSwgdGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMSh0ZXh0LCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NvZGVzcGFuJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBicihzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYnIuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdicicsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlbChzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZGVsLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGVsJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXBbMl0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2VucyhjYXBbMl0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhdXRvbGluayhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYXV0b2xpbmsuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgICAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMShjYXBbMV0pO1xuICAgICAgICAgICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGVzY2FwZSQxKGNhcFsxXSk7XG4gICAgICAgICAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXJsKHNyYykge1xuICAgICAgICBsZXQgY2FwO1xuICAgICAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudXJsLmV4ZWMoc3JjKSkge1xuICAgICAgICAgICAgbGV0IHRleHQsIGhyZWY7XG4gICAgICAgICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZXNjYXBlJDEoY2FwWzBdKTtcbiAgICAgICAgICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGRvIGV4dGVuZGVkIGF1dG9saW5rIHBhdGggdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgIGxldCBwcmV2Q2FwWmVybztcbiAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZDYXBaZXJvID0gY2FwWzBdO1xuICAgICAgICAgICAgICAgICAgICBjYXBbMF0gPSB0aGlzLnJ1bGVzLmlubGluZS5fYmFja3BlZGFsLmV4ZWMoY2FwWzBdKT8uWzBdID8/ICcnO1xuICAgICAgICAgICAgICAgIH0gd2hpbGUgKHByZXZDYXBaZXJvICE9PSBjYXBbMF0pO1xuICAgICAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMShjYXBbMF0pO1xuICAgICAgICAgICAgICAgIGlmIChjYXBbMV0gPT09ICd3d3cuJykge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gJ2h0dHA6Ly8nICsgY2FwWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaHJlZiA9IGNhcFswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5saW5lVGV4dChzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGV4dC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCB0ZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jaykge1xuICAgICAgICAgICAgICAgIHRleHQgPSBjYXBbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZXNjYXBlJDEoY2FwWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgbmV3bGluZSA9IC9eKD86WyBcXHRdKig/OlxcbnwkKSkrLztcbmNvbnN0IGJsb2NrQ29kZSA9IC9eKCg/OiB7NH18IHswLDN9XFx0KVteXFxuXSsoPzpcXG4oPzpbIFxcdF0qKD86XFxufCQpKSopPykrLztcbmNvbnN0IGZlbmNlcyA9IC9eIHswLDN9KGB7Myx9KD89W15gXFxuXSooPzpcXG58JCkpfH57Myx9KShbXlxcbl0qKSg/OlxcbnwkKSg/OnwoW1xcc1xcU10qPykoPzpcXG58JCkpKD86IHswLDN9XFwxW35gXSogKig/PVxcbnwkKXwkKS87XG5jb25zdCBociA9IC9eIHswLDN9KCg/Oi1bXFx0IF0qKXszLH18KD86X1sgXFx0XSopezMsfXwoPzpcXCpbIFxcdF0qKXszLH0pKD86XFxuK3wkKS87XG5jb25zdCBoZWFkaW5nID0gL14gezAsM30oI3sxLDZ9KSg/PVxcc3wkKSguKikoPzpcXG4rfCQpLztcbmNvbnN0IGJ1bGxldCA9IC8oPzpbKistXXxcXGR7MSw5fVsuKV0pLztcbmNvbnN0IGxoZWFkaW5nID0gZWRpdCgvXig/IWJ1bGwgfGJsb2NrQ29kZXxmZW5jZXN8YmxvY2txdW90ZXxoZWFkaW5nfGh0bWwpKCg/Oi58XFxuKD8hXFxzKj9cXG58YnVsbCB8YmxvY2tDb2RlfGZlbmNlc3xibG9ja3F1b3RlfGhlYWRpbmd8aHRtbCkpKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8pXG4gICAgLnJlcGxhY2UoL2J1bGwvZywgYnVsbGV0KSAvLyBsaXN0cyBjYW4gaW50ZXJydXB0XG4gICAgLnJlcGxhY2UoL2Jsb2NrQ29kZS9nLCAvKD86IHs0fXwgezAsM31cXHQpLykgLy8gaW5kZW50ZWQgY29kZSBibG9ja3MgY2FuIGludGVycnVwdFxuICAgIC5yZXBsYWNlKC9mZW5jZXMvZywgLyB7MCwzfSg/OmB7Myx9fH57Myx9KS8pIC8vIGZlbmNlZCBjb2RlIGJsb2NrcyBjYW4gaW50ZXJydXB0XG4gICAgLnJlcGxhY2UoL2Jsb2NrcXVvdGUvZywgLyB7MCwzfT4vKSAvLyBibG9ja3F1b3RlIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgvaGVhZGluZy9nLCAvIHswLDN9I3sxLDZ9LykgLy8gQVRYIGhlYWRpbmcgY2FuIGludGVycnVwdFxuICAgIC5yZXBsYWNlKC9odG1sL2csIC8gezAsM308W15cXG4+XSs+XFxuLykgLy8gYmxvY2sgaHRtbCBjYW4gaW50ZXJydXB0XG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBfcGFyYWdyYXBoID0gL14oW15cXG5dKyg/Olxcbig/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXxmZW5jZXN8bGlzdHxodG1sfHRhYmxlfCArXFxuKVteXFxuXSspKikvO1xuY29uc3QgYmxvY2tUZXh0ID0gL15bXlxcbl0rLztcbmNvbnN0IF9ibG9ja0xhYmVsID0gLyg/IVxccypcXF0pKD86XFxcXC58W15cXFtcXF1cXFxcXSkrLztcbmNvbnN0IGRlZiA9IGVkaXQoL14gezAsM31cXFsobGFiZWwpXFxdOiAqKD86XFxuWyBcXHRdKik/KFtePFxcc11bXlxcc10qfDwuKj8+KSg/Oig/OiArKD86XFxuWyBcXHRdKik/fCAqXFxuWyBcXHRdKikodGl0bGUpKT8gKig/Olxcbit8JCkvKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9ibG9ja0xhYmVsKVxuICAgIC5yZXBsYWNlKCd0aXRsZScsIC8oPzpcIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnW14nXFxuXSooPzpcXG5bXidcXG5dKykqXFxuPyd8XFwoW14oKV0qXFwpKS8pXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBsaXN0ID0gZWRpdCgvXiggezAsM31idWxsKShbIFxcdF1bXlxcbl0rPyk/KD86XFxufCQpLylcbiAgICAucmVwbGFjZSgvYnVsbC9nLCBidWxsZXQpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBfdGFnID0gJ2FkZHJlc3N8YXJ0aWNsZXxhc2lkZXxiYXNlfGJhc2Vmb250fGJsb2NrcXVvdGV8Ym9keXxjYXB0aW9uJ1xuICAgICsgJ3xjZW50ZXJ8Y29sfGNvbGdyb3VwfGRkfGRldGFpbHN8ZGlhbG9nfGRpcnxkaXZ8ZGx8ZHR8ZmllbGRzZXR8ZmlnY2FwdGlvbidcbiAgICArICd8ZmlndXJlfGZvb3Rlcnxmb3JtfGZyYW1lfGZyYW1lc2V0fGhbMS02XXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZSdcbiAgICArICd8bGVnZW5kfGxpfGxpbmt8bWFpbnxtZW51fG1lbnVpdGVtfG1ldGF8bmF2fG5vZnJhbWVzfG9sfG9wdGdyb3VwfG9wdGlvbidcbiAgICArICd8cHxwYXJhbXxzZWFyY2h8c2VjdGlvbnxzdW1tYXJ5fHRhYmxlfHRib2R5fHRkfHRmb290fHRofHRoZWFkfHRpdGxlJ1xuICAgICsgJ3x0cnx0cmFja3x1bCc7XG5jb25zdCBfY29tbWVudCA9IC88IS0tKD86LT8+fFtcXHNcXFNdKj8oPzotLT58JCkpLztcbmNvbnN0IGh0bWwgPSBlZGl0KCdeIHswLDN9KD86JyAvLyBvcHRpb25hbCBpbmRlbnRhdGlvblxuICAgICsgJzwoc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbXFxcXHM+XVtcXFxcc1xcXFxTXSo/KD86PC9cXFxcMT5bXlxcXFxuXSpcXFxcbit8JCknIC8vICgxKVxuICAgICsgJ3xjb21tZW50W15cXFxcbl0qKFxcXFxuK3wkKScgLy8gKDIpXG4gICAgKyAnfDxcXFxcP1tcXFxcc1xcXFxTXSo/KD86XFxcXD8+XFxcXG4qfCQpJyAvLyAoMylcbiAgICArICd8PCFbQS1aXVtcXFxcc1xcXFxTXSo/KD86PlxcXFxuKnwkKScgLy8gKDQpXG4gICAgKyAnfDwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj8oPzpcXFxcXVxcXFxdPlxcXFxuKnwkKScgLy8gKDUpXG4gICAgKyAnfDwvPyh0YWcpKD86ICt8XFxcXG58Lz8+KVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFxcdF0qKStcXFxcbnwkKScgLy8gKDYpXG4gICAgKyAnfDwoPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKShbYS16XVtcXFxcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFxcdF0qKStcXFxcbnwkKScgLy8gKDcpIG9wZW4gdGFnXG4gICAgKyAnfDwvKD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuWyBcXHRdKikrXFxcXG58JCknIC8vICg3KSBjbG9zaW5nIHRhZ1xuICAgICsgJyknLCAnaScpXG4gICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBfY29tbWVudClcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZylcbiAgICAucmVwbGFjZSgnYXR0cmlidXRlJywgLyArW2EtekEtWjpfXVtcXHcuOi1dKig/OiAqPSAqXCJbXlwiXFxuXSpcInwgKj0gKidbXidcXG5dKid8ICo9ICpbXlxcc1wiJz08PmBdKyk/LylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IHBhcmFncmFwaCA9IGVkaXQoX3BhcmFncmFwaClcbiAgICAucmVwbGFjZSgnaHInLCBocilcbiAgICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0oPzpcXFxcc3wkKScpXG4gICAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleHQgaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAgIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IGJsb2NrcXVvdGUgPSBlZGl0KC9eKCB7MCwzfT4gPyhwYXJhZ3JhcGh8W15cXG5dKikoPzpcXG58JCkpKy8pXG4gICAgLnJlcGxhY2UoJ3BhcmFncmFwaCcsIHBhcmFncmFwaClcbiAgICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuY29uc3QgYmxvY2tOb3JtYWwgPSB7XG4gICAgYmxvY2txdW90ZSxcbiAgICBjb2RlOiBibG9ja0NvZGUsXG4gICAgZGVmLFxuICAgIGZlbmNlcyxcbiAgICBoZWFkaW5nLFxuICAgIGhyLFxuICAgIGh0bWwsXG4gICAgbGhlYWRpbmcsXG4gICAgbGlzdCxcbiAgICBuZXdsaW5lLFxuICAgIHBhcmFncmFwaCxcbiAgICB0YWJsZTogbm9vcFRlc3QsXG4gICAgdGV4dDogYmxvY2tUZXh0LFxufTtcbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuY29uc3QgZ2ZtVGFibGUgPSBlZGl0KCdeICooW15cXFxcbiBdLiopXFxcXG4nIC8vIEhlYWRlclxuICAgICsgJyB7MCwzfSgoPzpcXFxcfCAqKT86Py0rOj8gKig/OlxcXFx8ICo6Py0rOj8gKikqKD86XFxcXHwgKik/KScgLy8gQWxpZ25cbiAgICArICcoPzpcXFxcbigoPzooPyEgKlxcXFxufGhyfGhlYWRpbmd8YmxvY2txdW90ZXxjb2RlfGZlbmNlc3xsaXN0fGh0bWwpLiooPzpcXFxcbnwkKSkqKVxcXFxuKnwkKScpIC8vIENlbGxzXG4gICAgLnJlcGxhY2UoJ2hyJywgaHIpXG4gICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9KD86XFxcXHN8JCknKVxuICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgIC5yZXBsYWNlKCdjb2RlJywgJyg/OiB7NH18IHswLDN9XFx0KVteXFxcXG5dJylcbiAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gdGFibGVzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYmxvY2tHZm0gPSB7XG4gICAgLi4uYmxvY2tOb3JtYWwsXG4gICAgdGFibGU6IGdmbVRhYmxlLFxuICAgIHBhcmFncmFwaDogZWRpdChfcGFyYWdyYXBoKVxuICAgICAgICAucmVwbGFjZSgnaHInLCBocilcbiAgICAgICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9KD86XFxcXHN8JCknKVxuICAgICAgICAucmVwbGFjZSgnfGxoZWFkaW5nJywgJycpIC8vIHNldGV4dCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gICAgICAgIC5yZXBsYWNlKCd0YWJsZScsIGdmbVRhYmxlKSAvLyBpbnRlcnJ1cHQgcGFyYWdyYXBocyB3aXRoIHRhYmxlXG4gICAgICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgICAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgICAgIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gICAgICAgIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAgICAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBQZWRhbnRpYyBncmFtbWFyIChvcmlnaW5hbCBKb2huIEdydWJlcidzIGxvb3NlIG1hcmtkb3duIHNwZWNpZmljYXRpb24pXG4gKi9cbmNvbnN0IGJsb2NrUGVkYW50aWMgPSB7XG4gICAgLi4uYmxvY2tOb3JtYWwsXG4gICAgaHRtbDogZWRpdCgnXiAqKD86Y29tbWVudCAqKD86XFxcXG58XFxcXHMqJCknXG4gICAgICAgICsgJ3w8KHRhZylbXFxcXHNcXFxcU10rPzwvXFxcXDE+ICooPzpcXFxcbnsyLH18XFxcXHMqJCknIC8vIGNsb3NlZCB0YWdcbiAgICAgICAgKyAnfDx0YWcoPzpcIlteXCJdKlwifFxcJ1teXFwnXSpcXCd8XFxcXHNbXlxcJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpJylcbiAgICAgICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBfY29tbWVudClcbiAgICAgICAgLnJlcGxhY2UoL3RhZy9nLCAnKD8hKD86J1xuICAgICAgICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZXx2YXJ8c2FtcHxrYmR8c3ViJ1xuICAgICAgICArICd8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKSdcbiAgICAgICAgKyAnXFxcXGIpXFxcXHcrKD8hOnxbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG4gICAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogKyhbXCIoXVteXFxuXStbXCIpXSkpPyAqKD86XFxuK3wkKS8sXG4gICAgaGVhZGluZzogL14oI3sxLDZ9KSguKikoPzpcXG4rfCQpLyxcbiAgICBmZW5jZXM6IG5vb3BUZXN0LCAvLyBmZW5jZXMgbm90IHN1cHBvcnRlZFxuICAgIGxoZWFkaW5nOiAvXiguKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gICAgcGFyYWdyYXBoOiBlZGl0KF9wYXJhZ3JhcGgpXG4gICAgICAgIC5yZXBsYWNlKCdocicsIGhyKVxuICAgICAgICAucmVwbGFjZSgnaGVhZGluZycsICcgKiN7MSw2fSAqW15cXG5dJylcbiAgICAgICAgLnJlcGxhY2UoJ2xoZWFkaW5nJywgbGhlYWRpbmcpXG4gICAgICAgIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gICAgICAgIC5yZXBsYWNlKCd8ZmVuY2VzJywgJycpXG4gICAgICAgIC5yZXBsYWNlKCd8bGlzdCcsICcnKVxuICAgICAgICAucmVwbGFjZSgnfGh0bWwnLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ3x0YWcnLCAnJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5jb25zdCBlc2NhcGUgPSAvXlxcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pLztcbmNvbnN0IGlubGluZUNvZGUgPSAvXihgKykoW15gXXxbXmBdW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvO1xuY29uc3QgYnIgPSAvXiggezIsfXxcXFxcKVxcbig/IVxccyokKS87XG5jb25zdCBpbmxpbmVUZXh0ID0gL14oYCt8W15gXSkoPzooPz0gezIsfVxcbil8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKl9dfFxcYl98JCl8W14gXSg/PSB7Mix9XFxuKSkpLztcbi8vIGxpc3Qgb2YgdW5pY29kZSBwdW5jdHVhdGlvbiBtYXJrcywgcGx1cyBhbnkgbWlzc2luZyBjaGFyYWN0ZXJzIGZyb20gQ29tbW9uTWFyayBzcGVjXG5jb25zdCBfcHVuY3R1YXRpb24gPSAnXFxcXHB7UH1cXFxccHtTfSc7XG5jb25zdCBwdW5jdHVhdGlvbiA9IGVkaXQoL14oKD8hWypfXSlbXFxzcHVuY3R1YXRpb25dKS8sICd1JylcbiAgICAucmVwbGFjZSgvcHVuY3R1YXRpb24vZywgX3B1bmN0dWF0aW9uKS5nZXRSZWdleCgpO1xuLy8gc2VxdWVuY2VzIGVtIHNob3VsZCBza2lwIG92ZXIgW3RpdGxlXShsaW5rKSwgYGNvZGVgLCA8aHRtbD5cbmNvbnN0IGJsb2NrU2tpcCA9IC9cXFtbXltcXF1dKj9cXF1cXCgoPzpcXFxcLnxbXlxcXFxcXChcXCldfFxcKCg/OlxcXFwufFteXFxcXFxcKFxcKV0pKlxcKSkqXFwpfGBbXmBdKj9gfDxbXjw+XSo/Pi9nO1xuY29uc3QgZW1TdHJvbmdMRGVsaW0gPSBlZGl0KC9eKD86XFwqKyg/OigoPyFcXCopW3B1bmN0XSl8W15cXHMqXSkpfF5fKyg/OigoPyFfKVtwdW5jdF0pfChbXlxcc19dKSkvLCAndScpXG4gICAgLnJlcGxhY2UoL3B1bmN0L2csIF9wdW5jdHVhdGlvbilcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IGVtU3Ryb25nUkRlbGltQXN0ID0gZWRpdCgnXlteXypdKj9fX1teXypdKj9cXFxcKlteXypdKj8oPz1fXyknIC8vIFNraXAgb3JwaGFuIGluc2lkZSBzdHJvbmdcbiAgICArICd8W14qXSsoPz1bXipdKScgLy8gQ29uc3VtZSB0byBkZWxpbVxuICAgICsgJ3woPyFcXFxcKilbcHVuY3RdKFxcXFwqKykoPz1bXFxcXHNdfCQpJyAvLyAoMSkgIyoqKiBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKFxcXFwqKykoPyFcXFxcKikoPz1bcHVuY3RcXFxcc118JCknIC8vICgyKSBhKioqIywgYSoqKiBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3woPyFcXFxcKilbcHVuY3RcXFxcc10oXFxcXCorKSg/PVtecHVuY3RcXFxcc10pJyAvLyAoMykgIyoqKmEsICoqKmEgY2FuIG9ubHkgYmUgTGVmdCBEZWxpbWl0ZXJcbiAgICArICd8W1xcXFxzXShcXFxcKispKD8hXFxcXCopKD89W3B1bmN0XSknIC8vICg0KSAqKiojIGNhbiBvbmx5IGJlIExlZnQgRGVsaW1pdGVyXG4gICAgKyAnfCg/IVxcXFwqKVtwdW5jdF0oXFxcXCorKSg/IVxcXFwqKSg/PVtwdW5jdF0pJyAvLyAoNSkgIyoqKiMgY2FuIGJlIGVpdGhlciBMZWZ0IG9yIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKFxcXFwqKykoPz1bXnB1bmN0XFxcXHNdKScsICdndScpIC8vICg2KSBhKioqYSBjYW4gYmUgZWl0aGVyIExlZnQgb3IgUmlnaHQgRGVsaW1pdGVyXG4gICAgLnJlcGxhY2UoL3B1bmN0L2csIF9wdW5jdHVhdGlvbilcbiAgICAuZ2V0UmVnZXgoKTtcbi8vICg2KSBOb3QgYWxsb3dlZCBmb3IgX1xuY29uc3QgZW1TdHJvbmdSRGVsaW1VbmQgPSBlZGl0KCdeW15fKl0qP1xcXFwqXFxcXCpbXl8qXSo/X1teXypdKj8oPz1cXFxcKlxcXFwqKScgLy8gU2tpcCBvcnBoYW4gaW5zaWRlIHN0cm9uZ1xuICAgICsgJ3xbXl9dKyg/PVteX10pJyAvLyBDb25zdW1lIHRvIGRlbGltXG4gICAgKyAnfCg/IV8pW3B1bmN0XShfKykoPz1bXFxcXHNdfCQpJyAvLyAoMSkgI19fXyBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKF8rKSg/IV8pKD89W3B1bmN0XFxcXHNdfCQpJyAvLyAoMikgYV9fXyMsIGFfX18gY2FuIG9ubHkgYmUgYSBSaWdodCBEZWxpbWl0ZXJcbiAgICArICd8KD8hXylbcHVuY3RcXFxcc10oXyspKD89W15wdW5jdFxcXFxzXSknIC8vICgzKSAjX19fYSwgX19fYSBjYW4gb25seSBiZSBMZWZ0IERlbGltaXRlclxuICAgICsgJ3xbXFxcXHNdKF8rKSg/IV8pKD89W3B1bmN0XSknIC8vICg0KSBfX18jIGNhbiBvbmx5IGJlIExlZnQgRGVsaW1pdGVyXG4gICAgKyAnfCg/IV8pW3B1bmN0XShfKykoPyFfKSg/PVtwdW5jdF0pJywgJ2d1JykgLy8gKDUpICNfX18jIGNhbiBiZSBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbWl0ZXJcbiAgICAucmVwbGFjZSgvcHVuY3QvZywgX3B1bmN0dWF0aW9uKVxuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYW55UHVuY3R1YXRpb24gPSBlZGl0KC9cXFxcKFtwdW5jdF0pLywgJ2d1JylcbiAgICAucmVwbGFjZSgvcHVuY3QvZywgX3B1bmN0dWF0aW9uKVxuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYXV0b2xpbmsgPSBlZGl0KC9ePChzY2hlbWU6W15cXHNcXHgwMC1cXHgxZjw+XSp8ZW1haWwpPi8pXG4gICAgLnJlcGxhY2UoJ3NjaGVtZScsIC9bYS16QS1aXVthLXpBLVowLTkrLi1dezEsMzF9LylcbiAgICAucmVwbGFjZSgnZW1haWwnLCAvW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXSsoQClbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyg/IVstX10pLylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IF9pbmxpbmVDb21tZW50ID0gZWRpdChfY29tbWVudCkucmVwbGFjZSgnKD86LS0+fCQpJywgJy0tPicpLmdldFJlZ2V4KCk7XG5jb25zdCB0YWcgPSBlZGl0KCdeY29tbWVudCdcbiAgICArICd8XjwvW2EtekEtWl1bXFxcXHc6LV0qXFxcXHMqPicgLy8gc2VsZi1jbG9zaW5nIHRhZ1xuICAgICsgJ3xePFthLXpBLVpdW1xcXFx3LV0qKD86YXR0cmlidXRlKSo/XFxcXHMqLz8+JyAvLyBvcGVuIHRhZ1xuICAgICsgJ3xePFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz4nIC8vIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb24sIGUuZy4gPD9waHAgPz5cbiAgICArICd8XjwhW2EtekEtWl0rXFxcXHNbXFxcXHNcXFxcU10qPz4nIC8vIGRlY2xhcmF0aW9uLCBlLmcuIDwhRE9DVFlQRSBodG1sPlxuICAgICsgJ3xePCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+JykgLy8gQ0RBVEEgc2VjdGlvblxuICAgIC5yZXBsYWNlKCdjb21tZW50JywgX2lubGluZUNvbW1lbnQpXG4gICAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIC9cXHMrW2EtekEtWjpfXVtcXHcuOi1dKig/Olxccyo9XFxzKlwiW15cIl0qXCJ8XFxzKj1cXHMqJ1teJ10qJ3xcXHMqPVxccypbXlxcc1wiJz08PmBdKyk/LylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IF9pbmxpbmVMYWJlbCA9IC8oPzpcXFsoPzpcXFxcLnxbXlxcW1xcXVxcXFxdKSpcXF18XFxcXC58YFteYF0qYHxbXlxcW1xcXVxcXFxgXSkqPy87XG5jb25zdCBsaW5rID0gZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxcKFxccyooaHJlZikoPzpcXHMrKHRpdGxlKSk/XFxzKlxcKS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgX2lubGluZUxhYmVsKVxuICAgIC5yZXBsYWNlKCdocmVmJywgLzwoPzpcXFxcLnxbXlxcbjw+XFxcXF0pKz58W15cXHNcXHgwMC1cXHgxZl0qLylcbiAgICAucmVwbGFjZSgndGl0bGUnLCAvXCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwnP3xbXidcXFxcXSkqJ3xcXCgoPzpcXFxcXFwpP3xbXilcXFxcXSkqXFwpLylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IHJlZmxpbmsgPSBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFxbKHJlZilcXF0vKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9pbmxpbmVMYWJlbClcbiAgICAucmVwbGFjZSgncmVmJywgX2Jsb2NrTGFiZWwpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBub2xpbmsgPSBlZGl0KC9eIT9cXFsocmVmKVxcXSg/OlxcW1xcXSk/LylcbiAgICAucmVwbGFjZSgncmVmJywgX2Jsb2NrTGFiZWwpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCByZWZsaW5rU2VhcmNoID0gZWRpdCgncmVmbGlua3xub2xpbmsoPyFcXFxcKCknLCAnZycpXG4gICAgLnJlcGxhY2UoJ3JlZmxpbmsnLCByZWZsaW5rKVxuICAgIC5yZXBsYWNlKCdub2xpbmsnLCBub2xpbmspXG4gICAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5jb25zdCBpbmxpbmVOb3JtYWwgPSB7XG4gICAgX2JhY2twZWRhbDogbm9vcFRlc3QsIC8vIG9ubHkgdXNlZCBmb3IgR0ZNIHVybFxuICAgIGFueVB1bmN0dWF0aW9uLFxuICAgIGF1dG9saW5rLFxuICAgIGJsb2NrU2tpcCxcbiAgICBicixcbiAgICBjb2RlOiBpbmxpbmVDb2RlLFxuICAgIGRlbDogbm9vcFRlc3QsXG4gICAgZW1TdHJvbmdMRGVsaW0sXG4gICAgZW1TdHJvbmdSRGVsaW1Bc3QsXG4gICAgZW1TdHJvbmdSRGVsaW1VbmQsXG4gICAgZXNjYXBlLFxuICAgIGxpbmssXG4gICAgbm9saW5rLFxuICAgIHB1bmN0dWF0aW9uLFxuICAgIHJlZmxpbmssXG4gICAgcmVmbGlua1NlYXJjaCxcbiAgICB0YWcsXG4gICAgdGV4dDogaW5saW5lVGV4dCxcbiAgICB1cmw6IG5vb3BUZXN0LFxufTtcbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lUGVkYW50aWMgPSB7XG4gICAgLi4uaW5saW5lTm9ybWFsLFxuICAgIGxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXCgoLio/KVxcKS8pXG4gICAgICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9pbmxpbmVMYWJlbClcbiAgICAgICAgLmdldFJlZ2V4KCksXG4gICAgcmVmbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxccypcXFsoW15cXF1dKilcXF0vKVxuICAgICAgICAucmVwbGFjZSgnbGFiZWwnLCBfaW5saW5lTGFiZWwpXG4gICAgICAgIC5nZXRSZWdleCgpLFxufTtcbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cbmNvbnN0IGlubGluZUdmbSA9IHtcbiAgICAuLi5pbmxpbmVOb3JtYWwsXG4gICAgZXNjYXBlOiBlZGl0KGVzY2FwZSkucmVwbGFjZSgnXSknLCAnfnxdKScpLmdldFJlZ2V4KCksXG4gICAgdXJsOiBlZGl0KC9eKCg/OmZ0cHxodHRwcz8pOlxcL1xcL3x3d3dcXC4pKD86W2EtekEtWjAtOVxcLV0rXFwuPykrW15cXHM8XSp8XmVtYWlsLywgJ2knKVxuICAgICAgICAucmVwbGFjZSgnZW1haWwnLCAvW0EtWmEtejAtOS5fKy1dKyhAKVthLXpBLVowLTktX10rKD86XFwuW2EtekEtWjAtOS1fXSpbYS16QS1aMC05XSkrKD8hWy1fXSkvKVxuICAgICAgICAuZ2V0UmVnZXgoKSxcbiAgICBfYmFja3BlZGFsOiAvKD86W14/IS4sOjsqXydcIn4oKSZdK3xcXChbXildKlxcKXwmKD8hW2EtekEtWjAtOV0rOyQpfFs/IS4sOjsqXydcIn4pXSsoPyEkKSkrLyxcbiAgICBkZWw6IC9eKH5+PykoPz1bXlxcc35dKSgoPzpcXFxcLnxbXlxcXFxdKSo/KD86XFxcXC58W15cXHN+XFxcXF0pKVxcMSg/PVtefl18JCkvLFxuICAgIHRleHQ6IC9eKFtgfl0rfFteYH5dKSg/Oig/PSB7Mix9XFxuKXwoPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApfFtcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCp+X118XFxiX3xodHRwcz86XFwvXFwvfGZ0cDpcXC9cXC98d3d3XFwufCQpfFteIF0oPz0gezIsfVxcbil8W15hLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0oPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApKSkvLFxufTtcbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lQnJlYWtzID0ge1xuICAgIC4uLmlubGluZUdmbSxcbiAgICBicjogZWRpdChicikucmVwbGFjZSgnezIsfScsICcqJykuZ2V0UmVnZXgoKSxcbiAgICB0ZXh0OiBlZGl0KGlubGluZUdmbS50ZXh0KVxuICAgICAgICAucmVwbGFjZSgnXFxcXGJfJywgJ1xcXFxiX3wgezIsfVxcXFxuJylcbiAgICAgICAgLnJlcGxhY2UoL1xcezIsXFx9L2csICcqJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBleHBvcnRzXG4gKi9cbmNvbnN0IGJsb2NrID0ge1xuICAgIG5vcm1hbDogYmxvY2tOb3JtYWwsXG4gICAgZ2ZtOiBibG9ja0dmbSxcbiAgICBwZWRhbnRpYzogYmxvY2tQZWRhbnRpYyxcbn07XG5jb25zdCBpbmxpbmUgPSB7XG4gICAgbm9ybWFsOiBpbmxpbmVOb3JtYWwsXG4gICAgZ2ZtOiBpbmxpbmVHZm0sXG4gICAgYnJlYWtzOiBpbmxpbmVCcmVha3MsXG4gICAgcGVkYW50aWM6IGlubGluZVBlZGFudGljLFxufTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5jbGFzcyBfTGV4ZXIge1xuICAgIHRva2VucztcbiAgICBvcHRpb25zO1xuICAgIHN0YXRlO1xuICAgIHRva2VuaXplcjtcbiAgICBpbmxpbmVRdWV1ZTtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIC8vIFRva2VuTGlzdCBjYW5ub3QgYmUgY3JlYXRlZCBpbiBvbmUgZ29cbiAgICAgICAgdGhpcy50b2tlbnMgPSBbXTtcbiAgICAgICAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IF9kZWZhdWx0cztcbiAgICAgICAgdGhpcy5vcHRpb25zLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXIgfHwgbmV3IF9Ub2tlbml6ZXIoKTtcbiAgICAgICAgdGhpcy50b2tlbml6ZXIgPSB0aGlzLm9wdGlvbnMudG9rZW5pemVyO1xuICAgICAgICB0aGlzLnRva2VuaXplci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICB0aGlzLnRva2VuaXplci5sZXhlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuaW5saW5lUXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGluTGluazogZmFsc2UsXG4gICAgICAgICAgICBpblJhd0Jsb2NrOiBmYWxzZSxcbiAgICAgICAgICAgIHRvcDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcnVsZXMgPSB7XG4gICAgICAgICAgICBibG9jazogYmxvY2subm9ybWFsLFxuICAgICAgICAgICAgaW5saW5lOiBpbmxpbmUubm9ybWFsLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICBydWxlcy5ibG9jayA9IGJsb2NrLnBlZGFudGljO1xuICAgICAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLnBlZGFudGljO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgICAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2suZ2ZtO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgICAgICAgICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUuYnJlYWtzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmdmbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRva2VuaXplci5ydWxlcyA9IHJ1bGVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgUnVsZXNcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IHJ1bGVzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmxvY2ssXG4gICAgICAgICAgICBpbmxpbmUsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBMZXggTWV0aG9kXG4gICAgICovXG4gICAgc3RhdGljIGxleChzcmMsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbGV4ZXIgPSBuZXcgX0xleGVyKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBMZXggSW5saW5lIE1ldGhvZFxuICAgICAqL1xuICAgIHN0YXRpYyBsZXhJbmxpbmUoc3JjLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxleGVyID0gbmV3IF9MZXhlcihvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGxleGVyLmlubGluZVRva2VucyhzcmMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmVwcm9jZXNzaW5nXG4gICAgICovXG4gICAgbGV4KHNyYykge1xuICAgICAgICBzcmMgPSBzcmNcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKTtcbiAgICAgICAgdGhpcy5ibG9ja1Rva2VucyhzcmMsIHRoaXMudG9rZW5zKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlubGluZVF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5pbmxpbmVRdWV1ZVtpXTtcbiAgICAgICAgICAgIHRoaXMuaW5saW5lVG9rZW5zKG5leHQuc3JjLCBuZXh0LnRva2Vucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZSA9IFtdO1xuICAgICAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gICAgfVxuICAgIGJsb2NrVG9rZW5zKHNyYywgdG9rZW5zID0gW10sIGxhc3RQYXJhZ3JhcGhDbGlwcGVkID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgc3JjID0gc3JjLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpLnJlcGxhY2UoL14gKyQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdG9rZW47XG4gICAgICAgIGxldCBsYXN0VG9rZW47XG4gICAgICAgIGxldCBjdXRTcmM7XG4gICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmJsb2NrXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuYmxvY2suc29tZSgoZXh0VG9rZW5pemVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbiA9IGV4dFRva2VuaXplci5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgc3JjLCB0b2tlbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBuZXdsaW5lXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5zcGFjZShzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4ucmF3Lmxlbmd0aCA9PT0gMSAmJiB0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSdzIGEgc2luZ2xlIFxcbiBhcyBhIHNwYWNlciwgaXQncyB0ZXJtaW5hdGluZyB0aGUgbGFzdCBsaW5lLFxuICAgICAgICAgICAgICAgICAgICAvLyBzbyBtb3ZlIGl0IHRoZXJlIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IHVubmVjZXNzYXJ5IHBhcmFncmFwaCB0YWdzXG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0ucmF3ICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvZGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAvLyBBbiBpbmRlbnRlZCBjb2RlIGJsb2NrIGNhbm5vdCBpbnRlcnJ1cHQgYSBwYXJhZ3JhcGguXG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZlbmNlc1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZmVuY2VzKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGhlYWRpbmdcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhlYWRpbmcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaHJcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhyKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJsb2NrcXVvdGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJsb2NrcXVvdGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gbGlzdFxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGlzdChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBodG1sXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5odG1sKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRlZlxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVmKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCF0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmOiB0b2tlbi5ocmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRva2VuLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRhYmxlIChnZm0pXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWJsZShzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBsaGVhZGluZ1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGhlYWRpbmcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgICAgICAgICAgLy8gcHJldmVudCBwYXJhZ3JhcGggY29uc3VtaW5nIGV4dGVuc2lvbnMgYnkgY2xpcHBpbmcgJ3NyYycgdG8gZXh0ZW5zaW9uIHN0YXJ0XG4gICAgICAgICAgICBjdXRTcmMgPSBzcmM7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2suZm9yRWFjaCgoZ2V0U3RhcnRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnRvcCAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5wYXJhZ3JhcGgoY3V0U3JjKSkpIHtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0UGFyYWdyYXBoQ2xpcHBlZCAmJiBsYXN0VG9rZW4/LnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXN0UGFyYWdyYXBoQ2xpcHBlZCA9IChjdXRTcmMubGVuZ3RoICE9PSBzcmMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGV4dFxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGV4dChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZS50b3AgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH1cbiAgICBpbmxpbmUoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnB1c2goeyBzcmMsIHRva2VucyB9KTtcbiAgICAgICAgcmV0dXJuIHRva2VucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGV4aW5nL0NvbXBpbGluZ1xuICAgICAqL1xuICAgIGlubGluZVRva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgICAgIGxldCB0b2tlbiwgbGFzdFRva2VuLCBjdXRTcmM7XG4gICAgICAgIC8vIFN0cmluZyB3aXRoIGxpbmtzIG1hc2tlZCB0byBhdm9pZCBpbnRlcmZlcmVuY2Ugd2l0aCBlbSBhbmQgc3Ryb25nXG4gICAgICAgIGxldCBtYXNrZWRTcmMgPSBzcmM7XG4gICAgICAgIGxldCBtYXRjaDtcbiAgICAgICAgbGV0IGtlZXBQcmV2Q2hhciwgcHJldkNoYXI7XG4gICAgICAgIC8vIE1hc2sgb3V0IHJlZmxpbmtzXG4gICAgICAgIGlmICh0aGlzLnRva2Vucy5saW5rcykge1xuICAgICAgICAgICAgY29uc3QgbGlua3MgPSBPYmplY3Qua2V5cyh0aGlzLnRva2Vucy5saW5rcyk7XG4gICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmtzLmluY2x1ZGVzKG1hdGNoWzBdLnNsaWNlKG1hdGNoWzBdLmxhc3RJbmRleE9mKCdbJykgKyAxLCAtMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgJ2EnLnJlcGVhdChtYXRjaFswXS5sZW5ndGggLSAyKSArICddJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5sYXN0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE1hc2sgb3V0IG90aGVyIGJsb2Nrc1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnWycgKyAnYScucmVwZWF0KG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJ10nICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAubGFzdEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNYXNrIG91dCBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnKysnICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5sYXN0SW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIGlmICgha2VlcFByZXZDaGFyKSB7XG4gICAgICAgICAgICAgICAgcHJldkNoYXIgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtlZXBQcmV2Q2hhciA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lLnNvbWUoKGV4dFRva2VuaXplcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZXNjYXBlXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5lc2NhcGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGFnXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuICYmIHRva2VuLnR5cGUgPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGxpbmtcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxpbmsoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5yZWZsaW5rKHNyYywgdGhpcy50b2tlbnMubGlua3MpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZW0gJiBzdHJvbmdcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhcikpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvZGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGVzcGFuKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJyXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5icihzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkZWwgKGdmbSlcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlbChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhdXRvbGlua1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYXV0b2xpbmsoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXJsIChnZm0pXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaW5MaW5rICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnVybChzcmMpKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGV4dFxuICAgICAgICAgICAgLy8gcHJldmVudCBpbmxpbmVUZXh0IGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wU3RhcnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUuZm9yRWFjaCgoZ2V0U3RhcnRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmlubGluZVRleHQoY3V0U3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnJhdy5zbGljZSgtMSkgIT09ICdfJykgeyAvLyBUcmFjayBwcmV2Q2hhciBiZWZvcmUgc3RyaW5nIG9mIF9fX18gc3RhcnRlZFxuICAgICAgICAgICAgICAgICAgICBwcmV2Q2hhciA9IHRva2VuLnJhdy5zbGljZSgtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGtlZXBQcmV2Q2hhciA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cbmNsYXNzIF9SZW5kZXJlciB7XG4gICAgb3B0aW9ucztcbiAgICBwYXJzZXI7IC8vIHNldCBieSB0aGUgcGFyc2VyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IF9kZWZhdWx0cztcbiAgICB9XG4gICAgc3BhY2UodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb2RlKHsgdGV4dCwgbGFuZywgZXNjYXBlZCB9KSB7XG4gICAgICAgIGNvbnN0IGxhbmdTdHJpbmcgPSAobGFuZyB8fCAnJykubWF0Y2goL15cXFMqLyk/LlswXTtcbiAgICAgICAgY29uc3QgY29kZSA9IHRleHQucmVwbGFjZSgvXFxuJC8sICcnKSArICdcXG4nO1xuICAgICAgICBpZiAoIWxhbmdTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICAgICAgICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUkMShjb2RlLCB0cnVlKSlcbiAgICAgICAgICAgICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCJsYW5ndWFnZS0nXG4gICAgICAgICAgICArIGVzY2FwZSQxKGxhbmdTdHJpbmcpXG4gICAgICAgICAgICArICdcIj4nXG4gICAgICAgICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZSQxKGNvZGUsIHRydWUpKVxuICAgICAgICAgICAgKyAnPC9jb2RlPjwvcHJlPlxcbic7XG4gICAgfVxuICAgIGJsb2NrcXVvdGUoeyB0b2tlbnMgfSkge1xuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy5wYXJzZXIucGFyc2UodG9rZW5zKTtcbiAgICAgICAgcmV0dXJuIGA8YmxvY2txdW90ZT5cXG4ke2JvZHl9PC9ibG9ja3F1b3RlPlxcbmA7XG4gICAgfVxuICAgIGh0bWwoeyB0ZXh0IH0pIHtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGhlYWRpbmcoeyB0b2tlbnMsIGRlcHRoIH0pIHtcbiAgICAgICAgcmV0dXJuIGA8aCR7ZGVwdGh9PiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKX08L2gke2RlcHRofT5cXG5gO1xuICAgIH1cbiAgICBocih0b2tlbikge1xuICAgICAgICByZXR1cm4gJzxocj5cXG4nO1xuICAgIH1cbiAgICBsaXN0KHRva2VuKSB7XG4gICAgICAgIGNvbnN0IG9yZGVyZWQgPSB0b2tlbi5vcmRlcmVkO1xuICAgICAgICBjb25zdCBzdGFydCA9IHRva2VuLnN0YXJ0O1xuICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2VuLml0ZW1zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdG9rZW4uaXRlbXNbal07XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMubGlzdGl0ZW0oaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgICAgICAgY29uc3Qgc3RhcnRBdHRyID0gKG9yZGVyZWQgJiYgc3RhcnQgIT09IDEpID8gKCcgc3RhcnQ9XCInICsgc3RhcnQgKyAnXCInKSA6ICcnO1xuICAgICAgICByZXR1cm4gJzwnICsgdHlwZSArIHN0YXJ0QXR0ciArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbiAgICB9XG4gICAgbGlzdGl0ZW0oaXRlbSkge1xuICAgICAgICBsZXQgaXRlbUJvZHkgPSAnJztcbiAgICAgICAgaWYgKGl0ZW0udGFzaykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSB0aGlzLmNoZWNrYm94KHsgY2hlY2tlZDogISFpdGVtLmNoZWNrZWQgfSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5sb29zZSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vuc1swXS50b2tlbnMgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRva2Vucy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogY2hlY2tib3ggKyAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjaGVja2JveCArICcgJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbUJvZHkgKz0gY2hlY2tib3ggKyAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaXRlbUJvZHkgKz0gdGhpcy5wYXJzZXIucGFyc2UoaXRlbS50b2tlbnMsICEhaXRlbS5sb29zZSk7XG4gICAgICAgIHJldHVybiBgPGxpPiR7aXRlbUJvZHl9PC9saT5cXG5gO1xuICAgIH1cbiAgICBjaGVja2JveCh7IGNoZWNrZWQgfSkge1xuICAgICAgICByZXR1cm4gJzxpbnB1dCAnXG4gICAgICAgICAgICArIChjaGVja2VkID8gJ2NoZWNrZWQ9XCJcIiAnIDogJycpXG4gICAgICAgICAgICArICdkaXNhYmxlZD1cIlwiIHR5cGU9XCJjaGVja2JveFwiPic7XG4gICAgfVxuICAgIHBhcmFncmFwaCh7IHRva2VucyB9KSB7XG4gICAgICAgIHJldHVybiBgPHA+JHt0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpfTwvcD5cXG5gO1xuICAgIH1cbiAgICB0YWJsZSh0b2tlbikge1xuICAgICAgICBsZXQgaGVhZGVyID0gJyc7XG4gICAgICAgIC8vIGhlYWRlclxuICAgICAgICBsZXQgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2VuLmhlYWRlci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY2VsbCArPSB0aGlzLnRhYmxlY2VsbCh0b2tlbi5oZWFkZXJbal0pO1xuICAgICAgICB9XG4gICAgICAgIGhlYWRlciArPSB0aGlzLnRhYmxlcm93KHsgdGV4dDogY2VsbCB9KTtcbiAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0b2tlbi5yb3dzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0b2tlbi5yb3dzW2pdO1xuICAgICAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCByb3cubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBjZWxsICs9IHRoaXMudGFibGVjZWxsKHJvd1trXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMudGFibGVyb3coeyB0ZXh0OiBjZWxsIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5KVxuICAgICAgICAgICAgYm9keSA9IGA8dGJvZHk+JHtib2R5fTwvdGJvZHk+YDtcbiAgICAgICAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICAgICAgICAgKyAnPHRoZWFkPlxcbidcbiAgICAgICAgICAgICsgaGVhZGVyXG4gICAgICAgICAgICArICc8L3RoZWFkPlxcbidcbiAgICAgICAgICAgICsgYm9keVxuICAgICAgICAgICAgKyAnPC90YWJsZT5cXG4nO1xuICAgIH1cbiAgICB0YWJsZXJvdyh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gYDx0cj5cXG4ke3RleHR9PC90cj5cXG5gO1xuICAgIH1cbiAgICB0YWJsZWNlbGwodG9rZW4pIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2VuLnRva2Vucyk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0b2tlbi5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgICAgICAgY29uc3QgdGFnID0gdG9rZW4uYWxpZ25cbiAgICAgICAgICAgID8gYDwke3R5cGV9IGFsaWduPVwiJHt0b2tlbi5hbGlnbn1cIj5gXG4gICAgICAgICAgICA6IGA8JHt0eXBlfT5gO1xuICAgICAgICByZXR1cm4gdGFnICsgY29udGVudCArIGA8LyR7dHlwZX0+XFxuYDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3BhbiBsZXZlbCByZW5kZXJlclxuICAgICAqL1xuICAgIHN0cm9uZyh7IHRva2VucyB9KSB7XG4gICAgICAgIHJldHVybiBgPHN0cm9uZz4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyl9PC9zdHJvbmc+YDtcbiAgICB9XG4gICAgZW0oeyB0b2tlbnMgfSkge1xuICAgICAgICByZXR1cm4gYDxlbT4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyl9PC9lbT5gO1xuICAgIH1cbiAgICBjb2Rlc3Bhbih7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gYDxjb2RlPiR7dGV4dH08L2NvZGU+YDtcbiAgICB9XG4gICAgYnIodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICc8YnI+JztcbiAgICB9XG4gICAgZGVsKHsgdG9rZW5zIH0pIHtcbiAgICAgICAgcmV0dXJuIGA8ZGVsPiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKX08L2RlbD5gO1xuICAgIH1cbiAgICBsaW5rKHsgaHJlZiwgdGl0bGUsIHRva2VucyB9KSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICAgICAgICBjb25zdCBjbGVhbkhyZWYgPSBjbGVhblVybChocmVmKTtcbiAgICAgICAgaWYgKGNsZWFuSHJlZiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgaHJlZiA9IGNsZWFuSHJlZjtcbiAgICAgICAgbGV0IG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgaW1hZ2UoeyBocmVmLCB0aXRsZSwgdGV4dCB9KSB7XG4gICAgICAgIGNvbnN0IGNsZWFuSHJlZiA9IGNsZWFuVXJsKGhyZWYpO1xuICAgICAgICBpZiAoY2xlYW5IcmVmID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICBocmVmID0gY2xlYW5IcmVmO1xuICAgICAgICBsZXQgb3V0ID0gYDxpbWcgc3JjPVwiJHtocmVmfVwiIGFsdD1cIiR7dGV4dH1cImA7XG4gICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgb3V0ICs9IGAgdGl0bGU9XCIke3RpdGxlfVwiYDtcbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gJz4nO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICB0ZXh0KHRva2VuKSB7XG4gICAgICAgIHJldHVybiAndG9rZW5zJyBpbiB0b2tlbiAmJiB0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dDtcbiAgICB9XG59XG5cbi8qKlxuICogVGV4dFJlbmRlcmVyXG4gKiByZXR1cm5zIG9ubHkgdGhlIHRleHR1YWwgcGFydCBvZiB0aGUgdG9rZW5cbiAqL1xuY2xhc3MgX1RleHRSZW5kZXJlciB7XG4gICAgLy8gbm8gbmVlZCBmb3IgYmxvY2sgbGV2ZWwgcmVuZGVyZXJzXG4gICAgc3Ryb25nKHsgdGV4dCB9KSB7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBlbSh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgY29kZXNwYW4oeyB0ZXh0IH0pIHtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGRlbCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgaHRtbCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgdGV4dCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgbGluayh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gJycgKyB0ZXh0O1xuICAgIH1cbiAgICBpbWFnZSh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gJycgKyB0ZXh0O1xuICAgIH1cbiAgICBicigpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cbmNsYXNzIF9QYXJzZXIge1xuICAgIG9wdGlvbnM7XG4gICAgcmVuZGVyZXI7XG4gICAgdGV4dFJlbmRlcmVyO1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBfZGVmYXVsdHM7XG4gICAgICAgIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgX1JlbmRlcmVyKCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gICAgICAgIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdGhpcy5yZW5kZXJlci5wYXJzZXIgPSB0aGlzO1xuICAgICAgICB0aGlzLnRleHRSZW5kZXJlciA9IG5ldyBfVGV4dFJlbmRlcmVyKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UodG9rZW5zLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBfUGFyc2VyKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gcGFyc2VyLnBhcnNlKHRva2Vucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBQYXJzZSBJbmxpbmUgTWV0aG9kXG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlSW5saW5lKHRva2Vucywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgX1BhcnNlcihvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYXJzZSBMb29wXG4gICAgICovXG4gICAgcGFyc2UodG9rZW5zLCB0b3AgPSB0cnVlKSB7XG4gICAgICAgIGxldCBvdXQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGFueVRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1thbnlUb2tlbi50eXBlXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdlbmVyaWNUb2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldCA9IHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1tnZW5lcmljVG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCBnZW5lcmljVG9rZW4pO1xuICAgICAgICAgICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ3NwYWNlJywgJ2hyJywgJ2hlYWRpbmcnLCAnY29kZScsICd0YWJsZScsICdibG9ja3F1b3RlJywgJ2xpc3QnLCAnaHRtbCcsICdwYXJhZ3JhcGgnLCAndGV4dCddLmluY2x1ZGVzKGdlbmVyaWNUb2tlbi50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnNwYWNlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2hyJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5ocih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5oZWFkaW5nKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGUodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrcXVvdGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnbGlzdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGlzdCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5odG1sKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJvZHkgPSB0aGlzLnJlbmRlcmVyLnRleHQodGV4dFRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgKyAxIDwgdG9rZW5zLmxlbmd0aCAmJiB0b2tlbnNbaSArIDFdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dFRva2VuID0gdG9rZW5zWysraV07XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5yZW5kZXJlci50ZXh0KHRleHRUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXc6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IFt7IHR5cGU6ICd0ZXh0JywgcmF3OiBib2R5LCB0ZXh0OiBib2R5IH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQgKz0gYm9keTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFyc2UgSW5saW5lIFRva2Vuc1xuICAgICAqL1xuICAgIHBhcnNlSW5saW5lKHRva2VucywgcmVuZGVyZXIpIHtcbiAgICAgICAgcmVuZGVyZXIgPSByZW5kZXJlciB8fCB0aGlzLnJlbmRlcmVyO1xuICAgICAgICBsZXQgb3V0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhbnlUb2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbYW55VG9rZW4udHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbYW55VG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCBhbnlUb2tlbik7XG4gICAgICAgICAgICAgICAgaWYgKHJldCAhPT0gZmFsc2UgfHwgIVsnZXNjYXBlJywgJ2h0bWwnLCAnbGluaycsICdpbWFnZScsICdzdHJvbmcnLCAnZW0nLCAnY29kZXNwYW4nLCAnYnInLCAnZGVsJywgJ3RleHQnXS5pbmNsdWRlcyhhbnlUb2tlbi50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXNjYXBlJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaHRtbCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdsaW5rJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIubGluayh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdpbWFnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmltYWdlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0cm9uZyc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnN0cm9uZyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdlbSc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmVtKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvZGVzcGFuJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuY29kZXNwYW4odG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnYnInOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSByZW5kZXJlci5icih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdkZWwnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSByZW5kZXJlci5kZWwodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG59XG5cbmNsYXNzIF9Ib29rcyB7XG4gICAgb3B0aW9ucztcbiAgICBibG9jaztcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgX2RlZmF1bHRzO1xuICAgIH1cbiAgICBzdGF0aWMgcGFzc1Rocm91Z2hIb29rcyA9IG5ldyBTZXQoW1xuICAgICAgICAncHJlcHJvY2VzcycsXG4gICAgICAgICdwb3N0cHJvY2VzcycsXG4gICAgICAgICdwcm9jZXNzQWxsVG9rZW5zJyxcbiAgICBdKTtcbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIG1hcmtkb3duIGJlZm9yZSBtYXJrZWRcbiAgICAgKi9cbiAgICBwcmVwcm9jZXNzKG1hcmtkb3duKSB7XG4gICAgICAgIHJldHVybiBtYXJrZG93bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJvY2VzcyBIVE1MIGFmdGVyIG1hcmtlZCBpcyBmaW5pc2hlZFxuICAgICAqL1xuICAgIHBvc3Rwcm9jZXNzKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3MgYWxsIHRva2VucyBiZWZvcmUgd2FsayB0b2tlbnNcbiAgICAgKi9cbiAgICBwcm9jZXNzQWxsVG9rZW5zKHRva2Vucykge1xuICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGZ1bmN0aW9uIHRvIHRva2VuaXplIG1hcmtkb3duXG4gICAgICovXG4gICAgcHJvdmlkZUxleGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9jayA/IF9MZXhlci5sZXggOiBfTGV4ZXIubGV4SW5saW5lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGZ1bmN0aW9uIHRvIHBhcnNlIHRva2Vuc1xuICAgICAqL1xuICAgIHByb3ZpZGVQYXJzZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrID8gX1BhcnNlci5wYXJzZSA6IF9QYXJzZXIucGFyc2VJbmxpbmU7XG4gICAgfVxufVxuXG5jbGFzcyBNYXJrZWQge1xuICAgIGRlZmF1bHRzID0gX2dldERlZmF1bHRzKCk7XG4gICAgb3B0aW9ucyA9IHRoaXMuc2V0T3B0aW9ucztcbiAgICBwYXJzZSA9IHRoaXMucGFyc2VNYXJrZG93bih0cnVlKTtcbiAgICBwYXJzZUlubGluZSA9IHRoaXMucGFyc2VNYXJrZG93bihmYWxzZSk7XG4gICAgUGFyc2VyID0gX1BhcnNlcjtcbiAgICBSZW5kZXJlciA9IF9SZW5kZXJlcjtcbiAgICBUZXh0UmVuZGVyZXIgPSBfVGV4dFJlbmRlcmVyO1xuICAgIExleGVyID0gX0xleGVyO1xuICAgIFRva2VuaXplciA9IF9Ub2tlbml6ZXI7XG4gICAgSG9va3MgPSBfSG9va3M7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICB0aGlzLnVzZSguLi5hcmdzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUnVuIGNhbGxiYWNrIGZvciBldmVyeSB0b2tlblxuICAgICAqL1xuICAgIHdhbGtUb2tlbnModG9rZW5zLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KGNhbGxiYWNrLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZVRva2VuID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiB0YWJsZVRva2VuLmhlYWRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCByb3cgb2YgdGFibGVUb2tlbi5yb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2xpc3QnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KHRoaXMud2Fsa1Rva2VucyhsaXN0VG9rZW4uaXRlbXMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdlbmVyaWNUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5leHRlbnNpb25zPy5jaGlsZFRva2Vucz8uW2dlbmVyaWNUb2tlbi50eXBlXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW2dlbmVyaWNUb2tlbi50eXBlXS5mb3JFYWNoKChjaGlsZFRva2VucykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IGdlbmVyaWNUb2tlbltjaGlsZFRva2Vuc10uZmxhdChJbmZpbml0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnModG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZ2VuZXJpY1Rva2VuLnRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoZ2VuZXJpY1Rva2VuLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH1cbiAgICB1c2UoLi4uYXJncykge1xuICAgICAgICBjb25zdCBleHRlbnNpb25zID0gdGhpcy5kZWZhdWx0cy5leHRlbnNpb25zIHx8IHsgcmVuZGVyZXJzOiB7fSwgY2hpbGRUb2tlbnM6IHt9IH07XG4gICAgICAgIGFyZ3MuZm9yRWFjaCgocGFjaykgPT4ge1xuICAgICAgICAgICAgLy8gY29weSBvcHRpb25zIHRvIG5ldyBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSB7IC4uLnBhY2sgfTtcbiAgICAgICAgICAgIC8vIHNldCBhc3luYyB0byB0cnVlIGlmIGl0IHdhcyBzZXQgdG8gdHJ1ZSBiZWZvcmVcbiAgICAgICAgICAgIG9wdHMuYXN5bmMgPSB0aGlzLmRlZmF1bHRzLmFzeW5jIHx8IG9wdHMuYXN5bmMgfHwgZmFsc2U7XG4gICAgICAgICAgICAvLyA9PS0tIFBhcnNlIFwiYWRkb25cIiBleHRlbnNpb25zIC0tPT0gLy9cbiAgICAgICAgICAgIGlmIChwYWNrLmV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBwYWNrLmV4dGVuc2lvbnMuZm9yRWFjaCgoZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXh0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXh0ZW5zaW9uIG5hbWUgcmVxdWlyZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoJ3JlbmRlcmVyJyBpbiBleHQpIHsgLy8gUmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldlJlbmRlcmVyID0gZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZSZW5kZXJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgZXh0ZW5zaW9uIHdpdGggZnVuYyB0byBydW4gbmV3IGV4dGVuc2lvbiBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IGV4dC5yZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV0gPSBleHQucmVuZGVyZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCd0b2tlbml6ZXInIGluIGV4dCkgeyAvLyBUb2tlbml6ZXIgRXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleHQubGV2ZWwgfHwgKGV4dC5sZXZlbCAhPT0gJ2Jsb2NrJyAmJiBleHQubGV2ZWwgIT09ICdpbmxpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4dGVuc2lvbiBsZXZlbCBtdXN0IGJlICdibG9jaycgb3IgJ2lubGluZSdcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRMZXZlbCA9IGV4dGVuc2lvbnNbZXh0LmxldmVsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRMZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dExldmVsLnVuc2hpZnQoZXh0LnRva2VuaXplcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0gPSBbZXh0LnRva2VuaXplcl07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXh0LnN0YXJ0KSB7IC8vIEZ1bmN0aW9uIHRvIGNoZWNrIGZvciBzdGFydCBvZiB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHQubGV2ZWwgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRCbG9jayA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV4dC5sZXZlbCA9PT0gJ2lubGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUucHVzaChleHQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZSA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgnY2hpbGRUb2tlbnMnIGluIGV4dCAmJiBleHQuY2hpbGRUb2tlbnMpIHsgLy8gQ2hpbGQgdG9rZW5zIHRvIGJlIHZpc2l0ZWQgYnkgd2Fsa1Rva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1tleHQubmFtZV0gPSBleHQuY2hpbGRUb2tlbnM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvcHRzLmV4dGVuc2lvbnMgPSBleHRlbnNpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gPT0tLSBQYXJzZSBcIm92ZXJ3cml0ZVwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgICAgICAgICAgaWYgKHBhY2sucmVuZGVyZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IHRoaXMuZGVmYXVsdHMucmVuZGVyZXIgfHwgbmV3IF9SZW5kZXJlcih0aGlzLmRlZmF1bHRzKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay5yZW5kZXJlcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShwcm9wIGluIHJlbmRlcmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGByZW5kZXJlciAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ3BhcnNlciddLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgb3B0aW9ucyBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXJQcm9wID0gcHJvcDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXJGdW5jID0gcGFjay5yZW5kZXJlcltyZW5kZXJlclByb3BdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSByZW5kZXJlcltyZW5kZXJlclByb3BdO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHJlbmRlcmVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyW3JlbmRlcmVyUHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IHJlbmRlcmVyRnVuYy5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b2tlbml6ZXIgPSB0aGlzLmRlZmF1bHRzLnRva2VuaXplciB8fCBuZXcgX1Rva2VuaXplcih0aGlzLmRlZmF1bHRzKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEocHJvcCBpbiB0b2tlbml6ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRva2VuaXplciAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ3J1bGVzJywgJ2xleGVyJ10uaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBvcHRpb25zLCBydWxlcywgYW5kIGxleGVyIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuaXplclByb3AgPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbml6ZXJGdW5jID0gcGFjay50b2tlbml6ZXJbdG9rZW5pemVyUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZUb2tlbml6ZXIgPSB0b2tlbml6ZXJbdG9rZW5pemVyUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgdG9rZW5pemVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgY2Fubm90IHR5cGUgdG9rZW5pemVyIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgIHRva2VuaXplclt0b2tlbml6ZXJQcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV0ID0gdG9rZW5pemVyRnVuYy5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBwcmV2VG9rZW5pemVyLmFwcGx5KHRva2VuaXplciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRzLnRva2VuaXplciA9IHRva2VuaXplcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vID09LS0gUGFyc2UgSG9va3MgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgICAgICAgICBpZiAocGFjay5ob29rcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhvb2tzID0gdGhpcy5kZWZhdWx0cy5ob29rcyB8fCBuZXcgX0hvb2tzKCk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2suaG9va3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEocHJvcCBpbiBob29rcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaG9vayAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ2Jsb2NrJ10uaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBvcHRpb25zIGFuZCBibG9jayBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBob29rc1Byb3AgPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBob29rc0Z1bmMgPSBwYWNrLmhvb2tzW2hvb2tzUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZIb29rID0gaG9va3NbaG9va3NQcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9Ib29rcy5wYXNzVGhyb3VnaEhvb2tzLmhhcyhwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjYW5ub3QgdHlwZSBob29rIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgICAgICBob29rc1tob29rc1Byb3BdID0gKGFyZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaG9va3NGdW5jLmNhbGwoaG9va3MsIGFyZykpLnRoZW4ocmV0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2SG9vay5jYWxsKGhvb2tzLCByZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gaG9va3NGdW5jLmNhbGwoaG9va3MsIGFyZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZIb29rLmNhbGwoaG9va3MsIHJldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjYW5ub3QgdHlwZSBob29rIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgICAgICBob29rc1tob29rc1Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV0ID0gaG9va3NGdW5jLmFwcGx5KGhvb2tzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBwcmV2SG9vay5hcHBseShob29rcywgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdHMuaG9va3MgPSBob29rcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vID09LS0gUGFyc2UgV2Fsa1Rva2VucyBleHRlbnNpb25zIC0tPT0gLy9cbiAgICAgICAgICAgIGlmIChwYWNrLndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWxrVG9rZW5zID0gdGhpcy5kZWZhdWx0cy53YWxrVG9rZW5zO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhY2tXYWxrdG9rZW5zID0gcGFjay53YWxrVG9rZW5zO1xuICAgICAgICAgICAgICAgIG9wdHMud2Fsa1Rva2VucyA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHBhY2tXYWxrdG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQod2Fsa1Rva2Vucy5jYWxsKHRoaXMsIHRva2VuKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHsgLi4udGhpcy5kZWZhdWx0cywgLi4ub3B0cyB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHNldE9wdGlvbnMob3B0KSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7IC4uLnRoaXMuZGVmYXVsdHMsIC4uLm9wdCB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgbGV4ZXIoc3JjLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBfTGV4ZXIubGV4KHNyYywgb3B0aW9ucyA/PyB0aGlzLmRlZmF1bHRzKTtcbiAgICB9XG4gICAgcGFyc2VyKHRva2Vucywgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gX1BhcnNlci5wYXJzZSh0b2tlbnMsIG9wdGlvbnMgPz8gdGhpcy5kZWZhdWx0cyk7XG4gICAgfVxuICAgIHBhcnNlTWFya2Rvd24oYmxvY2tUeXBlKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIGNvbnN0IHBhcnNlID0gKHNyYywgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ09wdCA9IHsgLi4ub3B0aW9ucyB9O1xuICAgICAgICAgICAgY29uc3Qgb3B0ID0geyAuLi50aGlzLmRlZmF1bHRzLCAuLi5vcmlnT3B0IH07XG4gICAgICAgICAgICBjb25zdCB0aHJvd0Vycm9yID0gdGhpcy5vbkVycm9yKCEhb3B0LnNpbGVudCwgISFvcHQuYXN5bmMpO1xuICAgICAgICAgICAgLy8gdGhyb3cgZXJyb3IgaWYgYW4gZXh0ZW5zaW9uIHNldCBhc3luYyB0byB0cnVlIGJ1dCBwYXJzZSB3YXMgY2FsbGVkIHdpdGggYXN5bmM6IGZhbHNlXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5hc3luYyA9PT0gdHJ1ZSAmJiBvcmlnT3B0LmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IFRoZSBhc3luYyBvcHRpb24gd2FzIHNldCB0byB0cnVlIGJ5IGFuIGV4dGVuc2lvbi4gUmVtb3ZlIGFzeW5jOiBmYWxzZSBmcm9tIHRoZSBwYXJzZSBvcHRpb25zIG9iamVjdCB0byByZXR1cm4gYSBQcm9taXNlLicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRocm93IGVycm9yIGluIGNhc2Ugb2Ygbm9uIHN0cmluZyBpbnB1dFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzcmMgPT09ICd1bmRlZmluZWQnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlICdcbiAgICAgICAgICAgICAgICAgICAgKyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3JjKSArICcsIHN0cmluZyBleHBlY3RlZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgICAgICAgICAgICBvcHQuaG9va3Mub3B0aW9ucyA9IG9wdDtcbiAgICAgICAgICAgICAgICBvcHQuaG9va3MuYmxvY2sgPSBibG9ja1R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsZXhlciA9IG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcm92aWRlTGV4ZXIoKSA6IChibG9ja1R5cGUgPyBfTGV4ZXIubGV4IDogX0xleGVyLmxleElubGluZSk7XG4gICAgICAgICAgICBjb25zdCBwYXJzZXIgPSBvcHQuaG9va3MgPyBvcHQuaG9va3MucHJvdmlkZVBhcnNlcigpIDogKGJsb2NrVHlwZSA/IF9QYXJzZXIucGFyc2UgOiBfUGFyc2VyLnBhcnNlSW5saW5lKTtcbiAgICAgICAgICAgIGlmIChvcHQuYXN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYykgOiBzcmMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHNyYyA9PiBsZXhlcihzcmMsIG9wdCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRva2VucyA9PiBvcHQuaG9va3MgPyBvcHQuaG9va3MucHJvY2Vzc0FsbFRva2Vucyh0b2tlbnMpIDogdG9rZW5zKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih0b2tlbnMgPT4gb3B0LndhbGtUb2tlbnMgPyBQcm9taXNlLmFsbCh0aGlzLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2VucykpLnRoZW4oKCkgPT4gdG9rZW5zKSA6IHRva2VucylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4odG9rZW5zID0+IHBhcnNlcih0b2tlbnMsIG9wdCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGh0bWwgPT4gb3B0Lmhvb2tzID8gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpIDogaHRtbClcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKHRocm93RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNyYyA9IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCB0b2tlbnMgPSBsZXhlcihzcmMsIG9wdCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMgPSBvcHQuaG9va3MucHJvY2Vzc0FsbFRva2Vucyh0b2tlbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaHRtbCA9IHBhcnNlcih0b2tlbnMsIG9wdCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgICAgICAgICAgICBodG1sID0gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBwYXJzZTtcbiAgICB9XG4gICAgb25FcnJvcihzaWxlbnQsIGFzeW5jKSB7XG4gICAgICAgIHJldHVybiAoZSkgPT4ge1xuICAgICAgICAgICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZC4nO1xuICAgICAgICAgICAgaWYgKHNpbGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICAgICAgICAgICAgICsgZXNjYXBlJDEoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICsgJzwvcHJlPic7XG4gICAgICAgICAgICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhc3luYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5jb25zdCBtYXJrZWRJbnN0YW5jZSA9IG5ldyBNYXJrZWQoKTtcbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCkge1xuICAgIHJldHVybiBtYXJrZWRJbnN0YW5jZS5wYXJzZShzcmMsIG9wdCk7XG59XG4vKipcbiAqIFNldHMgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBIYXNoIG9mIG9wdGlvbnNcbiAqL1xubWFya2VkLm9wdGlvbnMgPVxuICAgIG1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgbWFya2VkSW5zdGFuY2Uuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgbWFya2VkLmRlZmF1bHRzID0gbWFya2VkSW5zdGFuY2UuZGVmYXVsdHM7XG4gICAgICAgIGNoYW5nZURlZmF1bHRzKG1hcmtlZC5kZWZhdWx0cyk7XG4gICAgICAgIHJldHVybiBtYXJrZWQ7XG4gICAgfTtcbi8qKlxuICogR2V0cyB0aGUgb3JpZ2luYWwgbWFya2VkIGRlZmF1bHQgb3B0aW9ucy5cbiAqL1xubWFya2VkLmdldERlZmF1bHRzID0gX2dldERlZmF1bHRzO1xubWFya2VkLmRlZmF1bHRzID0gX2RlZmF1bHRzO1xuLyoqXG4gKiBVc2UgRXh0ZW5zaW9uXG4gKi9cbm1hcmtlZC51c2UgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIG1hcmtlZEluc3RhbmNlLnVzZSguLi5hcmdzKTtcbiAgICBtYXJrZWQuZGVmYXVsdHMgPSBtYXJrZWRJbnN0YW5jZS5kZWZhdWx0cztcbiAgICBjaGFuZ2VEZWZhdWx0cyhtYXJrZWQuZGVmYXVsdHMpO1xuICAgIHJldHVybiBtYXJrZWQ7XG59O1xuLyoqXG4gKiBSdW4gY2FsbGJhY2sgZm9yIGV2ZXJ5IHRva2VuXG4gKi9cbm1hcmtlZC53YWxrVG9rZW5zID0gZnVuY3Rpb24gKHRva2VucywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbWFya2VkSW5zdGFuY2Uud2Fsa1Rva2Vucyh0b2tlbnMsIGNhbGxiYWNrKTtcbn07XG4vKipcbiAqIENvbXBpbGVzIG1hcmtkb3duIHRvIEhUTUwgd2l0aG91dCBlbmNsb3NpbmcgYHBgIHRhZy5cbiAqXG4gKiBAcGFyYW0gc3JjIFN0cmluZyBvZiBtYXJrZG93biBzb3VyY2UgdG8gYmUgY29tcGlsZWRcbiAqIEBwYXJhbSBvcHRpb25zIEhhc2ggb2Ygb3B0aW9uc1xuICogQHJldHVybiBTdHJpbmcgb2YgY29tcGlsZWQgSFRNTFxuICovXG5tYXJrZWQucGFyc2VJbmxpbmUgPSBtYXJrZWRJbnN0YW5jZS5wYXJzZUlubGluZTtcbi8qKlxuICogRXhwb3NlXG4gKi9cbm1hcmtlZC5QYXJzZXIgPSBfUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IF9QYXJzZXIucGFyc2U7XG5tYXJrZWQuUmVuZGVyZXIgPSBfUmVuZGVyZXI7XG5tYXJrZWQuVGV4dFJlbmRlcmVyID0gX1RleHRSZW5kZXJlcjtcbm1hcmtlZC5MZXhlciA9IF9MZXhlcjtcbm1hcmtlZC5sZXhlciA9IF9MZXhlci5sZXg7XG5tYXJrZWQuVG9rZW5pemVyID0gX1Rva2VuaXplcjtcbm1hcmtlZC5Ib29rcyA9IF9Ib29rcztcbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcbmNvbnN0IG9wdGlvbnMgPSBtYXJrZWQub3B0aW9ucztcbmNvbnN0IHNldE9wdGlvbnMgPSBtYXJrZWQuc2V0T3B0aW9ucztcbmNvbnN0IHVzZSA9IG1hcmtlZC51c2U7XG5jb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLndhbGtUb2tlbnM7XG5jb25zdCBwYXJzZUlubGluZSA9IG1hcmtlZC5wYXJzZUlubGluZTtcbmNvbnN0IHBhcnNlID0gbWFya2VkO1xuY29uc3QgcGFyc2VyID0gX1BhcnNlci5wYXJzZTtcbmNvbnN0IGxleGVyID0gX0xleGVyLmxleDtcblxuZXhwb3J0IHsgX0hvb2tzIGFzIEhvb2tzLCBfTGV4ZXIgYXMgTGV4ZXIsIE1hcmtlZCwgX1BhcnNlciBhcyBQYXJzZXIsIF9SZW5kZXJlciBhcyBSZW5kZXJlciwgX1RleHRSZW5kZXJlciBhcyBUZXh0UmVuZGVyZXIsIF9Ub2tlbml6ZXIgYXMgVG9rZW5pemVyLCBfZGVmYXVsdHMgYXMgZGVmYXVsdHMsIF9nZXREZWZhdWx0cyBhcyBnZXREZWZhdWx0cywgbGV4ZXIsIG1hcmtlZCwgb3B0aW9ucywgcGFyc2UsIHBhcnNlSW5saW5lLCBwYXJzZXIsIHNldE9wdGlvbnMsIHVzZSwgd2Fsa1Rva2VucyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFya2VkLmVzbS5qcy5tYXBcbiIsCiAgICAiZnVuY3Rpb24gYXNzZXJ0UGF0aChwYXRoKXtpZih0eXBlb2YgcGF0aCE9PVwic3RyaW5nXCIpdGhyb3cgVHlwZUVycm9yKFwiUGF0aCBtdXN0IGJlIGEgc3RyaW5nLiBSZWNlaXZlZCBcIitKU09OLnN0cmluZ2lmeShwYXRoKSl9ZnVuY3Rpb24gbm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCxhbGxvd0Fib3ZlUm9vdCl7dmFyIHJlcz1cIlwiLGxhc3RTZWdtZW50TGVuZ3RoPTAsbGFzdFNsYXNoPS0xLGRvdHM9MCxjb2RlO2Zvcih2YXIgaT0wO2k8PXBhdGgubGVuZ3RoOysraSl7aWYoaTxwYXRoLmxlbmd0aCljb2RlPXBhdGguY2hhckNvZGVBdChpKTtlbHNlIGlmKGNvZGU9PT00NylicmVhaztlbHNlIGNvZGU9NDc7aWYoY29kZT09PTQ3KXtpZihsYXN0U2xhc2g9PT1pLTF8fGRvdHM9PT0xKTtlbHNlIGlmKGxhc3RTbGFzaCE9PWktMSYmZG90cz09PTIpe2lmKHJlcy5sZW5ndGg8Mnx8bGFzdFNlZ21lbnRMZW5ndGghPT0yfHxyZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoLTEpIT09NDZ8fHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGgtMikhPT00Nil7aWYocmVzLmxlbmd0aD4yKXt2YXIgbGFzdFNsYXNoSW5kZXg9cmVzLmxhc3RJbmRleE9mKFwiL1wiKTtpZihsYXN0U2xhc2hJbmRleCE9PXJlcy5sZW5ndGgtMSl7aWYobGFzdFNsYXNoSW5kZXg9PT0tMSlyZXM9XCJcIixsYXN0U2VnbWVudExlbmd0aD0wO2Vsc2UgcmVzPXJlcy5zbGljZSgwLGxhc3RTbGFzaEluZGV4KSxsYXN0U2VnbWVudExlbmd0aD1yZXMubGVuZ3RoLTEtcmVzLmxhc3RJbmRleE9mKFwiL1wiKTtsYXN0U2xhc2g9aSxkb3RzPTA7Y29udGludWV9fWVsc2UgaWYocmVzLmxlbmd0aD09PTJ8fHJlcy5sZW5ndGg9PT0xKXtyZXM9XCJcIixsYXN0U2VnbWVudExlbmd0aD0wLGxhc3RTbGFzaD1pLGRvdHM9MDtjb250aW51ZX19aWYoYWxsb3dBYm92ZVJvb3Qpe2lmKHJlcy5sZW5ndGg+MClyZXMrPVwiLy4uXCI7ZWxzZSByZXM9XCIuLlwiO2xhc3RTZWdtZW50TGVuZ3RoPTJ9fWVsc2V7aWYocmVzLmxlbmd0aD4wKXJlcys9XCIvXCIrcGF0aC5zbGljZShsYXN0U2xhc2grMSxpKTtlbHNlIHJlcz1wYXRoLnNsaWNlKGxhc3RTbGFzaCsxLGkpO2xhc3RTZWdtZW50TGVuZ3RoPWktbGFzdFNsYXNoLTF9bGFzdFNsYXNoPWksZG90cz0wfWVsc2UgaWYoY29kZT09PTQ2JiZkb3RzIT09LTEpKytkb3RzO2Vsc2UgZG90cz0tMX1yZXR1cm4gcmVzfWZ1bmN0aW9uIF9mb3JtYXQoc2VwLHBhdGhPYmplY3Qpe3ZhciBkaXI9cGF0aE9iamVjdC5kaXJ8fHBhdGhPYmplY3Qucm9vdCxiYXNlPXBhdGhPYmplY3QuYmFzZXx8KHBhdGhPYmplY3QubmFtZXx8XCJcIikrKHBhdGhPYmplY3QuZXh0fHxcIlwiKTtpZighZGlyKXJldHVybiBiYXNlO2lmKGRpcj09PXBhdGhPYmplY3Qucm9vdClyZXR1cm4gZGlyK2Jhc2U7cmV0dXJuIGRpcitzZXArYmFzZX1mdW5jdGlvbiByZXNvbHZlKCl7dmFyIHJlc29sdmVkUGF0aD1cIlwiLHJlc29sdmVkQWJzb2x1dGU9ITEsY3dkO2Zvcih2YXIgaT1hcmd1bWVudHMubGVuZ3RoLTE7aT49LTEmJiFyZXNvbHZlZEFic29sdXRlO2ktLSl7dmFyIHBhdGg7aWYoaT49MClwYXRoPWFyZ3VtZW50c1tpXTtlbHNle2lmKGN3ZD09PXZvaWQgMCljd2Q9cHJvY2Vzcy5jd2QoKTtwYXRoPWN3ZH1pZihhc3NlcnRQYXRoKHBhdGgpLHBhdGgubGVuZ3RoPT09MCljb250aW51ZTtyZXNvbHZlZFBhdGg9cGF0aCtcIi9cIityZXNvbHZlZFBhdGgscmVzb2x2ZWRBYnNvbHV0ZT1wYXRoLmNoYXJDb2RlQXQoMCk9PT00N31pZihyZXNvbHZlZFBhdGg9bm9ybWFsaXplU3RyaW5nUG9zaXgocmVzb2x2ZWRQYXRoLCFyZXNvbHZlZEFic29sdXRlKSxyZXNvbHZlZEFic29sdXRlKWlmKHJlc29sdmVkUGF0aC5sZW5ndGg+MClyZXR1cm5cIi9cIityZXNvbHZlZFBhdGg7ZWxzZSByZXR1cm5cIi9cIjtlbHNlIGlmKHJlc29sdmVkUGF0aC5sZW5ndGg+MClyZXR1cm4gcmVzb2x2ZWRQYXRoO2Vsc2UgcmV0dXJuXCIuXCJ9ZnVuY3Rpb24gbm9ybWFsaXplKHBhdGgpe2lmKGFzc2VydFBhdGgocGF0aCkscGF0aC5sZW5ndGg9PT0wKXJldHVyblwiLlwiO3ZhciBpc0Fic29sdXRlPXBhdGguY2hhckNvZGVBdCgwKT09PTQ3LHRyYWlsaW5nU2VwYXJhdG9yPXBhdGguY2hhckNvZGVBdChwYXRoLmxlbmd0aC0xKT09PTQ3O2lmKHBhdGg9bm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCwhaXNBYnNvbHV0ZSkscGF0aC5sZW5ndGg9PT0wJiYhaXNBYnNvbHV0ZSlwYXRoPVwiLlwiO2lmKHBhdGgubGVuZ3RoPjAmJnRyYWlsaW5nU2VwYXJhdG9yKXBhdGgrPVwiL1wiO2lmKGlzQWJzb2x1dGUpcmV0dXJuXCIvXCIrcGF0aDtyZXR1cm4gcGF0aH1mdW5jdGlvbiBpc0Fic29sdXRlKHBhdGgpe3JldHVybiBhc3NlcnRQYXRoKHBhdGgpLHBhdGgubGVuZ3RoPjAmJnBhdGguY2hhckNvZGVBdCgwKT09PTQ3fWZ1bmN0aW9uIGpvaW4oKXtpZihhcmd1bWVudHMubGVuZ3RoPT09MClyZXR1cm5cIi5cIjt2YXIgam9pbmVkO2Zvcih2YXIgaT0wO2k8YXJndW1lbnRzLmxlbmd0aDsrK2kpe3ZhciBhcmc9YXJndW1lbnRzW2ldO2lmKGFzc2VydFBhdGgoYXJnKSxhcmcubGVuZ3RoPjApaWYoam9pbmVkPT09dm9pZCAwKWpvaW5lZD1hcmc7ZWxzZSBqb2luZWQrPVwiL1wiK2FyZ31pZihqb2luZWQ9PT12b2lkIDApcmV0dXJuXCIuXCI7cmV0dXJuIG5vcm1hbGl6ZShqb2luZWQpfWZ1bmN0aW9uIHJlbGF0aXZlKGZyb20sdG8pe2lmKGFzc2VydFBhdGgoZnJvbSksYXNzZXJ0UGF0aCh0byksZnJvbT09PXRvKXJldHVyblwiXCI7aWYoZnJvbT1yZXNvbHZlKGZyb20pLHRvPXJlc29sdmUodG8pLGZyb209PT10bylyZXR1cm5cIlwiO3ZhciBmcm9tU3RhcnQ9MTtmb3IoO2Zyb21TdGFydDxmcm9tLmxlbmd0aDsrK2Zyb21TdGFydClpZihmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0KSE9PTQ3KWJyZWFrO3ZhciBmcm9tRW5kPWZyb20ubGVuZ3RoLGZyb21MZW49ZnJvbUVuZC1mcm9tU3RhcnQsdG9TdGFydD0xO2Zvcig7dG9TdGFydDx0by5sZW5ndGg7Kyt0b1N0YXJ0KWlmKHRvLmNoYXJDb2RlQXQodG9TdGFydCkhPT00NylicmVhazt2YXIgdG9FbmQ9dG8ubGVuZ3RoLHRvTGVuPXRvRW5kLXRvU3RhcnQsbGVuZ3RoPWZyb21MZW48dG9MZW4/ZnJvbUxlbjp0b0xlbixsYXN0Q29tbW9uU2VwPS0xLGk9MDtmb3IoO2k8PWxlbmd0aDsrK2kpe2lmKGk9PT1sZW5ndGgpe2lmKHRvTGVuPmxlbmd0aCl7aWYodG8uY2hhckNvZGVBdCh0b1N0YXJ0K2kpPT09NDcpcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQraSsxKTtlbHNlIGlmKGk9PT0wKXJldHVybiB0by5zbGljZSh0b1N0YXJ0K2kpfWVsc2UgaWYoZnJvbUxlbj5sZW5ndGgpe2lmKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQraSk9PT00NylsYXN0Q29tbW9uU2VwPWk7ZWxzZSBpZihpPT09MClsYXN0Q29tbW9uU2VwPTB9YnJlYWt9dmFyIGZyb21Db2RlPWZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQraSksdG9Db2RlPXRvLmNoYXJDb2RlQXQodG9TdGFydCtpKTtpZihmcm9tQ29kZSE9PXRvQ29kZSlicmVhaztlbHNlIGlmKGZyb21Db2RlPT09NDcpbGFzdENvbW1vblNlcD1pfXZhciBvdXQ9XCJcIjtmb3IoaT1mcm9tU3RhcnQrbGFzdENvbW1vblNlcCsxO2k8PWZyb21FbmQ7KytpKWlmKGk9PT1mcm9tRW5kfHxmcm9tLmNoYXJDb2RlQXQoaSk9PT00NylpZihvdXQubGVuZ3RoPT09MClvdXQrPVwiLi5cIjtlbHNlIG91dCs9XCIvLi5cIjtpZihvdXQubGVuZ3RoPjApcmV0dXJuIG91dCt0by5zbGljZSh0b1N0YXJ0K2xhc3RDb21tb25TZXApO2Vsc2V7aWYodG9TdGFydCs9bGFzdENvbW1vblNlcCx0by5jaGFyQ29kZUF0KHRvU3RhcnQpPT09NDcpKyt0b1N0YXJ0O3JldHVybiB0by5zbGljZSh0b1N0YXJ0KX19ZnVuY3Rpb24gX21ha2VMb25nKHBhdGgpe3JldHVybiBwYXRofWZ1bmN0aW9uIGRpcm5hbWUocGF0aCl7aWYoYXNzZXJ0UGF0aChwYXRoKSxwYXRoLmxlbmd0aD09PTApcmV0dXJuXCIuXCI7dmFyIGNvZGU9cGF0aC5jaGFyQ29kZUF0KDApLGhhc1Jvb3Q9Y29kZT09PTQ3LGVuZD0tMSxtYXRjaGVkU2xhc2g9ITA7Zm9yKHZhciBpPXBhdGgubGVuZ3RoLTE7aT49MTstLWkpaWYoY29kZT1wYXRoLmNoYXJDb2RlQXQoaSksY29kZT09PTQ3KXtpZighbWF0Y2hlZFNsYXNoKXtlbmQ9aTticmVha319ZWxzZSBtYXRjaGVkU2xhc2g9ITE7aWYoZW5kPT09LTEpcmV0dXJuIGhhc1Jvb3Q/XCIvXCI6XCIuXCI7aWYoaGFzUm9vdCYmZW5kPT09MSlyZXR1cm5cIi8vXCI7cmV0dXJuIHBhdGguc2xpY2UoMCxlbmQpfWZ1bmN0aW9uIGJhc2VuYW1lKHBhdGgsZXh0KXtpZihleHQhPT12b2lkIDAmJnR5cGVvZiBleHQhPT1cInN0cmluZ1wiKXRocm93IFR5cGVFcnJvcignXCJleHRcIiBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJyk7YXNzZXJ0UGF0aChwYXRoKTt2YXIgc3RhcnQ9MCxlbmQ9LTEsbWF0Y2hlZFNsYXNoPSEwLGk7aWYoZXh0IT09dm9pZCAwJiZleHQubGVuZ3RoPjAmJmV4dC5sZW5ndGg8PXBhdGgubGVuZ3RoKXtpZihleHQubGVuZ3RoPT09cGF0aC5sZW5ndGgmJmV4dD09PXBhdGgpcmV0dXJuXCJcIjt2YXIgZXh0SWR4PWV4dC5sZW5ndGgtMSxmaXJzdE5vblNsYXNoRW5kPS0xO2ZvcihpPXBhdGgubGVuZ3RoLTE7aT49MDstLWkpe3ZhciBjb2RlPXBhdGguY2hhckNvZGVBdChpKTtpZihjb2RlPT09NDcpe2lmKCFtYXRjaGVkU2xhc2gpe3N0YXJ0PWkrMTticmVha319ZWxzZXtpZihmaXJzdE5vblNsYXNoRW5kPT09LTEpbWF0Y2hlZFNsYXNoPSExLGZpcnN0Tm9uU2xhc2hFbmQ9aSsxO2lmKGV4dElkeD49MClpZihjb2RlPT09ZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSl7aWYoLS1leHRJZHg9PT0tMSllbmQ9aX1lbHNlIGV4dElkeD0tMSxlbmQ9Zmlyc3ROb25TbGFzaEVuZH19aWYoc3RhcnQ9PT1lbmQpZW5kPWZpcnN0Tm9uU2xhc2hFbmQ7ZWxzZSBpZihlbmQ9PT0tMSllbmQ9cGF0aC5sZW5ndGg7cmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsZW5kKX1lbHNle2ZvcihpPXBhdGgubGVuZ3RoLTE7aT49MDstLWkpaWYocGF0aC5jaGFyQ29kZUF0KGkpPT09NDcpe2lmKCFtYXRjaGVkU2xhc2gpe3N0YXJ0PWkrMTticmVha319ZWxzZSBpZihlbmQ9PT0tMSltYXRjaGVkU2xhc2g9ITEsZW5kPWkrMTtpZihlbmQ9PT0tMSlyZXR1cm5cIlwiO3JldHVybiBwYXRoLnNsaWNlKHN0YXJ0LGVuZCl9fWZ1bmN0aW9uIGV4dG5hbWUocGF0aCl7YXNzZXJ0UGF0aChwYXRoKTt2YXIgc3RhcnREb3Q9LTEsc3RhcnRQYXJ0PTAsZW5kPS0xLG1hdGNoZWRTbGFzaD0hMCxwcmVEb3RTdGF0ZT0wO2Zvcih2YXIgaT1wYXRoLmxlbmd0aC0xO2k+PTA7LS1pKXt2YXIgY29kZT1wYXRoLmNoYXJDb2RlQXQoaSk7aWYoY29kZT09PTQ3KXtpZighbWF0Y2hlZFNsYXNoKXtzdGFydFBhcnQ9aSsxO2JyZWFrfWNvbnRpbnVlfWlmKGVuZD09PS0xKW1hdGNoZWRTbGFzaD0hMSxlbmQ9aSsxO2lmKGNvZGU9PT00Nil7aWYoc3RhcnREb3Q9PT0tMSlzdGFydERvdD1pO2Vsc2UgaWYocHJlRG90U3RhdGUhPT0xKXByZURvdFN0YXRlPTF9ZWxzZSBpZihzdGFydERvdCE9PS0xKXByZURvdFN0YXRlPS0xfWlmKHN0YXJ0RG90PT09LTF8fGVuZD09PS0xfHxwcmVEb3RTdGF0ZT09PTB8fHByZURvdFN0YXRlPT09MSYmc3RhcnREb3Q9PT1lbmQtMSYmc3RhcnREb3Q9PT1zdGFydFBhcnQrMSlyZXR1cm5cIlwiO3JldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LGVuZCl9ZnVuY3Rpb24gZm9ybWF0KHBhdGhPYmplY3Qpe2lmKHBhdGhPYmplY3Q9PT1udWxsfHx0eXBlb2YgcGF0aE9iamVjdCE9PVwib2JqZWN0XCIpdGhyb3cgVHlwZUVycm9yKCdUaGUgXCJwYXRoT2JqZWN0XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnK3R5cGVvZiBwYXRoT2JqZWN0KTtyZXR1cm4gX2Zvcm1hdChcIi9cIixwYXRoT2JqZWN0KX1mdW5jdGlvbiBwYXJzZShwYXRoKXthc3NlcnRQYXRoKHBhdGgpO3ZhciByZXQ9e3Jvb3Q6XCJcIixkaXI6XCJcIixiYXNlOlwiXCIsZXh0OlwiXCIsbmFtZTpcIlwifTtpZihwYXRoLmxlbmd0aD09PTApcmV0dXJuIHJldDt2YXIgY29kZT1wYXRoLmNoYXJDb2RlQXQoMCksaXNBYnNvbHV0ZTI9Y29kZT09PTQ3LHN0YXJ0O2lmKGlzQWJzb2x1dGUyKXJldC5yb290PVwiL1wiLHN0YXJ0PTE7ZWxzZSBzdGFydD0wO3ZhciBzdGFydERvdD0tMSxzdGFydFBhcnQ9MCxlbmQ9LTEsbWF0Y2hlZFNsYXNoPSEwLGk9cGF0aC5sZW5ndGgtMSxwcmVEb3RTdGF0ZT0wO2Zvcig7aT49c3RhcnQ7LS1pKXtpZihjb2RlPXBhdGguY2hhckNvZGVBdChpKSxjb2RlPT09NDcpe2lmKCFtYXRjaGVkU2xhc2gpe3N0YXJ0UGFydD1pKzE7YnJlYWt9Y29udGludWV9aWYoZW5kPT09LTEpbWF0Y2hlZFNsYXNoPSExLGVuZD1pKzE7aWYoY29kZT09PTQ2KXtpZihzdGFydERvdD09PS0xKXN0YXJ0RG90PWk7ZWxzZSBpZihwcmVEb3RTdGF0ZSE9PTEpcHJlRG90U3RhdGU9MX1lbHNlIGlmKHN0YXJ0RG90IT09LTEpcHJlRG90U3RhdGU9LTF9aWYoc3RhcnREb3Q9PT0tMXx8ZW5kPT09LTF8fHByZURvdFN0YXRlPT09MHx8cHJlRG90U3RhdGU9PT0xJiZzdGFydERvdD09PWVuZC0xJiZzdGFydERvdD09PXN0YXJ0UGFydCsxKXtpZihlbmQhPT0tMSlpZihzdGFydFBhcnQ9PT0wJiZpc0Fic29sdXRlMilyZXQuYmFzZT1yZXQubmFtZT1wYXRoLnNsaWNlKDEsZW5kKTtlbHNlIHJldC5iYXNlPXJldC5uYW1lPXBhdGguc2xpY2Uoc3RhcnRQYXJ0LGVuZCl9ZWxzZXtpZihzdGFydFBhcnQ9PT0wJiZpc0Fic29sdXRlMilyZXQubmFtZT1wYXRoLnNsaWNlKDEsc3RhcnREb3QpLHJldC5iYXNlPXBhdGguc2xpY2UoMSxlbmQpO2Vsc2UgcmV0Lm5hbWU9cGF0aC5zbGljZShzdGFydFBhcnQsc3RhcnREb3QpLHJldC5iYXNlPXBhdGguc2xpY2Uoc3RhcnRQYXJ0LGVuZCk7cmV0LmV4dD1wYXRoLnNsaWNlKHN0YXJ0RG90LGVuZCl9aWYoc3RhcnRQYXJ0PjApcmV0LmRpcj1wYXRoLnNsaWNlKDAsc3RhcnRQYXJ0LTEpO2Vsc2UgaWYoaXNBYnNvbHV0ZTIpcmV0LmRpcj1cIi9cIjtyZXR1cm4gcmV0fXZhciBzZXA9XCIvXCIsZGVsaW1pdGVyPVwiOlwiLHBvc2l4PSgocCk9PihwLnBvc2l4PXAscCkpKHtyZXNvbHZlLG5vcm1hbGl6ZSxpc0Fic29sdXRlLGpvaW4scmVsYXRpdmUsX21ha2VMb25nLGRpcm5hbWUsYmFzZW5hbWUsZXh0bmFtZSxmb3JtYXQscGFyc2Usc2VwLGRlbGltaXRlcix3aW4zMjpudWxsLHBvc2l4Om51bGx9KTt2YXIgcGF0aF9kZWZhdWx0PXBvc2l4O2V4cG9ydHtzZXAscmVzb2x2ZSxyZWxhdGl2ZSxwb3NpeCxwYXJzZSxub3JtYWxpemUsam9pbixpc0Fic29sdXRlLGZvcm1hdCxleHRuYW1lLGRpcm5hbWUsZGVsaW1pdGVyLHBhdGhfZGVmYXVsdCBhcyBkZWZhdWx0LGJhc2VuYW1lLF9tYWtlTG9uZ307IiwKICAgICJpbXBvcnQge21hcmtlZH0gZnJvbSAnbWFya2VkJ1xuaW1wb3J0IHtyZWFkRmlsZX0gZnJvbSAnZnMvcHJvbWlzZXMnXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnXG5cbi8vIENvbmZpZ3VyZSBtYXJrZWRcbm1hcmtlZC5zZXRPcHRpb25zKHtcblx0Z2ZtOiB0cnVlLFxuXHRicmVha3M6IGZhbHNlLFxufSlcblxuZXhwb3J0IGludGVyZmFjZSBEb2NQYWdlIHtcblx0dGl0bGU6IHN0cmluZ1xuXHRjb250ZW50OiBzdHJpbmdcblx0bWV0YURlc2NyaXB0aW9uOiBzdHJpbmdcbn1cblxuY29uc3QgbWV0YURlc2NyaXB0aW9uUmVnZXggPSAvPCEtLW1ldGEtZGVzY3JpcHRpb25cXG4oW1xcc1xcU10rPylcXG4tLT4vbVxuXG5mdW5jdGlvbiBleHRyYWN0TWV0YURlc2NyaXB0aW9uKG1hcmtkb3duOiBzdHJpbmcsIGRlZmF1bHREZXNjOiBzdHJpbmcgPSAnTWl0aHJpbC5qcyBEb2N1bWVudGF0aW9uJyk6IHN0cmluZyB7XG5cdGNvbnN0IG1hdGNoID0gbWFya2Rvd24ubWF0Y2gobWV0YURlc2NyaXB0aW9uUmVnZXgpXG5cdHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRyaW0oKSA6IGRlZmF1bHREZXNjXG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RUaXRsZShtYXJrZG93bjogc3RyaW5nKTogc3RyaW5nIHtcblx0Y29uc3QgaDFNYXRjaCA9IG1hcmtkb3duLm1hdGNoKC9eI1xccysoLispJC9tKVxuXHRyZXR1cm4gaDFNYXRjaCA/IGgxTWF0Y2hbMV0gOiAnTWl0aHJpbC5qcydcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRNYXJrZG93bkZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8RG9jUGFnZT4ge1xuXHRjb25zdCBtYXJrZG93biA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoLCAndXRmLTgnKVxuXHRjb25zdCBodG1sID0gbWFya2VkLnBhcnNlKG1hcmtkb3duKSBhcyBzdHJpbmdcblx0Y29uc3QgdGl0bGUgPSBleHRyYWN0VGl0bGUobWFya2Rvd24pXG5cdGNvbnN0IG1ldGFEZXNjcmlwdGlvbiA9IGV4dHJhY3RNZXRhRGVzY3JpcHRpb24obWFya2Rvd24pXG5cdFxuXHRyZXR1cm4ge1xuXHRcdHRpdGxlLFxuXHRcdGNvbnRlbnQ6IGh0bWwsXG5cdFx0bWV0YURlc2NyaXB0aW9uLFxuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkTWFya2Rvd25Gcm9tRG9jcyhkb2NOYW1lOiBzdHJpbmcpOiBQcm9taXNlPERvY1BhZ2UgfCBudWxsPiB7XG5cdC8vIE9ubHkgbG9hZCBtYXJrZG93biBvbiBzZXJ2ZXIgKEJ1bi9Ob2RlLmpzKSwgbm90IGluIGJyb3dzZXJcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0cmV0dXJuIG51bGxcblx0fVxuXHRcblx0dHJ5IHtcblx0XHQvLyBMb2FkIGZyb20gaW4tcmVwbyBjb250ZW50IChtaXRocmlsL2RvY3Mvc2l0ZS9jb250ZW50Lylcblx0XHRjb25zdCBkb2NzUGF0aCA9IGpvaW4oaW1wb3J0Lm1ldGEuZGlyLCAnY29udGVudCcsIGAke2RvY05hbWV9Lm1kYClcblx0XHRyZXR1cm4gYXdhaXQgbG9hZE1hcmtkb3duRmlsZShkb2NzUGF0aClcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIG51bGxcblx0fVxufVxuIiwKICAgICJpbXBvcnQge3JlYWRGaWxlfSBmcm9tICdmcy9wcm9taXNlcydcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCdcbmltcG9ydCB7bWFya2VkfSBmcm9tICdtYXJrZWQnXG5pbXBvcnQgdHlwZSB7TmF2U2VjdGlvbn0gZnJvbSAnLi9zdG9yZSdcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5hdkd1aWRlcygpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiAnJ1xuXHR0cnkge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShqb2luKGltcG9ydC5tZXRhLmRpciwgJ2NvbnRlbnQnLCAnbmF2LWd1aWRlcy5tZCcpLCAndXRmLTgnKVxuXHRcdHJldHVybiBtYXJrZWQucGFyc2UoY29udGVudCkgYXMgc3RyaW5nXG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiAnJ1xuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROYXZNZXRob2RzKCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgcmV0dXJuICcnXG5cdHRyeSB7XG5cdFx0Y29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKGpvaW4oaW1wb3J0Lm1ldGEuZGlyLCAnY29udGVudCcsICduYXYtbWV0aG9kcy5tZCcpLCAndXRmLTgnKVxuXHRcdHJldHVybiBtYXJrZWQucGFyc2UoY29udGVudCkgYXMgc3RyaW5nXG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiAnJ1xuXHR9XG59XG5cbmNvbnN0IGxpbmtSZWdleCA9IC9cXFsoW15cXF1dKylcXF1cXCgoW14pXSspXFwpL1xuXG5mdW5jdGlvbiBwYXJzZU5hdlRvU3RydWN0dXJlKG1hcmtkb3duOiBzdHJpbmcpOiBOYXZTZWN0aW9uW10ge1xuXHRjb25zdCBzZWN0aW9uczogTmF2U2VjdGlvbltdID0gW11cblx0bGV0IGN1cnJlbnRTZWN0aW9uOiBOYXZTZWN0aW9uIHwgbnVsbCA9IG51bGxcblxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbWFya2Rvd24uc3BsaXQoJ1xcbicpKSB7XG5cdFx0Y29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpXG5cdFx0aWYgKCF0cmltbWVkKSBjb250aW51ZVxuXG5cdFx0Y29uc3QgbGlua01hdGNoID0gdHJpbW1lZC5tYXRjaChsaW5rUmVnZXgpXG5cdFx0Y29uc3QgaXNOZXN0ZWQgPSBsaW5lLnN0YXJ0c1dpdGgoJ1xcdCcpIHx8IGxpbmUuc3RhcnRzV2l0aCgnICAnKVxuXG5cdFx0aWYgKGxpbmtNYXRjaCkge1xuXHRcdFx0Y29uc3QgWywgdGV4dCwgaHJlZl0gPSBsaW5rTWF0Y2hcblx0XHRcdGNvbnN0IGV4dGVybmFsID0gaHJlZi5zdGFydHNXaXRoKCdodHRwJylcblx0XHRcdGlmIChpc05lc3RlZCAmJiBjdXJyZW50U2VjdGlvbikge1xuXHRcdFx0XHRjdXJyZW50U2VjdGlvbi5saW5rcy5wdXNoKHt0ZXh0LCBocmVmLCBleHRlcm5hbH0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXJyZW50U2VjdGlvbiA9IHt0aXRsZTogdGV4dCwgbGlua3M6IFt7dGV4dCwgaHJlZiwgZXh0ZXJuYWx9XX1cblx0XHRcdFx0c2VjdGlvbnMucHVzaChjdXJyZW50U2VjdGlvbilcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFpc05lc3RlZCAmJiB0cmltbWVkLnN0YXJ0c1dpdGgoJy0gJykpIHtcblx0XHRcdGNvbnN0IHRpdGxlID0gdHJpbW1lZC5zbGljZSgyKS50cmltKClcblx0XHRcdGN1cnJlbnRTZWN0aW9uID0ge3RpdGxlLCBsaW5rczogW119XG5cdFx0XHRzZWN0aW9ucy5wdXNoKGN1cnJlbnRTZWN0aW9uKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2VjdGlvbnNcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5hdkd1aWRlc1N0cnVjdHVyZSgpOiBQcm9taXNlPE5hdlNlY3Rpb25bXT4ge1xuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBbXVxuXHR0cnkge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShqb2luKGltcG9ydC5tZXRhLmRpciwgJ2NvbnRlbnQnLCAnbmF2LWd1aWRlcy5tZCcpLCAndXRmLTgnKVxuXHRcdHJldHVybiBwYXJzZU5hdlRvU3RydWN0dXJlKGNvbnRlbnQpXG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiBbXVxuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROYXZNZXRob2RzU3RydWN0dXJlKCk6IFByb21pc2U8TmF2U2VjdGlvbltdPiB7XG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIFtdXG5cdHRyeSB7XG5cdFx0Y29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKGpvaW4oaW1wb3J0Lm1ldGEuZGlyLCAnY29udGVudCcsICduYXYtbWV0aG9kcy5tZCcpLCAndXRmLTgnKVxuXHRcdHJldHVybiBwYXJzZU5hdlRvU3RydWN0dXJlKGNvbnRlbnQpXG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiBbXVxuXHR9XG59XG4iLAogICAgIi8vIFRoaXMgZXhpc3RzIHNvIEknbSBvbmx5IHNhdmluZyBpdCBvbmNlLlxuZXhwb3J0IGRlZmF1bHQge30uaGFzT3duUHJvcGVydHlcbiIsCiAgICAiLy8gVHlwZSBkZWZpbml0aW9ucyBmb3IgTWl0aHJpbCBjb21wb25lbnRzIGFuZCB2bm9kZXNcblxuZXhwb3J0IGludGVyZmFjZSBWbm9kZTxBdHRycyA9IFJlY29yZDxzdHJpbmcsIGFueT4sIFN0YXRlID0gYW55PiB7XG5cdHRhZzogc3RyaW5nIHwgQ29tcG9uZW50PEF0dHJzLCBTdGF0ZT4gfCAoKCkgPT4gQ29tcG9uZW50PEF0dHJzLCBTdGF0ZT4pXG5cdGtleT86IHN0cmluZyB8IG51bWJlciB8IG51bGxcblx0YXR0cnM/OiBBdHRyc1xuXHRjaGlsZHJlbj86IENoaWxkcmVuXG5cdHRleHQ/OiBzdHJpbmcgfCBudW1iZXJcblx0ZG9tPzogTm9kZSB8IG51bGxcblx0aXM/OiBzdHJpbmdcblx0ZG9tU2l6ZT86IG51bWJlclxuXHRzdGF0ZT86IFN0YXRlXG5cdGV2ZW50cz86IFJlY29yZDxzdHJpbmcsIGFueT5cblx0aW5zdGFuY2U/OiBhbnlcbn1cblxuLyoqIFNpbmdsZSBjaGlsZCAtIFZub2RlL0VsZW1lbnQsIHByaW1pdGl2ZXMsIG9yIG51bGwvdW5kZWZpbmVkICovXG5leHBvcnQgdHlwZSBDaGlsZCA9IFZub2RlIHwgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWRcbi8qKiBDaGlsZHJlbjogc2luZ2xlIGNoaWxkLCBhcnJheSBvZiBjaGlsZHJlbiwgb3IgcHJpbWl0aXZlcy4gQXJyYXlzIG1heSBjb250YWluIGZhbHNlIChjb25kaXRpb25hbGx5IGhpZGRlbikuICovXG5leHBvcnQgdHlwZSBDaGlsZHJlbiA9IENoaWxkIHwgQ2hpbGRbXVxuXG4vKiogVm5vZGUgd2l0aCBkb20gZ3VhcmFudGVlZCAob25jcmVhdGUvb251cGRhdGUgbGlmZWN5Y2xlKSAqL1xuZXhwb3J0IHR5cGUgVm5vZGVET008QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4gPSBDb21wb25lbnRWbm9kZTxBdHRycywgU3RhdGU+ICYgeyBkb206IEVsZW1lbnQgfVxuXG4vKipcbiAqIFZub2RlIHBhc3NlZCB0byBjb21wb25lbnQgbGlmZWN5Y2xlIG1ldGhvZHMgLSBhdHRycyBpcyBhbHdheXMgZGVmaW5lZCAoTWl0aHJpbCBwYXNzZXMgYXQgbGVhc3Qge30pLlxuICogVXNlIHRoaXMgc28gdm5vZGUuYXR0cnMgaXMgbmV2ZXIgdW5kZWZpbmVkIGluIHZpZXcvb25pbml0L29uY3JlYXRlIGV0Yy5cbiAqL1xuZXhwb3J0IHR5cGUgQ29tcG9uZW50Vm5vZGU8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4gPSBPbWl0PFZub2RlPEF0dHJzLCBTdGF0ZT4sICdhdHRycyc+ICYge2F0dHJzOiBBdHRyc31cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnQ8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4ge1xuXHRvbmluaXQ/OiAodm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IHZvaWRcblx0b25jcmVhdGU/OiAodm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IHZvaWRcblx0b25iZWZvcmV1cGRhdGU/OiAodm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzLCBTdGF0ZT4sIG9sZDogQ29tcG9uZW50Vm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gYm9vbGVhbiB8IHZvaWRcblx0b251cGRhdGU/OiAodm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IHZvaWRcblx0b25iZWZvcmVyZW1vdmU/OiAodm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IFByb21pc2U8YW55PiB8IHZvaWRcblx0b25yZW1vdmU/OiAodm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IHZvaWRcblx0dmlldzogKHZub2RlOiBDb21wb25lbnRWbm9kZTxBdHRycywgU3RhdGU+KSA9PiBDaGlsZHJlbiB8IFZub2RlIHwgbnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEZhY3Rvcnk8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4ge1xuXHQoLi4uYXJnczogYW55W10pOiBDb21wb25lbnQ8QXR0cnMsIFN0YXRlPlxuXHR2aWV3PzogKHZub2RlOiBDb21wb25lbnRWbm9kZTxBdHRycywgU3RhdGU+KSA9PiBDaGlsZHJlbiB8IFZub2RlIHwgbnVsbFxufVxuXG5leHBvcnQgdHlwZSBDb21wb25lbnRUeXBlPEF0dHJzID0gUmVjb3JkPHN0cmluZywgYW55PiwgU3RhdGUgPSBhbnk+ID0gXG5cdHwgQ29tcG9uZW50PEF0dHJzLCBTdGF0ZT5cblx0fCBDb21wb25lbnRGYWN0b3J5PEF0dHJzLCBTdGF0ZT5cblx0fCAoKCkgPT4gQ29tcG9uZW50PEF0dHJzLCBTdGF0ZT4pXG5cdHwgKG5ldyAoLi4uYXJnczogYW55W10pID0+IE1pdGhyaWxDb21wb25lbnQ8QXR0cnM+KVxuXG4vKipcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIFRTWC9KU1ggY2xhc3MtYmFzZWQgY29tcG9uZW50cy5cbiAqIEFzc2lnbiB2aWV3IGFzIGEgcHJvcGVydHkgc28gVHlwZVNjcmlwdCBpbmZlcnMgdm5vZGUgZnJvbSB0aGUgdGVtcGxhdGU6IHZpZXcgPSAodm5vZGUpID0+IHsgLi4uIH1cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1pdGhyaWxDb21wb25lbnQ8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG5cdC8qKiBSZXF1aXJlZCBmb3IgSlNYIGF0dHJpYnV0ZSB0eXBlLWNoZWNraW5nIC0gZG8gbm90IHVzZSBkaXJlY3RseSAqL1xuXHRwcml2YXRlIHJlYWRvbmx5IF9fdHN4X2F0dHJzITogKHVua25vd24gZXh0ZW5kcyBBdHRycyA/IFJlY29yZDxzdHJpbmcsIGFueT4gOiBBdHRycykgJiB7a2V5Pzogc3RyaW5nIHwgbnVtYmVyfVxuXG5cdG9uaW5pdD8odm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzPik6IHZvaWRcblx0b25jcmVhdGU/KHZub2RlOiBDb21wb25lbnRWbm9kZTxBdHRycz4pOiB2b2lkXG5cdG9uYmVmb3JldXBkYXRlPyh2bm9kZTogQ29tcG9uZW50Vm5vZGU8QXR0cnM+LCBvbGQ6IENvbXBvbmVudFZub2RlPEF0dHJzPik6IGJvb2xlYW4gfCB2b2lkXG5cdG9udXBkYXRlPyh2bm9kZTogQ29tcG9uZW50Vm5vZGU8QXR0cnM+KTogdm9pZFxuXHRvbmJlZm9yZXJlbW92ZT8odm5vZGU6IENvbXBvbmVudFZub2RlPEF0dHJzPik6IFByb21pc2U8YW55PiB8IHZvaWRcblx0b25yZW1vdmU/KHZub2RlOiBDb21wb25lbnRWbm9kZTxBdHRycz4pOiB2b2lkXG5cdC8qKiBJbXBsZW1lbnQgaW4gc3ViY2xhc3M6IHZpZXcodm5vZGUpIHsgLi4uIH0gLSBhbm5vdGF0ZSB2bm9kZSBhcyBtLlZub2RlPEF0dHJzPiAqL1xuXHRhYnN0cmFjdCB2aWV3KHZub2RlOiBDb21wb25lbnRWbm9kZTxBdHRycz4pOiBDaGlsZHJlbiB8IFZub2RlIHwgbnVsbFxufVxuXG4vKiogSGVscGVyIHR5cGUgZm9yIFZub2RlIG9mIGEgY29tcG9uZW50IC0gdXNlIHdoZW4gdGhpc1snVm5vZGUnXSBpcyBub3QgYXZhaWxhYmxlICovXG5leHBvcnQgdHlwZSBWbm9kZU9mPFQ+ID0gVCBleHRlbmRzIE1pdGhyaWxDb21wb25lbnQ8aW5mZXIgQT4gPyBDb21wb25lbnRWbm9kZTxBPiA6IG5ldmVyXG5cbmZ1bmN0aW9uIFZub2RlKHRhZzogYW55LCBrZXk6IHN0cmluZyB8IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQsIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCB8IHVuZGVmaW5lZCwgY2hpbGRyZW46IENoaWxkcmVuIHwgbnVsbCB8IHVuZGVmaW5lZCwgdGV4dDogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCwgZG9tOiBOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFZub2RlIHtcblx0cmV0dXJuIHt0YWc6IHRhZywga2V5OiBrZXkgPz8gdW5kZWZpbmVkLCBhdHRyczogYXR0cnMgPz8gdW5kZWZpbmVkLCBjaGlsZHJlbjogY2hpbGRyZW4gPz8gdW5kZWZpbmVkLCB0ZXh0OiB0ZXh0ID8/IHVuZGVmaW5lZCwgZG9tOiBkb20gPz8gdW5kZWZpbmVkLCBpczogdW5kZWZpbmVkLCBkb21TaXplOiB1bmRlZmluZWQsIHN0YXRlOiB1bmRlZmluZWQsIGV2ZW50czogdW5kZWZpbmVkLCBpbnN0YW5jZTogdW5kZWZpbmVkfVxufVxuY29uc3Qgbm9ybWFsaXplID0gZnVuY3Rpb24obm9kZTogYW55KTogVm5vZGUgfCBudWxsIHtcblx0aWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHJldHVybiBWbm9kZSgnWycsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBub3JtYWxpemVDaGlsZHJlbihub2RlKSBhcyBDaGlsZHJlbiwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG5cdGlmIChub2RlID09IG51bGwgfHwgdHlwZW9mIG5vZGUgPT09ICdib29sZWFuJykgcmV0dXJuIG51bGxcblx0aWYgKHR5cGVvZiBub2RlID09PSAnb2JqZWN0JykgcmV0dXJuIG5vZGVcblx0cmV0dXJuIFZub2RlKCcjJywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFN0cmluZyhub2RlKSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG59XG5cbmNvbnN0IG5vcm1hbGl6ZUNoaWxkcmVuID0gZnVuY3Rpb24oaW5wdXQ6IGFueVtdKTogKFZub2RlIHwgbnVsbClbXSB7XG5cdC8vIFByZWFsbG9jYXRlIHRoZSBhcnJheSBsZW5ndGggKGluaXRpYWxseSBob2xleSkgYW5kIGZpbGwgZXZlcnkgaW5kZXggaW1tZWRpYXRlbHkgaW4gb3JkZXIuXG5cdC8vIEJlbmNobWFya2luZyBzaG93cyBiZXR0ZXIgcGVyZm9ybWFuY2Ugb24gVjguXG5cdGNvbnN0IGNoaWxkcmVuID0gbmV3IEFycmF5KGlucHV0Lmxlbmd0aClcblx0Ly8gQ291bnQgdGhlIG51bWJlciBvZiBrZXllZCBub3JtYWxpemVkIHZub2RlcyBmb3IgY29uc2lzdGVuY3kgY2hlY2suXG5cdC8vIE5vdGU6IHRoaXMgaXMgYSBwZXJmLXNlbnNpdGl2ZSBjaGVjay5cblx0Ly8gRnVuIGZhY3Q6IG1lcmdpbmcgdGhlIGxvb3AgbGlrZSB0aGlzIGlzIHNvbWVob3cgZmFzdGVyIHRoYW4gc3BsaXR0aW5nXG5cdC8vIHRoZSBjaGVjayB3aXRoaW4gdXBkYXRlTm9kZXMoKSwgbm90aWNlYWJseSBzby5cblx0bGV0IG51bUtleWVkID0gMFxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2hpbGRyZW5baV0gPSBub3JtYWxpemUoaW5wdXRbaV0pXG5cdFx0aWYgKGNoaWxkcmVuW2ldICE9PSBudWxsICYmIGNoaWxkcmVuW2ldIS5rZXkgIT0gbnVsbCkgbnVtS2V5ZWQrK1xuXHR9XG5cdGlmIChudW1LZXllZCAhPT0gMCAmJiBudW1LZXllZCAhPT0gaW5wdXQubGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihjaGlsZHJlbi5pbmNsdWRlcyhudWxsKVxuXHRcdFx0PyAnSW4gZnJhZ21lbnRzLCB2bm9kZXMgbXVzdCBlaXRoZXIgYWxsIGhhdmUga2V5cyBvciBub25lIGhhdmUga2V5cy4gWW91IG1heSB3aXNoIHRvIGNvbnNpZGVyIHVzaW5nIGFuIGV4cGxpY2l0IGtleWVkIGVtcHR5IGZyYWdtZW50LCBtLmZyYWdtZW50KHtrZXk6IC4uLn0pLCBpbnN0ZWFkIG9mIGEgaG9sZS4nXG5cdFx0XHQ6ICdJbiBmcmFnbWVudHMsIHZub2RlcyBtdXN0IGVpdGhlciBhbGwgaGF2ZSBrZXlzIG9yIG5vbmUgaGF2ZSBrZXlzLicsXG5cdFx0KVxuXHR9XG5cdHJldHVybiBjaGlsZHJlblxufVxuXG47KFZub2RlIGFzIGFueSkubm9ybWFsaXplID0gbm9ybWFsaXplXG47KFZub2RlIGFzIGFueSkubm9ybWFsaXplQ2hpbGRyZW4gPSBub3JtYWxpemVDaGlsZHJlblxuXG5leHBvcnQgZGVmYXVsdCBWbm9kZSBhcyB0eXBlb2YgVm5vZGUgJiB7XG5cdG5vcm1hbGl6ZTogdHlwZW9mIG5vcm1hbGl6ZVxuXHRub3JtYWxpemVDaGlsZHJlbjogdHlwZW9mIG5vcm1hbGl6ZUNoaWxkcmVuXG59XG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuL3Zub2RlJ1xuXG4vLyBOb3RlOiB0aGUgcHJvY2Vzc2luZyBvZiB2YXJpYWRpYyBwYXJhbWV0ZXJzIGlzIHBlcmYtc2Vuc2l0aXZlLlxuLy9cbi8vIEluIG5hdGl2ZSBFUzYsIGl0IG1pZ2h0IGJlIHByZWZlcmFibGUgdG8gZGVmaW5lIGh5cGVyc2NyaXB0IGFuZCBmcmFnbWVudFxuLy8gZmFjdG9yaWVzIHdpdGggYSBmaW5hbCAuLi5hcmdzIHBhcmFtZXRlciBhbmQgY2FsbCBoeXBlcnNjcmlwdFZub2RlKC4uLmFyZ3MpLFxuLy8gc2luY2UgbW9kZXJuIGVuZ2luZXMgY2FuIG9wdGltaXplIHNwcmVhZCBjYWxscy5cbi8vXG4vLyBIb3dldmVyLCBiZW5jaG1hcmtzIHNob3dlZCB0aGlzIHdhcyBub3QgZmFzdGVyLiBBcyBhIHJlc3VsdCwgc3ByZWFkIGlzIHVzZWRcbi8vIG9ubHkgaW4gdGhlIHBhcmFtZXRlciBsaXN0cyBvZiBoeXBlcnNjcmlwdCBhbmQgZnJhZ21lbnQsIHdoaWxlIGFuIGFycmF5IGlzXG4vLyBwYXNzZWQgdG8gaHlwZXJzY3JpcHRWbm9kZS5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGh5cGVyc2NyaXB0Vm5vZGUoYXR0cnM6IGFueSwgY2hpbGRyZW46IGFueVtdKTogYW55IHtcblx0aWYgKGF0dHJzID09IG51bGwgfHwgdHlwZW9mIGF0dHJzID09PSAnb2JqZWN0JyAmJiBhdHRycy50YWcgPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShhdHRycykpIHtcblx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIEFycmF5LmlzQXJyYXkoY2hpbGRyZW5bMF0pKSBjaGlsZHJlbiA9IGNoaWxkcmVuWzBdXG5cdH0gZWxzZSB7XG5cdFx0Y2hpbGRyZW4gPSBjaGlsZHJlbi5sZW5ndGggPT09IDAgJiYgQXJyYXkuaXNBcnJheShhdHRycykgPyBhdHRycyA6IFthdHRycywgLi4uY2hpbGRyZW5dXG5cdFx0YXR0cnMgPSB1bmRlZmluZWRcblx0fVxuXG5cdHJldHVybiBWbm9kZSgnJywgYXR0cnMgJiYgYXR0cnMua2V5LCBhdHRycywgY2hpbGRyZW4sIG51bGwsIG51bGwpXG59XG4iLAogICAgIi8vIFRoaXMgaXMgYW4gYXR0cnMgb2JqZWN0IHRoYXQgaXMgdXNlZCBieSBkZWZhdWx0IHdoZW4gYXR0cnMgaXMgdW5kZWZpbmVkIG9yIG51bGwuXG5leHBvcnQgZGVmYXVsdCB7fVxuIiwKICAgICJpbXBvcnQgZW1wdHlBdHRycyBmcm9tICcuL2VtcHR5QXR0cnMnXG5cbi8vIFRoaXMgTWFwIG1hbmFnZXMgdGhlIGZvbGxvd2luZzpcbi8vIC0gV2hldGhlciBhbiBhdHRycyBpcyBjYWNoZWQgYXR0cnMgZ2VuZXJhdGVkIGJ5IGNvbXBpbGVTZWxlY3RvcigpLlxuLy8gLSBXaGV0aGVyIHRoZSBjYWNoZWQgYXR0cnMgaXMgXCJzdGF0aWNcIiwgaS5lLiwgZG9lcyBub3QgY29udGFpbiBhbnkgZm9ybSBhdHRyaWJ1dGVzLlxuLy8gVGhlc2UgaW5mb3JtYXRpb24gd2lsbCBiZSB1c2VmdWwgdG8gc2tpcCB1cGRhdGluZyBhdHRycyBpbiByZW5kZXIoKS5cbi8vXG4vLyBTaW5jZSB0aGUgYXR0cnMgdXNlZCBhcyBrZXlzIGluIHRoaXMgbWFwIGFyZSBub3QgcmVsZWFzZWQgZnJvbSB0aGUgc2VsZWN0b3JDYWNoZSBvYmplY3QsXG4vLyB0aGVyZSBpcyBubyByaXNrIG9mIG1lbW9yeSBsZWFrcy4gVGhlcmVmb3JlLCBNYXAgaXMgdXNlZCBoZXJlIGluc3RlYWQgb2YgV2Vha01hcC5cbmV4cG9ydCBkZWZhdWx0IG5ldyBNYXAoW1tlbXB0eUF0dHJzLCB0cnVlXV0pXG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuL3Zub2RlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cnVzdChodG1sOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogYW55IHtcblx0aWYgKGh0bWwgPT0gbnVsbCkgaHRtbCA9ICcnXG5cdHJldHVybiBWbm9kZSgnPCcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBodG1sLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcbn1cbiIsCiAgICAiaW1wb3J0IFZub2RlIGZyb20gJy4vdm5vZGUnXG5pbXBvcnQgaHlwZXJzY3JpcHRWbm9kZSBmcm9tICcuL2h5cGVyc2NyaXB0Vm5vZGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZyYWdtZW50KGF0dHJzOiBhbnksIC4uLmNoaWxkcmVuOiBhbnlbXSk6IGFueSB7XG5cdGNvbnN0IHZub2RlID0gaHlwZXJzY3JpcHRWbm9kZShhdHRycywgY2hpbGRyZW4pXG5cblx0aWYgKHZub2RlLmF0dHJzID09IG51bGwpIHZub2RlLmF0dHJzID0ge31cblx0dm5vZGUudGFnID0gJ1snXG5cdHZub2RlLmNoaWxkcmVuID0gVm5vZGUubm9ybWFsaXplQ2hpbGRyZW4odm5vZGUuY2hpbGRyZW4pXG5cdHJldHVybiB2bm9kZVxufVxuIiwKICAgICJpbXBvcnQgaGFzT3duIGZyb20gJy4uL3V0aWwvaGFzT3duJ1xuXG5pbXBvcnQgVm5vZGUgZnJvbSAnLi92bm9kZSdcbmltcG9ydCBoeXBlcnNjcmlwdFZub2RlIGZyb20gJy4vaHlwZXJzY3JpcHRWbm9kZSdcbmltcG9ydCBlbXB0eUF0dHJzIGZyb20gJy4vZW1wdHlBdHRycydcbmltcG9ydCBjYWNoZWRBdHRyc0lzU3RhdGljTWFwIGZyb20gJy4vY2FjaGVkQXR0cnNJc1N0YXRpY01hcCdcbmltcG9ydCB0cnVzdCBmcm9tICcuL3RydXN0J1xuaW1wb3J0IGZyYWdtZW50IGZyb20gJy4vZnJhZ21lbnQnXG5cbmltcG9ydCB0eXBlIHtDb21wb25lbnRUeXBlLCBDaGlsZHJlbiwgVm5vZGUgYXMgVm5vZGVUeXBlfSBmcm9tICcuL3Zub2RlJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEh5cGVyc2NyaXB0IHtcblx0KHNlbGVjdG9yOiBzdHJpbmcsIC4uLmNoaWxkcmVuOiBDaGlsZHJlbltdKTogVm5vZGVUeXBlXG5cdChzZWxlY3Rvcjogc3RyaW5nLCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiwgLi4uY2hpbGRyZW46IENoaWxkcmVuW10pOiBWbm9kZVR5cGVcblx0PEF0dHJzLCBTdGF0ZT4oY29tcG9uZW50OiBDb21wb25lbnRUeXBlPEF0dHJzLCBTdGF0ZT4sIC4uLmNoaWxkcmVuOiBDaGlsZHJlbltdKTogVm5vZGVUeXBlPEF0dHJzLCBTdGF0ZT5cblx0PEF0dHJzLCBTdGF0ZT4oY29tcG9uZW50OiBDb21wb25lbnRUeXBlPEF0dHJzLCBTdGF0ZT4sIGF0dHJzOiBBdHRycywgLi4uY2hpbGRyZW46IENoaWxkcmVuW10pOiBWbm9kZVR5cGU8QXR0cnMsIFN0YXRlPlxuXHR0cnVzdChodG1sOiBzdHJpbmcpOiBWbm9kZVR5cGVcblx0ZnJhZ21lbnQoYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCAuLi5jaGlsZHJlbjogQ2hpbGRyZW5bXSk6IFZub2RlVHlwZVxuXHRGcmFnbWVudDogc3RyaW5nXG59XG5cbmNvbnN0IHNlbGVjdG9yUGFyc2VyID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsoLis/KSg/Olxccyo9XFxzKihcInwnfCkoKD86XFxcXFtcIidcXF1dfC4pKj8pXFw1KT9cXF0pL2dcbmNvbnN0IHNlbGVjdG9yQ2FjaGU6IFJlY29yZDxzdHJpbmcsIHt0YWc6IHN0cmluZzsgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT47IGlzPzogc3RyaW5nfT4gPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbmZ1bmN0aW9uIGlzRW1wdHkob2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogYm9vbGVhbiB7XG5cdGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkgaWYgKGhhc093bi5jYWxsKG9iamVjdCwga2V5KSkgcmV0dXJuIGZhbHNlXG5cdHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGlzRm9ybUF0dHJpYnV0ZUtleShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRyZXR1cm4ga2V5ID09PSAndmFsdWUnIHx8IGtleSA9PT0gJ2NoZWNrZWQnIHx8IGtleSA9PT0gJ3NlbGVjdGVkSW5kZXgnIHx8IGtleSA9PT0gJ3NlbGVjdGVkJ1xufVxuXG5mdW5jdGlvbiBjb21waWxlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHt0YWc6IHN0cmluZzsgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT47IGlzPzogc3RyaW5nfSB7XG5cdGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbFxuXHRsZXQgdGFnID0gJ2Rpdidcblx0Y29uc3QgY2xhc3Nlczogc3RyaW5nW10gPSBbXVxuXHRsZXQgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXHRsZXQgaXNTdGF0aWMgPSB0cnVlXG5cdHdoaWxlICgobWF0Y2ggPSBzZWxlY3RvclBhcnNlci5leGVjKHNlbGVjdG9yKSkgIT09IG51bGwpIHtcblx0XHRjb25zdCB0eXBlID0gbWF0Y2hbMV1cblx0XHRjb25zdCB2YWx1ZSA9IG1hdGNoWzJdXG5cdFx0aWYgKHR5cGUgPT09ICcnICYmIHZhbHVlICE9PSAnJykgdGFnID0gdmFsdWVcblx0XHRlbHNlIGlmICh0eXBlID09PSAnIycpIGF0dHJzLmlkID0gdmFsdWVcblx0XHRlbHNlIGlmICh0eXBlID09PSAnLicpIGNsYXNzZXMucHVzaCh2YWx1ZSlcblx0XHRlbHNlIGlmIChtYXRjaFszXVswXSA9PT0gJ1snKSB7XG5cdFx0XHRsZXQgYXR0clZhbHVlID0gbWF0Y2hbNl1cblx0XHRcdGlmIChhdHRyVmFsdWUpIGF0dHJWYWx1ZSA9IGF0dHJWYWx1ZS5yZXBsYWNlKC9cXFxcKFtcIiddKS9nLCAnJDEnKS5yZXBsYWNlKC9cXFxcXFxcXC9nLCAnXFxcXCcpXG5cdFx0XHRpZiAobWF0Y2hbNF0gPT09ICdjbGFzcycpIGNsYXNzZXMucHVzaChhdHRyVmFsdWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0YXR0cnNbbWF0Y2hbNF1dID0gYXR0clZhbHVlID09PSAnJyA/IGF0dHJWYWx1ZSA6IGF0dHJWYWx1ZSB8fCB0cnVlXG5cdFx0XHRcdGlmIChpc0Zvcm1BdHRyaWJ1dGVLZXkobWF0Y2hbNF0pKSBpc1N0YXRpYyA9IGZhbHNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChjbGFzc2VzLmxlbmd0aCA+IDApIGF0dHJzLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpXG5cdGlmIChpc0VtcHR5KGF0dHJzKSkgYXR0cnMgPSBlbXB0eUF0dHJzXG5cdGVsc2UgY2FjaGVkQXR0cnNJc1N0YXRpY01hcC5zZXQoYXR0cnMsIGlzU3RhdGljKVxuXHRyZXR1cm4gc2VsZWN0b3JDYWNoZVtzZWxlY3Rvcl0gPSB7dGFnOiB0YWcsIGF0dHJzOiBhdHRycywgaXM6IGF0dHJzLmlzfVxufVxuXG5mdW5jdGlvbiBleGVjU2VsZWN0b3Ioc3RhdGU6IHt0YWc6IHN0cmluZzsgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT47IGlzPzogc3RyaW5nfSwgdm5vZGU6IGFueSk6IGFueSB7XG5cdHZub2RlLnRhZyA9IHN0YXRlLnRhZ1xuXG5cdGxldCBhdHRycyA9IHZub2RlLmF0dHJzXG5cdGlmIChhdHRycyA9PSBudWxsKSB7XG5cdFx0dm5vZGUuYXR0cnMgPSBzdGF0ZS5hdHRyc1xuXHRcdHZub2RlLmlzID0gc3RhdGUuaXNcblx0XHRyZXR1cm4gdm5vZGVcblx0fVxuXG5cdGlmIChoYXNPd24uY2FsbChhdHRycywgJ2NsYXNzJykpIHtcblx0XHRpZiAoYXR0cnMuY2xhc3MgIT0gbnVsbCkgYXR0cnMuY2xhc3NOYW1lID0gYXR0cnMuY2xhc3Ncblx0XHRhdHRycy5jbGFzcyA9IG51bGxcblx0fVxuXG5cdGlmIChzdGF0ZS5hdHRycyAhPT0gZW1wdHlBdHRycykge1xuXHRcdGNvbnN0IGNsYXNzTmFtZSA9IGF0dHJzLmNsYXNzTmFtZVxuXHRcdGF0dHJzID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuYXR0cnMsIGF0dHJzKVxuXG5cdFx0aWYgKHN0YXRlLmF0dHJzLmNsYXNzTmFtZSAhPSBudWxsKSBhdHRycy5jbGFzc05hbWUgPVxuXHRcdFx0Y2xhc3NOYW1lICE9IG51bGxcblx0XHRcdFx0PyBTdHJpbmcoc3RhdGUuYXR0cnMuY2xhc3NOYW1lKSArICcgJyArIFN0cmluZyhjbGFzc05hbWUpXG5cdFx0XHRcdDogc3RhdGUuYXR0cnMuY2xhc3NOYW1lXG5cdH1cblxuXHQvLyB3b3JrYXJvdW5kIGZvciAjMjYyMiAocmVvcmRlciBrZXlzIGluIGF0dHJzIHRvIHNldCBcInR5cGVcIiBmaXJzdClcblx0Ly8gVGhlIERPTSBkb2VzIHRoaW5ncyB0byBpbnB1dHMgYmFzZWQgb24gdGhlIFwidHlwZVwiLCBzbyBpdCBuZWVkcyBzZXQgZmlyc3QuXG5cdC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL01pdGhyaWxKUy9taXRocmlsLmpzL2lzc3Vlcy8yNjIyXG5cdGlmIChzdGF0ZS50YWcgPT09ICdpbnB1dCcgJiYgaGFzT3duLmNhbGwoYXR0cnMsICd0eXBlJykpIHtcblx0XHRhdHRycyA9IE9iamVjdC5hc3NpZ24oe3R5cGU6IGF0dHJzLnR5cGV9LCBhdHRycylcblx0fVxuXG5cdC8vIFRoaXMgcmVkdWNlcyB0aGUgY29tcGxleGl0eSBvZiB0aGUgZXZhbHVhdGlvbiBvZiBcImlzXCIgd2l0aGluIHRoZSByZW5kZXIgZnVuY3Rpb24uXG5cdHZub2RlLmlzID0gYXR0cnMuaXNcblxuXHR2bm9kZS5hdHRycyA9IGF0dHJzXG5cblx0cmV0dXJuIHZub2RlXG59XG5cbmZ1bmN0aW9uIGh5cGVyc2NyaXB0KHNlbGVjdG9yOiBzdHJpbmcgfCBDb21wb25lbnRUeXBlLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCAuLi5jaGlsZHJlbjogQ2hpbGRyZW5bXSk6IGFueSB7XG5cdGlmIChzZWxlY3RvciA9PSBudWxsIHx8IHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIHNlbGVjdG9yICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiAoc2VsZWN0b3IgYXMgYW55KS52aWV3ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgRXJyb3IoJ1RoZSBzZWxlY3RvciBtdXN0IGJlIGVpdGhlciBhIHN0cmluZyBvciBhIGNvbXBvbmVudC4nKVxuXHR9XG5cblx0Y29uc3Qgdm5vZGUgPSBoeXBlcnNjcmlwdFZub2RlKGF0dHJzLCBjaGlsZHJlbilcblxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuXHRcdHZub2RlLmNoaWxkcmVuID0gVm5vZGUubm9ybWFsaXplQ2hpbGRyZW4odm5vZGUuY2hpbGRyZW4pXG5cdFx0aWYgKHNlbGVjdG9yICE9PSAnWycpIHJldHVybiBleGVjU2VsZWN0b3Ioc2VsZWN0b3JDYWNoZVtzZWxlY3Rvcl0gfHwgY29tcGlsZVNlbGVjdG9yKHNlbGVjdG9yKSwgdm5vZGUpXG5cdH1cblxuXHRpZiAodm5vZGUuYXR0cnMgPT0gbnVsbCkgdm5vZGUuYXR0cnMgPSB7fVxuXHR2bm9kZS50YWcgPSBzZWxlY3RvclxuXHRyZXR1cm4gdm5vZGVcbn1cblxuaHlwZXJzY3JpcHQudHJ1c3QgPSB0cnVzdFxuXG5oeXBlcnNjcmlwdC5mcmFnbWVudCA9IGZyYWdtZW50XG5oeXBlcnNjcmlwdC5GcmFnbWVudCA9ICdbJ1xuXG5leHBvcnQgZGVmYXVsdCBoeXBlcnNjcmlwdFxuIiwKICAgICIvKipcbiAqIFJlcXVlc3Qtc2NvcGVkIFNTUiBjb250ZXh0IHVzaW5nIEFzeW5jTG9jYWxTdG9yYWdlIChOb2RlL0J1bikuXG4gKiBFYWNoIFNTUiByZXF1ZXN0IHJ1bnMgaW5zaWRlIHJ1bldpdGhDb250ZXh0KCk7IGNvZGUgdGhhdCBuZWVkcyB0aGUgY3VycmVudFxuICogcmVxdWVzdCdzIHN0b3JlIG9yIHN0YXRlIHJlZ2lzdHJ5IGNhbGxzIGdldFNTUkNvbnRleHQoKSBhbmQgZ2V0cyB0aGF0XG4gKiByZXF1ZXN0J3MgY29udGV4dC4gTm8gZ2xvYmFscywgc2FmZSB1bmRlciBjb25jdXJyZW50IHJlcXVlc3RzLlxuICogSW4gdGhlIGJyb3dzZXIsIGdldFNTUkNvbnRleHQoKSByZXR1cm5zIHVuZGVmaW5lZCBhbmQgcnVuV2l0aENvbnRleHQganVzdCBydW5zIGZuLlxuICovXG50eXBlIFN0b3JhZ2VMaWtlID0ge1xuXHRnZXRTdG9yZSgpOiBTU1JBY2Nlc3NDb250ZXh0IHwgdW5kZWZpbmVkXG5cdHJ1bjxUPihjb250ZXh0OiBTU1JBY2Nlc3NDb250ZXh0LCBmbjogKCkgPT4gVCk6IFRcbn1cblxubGV0IHNzclN0b3JhZ2U6IFN0b3JhZ2VMaWtlXG5cbnRyeSB7XG5cdGNvbnN0IHtBc3luY0xvY2FsU3RvcmFnZX0gPSByZXF1aXJlKCdub2RlOmFzeW5jX2hvb2tzJykgYXMge0FzeW5jTG9jYWxTdG9yYWdlOiBuZXcgKCkgPT4gU3RvcmFnZUxpa2V9XG5cdHNzclN0b3JhZ2UgPSBuZXcgQXN5bmNMb2NhbFN0b3JhZ2UoKVxufSBjYXRjaCB7XG5cdC8vIEJyb3dzZXIgb3IgZW52aXJvbm1lbnQgd2l0aG91dCBub2RlOmFzeW5jX2hvb2tzOyBubyByZXF1ZXN0IGNvbnRleHRcblx0c3NyU3RvcmFnZSA9IHtcblx0XHRnZXRTdG9yZTogKCkgPT4gdW5kZWZpbmVkLFxuXHRcdHJ1bjogKF9jb250ZXh0LCBmbikgPT4gZm4oKSxcblx0fVxufVxuXG4vKipcbiAqIERhdGEgZm9yIGEgc2luZ2xlIFNTUiByZXF1ZXN0LiBDcmVhdGVkIHBlciByZXF1ZXN0OyBvbmx5IHZpc2libGUgdG8gY29kZVxuICogdGhhdCBydW5zIGluc2lkZSB0aGUgc2FtZSBydW5XaXRoQ29udGV4dCgpIGNhbGwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU1NSQWNjZXNzQ29udGV4dCB7XG5cdHN0b3JlPzogYW55XG5cdC8qKiBQZXItcmVxdWVzdCBzdGF0ZSByZWdpc3RyeSBmb3Igc2VyaWFsaXphdGlvbjsgZnJlc2ggTWFwIHBlciByZXF1ZXN0LiAqL1xuXHRzdGF0ZVJlZ2lzdHJ5OiBNYXA8c3RyaW5nLCB7c3RhdGU6IGFueTsgaW5pdGlhbDogYW55fT5cblx0c2Vzc2lvbklkPzogc3RyaW5nXG5cdHNlc3Npb25EYXRhPzogYW55XG5cdC8qKiBQZXItcmVxdWVzdCBFdmVudEVtaXR0ZXI7IHByZXZlbnRzIGV2ZW50IGxpc3RlbmVycyBmcm9tIHBlcnNpc3RpbmcgYmV0d2VlbiByZXF1ZXN0cy4gKi9cblx0ZXZlbnRzPzogYW55XG5cdC8qKiBQZXItcmVxdWVzdCB3YXRjaGVyIGNsZWFudXAgZnVuY3Rpb25zOyBwcmV2ZW50cyB3YXRjaGVycyBmcm9tIHBlcnNpc3RpbmcgYmV0d2VlbiByZXF1ZXN0cy4gKi9cblx0d2F0Y2hlcnM/OiBBcnJheTwoKSA9PiB2b2lkPlxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgU1NSIHJlcXVlc3QgY29udGV4dCwgb3IgdW5kZWZpbmVkIGlmIHdlJ3JlIG5vdCBpbnNpZGVcbiAqIGEgcnVuV2l0aENvbnRleHQoKSBjYWxsIChlLmcuIG9uIHRoZSBjbGllbnQgb3Igb3V0c2lkZSBTU1IpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U1NSQ29udGV4dCgpOiBTU1JBY2Nlc3NDb250ZXh0IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIHNzclN0b3JhZ2UuZ2V0U3RvcmUoKVxufVxuXG4vKipcbiAqIFJ1bnMgZm4gd2l0aCBjb250ZXh0IGFzIHRoZSBjdXJyZW50IFNTUiBjb250ZXh0LiBVc2VkIGJ5IHRoZSBzZXJ2ZXIgc28gdGhhdFxuICogZ2V0U1NSQ29udGV4dCgpIHJldHVybnMgdGhpcyByZXF1ZXN0J3MgY29udGV4dCBmb3IgdGhlIGR1cmF0aW9uIG9mIGZuLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuV2l0aENvbnRleHQ8VD4oY29udGV4dDogU1NSQWNjZXNzQ29udGV4dCwgZm46ICgpID0+IFQpOiBUIHtcblx0cmV0dXJuIHNzclN0b3JhZ2UucnVuKGNvbnRleHQsIGZuKVxufVxuXG4vKipcbiAqIENsZWFuIHVwIGFsbCB3YXRjaGVycyByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IFNTUiBjb250ZXh0LlxuICogQ2FsbGVkIGF1dG9tYXRpY2FsbHkgYXQgdGhlIGVuZCBvZiBydW5XaXRoQ29udGV4dEFzeW5jLCBidXQgY2FuIGJlIGNhbGxlZCBtYW51YWxseSBpZiBuZWVkZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwV2F0Y2hlcnMoY29udGV4dD86IFNTUkFjY2Vzc0NvbnRleHQpOiB2b2lkIHtcblx0Y29uc3QgY3R4ID0gY29udGV4dCB8fCBnZXRTU1JDb250ZXh0KClcblx0aWYgKGN0eCAmJiBjdHgud2F0Y2hlcnMgJiYgY3R4LndhdGNoZXJzLmxlbmd0aCA+IDApIHtcblx0XHRjdHgud2F0Y2hlcnMuZm9yRWFjaCh1bndhdGNoID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHVud2F0Y2goKVxuXHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNsZWFuaW5nIHVwIHdhdGNoZXI6JywgZSlcblx0XHRcdH1cblx0XHR9KVxuXHRcdGN0eC53YXRjaGVycy5sZW5ndGggPSAwXG5cdH1cbn1cblxuLyoqXG4gKiBTYW1lIGFzIHJ1bldpdGhDb250ZXh0IGJ1dCBmb3IgYXN5bmMgZnVuY3Rpb25zLlxuICogQXV0b21hdGljYWxseSBjbGVhbnMgdXAgd2F0Y2hlcnMgYXQgdGhlIGVuZCBvZiB0aGUgcmVxdWVzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldpdGhDb250ZXh0QXN5bmM8VD4oXG5cdGNvbnRleHQ6IFNTUkFjY2Vzc0NvbnRleHQsXG5cdGZuOiAoKSA9PiBQcm9taXNlPFQ+LFxuKTogUHJvbWlzZTxUPiB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IHNzclN0b3JhZ2UucnVuKGNvbnRleHQsIGZuKVxuXHR9IGZpbmFsbHkge1xuXHRcdC8vIENsZWFuIHVwIHdhdGNoZXJzIGF0IHRoZSBlbmQgb2YgU1NSIHJlcXVlc3Rcblx0XHRjbGVhbnVwV2F0Y2hlcnMoY29udGV4dClcblx0fVxufVxuIiwKICAgICIvLyBDb3JlIHNpZ25hbCBwcmltaXRpdmUgZm9yIGZpbmUtZ3JhaW5lZCByZWFjdGl2aXR5XG5cbmltcG9ydCB7Z2V0U1NSQ29udGV4dCwgcnVuV2l0aENvbnRleHR9IGZyb20gJy4vc3NyQ29udGV4dCdcblxuLy8gQ3VycmVudCBlZmZlY3QgY29udGV4dCBmb3IgZGVwZW5kZW5jeSB0cmFja2luZ1xubGV0IGN1cnJlbnRFZmZlY3Q6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsXG5cbi8vIENvbXBvbmVudC10by1zaWduYWwgZGVwZW5kZW5jeSB0cmFja2luZ1xuY29uc3QgY29tcG9uZW50U2lnbmFsTWFwID0gbmV3IFdlYWtNYXA8YW55LCBTZXQ8U2lnbmFsPGFueT4+PigpXG5jb25zdCBzaWduYWxDb21wb25lbnRNYXAgPSBuZXcgV2Vha01hcDxTaWduYWw8YW55PiwgU2V0PGFueT4+KClcblxuLy8gQ3VycmVudCBjb21wb25lbnQgY29udGV4dCBmb3IgY29tcG9uZW50LXRvLXNpZ25hbCBkZXBlbmRlbmN5IHRyYWNraW5nXG5sZXQgY3VycmVudENvbXBvbmVudDogYW55ID0gbnVsbFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VycmVudENvbXBvbmVudChjb21wb25lbnQ6IGFueSkge1xuXHRjdXJyZW50Q29tcG9uZW50ID0gY29tcG9uZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckN1cnJlbnRDb21wb25lbnQoKSB7XG5cdGN1cnJlbnRDb21wb25lbnQgPSBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50Q29tcG9uZW50KCkge1xuXHRyZXR1cm4gY3VycmVudENvbXBvbmVudFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tDb21wb25lbnRTaWduYWwoY29tcG9uZW50OiBhbnksIHNpZ25hbDogU2lnbmFsPGFueT4pIHtcblx0aWYgKCFjb21wb25lbnRTaWduYWxNYXAuaGFzKGNvbXBvbmVudCkpIHtcblx0XHRjb21wb25lbnRTaWduYWxNYXAuc2V0KGNvbXBvbmVudCwgbmV3IFNldCgpKVxuXHR9XG5cdGNvbXBvbmVudFNpZ25hbE1hcC5nZXQoY29tcG9uZW50KSEuYWRkKHNpZ25hbClcblxuXHRpZiAoIXNpZ25hbENvbXBvbmVudE1hcC5oYXMoc2lnbmFsKSkge1xuXHRcdHNpZ25hbENvbXBvbmVudE1hcC5zZXQoc2lnbmFsLCBuZXcgU2V0KCkpXG5cdH1cblx0c2lnbmFsQ29tcG9uZW50TWFwLmdldChzaWduYWwpIS5hZGQoY29tcG9uZW50KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50U2lnbmFscyhjb21wb25lbnQ6IGFueSk6IFNldDxTaWduYWw8YW55Pj4gfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gY29tcG9uZW50U2lnbmFsTWFwLmdldChjb21wb25lbnQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTaWduYWxDb21wb25lbnRzKHNpZ25hbDogU2lnbmFsPGFueT4pOiBTZXQ8YW55PiB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBzaWduYWxDb21wb25lbnRNYXAuZ2V0KHNpZ25hbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyQ29tcG9uZW50RGVwZW5kZW5jaWVzKGNvbXBvbmVudDogYW55KSB7XG5cdGNvbnN0IHNpZ25hbHMgPSBjb21wb25lbnRTaWduYWxNYXAuZ2V0KGNvbXBvbmVudClcblx0aWYgKHNpZ25hbHMpIHtcblx0XHRzaWduYWxzLmZvckVhY2goc2lnbmFsID0+IHtcblx0XHRcdGNvbnN0IGNvbXBvbmVudHMgPSBzaWduYWxDb21wb25lbnRNYXAuZ2V0KHNpZ25hbClcblx0XHRcdGlmIChjb21wb25lbnRzKSB7XG5cdFx0XHRcdGNvbXBvbmVudHMuZGVsZXRlKGNvbXBvbmVudClcblx0XHRcdFx0aWYgKGNvbXBvbmVudHMuc2l6ZSA9PT0gMCkge1xuXHRcdFx0XHRcdHNpZ25hbENvbXBvbmVudE1hcC5kZWxldGUoc2lnbmFsKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0XHRjb21wb25lbnRTaWduYWxNYXAuZGVsZXRlKGNvbXBvbmVudClcblx0fVxufVxuXG4vLyBTZXQgdXAgY2FsbGJhY2sgZm9yIHNpZ25hbC10by1jb21wb25lbnQgcmVkcmF3IGludGVncmF0aW9uXG5leHBvcnQgZnVuY3Rpb24gc2V0U2lnbmFsUmVkcmF3Q2FsbGJhY2soY2FsbGJhY2s6IChzaWduYWw6IFNpZ25hbDxhbnk+KSA9PiB2b2lkKSB7XG5cdChzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrID0gY2FsbGJhY2tcbn1cblxuLyoqXG4gKiBTaWduYWwgY2xhc3MgLSByZWFjdGl2ZSBwcmltaXRpdmUgdGhhdCB0cmFja3Mgc3Vic2NyaWJlcnNcbiAqL1xuZXhwb3J0IGNsYXNzIFNpZ25hbDxUPiB7XG5cdHByaXZhdGUgX3ZhbHVlOiBUXG5cdHByaXZhdGUgX3N1YnNjcmliZXJzOiBTZXQ8KCkgPT4gdm9pZD4gPSBuZXcgU2V0KClcblxuXHRjb25zdHJ1Y3Rvcihpbml0aWFsOiBUKSB7XG5cdFx0dGhpcy5fdmFsdWUgPSBpbml0aWFsXG5cdH1cblxuXHRnZXQgdmFsdWUoKTogVCB7XG5cdFx0Ly8gRW5zdXJlIF9zdWJzY3JpYmVycyBpcyBpbml0aWFsaXplZCAoZGVmZW5zaXZlIGNoZWNrKVxuXHRcdGlmICghdGhpcy5fc3Vic2NyaWJlcnMpIHtcblx0XHRcdHRoaXMuX3N1YnNjcmliZXJzID0gbmV3IFNldCgpXG5cdFx0fVxuXHRcdC8vIFRyYWNrIGFjY2VzcyBkdXJpbmcgcmVuZGVyL2VmZmVjdFxuXHRcdGlmIChjdXJyZW50RWZmZWN0KSB7XG5cdFx0XHR0aGlzLl9zdWJzY3JpYmVycy5hZGQoY3VycmVudEVmZmVjdClcblx0XHR9XG5cdFx0Ly8gVHJhY2sgY29tcG9uZW50IGRlcGVuZGVuY3lcblx0XHRpZiAoY3VycmVudENvbXBvbmVudCkge1xuXHRcdFx0dHJhY2tDb21wb25lbnRTaWduYWwoY3VycmVudENvbXBvbmVudCwgdGhpcylcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3ZhbHVlXG5cdH1cblxuXHRzZXQgdmFsdWUobmV3VmFsdWU6IFQpIHtcblx0XHRpZiAodGhpcy5fdmFsdWUgIT09IG5ld1ZhbHVlKSB7XG5cdFx0XHR0aGlzLl92YWx1ZSA9IG5ld1ZhbHVlXG5cdFx0XHQvLyBFbnN1cmUgX3N1YnNjcmliZXJzIGlzIGluaXRpYWxpemVkIChkZWZlbnNpdmUgY2hlY2spXG5cdFx0XHRpZiAoIXRoaXMuX3N1YnNjcmliZXJzKSB7XG5cdFx0XHRcdHRoaXMuX3N1YnNjcmliZXJzID0gbmV3IFNldCgpXG5cdFx0XHR9XG5cdFx0XHQvLyBOb3RpZnkgYWxsIHN1YnNjcmliZXJzXG5cdFx0XHRjb25zdCBjb250ZXh0ID0gZ2V0U1NSQ29udGV4dCgpXG5cdFx0XHR0aGlzLl9zdWJzY3JpYmVycy5mb3JFYWNoKGZuID0+IHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHQvLyBBbHdheXMgcnVuIHdhdGNoZXJzIC0gd3JhcCBpbiBTU1IgY29udGV4dCBpZiBhdmFpbGFibGVcblx0XHRcdFx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0XHRcdFx0Ly8gUnVuIHdhdGNoZXIgaW5zaWRlIFNTUiBjb250ZXh0LCBzaW1pbGFyIHRvIGV2ZW50c1xuXHRcdFx0XHRcdFx0cnVuV2l0aENvbnRleHQoY29udGV4dCwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBzaWduYWwgc3Vic2NyaWJlcjonLCBlKVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0Ly8gVHJpZ2dlciBjb21wb25lbnQgcmVkcmF3cyBmb3IgYWZmZWN0ZWQgY29tcG9uZW50c1xuXHRcdFx0Ly8gVGhpcyBpcyBzZXQgdXAgaW4gaW5kZXgudHMgYWZ0ZXIgbS5yZWRyYXcgaXMgY3JlYXRlZFxuXHRcdFx0aWYgKChzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKSB7XG5cdFx0XHRcdDsoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjayh0aGlzKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTdWJzY3JpYmUgdG8gc2lnbmFsIGNoYW5nZXNcblx0ICovXG5cdHN1YnNjcmliZShjYWxsYmFjazogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuXHRcdC8vIEVuc3VyZSBfc3Vic2NyaWJlcnMgaXMgaW5pdGlhbGl6ZWQgKGRlZmVuc2l2ZSBjaGVjaylcblx0XHRpZiAoIXRoaXMuX3N1YnNjcmliZXJzKSB7XG5cdFx0XHR0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBTZXQoKVxuXHRcdH1cblx0XHR0aGlzLl9zdWJzY3JpYmVycy5hZGQoY2FsbGJhY2spXG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGlmICh0aGlzLl9zdWJzY3JpYmVycykge1xuXHRcdFx0XHR0aGlzLl9zdWJzY3JpYmVycy5kZWxldGUoY2FsbGJhY2spXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFdhdGNoIHNpZ25hbCBjaGFuZ2VzIChjb252ZW5pZW5jZSBtZXRob2QpXG5cdCAqL1xuXHR3YXRjaChjYWxsYmFjazogKG5ld1ZhbHVlOiBULCBvbGRWYWx1ZTogVCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuXHRcdGxldCBvbGRWYWx1ZSA9IHRoaXMuX3ZhbHVlXG5cdFx0Y29uc3QgdW5zdWJzY3JpYmUgPSB0aGlzLnN1YnNjcmliZSgoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdWYWx1ZSA9IHRoaXMuX3ZhbHVlXG5cdFx0XHRjYWxsYmFjayhuZXdWYWx1ZSwgb2xkVmFsdWUpXG5cdFx0XHRvbGRWYWx1ZSA9IG5ld1ZhbHVlXG5cdFx0fSlcblx0XHRyZXR1cm4gdW5zdWJzY3JpYmVcblx0fVxuXG5cdC8qKlxuXHQgKiBQZWVrIGF0IHZhbHVlIHdpdGhvdXQgc3Vic2NyaWJpbmdcblx0ICovXG5cdHBlZWsoKTogVCB7XG5cdFx0cmV0dXJuIHRoaXMuX3ZhbHVlXG5cdH1cbn1cblxuLyoqXG4gKiBDb21wdXRlZCBzaWduYWwgLSBhdXRvbWF0aWNhbGx5IHJlY29tcHV0ZXMgd2hlbiBkZXBlbmRlbmNpZXMgY2hhbmdlXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wdXRlZFNpZ25hbDxUPiBleHRlbmRzIFNpZ25hbDxUPiB7XG5cdHByaXZhdGUgX2NvbXB1dGU6ICgpID0+IFRcblx0cHJpdmF0ZSBfZGVwZW5kZW5jaWVzOiBTZXQ8U2lnbmFsPGFueT4+ID0gbmV3IFNldCgpXG5cdHByaXZhdGUgX2lzRGlydHkgPSB0cnVlXG5cdHByaXZhdGUgX2NhY2hlZFZhbHVlITogVFxuXG5cdGNvbnN0cnVjdG9yKGNvbXB1dGU6ICgpID0+IFQpIHtcblx0XHRzdXBlcihudWxsIGFzIGFueSkgLy8gV2lsbCBiZSBjb21wdXRlZCBvbiBmaXJzdCBhY2Nlc3Ncblx0XHR0aGlzLl9jb21wdXRlID0gY29tcHV0ZVxuXHR9XG5cblx0Z2V0IHZhbHVlKCk6IFQge1xuXHRcdC8vIFRyYWNrIGFjY2VzcyBieSBvdGhlciBjb21wdXRlZCBzaWduYWxzIC0gdGhpcyBlbmFibGVzIGNvbXB1dGVkLXRvLWNvbXB1dGVkIGRlcGVuZGVuY3kgY2hhaW5zXG5cdFx0Ly8gV2hlbiBjb21wdXRlZCBCIGFjY2Vzc2VzIGNvbXB1dGVkIEEsIEEgc2hvdWxkIG5vdGlmeSBCIHdoZW4gQSdzIGRlcGVuZGVuY2llcyBjaGFuZ2Vcblx0XHRpZiAoY3VycmVudEVmZmVjdCkge1xuXHRcdFx0Ly8gRW5zdXJlIF9zdWJzY3JpYmVycyBpcyBpbml0aWFsaXplZCAoZGVmZW5zaXZlIGNoZWNrKVxuXHRcdFx0aWYgKCEodGhpcyBhcyBhbnkpLl9zdWJzY3JpYmVycykge1xuXHRcdFx0XHQodGhpcyBhcyBhbnkpLl9zdWJzY3JpYmVycyA9IG5ldyBTZXQoKVxuXHRcdFx0fVxuXHRcdFx0Oyh0aGlzIGFzIGFueSkuX3N1YnNjcmliZXJzLmFkZChjdXJyZW50RWZmZWN0KVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9pc0RpcnR5KSB7XG5cdFx0XHQvLyBDbGVhciBvbGQgZGVwZW5kZW5jaWVzXG5cdFx0XHR0aGlzLl9kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4ge1xuXHRcdFx0XHRkZXAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX21hcmtEaXJ0eSgpKT8uKCkgLy8gVW5zdWJzY3JpYmUgb2xkXG5cdFx0XHR9KVxuXHRcdFx0dGhpcy5fZGVwZW5kZW5jaWVzLmNsZWFyKClcblxuXHRcdFx0Ly8gVHJhY2sgZGVwZW5kZW5jaWVzIGR1cmluZyBjb21wdXRhdGlvblxuXHRcdFx0Y29uc3QgcHJldmlvdXNFZmZlY3QgPSBjdXJyZW50RWZmZWN0XG5cdFx0XHRjdXJyZW50RWZmZWN0ID0gKCkgPT4ge1xuXHRcdFx0XHR0aGlzLl9tYXJrRGlydHkoKVxuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLl9jYWNoZWRWYWx1ZSA9IHRoaXMuX2NvbXB1dGUoKVxuXHRcdFx0XHQvLyBSZS1zdWJzY3JpYmUgdG8gbmV3IGRlcGVuZGVuY2llc1xuXHRcdFx0XHQvLyBEZXBlbmRlbmNpZXMgYXJlIHRyYWNrZWQgdmlhIHRoZSBjb21wdXRlIGZ1bmN0aW9uIGFjY2Vzc2luZyBzaWduYWxzXG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRjdXJyZW50RWZmZWN0ID0gcHJldmlvdXNFZmZlY3Rcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5faXNEaXJ0eSA9IGZhbHNlXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9jYWNoZWRWYWx1ZVxuXHR9XG5cblx0cHJpdmF0ZSBfbWFya0RpcnR5KCkge1xuXHRcdGlmICghdGhpcy5faXNEaXJ0eSkge1xuXHRcdFx0dGhpcy5faXNEaXJ0eSA9IHRydWVcblx0XHRcdC8vIEVuc3VyZSBfc3Vic2NyaWJlcnMgaXMgaW5pdGlhbGl6ZWQgKGRlZmVuc2l2ZSBjaGVjaylcblx0XHRcdGlmICghKHRoaXMgYXMgYW55KS5fc3Vic2NyaWJlcnMpIHtcblx0XHRcdFx0KHRoaXMgYXMgYW55KS5fc3Vic2NyaWJlcnMgPSBuZXcgU2V0KClcblx0XHRcdH1cblx0XHRcdC8vIE5vdGlmeSBzdWJzY3JpYmVycyB0aGF0IGNvbXB1dGVkIHZhbHVlIGNoYW5nZWRcblx0XHRcdGNvbnN0IGNvbnRleHQgPSBnZXRTU1JDb250ZXh0KClcblx0XHRcdDsodGhpcyBhcyBhbnkpLl9zdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRcdFx0XHQvLyBSdW4gd2F0Y2hlciBpbnNpZGUgU1NSIGNvbnRleHQsIHNpbWlsYXIgdG8gZXZlbnRzXG5cdFx0XHRcdFx0XHRydW5XaXRoQ29udGV4dChjb250ZXh0LCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNvbXB1dGVkIHNpZ25hbCBzdWJzY3JpYmVyOicsIGUpXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1hcmsgdGhpcyBjb21wdXRlZCBhcyBkaXJ0eSBzbyBpdCB3aWxsIHJlY29tcHV0ZSBvbiBuZXh0IHZhbHVlIGFjY2Vzcy5cblx0ICogVXNlZCBieSB0aGUgc3RhdGUgbGF5ZXIgd2hlbiBvcGVuaW5nIHRoZSBkZWZlcnJlZC1jb21wdXRlZCBnYXRlIChhbGxvd0NvbXB1dGVkKS5cblx0ICovXG5cdG1hcmtEaXJ0eSgpOiB2b2lkIHtcblx0XHR0aGlzLl9tYXJrRGlydHkoKVxuXHR9XG5cblx0c2V0IHZhbHVlKF9uZXdWYWx1ZTogVCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQ29tcHV0ZWQgc2lnbmFscyBhcmUgcmVhZC1vbmx5Jylcblx0fVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHNpZ25hbFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2lnbmFsPFQ+KGluaXRpYWw6IFQpOiBTaWduYWw8VD4ge1xuXHRyZXR1cm4gbmV3IFNpZ25hbChpbml0aWFsKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIGNvbXB1dGVkIHNpZ25hbFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZWQ8VD4oY29tcHV0ZTogKCkgPT4gVCk6IENvbXB1dGVkU2lnbmFsPFQ+IHtcblx0cmV0dXJuIG5ldyBDb21wdXRlZFNpZ25hbChjb21wdXRlKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBlZmZlY3QgdGhhdCBydW5zIHdoZW4gZGVwZW5kZW5jaWVzIGNoYW5nZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZWZmZWN0KGZuOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG5cdGNvbnN0IHByZXZpb3VzRWZmZWN0ID0gY3VycmVudEVmZmVjdFxuXHRsZXQgY2xlYW51cDogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGxcblx0bGV0IGlzQWN0aXZlID0gdHJ1ZVxuXG5cdGNvbnN0IGVmZmVjdEZuID0gKCkgPT4ge1xuXHRcdGlmICghaXNBY3RpdmUpIHJldHVyblxuXHRcdFxuXHRcdC8vIFJ1biBjbGVhbnVwIGlmIGV4aXN0c1xuXHRcdGlmIChjbGVhbnVwKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjbGVhbnVwKClcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBlZmZlY3QgY2xlYW51cDonLCBlKVxuXHRcdFx0fVxuXHRcdFx0Y2xlYW51cCA9IG51bGxcblx0XHR9XG5cblx0XHQvLyBUcmFjayBkZXBlbmRlbmNpZXNcblx0XHRjdXJyZW50RWZmZWN0ID0gZWZmZWN0Rm5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZm4oKVxuXHRcdFx0Ly8gSWYgZm4gcmV0dXJucyBhIGNsZWFudXAgZnVuY3Rpb24sIHN0b3JlIGl0XG5cdFx0XHRpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRjbGVhbnVwID0gcmVzdWx0XG5cdFx0XHR9XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBlZmZlY3Q6JywgZSlcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Y3VycmVudEVmZmVjdCA9IHByZXZpb3VzRWZmZWN0XG5cdFx0fVxuXHR9XG5cblx0Ly8gUnVuIGVmZmVjdCBpbW1lZGlhdGVseVxuXHRlZmZlY3RGbigpXG5cblx0Ly8gUmV0dXJuIGNsZWFudXAgZnVuY3Rpb25cblx0cmV0dXJuICgpID0+IHtcblx0XHRpc0FjdGl2ZSA9IGZhbHNlXG5cdFx0aWYgKGNsZWFudXApIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNsZWFudXAoKVxuXHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGVmZmVjdCBjbGVhbnVwOicsIGUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIE5vdGU6IFdlIGNhbid0IHVuc3Vic2NyaWJlIGZyb20gc2lnbmFscyBoZXJlIGJlY2F1c2Ugd2UgZG9uJ3QgdHJhY2sgdGhlbVxuXHRcdC8vIFRoaXMgaXMgYSBsaW1pdGF0aW9uIC0gaW4gYSBmdWxsIGltcGxlbWVudGF0aW9uLCB3ZSdkIHRyYWNrIHNpZ25hbCBzdWJzY3JpcHRpb25zXG5cdH1cbn1cbiIsCiAgICAiaW1wb3J0IFZub2RlIGZyb20gJy4uL3JlbmRlci92bm9kZSdcbmltcG9ydCB7Z2V0U2lnbmFsQ29tcG9uZW50cywgdHlwZSBTaWduYWx9IGZyb20gJy4uL3NpZ25hbCdcblxuaW1wb3J0IHR5cGUge0NvbXBvbmVudFR5cGUsIENoaWxkcmVuLCBWbm9kZSBhcyBWbm9kZVR5cGV9IGZyb20gJy4uL3JlbmRlci92bm9kZSdcblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXIge1xuXHQocm9vdDogRWxlbWVudCwgdm5vZGVzOiBDaGlsZHJlbiB8IFZub2RlVHlwZSB8IG51bGwsIHJlZHJhdz86ICgpID0+IHZvaWQpOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVkcmF3IHtcblx0KGNvbXBvbmVudD86IENvbXBvbmVudFR5cGUpOiB2b2lkXG5cdHN5bmMoKTogdm9pZFxuXHRzaWduYWw/OiAoc2lnbmFsOiBTaWduYWw8YW55PikgPT4gdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdW50IHtcblx0KHJvb3Q6IEVsZW1lbnQsIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IG51bGwpOiB2b2lkXG59XG5cbmludGVyZmFjZSBTY2hlZHVsZSB7XG5cdChmbjogKCkgPT4gdm9pZCk6IHZvaWRcbn1cblxuaW50ZXJmYWNlIENvbnNvbGUge1xuXHRlcnJvcjogKGU6IGFueSkgPT4gdm9pZFxufVxuXG5pbnRlcmZhY2UgTW91bnRSZWRyYXcge1xuXHRtb3VudDogTW91bnRcblx0cmVkcmF3OiBSZWRyYXdcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbW91bnRSZWRyYXdGYWN0b3J5KHJlbmRlcjogUmVuZGVyLCBzY2hlZHVsZTogU2NoZWR1bGUsIGNvbnNvbGU6IENvbnNvbGUpOiBNb3VudFJlZHJhdyB7XG5cdGNvbnN0IHN1YnNjcmlwdGlvbnM6IEFycmF5PEVsZW1lbnQgfCBDb21wb25lbnRUeXBlPiA9IFtdXG5cdGNvbnN0IGNvbXBvbmVudFRvRWxlbWVudCA9IG5ldyBXZWFrTWFwPENvbXBvbmVudFR5cGUsIEVsZW1lbnQ+KClcblx0bGV0IHBlbmRpbmcgPSBmYWxzZVxuXHRsZXQgb2Zmc2V0ID0gLTFcblxuXHRmdW5jdGlvbiBzeW5jKCkge1xuXHRcdGZvciAob2Zmc2V0ID0gMDsgb2Zmc2V0IDwgc3Vic2NyaXB0aW9ucy5sZW5ndGg7IG9mZnNldCArPSAyKSB7XG5cdFx0XHR0cnkgeyByZW5kZXIoc3Vic2NyaXB0aW9uc1tvZmZzZXRdIGFzIEVsZW1lbnQsIFZub2RlKHN1YnNjcmlwdGlvbnNbb2Zmc2V0ICsgMV0gYXMgQ29tcG9uZW50VHlwZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIHJlZHJhdykgfVxuXHRcdFx0Y2F0Y2goZSkgeyBjb25zb2xlLmVycm9yKGUpIH1cblx0XHR9XG5cdFx0b2Zmc2V0ID0gLTFcblx0fVxuXG5cdGZ1bmN0aW9uIHJlZHJhd0NvbXBvbmVudChjb21wb25lbnRPclN0YXRlOiBDb21wb25lbnRUeXBlKSB7XG5cdFx0Ly8gY29tcG9uZW50T3JTdGF0ZSBtaWdodCBiZSB2bm9kZS5zdGF0ZSAoZnJvbSBzaWduYWwgdHJhY2tpbmcpIG9yIGNvbXBvbmVudCBvYmplY3Rcblx0XHQvLyBUcnkgdG8gZmluZCB0aGUgYWN0dWFsIGNvbXBvbmVudCBvYmplY3QgaWYgaXQncyB2bm9kZS5zdGF0ZVxuXHRcdGxldCBjb21wb25lbnQgPSBjb21wb25lbnRPclN0YXRlXG5cdFx0Y29uc3Qgc3RhdGVUb0NvbXBvbmVudE1hcCA9IChnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCBhcyBXZWFrTWFwPGFueSwgQ29tcG9uZW50VHlwZT4gfCB1bmRlZmluZWRcblx0XHRpZiAoc3RhdGVUb0NvbXBvbmVudE1hcCAmJiBzdGF0ZVRvQ29tcG9uZW50TWFwLmhhcyhjb21wb25lbnRPclN0YXRlKSkge1xuXHRcdFx0Y29tcG9uZW50ID0gc3RhdGVUb0NvbXBvbmVudE1hcC5nZXQoY29tcG9uZW50T3JTdGF0ZSkhXG5cdFx0fVxuXHRcdFxuXHRcdC8vIEZpcnN0IHRyeTogZmluZCBlbGVtZW50IGluIGNvbXBvbmVudFRvRWxlbWVudCAoZm9yIG0ubW91bnQgY29tcG9uZW50cylcblx0XHQvLyBDaGVjayB0aGlzIGZpcnN0IHRvIGVuc3VyZSBzeW5jaHJvbm91cyByZWRyYXdzIGZvciBtLm1vdW50IGNvbXBvbmVudHNcblx0XHRjb25zdCBlbGVtZW50ID0gY29tcG9uZW50VG9FbGVtZW50LmdldChjb21wb25lbnQpXG5cdFx0aWYgKGVsZW1lbnQpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJlbmRlcihlbGVtZW50LCBWbm9kZShjb21wb25lbnQsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCByZWRyYXcpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBzdWNjZWVkcywgd2UncmUgZG9uZVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBmYWlscywgY29udGludWUgdG8gbmV4dCBjaGVjayAoZmFsbCB0aHJvdWdoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBTZWNvbmQgdHJ5OiBmaW5kIERPTSBlbGVtZW50IGRpcmVjdGx5IGZyb20gY29tcG9uZW50IHN0YXRlIChmb3Igcm91dGVkIGNvbXBvbmVudHMpXG5cdFx0Ly8gT25seSBjaGVjayB0aGlzIGlmIGNvbXBvbmVudFRvRWxlbWVudCBkaWRuJ3QgZmluZCBhbnl0aGluZyAobm90IGFuIG0ubW91bnQgY29tcG9uZW50KVxuXHRcdGNvbnN0IHN0YXRlVG9Eb21NYXAgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gYXMgV2Vha01hcDxhbnksIEVsZW1lbnQ+IHwgdW5kZWZpbmVkXG5cdFx0aWYgKHN0YXRlVG9Eb21NYXAgJiYgc3RhdGVUb0RvbU1hcC5oYXMoY29tcG9uZW50T3JTdGF0ZSkpIHtcblx0XHRcdC8vIEZvciByb3V0ZWQgY29tcG9uZW50cywgYWx3YXlzIHVzZSBnbG9iYWwgcmVkcmF3IHRvIGVuc3VyZSBSb3V0ZXJSb290IHJlLXJlbmRlcnMgY29ycmVjdGx5XG5cdFx0XHQvLyBSb3V0ZXJSb290IG5lZWRzIGN1cnJlbnRSZXNvbHZlciBhbmQgY29tcG9uZW50IHRvIGJlIHNldCAoZnJvbSByb3V0ZSByZXNvbHV0aW9uKVxuXHRcdFx0Ly8gQSBkaXJlY3QgcmVkcmF3IG1pZ2h0IHVzZSBzdGFsZSByb3V0ZSBzdGF0ZSwgc28gd2UgdHJpZ2dlciBhIGZ1bGwgc3luYyBpbnN0ZWFkXG5cdFx0XHQvLyBUaGlzIGVuc3VyZXMgUm91dGVyUm9vdCByZS1yZW5kZXJzIHdpdGggdGhlIGN1cnJlbnQgcm91dGUsIHByZXNlcnZpbmcgTGF5b3V0XG5cdFx0XHRpZiAoIXBlbmRpbmcpIHtcblx0XHRcdFx0cGVuZGluZyA9IHRydWVcblx0XHRcdFx0c2NoZWR1bGUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cGVuZGluZyA9IGZhbHNlXG5cdFx0XHRcdFx0c3luYygpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBUaGlyZCB0cnk6IGZpbmQgZWxlbWVudCBpbiBzdWJzY3JpcHRpb25zXG5cdFx0Y29uc3QgaW5kZXggPSBzdWJzY3JpcHRpb25zLmluZGV4T2YoY29tcG9uZW50KVxuXHRcdGlmIChpbmRleCA+PSAwICYmIGluZGV4ICUgMiA9PT0gMSkge1xuXHRcdFx0Y29uc3Qgcm9vdEVsZW1lbnQgPSBzdWJzY3JpcHRpb25zW2luZGV4IC0gMV0gYXMgRWxlbWVudFxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmVuZGVyKHJvb3RFbGVtZW50LCBWbm9kZShjb21wb25lbnQsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCByZWRyYXcpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBzdWNjZWVkcywgd2UncmUgZG9uZVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBmYWlscywgY29udGludWUgdG8gZmFsbGJhY2sgKGZhbGwgdGhyb3VnaClcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gRmluYWwgZmFsbGJhY2s6IGNvbXBvbmVudCBub3QgZm91bmQgLSB0cmlnZ2VyIGdsb2JhbCByZWRyYXdcblx0XHQvLyBUaGlzIGhhbmRsZXMgZWRnZSBjYXNlcyB3aGVyZSBjb21wb25lbnQgdHJhY2tpbmcgZmFpbGVkXG5cdFx0aWYgKCFwZW5kaW5nKSB7XG5cdFx0XHRwZW5kaW5nID0gdHJ1ZVxuXHRcdFx0c2NoZWR1bGUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHBlbmRpbmcgPSBmYWxzZVxuXHRcdFx0XHRzeW5jKClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVkcmF3KGNvbXBvbmVudD86IENvbXBvbmVudFR5cGUpIHtcblx0XHQvLyBDb21wb25lbnQtbGV2ZWwgcmVkcmF3XG5cdFx0aWYgKGNvbXBvbmVudCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZWRyYXdDb21wb25lbnQoY29tcG9uZW50KVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gR2xvYmFsIHJlZHJhdyAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcblx0XHRpZiAoIXBlbmRpbmcpIHtcblx0XHRcdHBlbmRpbmcgPSB0cnVlXG5cdFx0XHRzY2hlZHVsZShmdW5jdGlvbigpIHtcblx0XHRcdFx0cGVuZGluZyA9IGZhbHNlXG5cdFx0XHRcdHN5bmMoKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRyZWRyYXcuc3luYyA9IHN5bmNcblxuXHQvLyBFeHBvcnQgZnVuY3Rpb24gdG8gcmVkcmF3IGNvbXBvbmVudHMgYWZmZWN0ZWQgYnkgc2lnbmFsIGNoYW5nZXNcblx0OyhyZWRyYXcgYXMgYW55KS5zaWduYWwgPSBmdW5jdGlvbihzaWduYWw6IFNpZ25hbDxhbnk+KSB7XG5cdFx0Y29uc3QgY29tcG9uZW50cyA9IGdldFNpZ25hbENvbXBvbmVudHMoc2lnbmFsKVxuXHRcdGlmIChjb21wb25lbnRzKSB7XG5cdFx0XHRjb21wb25lbnRzLmZvckVhY2goY29tcG9uZW50ID0+IHtcblx0XHRcdFx0cmVkcmF3Q29tcG9uZW50KGNvbXBvbmVudClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbW91bnQocm9vdDogRWxlbWVudCwgY29tcG9uZW50OiBDb21wb25lbnRUeXBlIHwgbnVsbCkge1xuXHRcdGlmIChjb21wb25lbnQgIT0gbnVsbCAmJiAoY29tcG9uZW50IGFzIGFueSkudmlldyA9PSBudWxsICYmIHR5cGVvZiBjb21wb25lbnQgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ20ubW91bnQgZXhwZWN0cyBhIGNvbXBvbmVudCwgbm90IGEgdm5vZGUuJylcblx0XHR9XG5cblx0XHRjb25zdCBpbmRleCA9IHN1YnNjcmlwdGlvbnMuaW5kZXhPZihyb290KVxuXHRcdGlmIChpbmRleCA+PSAwKSB7XG5cdFx0XHRjb25zdCBvbGRDb21wb25lbnQgPSBzdWJzY3JpcHRpb25zW2luZGV4ICsgMV0gYXMgQ29tcG9uZW50VHlwZVxuXHRcdFx0aWYgKG9sZENvbXBvbmVudCkge1xuXHRcdFx0XHRjb21wb25lbnRUb0VsZW1lbnQuZGVsZXRlKG9sZENvbXBvbmVudClcblx0XHRcdH1cblx0XHRcdHN1YnNjcmlwdGlvbnMuc3BsaWNlKGluZGV4LCAyKVxuXHRcdFx0aWYgKGluZGV4IDw9IG9mZnNldCkgb2Zmc2V0IC09IDJcblx0XHRcdHJlbmRlcihyb290LCBbXSlcblx0XHR9XG5cblx0XHRpZiAoY29tcG9uZW50ICE9IG51bGwpIHtcblx0XHRcdHN1YnNjcmlwdGlvbnMucHVzaChyb290LCBjb21wb25lbnQpXG5cdFx0XHRjb21wb25lbnRUb0VsZW1lbnQuc2V0KGNvbXBvbmVudCwgcm9vdClcblx0XHRcdHJlbmRlcihyb290LCBWbm9kZShjb21wb25lbnQsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCByZWRyYXcpXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHttb3VudDogbW91bnQsIHJlZHJhdzogcmVkcmF3fVxufVxuIiwKICAgICIvKlxuUGVyY2VudCBlbmNvZGluZ3MgZW5jb2RlIFVURi04IGJ5dGVzLCBzbyB0aGlzIHJlZ2V4cCBuZWVkcyB0byBtYXRjaCB0aGF0LlxuSGVyZSdzIGhvdyBVVEYtOCBlbmNvZGVzIHN0dWZmOlxuLSBgMDAtN0ZgOiAxLWJ5dGUsIGZvciBVKzAwMDAtVSswMDdGXG4tIGBDMi1ERiA4MC1CRmA6IDItYnl0ZSwgZm9yIFUrMDA4MC1VKzA3RkZcbi0gYEUwLUVGIDgwLUJGIDgwLUJGYDogMy1ieXRlLCBlbmNvZGVzIFUrMDgwMC1VK0ZGRkZcbi0gYEYwLUY0IDgwLUJGIDgwLUJGIDgwLUJGYDogNC1ieXRlLCBlbmNvZGVzIFUrMTAwMDAtVSsxMEZGRkZcbkluIHRoaXMsIHRoZXJlJ3MgYSBudW1iZXIgb2YgaW52YWxpZCBieXRlIHNlcXVlbmNlczpcbi0gYDgwLUJGYDogQ29udGludWF0aW9uIGJ5dGUsIGludmFsaWQgYXMgc3RhcnRcbi0gYEMwLUMxIDgwLUJGYDogT3ZlcmxvbmcgZW5jb2RpbmcgZm9yIFUrMDAwMC1VKzAwN0Zcbi0gYEUwIDgwLTlGIDgwLUJGYDogT3ZlcmxvbmcgZW5jb2RpbmcgZm9yIFUrMDA4MC1VKzA3RkZcbi0gYEVEIEEwLUJGIDgwLUJGYDogRW5jb2RpbmcgZm9yIFVURi0xNiBzdXJyb2dhdGUgVStEODAwLVUrREZGRlxuLSBgRjAgODAtOEYgODAtQkYgODAtQkZgOiBPdmVybG9uZyBlbmNvZGluZyBmb3IgVSswODAwLVUrRkZGRlxuLSBgRjQgOTAtQkZgOiBSRkMgMzYyOSByZXN0cmljdGVkIFVURi04IHRvIG9ubHkgY29kZSBwb2ludHMgVVRGLTE2IGNvdWxkIGVuY29kZS5cbi0gYEY1LUZGYDogUkZDIDM2MjkgcmVzdHJpY3RlZCBVVEYtOCB0byBvbmx5IGNvZGUgcG9pbnRzIFVURi0xNiBjb3VsZCBlbmNvZGUuXG5TbyBpbiByZWFsaXR5LCBvbmx5IHRoZSBmb2xsb3dpbmcgc2VxdWVuY2VzIGNhbiBlbmNvZGUgYXJlIHZhbGlkIGNoYXJhY3RlcnM6XG4tIDAwLTdGXG4tIEMyLURGIDgwLUJGXG4tIEUwICAgIEEwLUJGIDgwLUJGXG4tIEUxLUVDIDgwLUJGIDgwLUJGXG4tIEVEICAgIDgwLTlGIDgwLUJGXG4tIEVFLUVGIDgwLUJGIDgwLUJGXG4tIEYwICAgIDkwLUJGIDgwLUJGIDgwLUJGXG4tIEYxLUYzIDgwLUJGIDgwLUJGIDgwLUJGXG4tIEY0ICAgIDgwLThGIDgwLUJGIDgwLUJGXG5cblRoZSByZWdleHAganVzdCB0cmllcyB0byBtYXRjaCB0aGlzIGFzIGNvbXBhY3RseSBhcyBwb3NzaWJsZS5cbiovXG5jb25zdCB2YWxpZFV0ZjhFbmNvZGluZ3MgPSAvJSg/OlswLTddfCg/IWNbMDFdfGUwJVs4OV18ZWQlW2FiXXxmMCU4fGY0JVs5YWJdKSg/OmN8ZHwoPzplfGZbMC00XSVbODlhYl0pW1xcZGEtZl0lWzg5YWJdKVtcXGRhLWZdJVs4OWFiXSlbXFxkYS1mXS9naVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWNvZGVVUklDb21wb25lbnRTYWZlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UodmFsaWRVdGY4RW5jb2RpbmdzLCBkZWNvZGVVUklDb21wb25lbnQpXG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1aWxkUXVlcnlTdHJpbmcob2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcblx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpICE9PSAnW29iamVjdCBPYmplY3RdJykgcmV0dXJuICcnXG5cblx0Y29uc3QgYXJnczogc3RyaW5nW10gPSBbXVxuXHRmdW5jdGlvbiBkZXN0cnVjdHVyZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkgKyAnWycgKyBpICsgJ10nLCB2YWx1ZVtpXSlcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRcdGZvciAoY29uc3QgaSBpbiB2YWx1ZSkge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkgKyAnWycgKyBpICsgJ10nLCB2YWx1ZVtpXSlcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBhcmdzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycgPyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpIDogJycpKVxuXHR9XG5cblx0Zm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG5cdFx0ZGVzdHJ1Y3R1cmUoa2V5LCBvYmplY3Rba2V5XSlcblx0fVxuXG5cdHJldHVybiBhcmdzLmpvaW4oJyYnKVxufVxuIiwKICAgICJpbXBvcnQgYnVpbGRRdWVyeVN0cmluZyBmcm9tICcuLi9xdWVyeXN0cmluZy9idWlsZCdcblxuLy8gUmV0dXJucyBgcGF0aGAgZnJvbSBgdGVtcGxhdGVgICsgYHBhcmFtc2BcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1aWxkUGF0aG5hbWUodGVtcGxhdGU6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcblx0aWYgKCgvOihbXlxcL1xcLi1dKykoXFwuezN9KT86LykudGVzdCh0ZW1wbGF0ZSkpIHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1RlbXBsYXRlIHBhcmFtZXRlciBuYW1lcyBtdXN0IGJlIHNlcGFyYXRlZCBieSBlaXRoZXIgYSBcXCcvXFwnLCBcXCctXFwnLCBvciBcXCcuXFwnLicpXG5cdH1cblx0aWYgKHBhcmFtcyA9PSBudWxsKSByZXR1cm4gdGVtcGxhdGVcblx0Y29uc3QgcXVlcnlJbmRleCA9IHRlbXBsYXRlLmluZGV4T2YoJz8nKVxuXHRjb25zdCBoYXNoSW5kZXggPSB0ZW1wbGF0ZS5pbmRleE9mKCcjJylcblx0Y29uc3QgcXVlcnlFbmQgPSBoYXNoSW5kZXggPCAwID8gdGVtcGxhdGUubGVuZ3RoIDogaGFzaEluZGV4XG5cdGNvbnN0IHBhdGhFbmQgPSBxdWVyeUluZGV4IDwgMCA/IHF1ZXJ5RW5kIDogcXVlcnlJbmRleFxuXHRjb25zdCBwYXRoID0gdGVtcGxhdGUuc2xpY2UoMCwgcGF0aEVuZClcblx0Y29uc3QgcXVlcnk6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXG5cdE9iamVjdC5hc3NpZ24ocXVlcnksIHBhcmFtcylcblxuXHRjb25zdCByZXNvbHZlZCA9IHBhdGgucmVwbGFjZSgvOihbXlxcL1xcLi1dKykoXFwuezN9KT8vZywgZnVuY3Rpb24obSwga2V5LCB2YXJpYWRpYykge1xuXHRcdGRlbGV0ZSBxdWVyeVtrZXldXG5cdFx0Ly8gSWYgbm8gc3VjaCBwYXJhbWV0ZXIgZXhpc3RzLCBkb24ndCBpbnRlcnBvbGF0ZSBpdC5cblx0XHRpZiAocGFyYW1zW2tleV0gPT0gbnVsbCkgcmV0dXJuIG1cblx0XHQvLyBFc2NhcGUgbm9ybWFsIHBhcmFtZXRlcnMsIGJ1dCBub3QgdmFyaWFkaWMgb25lcy5cblx0XHRyZXR1cm4gdmFyaWFkaWMgPyBwYXJhbXNba2V5XSA6IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcocGFyYW1zW2tleV0pKVxuXHR9KVxuXG5cdC8vIEluIGNhc2UgdGhlIHRlbXBsYXRlIHN1YnN0aXR1dGlvbiBhZGRzIG5ldyBxdWVyeS9oYXNoIHBhcmFtZXRlcnMuXG5cdGNvbnN0IG5ld1F1ZXJ5SW5kZXggPSByZXNvbHZlZC5pbmRleE9mKCc/Jylcblx0Y29uc3QgbmV3SGFzaEluZGV4ID0gcmVzb2x2ZWQuaW5kZXhPZignIycpXG5cdGNvbnN0IG5ld1F1ZXJ5RW5kID0gbmV3SGFzaEluZGV4IDwgMCA/IHJlc29sdmVkLmxlbmd0aCA6IG5ld0hhc2hJbmRleFxuXHRjb25zdCBuZXdQYXRoRW5kID0gbmV3UXVlcnlJbmRleCA8IDAgPyBuZXdRdWVyeUVuZCA6IG5ld1F1ZXJ5SW5kZXhcblx0bGV0IHJlc3VsdCA9IHJlc29sdmVkLnNsaWNlKDAsIG5ld1BhdGhFbmQpXG5cblx0aWYgKHF1ZXJ5SW5kZXggPj0gMCkgcmVzdWx0ICs9IHRlbXBsYXRlLnNsaWNlKHF1ZXJ5SW5kZXgsIHF1ZXJ5RW5kKVxuXHRpZiAobmV3UXVlcnlJbmRleCA+PSAwKSByZXN1bHQgKz0gKHF1ZXJ5SW5kZXggPCAwID8gJz8nIDogJyYnKSArIHJlc29sdmVkLnNsaWNlKG5ld1F1ZXJ5SW5kZXgsIG5ld1F1ZXJ5RW5kKVxuXHRjb25zdCBxdWVyeXN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmcocXVlcnkpXG5cdGlmIChxdWVyeXN0cmluZykgcmVzdWx0ICs9IChxdWVyeUluZGV4IDwgMCAmJiBuZXdRdWVyeUluZGV4IDwgMCA/ICc/JyA6ICcmJykgKyBxdWVyeXN0cmluZ1xuXHRpZiAoaGFzaEluZGV4ID49IDApIHJlc3VsdCArPSB0ZW1wbGF0ZS5zbGljZShoYXNoSW5kZXgpXG5cdGlmIChuZXdIYXNoSW5kZXggPj0gMCkgcmVzdWx0ICs9IChoYXNoSW5kZXggPCAwID8gJycgOiAnJicpICsgcmVzb2x2ZWQuc2xpY2UobmV3SGFzaEluZGV4KVxuXHRyZXR1cm4gcmVzdWx0XG59XG4iLAogICAgImltcG9ydCBkZWNvZGVVUklDb21wb25lbnRTYWZlIGZyb20gJy4uL3V0aWwvZGVjb2RlVVJJQ29tcG9uZW50U2FmZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhzdHJpbmc6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcblx0aWYgKHN0cmluZyA9PT0gJycgfHwgc3RyaW5nID09IG51bGwpIHJldHVybiB7fVxuXHRpZiAoc3RyaW5nLmNoYXJBdCgwKSA9PT0gJz8nKSBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMSlcblxuXHRjb25zdCBlbnRyaWVzID0gc3RyaW5nLnNwbGl0KCcmJylcblx0Y29uc3QgY291bnRlcnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fVxuXHRjb25zdCBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3QgZW50cnkgPSBlbnRyaWVzW2ldLnNwbGl0KCc9Jylcblx0XHRjb25zdCBrZXkgPSBkZWNvZGVVUklDb21wb25lbnRTYWZlKGVudHJ5WzBdKVxuXHRcdGxldCB2YWx1ZTogYW55ID0gZW50cnkubGVuZ3RoID09PSAyID8gZGVjb2RlVVJJQ29tcG9uZW50U2FmZShlbnRyeVsxXSkgOiAnJ1xuXG5cdFx0aWYgKHZhbHVlID09PSAndHJ1ZScpIHZhbHVlID0gdHJ1ZVxuXHRcdGVsc2UgaWYgKHZhbHVlID09PSAnZmFsc2UnKSB2YWx1ZSA9IGZhbHNlXG5cblx0XHRjb25zdCBsZXZlbHMgPSBrZXkuc3BsaXQoL1xcXVxcWz98XFxbLylcblx0XHRsZXQgY3Vyc29yOiBhbnkgPSBkYXRhXG5cdFx0aWYgKGtleS5pbmRleE9mKCdbJykgPiAtMSkgbGV2ZWxzLnBvcCgpXG5cdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBsZXZlbHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGNvbnN0IGxldmVsID0gbGV2ZWxzW2pdXG5cdFx0XHRjb25zdCBuZXh0TGV2ZWwgPSBsZXZlbHNbaiArIDFdXG5cdFx0XHRjb25zdCBpc051bWJlciA9IG5leHRMZXZlbCA9PSAnJyB8fCAhaXNOYU4ocGFyc2VJbnQobmV4dExldmVsLCAxMCkpXG5cdFx0XHRsZXQgZmluYWxMZXZlbDogc3RyaW5nIHwgbnVtYmVyXG5cdFx0XHRpZiAobGV2ZWwgPT09ICcnKSB7XG5cdFx0XHRcdGNvbnN0IGtleSA9IGxldmVscy5zbGljZSgwLCBqKS5qb2luKClcblx0XHRcdFx0aWYgKGNvdW50ZXJzW2tleV0gPT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvdW50ZXJzW2tleV0gPSBBcnJheS5pc0FycmF5KGN1cnNvcikgPyBjdXJzb3IubGVuZ3RoIDogMFxuXHRcdFx0XHR9XG5cdFx0XHRcdGZpbmFsTGV2ZWwgPSBjb3VudGVyc1trZXldKytcblx0XHRcdH1cblx0XHRcdC8vIERpc2FsbG93IGRpcmVjdCBwcm90b3R5cGUgcG9sbHV0aW9uXG5cdFx0XHRlbHNlIGlmIChsZXZlbCA9PT0gJ19fcHJvdG9fXycpIGJyZWFrXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0ZmluYWxMZXZlbCA9IGxldmVsXG5cdFx0XHR9XG5cdFx0XHRpZiAoaiA9PT0gbGV2ZWxzLmxlbmd0aCAtIDEpIGN1cnNvcltmaW5hbExldmVsXSA9IHZhbHVlXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gUmVhZCBvd24gcHJvcGVydGllcyBleGNsdXNpdmVseSB0byBkaXNhbGxvdyBpbmRpcmVjdFxuXHRcdFx0XHQvLyBwcm90b3R5cGUgcG9sbHV0aW9uXG5cdFx0XHRcdGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGN1cnNvciwgZmluYWxMZXZlbClcblx0XHRcdFx0bGV0IGRlc2NWYWx1ZSA9IGRlc2MgIT0gbnVsbCA/IGRlc2MudmFsdWUgOiB1bmRlZmluZWRcblx0XHRcdFx0aWYgKGRlc2NWYWx1ZSA9PSBudWxsKSBjdXJzb3JbZmluYWxMZXZlbF0gPSBkZXNjVmFsdWUgPSBpc051bWJlciA/IFtdIDoge31cblx0XHRcdFx0Y3Vyc29yID0gZGVzY1ZhbHVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBkYXRhXG59XG4iLAogICAgImltcG9ydCBwYXJzZVF1ZXJ5U3RyaW5nIGZyb20gJy4uL3F1ZXJ5c3RyaW5nL3BhcnNlJ1xuXG4vLyBSZXR1cm5zIGB7cGF0aCwgcGFyYW1zfWAgZnJvbSBgdXJsYFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VQYXRobmFtZSh1cmw6IHN0cmluZyk6IHtwYXRoOiBzdHJpbmc7IHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pn0ge1xuXHRjb25zdCBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nKVxuXHRjb25zdCBoYXNoSW5kZXggPSB1cmwuaW5kZXhPZignIycpXG5cdGNvbnN0IHF1ZXJ5RW5kID0gaGFzaEluZGV4IDwgMCA/IHVybC5sZW5ndGggOiBoYXNoSW5kZXhcblx0Y29uc3QgcGF0aEVuZCA9IHF1ZXJ5SW5kZXggPCAwID8gcXVlcnlFbmQgOiBxdWVyeUluZGV4XG5cdGxldCBwYXRoID0gdXJsLnNsaWNlKDAsIHBhdGhFbmQpLnJlcGxhY2UoL1xcL3syLH0vZywgJy8nKVxuXG5cdGlmICghcGF0aCkgcGF0aCA9ICcvJ1xuXHRlbHNlIHtcblx0XHRpZiAocGF0aFswXSAhPT0gJy8nKSBwYXRoID0gJy8nICsgcGF0aFxuXHR9XG5cdHJldHVybiB7XG5cdFx0cGF0aDogcGF0aCxcblx0XHRwYXJhbXM6IHF1ZXJ5SW5kZXggPCAwXG5cdFx0XHQ/IHt9XG5cdFx0XHQ6IHBhcnNlUXVlcnlTdHJpbmcodXJsLnNsaWNlKHF1ZXJ5SW5kZXggKyAxLCBxdWVyeUVuZCkpLFxuXHR9XG59XG4iLAogICAgImltcG9ydCBwYXJzZVBhdGhuYW1lIGZyb20gJy4vcGFyc2UnXG5cbmludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlIHtcblx0KGRhdGE6IHtwYXRoOiBzdHJpbmc7IHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pn0pOiBib29sZWFuXG59XG5cbi8vIENvbXBpbGVzIGEgdGVtcGxhdGUgaW50byBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSByZXNvbHZlZCBwYXRoICh3aXRob3V0IHF1ZXJ5XG4vLyBzdHJpbmdzKSBhbmQgcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgdGVtcGxhdGUgcGFyYW1ldGVycyB3aXRoIHRoZWlyXG4vLyBwYXJzZWQgdmFsdWVzLiBUaGlzIGV4cGVjdHMgdGhlIGlucHV0IG9mIHRoZSBjb21waWxlZCB0ZW1wbGF0ZSB0byBiZSB0aGVcbi8vIG91dHB1dCBvZiBgcGFyc2VQYXRobmFtZWAuIE5vdGUgdGhhdCBpdCBkb2VzICpub3QqIHJlbW92ZSBxdWVyeSBwYXJhbWV0ZXJzXG4vLyBzcGVjaWZpZWQgaW4gdGhlIHRlbXBsYXRlLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlOiBzdHJpbmcpOiBDb21waWxlZFRlbXBsYXRlIHtcblx0Y29uc3QgdGVtcGxhdGVEYXRhID0gcGFyc2VQYXRobmFtZSh0ZW1wbGF0ZSlcblx0Y29uc3QgdGVtcGxhdGVLZXlzID0gT2JqZWN0LmtleXModGVtcGxhdGVEYXRhLnBhcmFtcylcblx0Y29uc3Qga2V5czogQXJyYXk8e2s6IHN0cmluZzsgcjogYm9vbGVhbn0+ID0gW11cblx0Y29uc3QgcmVnZXhwID0gbmV3IFJlZ0V4cCgnXicgKyB0ZW1wbGF0ZURhdGEucGF0aC5yZXBsYWNlKFxuXHRcdC8vIEkgZXNjYXBlIGxpdGVyYWwgdGV4dCBzbyBwZW9wbGUgY2FuIHVzZSB0aGluZ3MgbGlrZSBgOmZpbGUuOmV4dGAgb3Jcblx0XHQvLyBgOmxhbmctOmxvY2FsZWAgaW4gcm91dGVzLiBUaGlzIGlzIGFsbCBtZXJnZWQgaW50byBvbmUgcGFzcyBzbyBJXG5cdFx0Ly8gZG9uJ3QgYWxzbyBhY2NpZGVudGFsbHkgZXNjYXBlIGAtYCBhbmQgbWFrZSBpdCBoYXJkZXIgdG8gZGV0ZWN0IGl0IHRvXG5cdFx0Ly8gYmFuIGl0IGZyb20gdGVtcGxhdGUgcGFyYW1ldGVycy5cblx0XHQvOihbXlxcLy4tXSspKFxcLnszfXxcXC4oPyFcXC4pfC0pP3xbXFxcXF4kKisuKCl8XFxbXFxde31dL2csXG5cdFx0ZnVuY3Rpb24obSwga2V5LCBleHRyYSkge1xuXHRcdFx0aWYgKGtleSA9PSBudWxsKSByZXR1cm4gJ1xcXFwnICsgbVxuXHRcdFx0a2V5cy5wdXNoKHtrOiBrZXksIHI6IGV4dHJhID09PSAnLi4uJ30pXG5cdFx0XHRpZiAoZXh0cmEgPT09ICcuLi4nKSByZXR1cm4gJyguKiknXG5cdFx0XHRpZiAoZXh0cmEgPT09ICcuJykgcmV0dXJuICcoW14vXSspXFxcXC4nXG5cdFx0XHRyZXR1cm4gJyhbXi9dKyknICsgKGV4dHJhIHx8ICcnKVxuXHRcdH0sXG5cdCkgKyAnXFxcXC8/JCcpXG5cdHJldHVybiBmdW5jdGlvbihkYXRhOiB7cGF0aDogc3RyaW5nOyBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT59KTogYm9vbGVhbiB7XG5cdFx0Ly8gRmlyc3QsIGNoZWNrIHRoZSBwYXJhbXMuIFVzdWFsbHksIHRoZXJlIGlzbid0IGFueSwgYW5kIGl0J3MganVzdFxuXHRcdC8vIGNoZWNraW5nIGEgc3RhdGljIHNldC5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRlbXBsYXRlS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRlbXBsYXRlRGF0YS5wYXJhbXNbdGVtcGxhdGVLZXlzW2ldXSAhPT0gZGF0YS5wYXJhbXNbdGVtcGxhdGVLZXlzW2ldXSkgcmV0dXJuIGZhbHNlXG5cdFx0fVxuXHRcdC8vIElmIG5vIGludGVycG9sYXRpb25zIGV4aXN0LCBsZXQncyBza2lwIGFsbCB0aGUgY2VyZW1vbnlcblx0XHRpZiAoIWtleXMubGVuZ3RoKSByZXR1cm4gcmVnZXhwLnRlc3QoZGF0YS5wYXRoKVxuXHRcdGNvbnN0IHZhbHVlcyA9IHJlZ2V4cC5leGVjKGRhdGEucGF0aClcblx0XHRpZiAodmFsdWVzID09IG51bGwpIHJldHVybiBmYWxzZVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZGF0YS5wYXJhbXNba2V5c1tpXS5rXSA9IGtleXNbaV0uciA/IHZhbHVlc1tpICsgMV0gOiBkZWNvZGVVUklDb21wb25lbnQodmFsdWVzW2kgKyAxXSlcblx0XHR9XG5cdFx0cmV0dXJuIHRydWVcblx0fVxufVxuIiwKICAgICIvLyBOb3RlOiB0aGlzIGlzIG1pbGRseSBwZXJmLXNlbnNpdGl2ZS5cbi8vXG4vLyBJdCBkb2VzICpub3QqIHVzZSBgZGVsZXRlYCAtIGR5bmFtaWMgYGRlbGV0ZWBzIHVzdWFsbHkgY2F1c2Ugb2JqZWN0cyB0byBiYWlsXG4vLyBvdXQgaW50byBkaWN0aW9uYXJ5IG1vZGUgYW5kIGp1c3QgZ2VuZXJhbGx5IGNhdXNlIGEgYnVuY2ggb2Ygb3B0aW1pemF0aW9uXG4vLyBpc3N1ZXMgd2l0aGluIGVuZ2luZXMuXG4vL1xuLy8gSWRlYWxseSwgSSB3b3VsZCd2ZSBwcmVmZXJyZWQgdG8gZG8gdGhpcywgaWYgaXQgd2VyZW4ndCBmb3IgdGhlIG9wdGltaXphdGlvblxuLy8gaXNzdWVzOlxuLy9cbi8vIGBgYHRzXG4vLyBjb25zdCBoYXNPd24gPSByZXF1aXJlKFwiLi9oYXNPd25cIilcbi8vIGNvbnN0IG1hZ2ljID0gW1xuLy8gICAgIFwia2V5XCIsIFwib25pbml0XCIsIFwib25jcmVhdGVcIiwgXCJvbmJlZm9yZXVwZGF0ZVwiLCBcIm9udXBkYXRlXCIsXG4vLyAgICAgXCJvbmJlZm9yZXJlbW92ZVwiLCBcIm9ucmVtb3ZlXCIsXG4vLyBdXG4vLyBleHBvcnQgZGVmYXVsdCAoYXR0cnMsIGV4dHJhcykgPT4ge1xuLy8gICAgIGNvbnN0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShudWxsKSwgYXR0cnMpXG4vLyAgICAgZm9yIChjb25zdCBrZXkgb2YgbWFnaWMpIGRlbGV0ZSByZXN1bHRba2V5XVxuLy8gICAgIGlmIChleHRyYXMgIT0gbnVsbCkgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFzKSBkZWxldGUgcmVzdWx0W2tleV1cbi8vICAgICByZXR1cm4gcmVzdWx0XG4vLyB9XG4vLyBgYGBcblxuaW1wb3J0IGhhc093biBmcm9tICcuL2hhc093bidcblxuY29uc3QgbWFnaWMgPSAvXig/OmtleXxvbmluaXR8b25jcmVhdGV8b25iZWZvcmV1cGRhdGV8b251cGRhdGV8b25iZWZvcmVyZW1vdmV8b25yZW1vdmUpJC9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2Vuc29yKGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBleHRyYXM/OiBzdHJpbmdbXSk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuXHRjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXG5cdGlmIChleHRyYXMgIT0gbnVsbCkge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG5cdFx0XHRpZiAoaGFzT3duLmNhbGwoYXR0cnMsIGtleSkgJiYgIW1hZ2ljLnRlc3Qoa2V5KSAmJiBleHRyYXMuaW5kZXhPZihrZXkpIDwgMCkge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJzW2tleV1cblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcblx0XHRcdGlmIChoYXNPd24uY2FsbChhdHRycywga2V5KSAmJiAhbWFnaWMudGVzdChrZXkpKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cnNba2V5XVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRcbn1cbiIsCiAgICAiLyoqXG4gKiBJc29tb3JwaGljIFVSSSBBUEkgLSB3b3JrcyBpbiBib3RoIFNTUiAoc2VydmVyKSBhbmQgYnJvd3NlciBjb250ZXh0c1xuICovXG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IGZ1bGwgVVJMIChocmVmKVxuICogUmV0dXJucyB3aW5kb3cubG9jYXRpb24uaHJlZiBpbiBicm93c2VyLCBvciBzZXJ2ZXIncyByZXF1ZXN0IFVSTCBkdXJpbmcgU1NSXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50VXJsKCk6IHN0cmluZyB7XG5cdC8vIFByZWZlciBicm93c2VyIGxvY2F0aW9uIHdoZW4gYXZhaWxhYmxlIChtb3JlIGRpcmVjdClcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuXHRcdHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZlxuXHR9XG5cdFxuXHQvLyBGYWxsIGJhY2sgdG8gU1NSIHNlcnZlciBVUkwgKHdoZW4gY2xpZW50IGNvZGUgcnVucyBvbiBzZXJ2ZXIpXG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgKGdsb2JhbFRoaXMgYXMgYW55KS5fX1NTUl9VUkxfXykge1xuXHRcdHJldHVybiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fU1NSX1VSTF9fXG5cdH1cblx0XG5cdC8vIEZhbGxiYWNrIChzaG91bGRuJ3QgaGFwcGVuKVxuXHRyZXR1cm4gJydcbn1cblxuLyoqXG4gKiBQYXJzZSBhIFVSTCBzdHJpbmcgaW50byBpdHMgY29tcG9uZW50c1xuICovXG5mdW5jdGlvbiBwYXJzZVVybCh1cmw6IHN0cmluZyk6IFVSTCB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKVxuXHR9IGNhdGNoIHtcblx0XHQvLyBGYWxsYmFjayBmb3IgcmVsYXRpdmUgVVJMc1xuXHRcdHJldHVybiBuZXcgVVJMKHVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKVxuXHR9XG59XG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IHBhdGhuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRobmFtZSgpOiBzdHJpbmcge1xuXHQvLyBQcmVmZXIgYnJvd3NlciBsb2NhdGlvbiB3aGVuIGF2YWlsYWJsZSAobW9yZSBkaXJlY3QpXG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24pIHtcblx0XHRyZXR1cm4gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lIHx8ICcvJ1xuXHR9XG5cdFxuXHQvLyBGYWxsIGJhY2sgdG8gcGFyc2luZyBTU1IgVVJMXG5cdGNvbnN0IHVybCA9IGdldEN1cnJlbnRVcmwoKVxuXHRpZiAoIXVybCkgcmV0dXJuICcvJ1xuXHRcblx0Y29uc3QgcGFyc2VkID0gcGFyc2VVcmwodXJsKVxuXHRyZXR1cm4gcGFyc2VkLnBhdGhuYW1lIHx8ICcvJ1xufVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBzZWFyY2ggc3RyaW5nIChxdWVyeSBzdHJpbmcpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWFyY2goKTogc3RyaW5nIHtcblx0Ly8gUHJlZmVyIGJyb3dzZXIgbG9jYXRpb24gd2hlbiBhdmFpbGFibGUgKG1vcmUgZGlyZWN0KVxuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2F0aW9uKSB7XG5cdFx0cmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggfHwgJydcblx0fVxuXHRcblx0Ly8gRmFsbCBiYWNrIHRvIHBhcnNpbmcgU1NSIFVSTFxuXHRjb25zdCB1cmwgPSBnZXRDdXJyZW50VXJsKClcblx0aWYgKCF1cmwpIHJldHVybiAnJ1xuXHRcblx0Y29uc3QgcGFyc2VkID0gcGFyc2VVcmwodXJsKVxuXHRyZXR1cm4gcGFyc2VkLnNlYXJjaCB8fCAnJ1xufVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBoYXNoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYXNoKCk6IHN0cmluZyB7XG5cdC8vIFByZWZlciBicm93c2VyIGxvY2F0aW9uIHdoZW4gYXZhaWxhYmxlIChtb3JlIGRpcmVjdClcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuXHRcdHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaCB8fCAnJ1xuXHR9XG5cdFxuXHQvLyBGYWxsIGJhY2sgdG8gcGFyc2luZyBTU1IgVVJMXG5cdGNvbnN0IHVybCA9IGdldEN1cnJlbnRVcmwoKVxuXHRpZiAoIXVybCkgcmV0dXJuICcnXG5cdFxuXHRjb25zdCBwYXJzZWQgPSBwYXJzZVVybCh1cmwpXG5cdHJldHVybiBwYXJzZWQuaGFzaCB8fCAnJ1xufVxuXG4vKipcbiAqIEdldCBhIExvY2F0aW9uLWxpa2Ugb2JqZWN0IHdpdGggYWxsIHByb3BlcnRpZXNcbiAqIENvbXBhdGlibGUgd2l0aCBicm93c2VyIExvY2F0aW9uIEFQSVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElzb21vcnBoaWNMb2NhdGlvbiB7XG5cdGhyZWY6IHN0cmluZ1xuXHRwYXRobmFtZTogc3RyaW5nXG5cdHNlYXJjaDogc3RyaW5nXG5cdGhhc2g6IHN0cmluZ1xuXHRvcmlnaW4/OiBzdHJpbmdcblx0aG9zdD86IHN0cmluZ1xuXHRob3N0bmFtZT86IHN0cmluZ1xuXHRwb3J0Pzogc3RyaW5nXG5cdHByb3RvY29sPzogc3RyaW5nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhdGlvbigpOiBJc29tb3JwaGljTG9jYXRpb24ge1xuXHRjb25zdCB1cmwgPSBnZXRDdXJyZW50VXJsKClcblx0aWYgKCF1cmwpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aHJlZjogJycsXG5cdFx0XHRwYXRobmFtZTogJy8nLFxuXHRcdFx0c2VhcmNoOiAnJyxcblx0XHRcdGhhc2g6ICcnLFxuXHRcdH1cblx0fVxuXHRcblx0Y29uc3QgcGFyc2VkID0gcGFyc2VVcmwodXJsKVxuXHRyZXR1cm4ge1xuXHRcdGhyZWY6IHBhcnNlZC5ocmVmLFxuXHRcdHBhdGhuYW1lOiBwYXJzZWQucGF0aG5hbWUgfHwgJy8nLFxuXHRcdHNlYXJjaDogcGFyc2VkLnNlYXJjaCB8fCAnJyxcblx0XHRoYXNoOiBwYXJzZWQuaGFzaCB8fCAnJyxcblx0XHRvcmlnaW46IHBhcnNlZC5vcmlnaW4sXG5cdFx0aG9zdDogcGFyc2VkLmhvc3QsXG5cdFx0aG9zdG5hbWU6IHBhcnNlZC5ob3N0bmFtZSxcblx0XHRwb3J0OiBwYXJzZWQucG9ydCxcblx0XHRwcm90b2NvbDogcGFyc2VkLnByb3RvY29sLFxuXHR9XG59XG4iLAogICAgIi8qKlxuICogSXNvbW9ycGhpYyBsb2dnZXIgd2l0aCBjb2xvcnMgYW5kIHN0cnVjdHVyZWQgbG9nZ2luZy5cbiAqIFdvcmtzIGluIGJvdGggc2VydmVyIChCdW4vTm9kZSkgYW5kIGNsaWVudCAoYnJvd3NlcikgZW52aXJvbm1lbnRzLlxuICogUHJvdmlkZXMgaW5mbywgZGVidWcsIHdhcm5pbmcsIGFuZCBlcnJvciBsb2cgbGV2ZWxzIHdpdGggYXBwcm9wcmlhdGUgZm9ybWF0dGluZy5cbiAqL1xuXG4vLyBEZXRlY3QgaWYgd2UncmUgcnVubmluZyBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnRcbmNvbnN0IGlzQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcblxuLy8gQU5TSSBjb2xvciBjb2RlcyBmb3IgdGVybWluYWwgb3V0cHV0IChzZXJ2ZXIgb25seSlcbmNvbnN0IGNvbG9ycyA9IHtcblx0cmVzZXQ6ICdcXHgxYlswbScsXG5cdGJyaWdodDogJ1xceDFiWzFtJyxcblx0ZGltOiAnXFx4MWJbMm0nLFxuXHRcblx0Ly8gVGV4dCBjb2xvcnNcblx0YmxhY2s6ICdcXHgxYlszMG0nLFxuXHRyZWQ6ICdcXHgxYlszMW0nLFxuXHRncmVlbjogJ1xceDFiWzMybScsXG5cdHllbGxvdzogJ1xceDFiWzMzbScsXG5cdGJsdWU6ICdcXHgxYlszNG0nLFxuXHRtYWdlbnRhOiAnXFx4MWJbMzVtJyxcblx0Y3lhbjogJ1xceDFiWzM2bScsXG5cdHdoaXRlOiAnXFx4MWJbMzdtJyxcblx0XG5cdC8vIEJhY2tncm91bmQgY29sb3JzXG5cdGJnQmxhY2s6ICdcXHgxYls0MG0nLFxuXHRiZ1JlZDogJ1xceDFiWzQxbScsXG5cdGJnR3JlZW46ICdcXHgxYls0Mm0nLFxuXHRiZ1llbGxvdzogJ1xceDFiWzQzbScsXG5cdGJnQmx1ZTogJ1xceDFiWzQ0bScsXG5cdGJnTWFnZW50YTogJ1xceDFiWzQ1bScsXG5cdGJnQ3lhbjogJ1xceDFiWzQ2bScsXG5cdGJnV2hpdGU6ICdcXHgxYls0N20nLFxufVxuXG4vLyBDaGVjayBpZiBjb2xvcnMgc2hvdWxkIGJlIGVuYWJsZWQgKHNlcnZlciBvbmx5LCBkZWZhdWx0OiB0cnVlLCBjYW4gYmUgZGlzYWJsZWQgd2l0aCBOT19DT0xPUiBlbnYgdmFyKVxuY29uc3QgZW5hYmxlQ29sb3JzID0gIWlzQnJvd3NlciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnYgJiYgcHJvY2Vzcy5lbnYuTk9fQ09MT1IgIT09ICcxJyAmJiBwcm9jZXNzLmVudi5OT19DT0xPUiAhPT0gJ3RydWUnXG5cbmZ1bmN0aW9uIGNvbG9yaXplKHRleHQ6IHN0cmluZywgY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiBlbmFibGVDb2xvcnMgPyBgJHtjb2xvcn0ke3RleHR9JHtjb2xvcnMucmVzZXR9YCA6IHRleHRcbn1cblxuZnVuY3Rpb24gZ2V0VGltZXN0YW1wKCk6IHN0cmluZyB7XG5cdGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcblx0Y29uc3QgaG91cnMgPSBTdHJpbmcobm93LmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsICcwJylcblx0Y29uc3QgbWludXRlcyA9IFN0cmluZyhub3cuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpXG5cdGNvbnN0IHNlY29uZHMgPSBTdHJpbmcobm93LmdldFNlY29uZHMoKSkucGFkU3RhcnQoMiwgJzAnKVxuXHRjb25zdCBtcyA9IFN0cmluZyhub3cuZ2V0TWlsbGlzZWNvbmRzKCkpLnBhZFN0YXJ0KDMsICcwJylcblx0cmV0dXJuIGAke2hvdXJzfToke21pbnV0ZXN9OiR7c2Vjb25kc30uJHttc31gXG59XG5cbmZ1bmN0aW9uIGZvcm1hdExldmVsKGxldmVsOiAnaW5mbycgfCAnZGVidWcnIHwgJ3dhcm4nIHwgJ2Vycm9yJyk6IHN0cmluZyB7XG5cdGNvbnN0IGxldmVsTWFwID0ge1xuXHRcdGluZm86IGNvbG9yaXplKCdJTkZPJywgY29sb3JzLmJyaWdodCArIGNvbG9ycy5jeWFuKSxcblx0XHRkZWJ1ZzogY29sb3JpemUoJ0RFQlVHJywgY29sb3JzLmJyaWdodCArIGNvbG9ycy5ibHVlKSxcblx0XHR3YXJuOiBjb2xvcml6ZSgnV0FSTicsIGNvbG9ycy5icmlnaHQgKyBjb2xvcnMueWVsbG93KSxcblx0XHRlcnJvcjogY29sb3JpemUoJ0VSUk9SJywgY29sb3JzLmJyaWdodCArIGNvbG9ycy5yZWQpLFxuXHR9XG5cdHJldHVybiBsZXZlbE1hcFtsZXZlbF1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dDb250ZXh0IHtcblx0cGF0aG5hbWU/OiBzdHJpbmdcblx0bWV0aG9kPzogc3RyaW5nXG5cdHNlc3Npb25JZD86IHN0cmluZ1xuXHRyb3V0ZT86IHN0cmluZ1xuXHRtb2R1bGU/OiBzdHJpbmcgLy8gTW9kdWxlIG5hbWUgKGUuZy4sICdpZGVudGl0eScsICdvcmRlcicpIC0gd2lsbCBiZSBzaG93biBhcyBbbW9kdWxlXSBwcmVmaXhcblx0W2tleTogc3RyaW5nXTogYW55XG59XG5cbmNsYXNzIExvZ2dlciB7XG5cdC8vIERlZmF1bHQgcHJlZml4OiBbU1NSXSBmb3Igc2VydmVyIGluZnJhc3RydWN0dXJlLCBbQVBQXSBmb3IgYXBwbGljYXRpb24gY29kZVxuXHRwcml2YXRlIHByZWZpeDogc3RyaW5nID0gJ1tTU1JdJ1xuXHRcblx0LyoqXG5cdCAqIFNldCB0aGUgbG9nIHByZWZpeCAoZGVmYXVsdDogJ1tTU1JdJyBmb3IgaW5mcmFzdHJ1Y3R1cmUsICdbQVBQXScgZm9yIGFwcGxpY2F0aW9uIGNvZGUpXG5cdCAqL1xuXHRzZXRQcmVmaXgocHJlZml4OiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLnByZWZpeCA9IHByZWZpeFxuXHR9XG5cdFxuXHRwcml2YXRlIGZvcm1hdE1lc3NhZ2UobGV2ZWw6ICdpbmZvJyB8ICdkZWJ1ZycgfCAnd2FybicgfCAnZXJyb3InLCBtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogc3RyaW5nIHtcblx0XHRjb25zdCB0aW1lc3RhbXAgPSBjb2xvcml6ZShnZXRUaW1lc3RhbXAoKSwgY29sb3JzLmRpbSArIGNvbG9ycy53aGl0ZSlcblx0XHRjb25zdCBsZXZlbFN0ciA9IGZvcm1hdExldmVsKGxldmVsKVxuXHRcdFxuXHRcdC8vIEFsd2F5cyB1c2UgdGhlIHNldCBwcmVmaXggKGUuZy4sIFtBUFBdIG9yIFtTU1JdKVxuXHRcdGNvbnN0IHByZWZpeFN0ciA9IGNvbG9yaXplKHRoaXMucHJlZml4LCB0aGlzLnByZWZpeCA9PT0gJ1tTU1JdJyA/IGNvbG9ycy5icmlnaHQgKyBjb2xvcnMubWFnZW50YSA6IGNvbG9ycy5icmlnaHQgKyBjb2xvcnMuY3lhbilcblx0XHRcblx0XHQvLyBJbmNsdWRlIG1vZHVsZSBpbiBtZXNzYWdlIGlmIHByb3ZpZGVkXG5cdFx0bGV0IGRpc3BsYXlNZXNzYWdlID0gbWVzc2FnZVxuXHRcdGlmIChjb250ZXh0Py5tb2R1bGUpIHtcblx0XHRcdGRpc3BsYXlNZXNzYWdlID0gYFske2NvbnRleHQubW9kdWxlfV0gJHttZXNzYWdlfWBcblx0XHR9XG5cdFx0XG5cdFx0bGV0IGNvbnRleHRTdHIgPSAnJ1xuXHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGFydHM6IHN0cmluZ1tdID0gW11cblx0XHRcdGlmIChjb250ZXh0Lm1ldGhvZCkge1xuXHRcdFx0XHRjb250ZXh0UGFydHMucHVzaChjb2xvcml6ZShjb250ZXh0Lm1ldGhvZCwgY29sb3JzLmN5YW4pKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbnRleHQucGF0aG5hbWUpIHtcblx0XHRcdFx0Y29udGV4dFBhcnRzLnB1c2goY29sb3JpemUoY29udGV4dC5wYXRobmFtZSwgY29sb3JzLmdyZWVuKSlcblx0XHRcdH1cblx0XHRcdGlmIChjb250ZXh0LnJvdXRlKSB7XG5cdFx0XHRcdGNvbnRleHRQYXJ0cy5wdXNoKGNvbG9yaXplKGByb3V0ZToke2NvbnRleHQucm91dGV9YCwgY29sb3JzLmJsdWUpKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbnRleHQuc2Vzc2lvbklkKSB7XG5cdFx0XHRcdGNvbnRleHRQYXJ0cy5wdXNoKGNvbG9yaXplKGBzZXNzaW9uOiR7Y29udGV4dC5zZXNzaW9uSWQuc2xpY2UoMCwgOCl9Li4uYCwgY29sb3JzLmRpbSArIGNvbG9ycy53aGl0ZSkpXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIEFkZCBhbnkgYWRkaXRpb25hbCBjb250ZXh0IGZpZWxkcyAoZXhjbHVkaW5nIG1vZHVsZSB3aGljaCBpcyBzaG93biBpbiBtZXNzYWdlKVxuXHRcdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29udGV4dCkpIHtcblx0XHRcdFx0aWYgKCFbJ21ldGhvZCcsICdwYXRobmFtZScsICdyb3V0ZScsICdzZXNzaW9uSWQnLCAnbW9kdWxlJ10uaW5jbHVkZXMoa2V5KSkge1xuXHRcdFx0XHRcdGNvbnRleHRQYXJ0cy5wdXNoKGNvbG9yaXplKGAke2tleX06JHt2YWx1ZX1gLCBjb2xvcnMuZGltICsgY29sb3JzLndoaXRlKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoY29udGV4dFBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29udGV4dFN0ciA9ICcgJyArIGNvbnRleHRQYXJ0cy5qb2luKCcgJylcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGAke3RpbWVzdGFtcH0gJHtwcmVmaXhTdHJ9ICR7bGV2ZWxTdHJ9JHtjb250ZXh0U3RyfSAke2Rpc3BsYXlNZXNzYWdlfWBcblx0fVxuXHRcblx0cHJpdmF0ZSBmb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0PzogTG9nQ29udGV4dCk6IHN0cmluZ1tdIHtcblx0XHRpZiAoIWNvbnRleHQpIHJldHVybiBbXVxuXHRcdFxuXHRcdGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG5cdFx0aWYgKGNvbnRleHQubWV0aG9kKSBwYXJ0cy5wdXNoKGBNZXRob2Q6ICR7Y29udGV4dC5tZXRob2R9YClcblx0XHRpZiAoY29udGV4dC5wYXRobmFtZSkgcGFydHMucHVzaChgUGF0aDogJHtjb250ZXh0LnBhdGhuYW1lfWApXG5cdFx0aWYgKGNvbnRleHQucm91dGUpIHBhcnRzLnB1c2goYFJvdXRlOiAke2NvbnRleHQucm91dGV9YClcblx0XHRpZiAoY29udGV4dC5zZXNzaW9uSWQpIHBhcnRzLnB1c2goYFNlc3Npb246ICR7Y29udGV4dC5zZXNzaW9uSWQuc2xpY2UoMCwgOCl9Li4uYClcblx0XHRcblx0XHQvLyBBZGQgYW55IGFkZGl0aW9uYWwgY29udGV4dCBmaWVsZHMgKGV4Y2x1ZGluZyBtb2R1bGUgd2hpY2ggaXMgdXNlZCBhcyBwcmVmaXgpXG5cdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29udGV4dCkpIHtcblx0XHRcdGlmICghWydtZXRob2QnLCAncGF0aG5hbWUnLCAncm91dGUnLCAnc2Vzc2lvbklkJywgJ21vZHVsZSddLmluY2x1ZGVzKGtleSkpIHtcblx0XHRcdFx0cGFydHMucHVzaChgJHtrZXl9OiAke3ZhbHVlfWApXG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBwYXJ0c1xuXHR9XG5cdFxuXHRwcml2YXRlIGdldERpc3BsYXlQcmVmaXgoY29udGV4dD86IExvZ0NvbnRleHQpOiBzdHJpbmcge1xuXHRcdC8vIEFsd2F5cyB1c2UgdGhlIHNldCBwcmVmaXggKGUuZy4sIFtjbGllbnRdIG9yIFtTU1JdKVxuXHRcdHJldHVybiB0aGlzLnByZWZpeFxuXHR9XG5cdFxuXHRwcml2YXRlIGdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IExvZ0NvbnRleHQpOiBzdHJpbmcge1xuXHRcdC8vIEluY2x1ZGUgbW9kdWxlIGluIG1lc3NhZ2UgaWYgcHJvdmlkZWRcblx0XHRpZiAoY29udGV4dD8ubW9kdWxlKSB7XG5cdFx0XHRyZXR1cm4gYFske2NvbnRleHQubW9kdWxlfV0gJHttZXNzYWdlfWBcblx0XHR9XG5cdFx0cmV0dXJuIG1lc3NhZ2Vcblx0fVxuXHRcblx0aW5mbyhtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogdm9pZCB7XG5cdFx0aWYgKGlzQnJvd3Nlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhcnRzID0gdGhpcy5mb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheVByZWZpeCA9IHRoaXMuZ2V0RGlzcGxheVByZWZpeChjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIGNvbnRleHQpXG5cdFx0XHQvLyBVc2UgbXVsdGlwbGUgJWMgZm9yIGRpZmZlcmVudCBjb2xvcmVkIHBhcnRzOiBwcmVmaXgsIGxldmVsLCBtZXNzYWdlXG5cdFx0XHRjb25zdCBwcmVmaXhTdHlsZSA9IGRpc3BsYXlQcmVmaXggPT09ICdbU1NSXScgPyAnY29sb3I6ICNkOTQ2ZWY7IGZvbnQtd2VpZ2h0OiBib2xkJyA6ICdjb2xvcjogIzNiODJmNjsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRjb25zdCBsZXZlbFN0eWxlID0gJ2NvbG9yOiAjMjJkM2VlOyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYCVjJHtkaXNwbGF5UHJlZml4fSVjIElORk8lYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0XHRjb250ZXh0UGFydHMuZm9yRWFjaChwYXJ0ID0+IGNvbnNvbGUubG9nKGAgICR7cGFydH1gKSlcblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgJWMke2Rpc3BsYXlQcmVmaXh9JWMgSU5GTyVjICR7ZGlzcGxheU1lc3NhZ2V9YCwgcHJlZml4U3R5bGUsIGxldmVsU3R5bGUsICdjb2xvcjogaW5oZXJpdCcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuZm9ybWF0TWVzc2FnZSgnaW5mbycsIG1lc3NhZ2UsIGNvbnRleHQpKVxuXHRcdH1cblx0fVxuXHRcblx0ZGVidWcobWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogTG9nQ29udGV4dCk6IHZvaWQge1xuXHRcdC8vIE9ubHkgbG9nIGRlYnVnIG1lc3NhZ2VzIGluIFNTUiBtb2RlIG9yIGJyb3dzZXIgZGV2IG1vZGVcblx0XHRjb25zdCBzaG91bGRMb2cgPSBnbG9iYWxUaGlzLl9fU1NSX01PREVfXyB8fCAoaXNCcm93c2VyICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudj8uTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcblx0XHRcblx0XHRpZiAoIXNob3VsZExvZykgcmV0dXJuXG5cdFx0XG5cdFx0aWYgKGlzQnJvd3Nlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhcnRzID0gdGhpcy5mb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheVByZWZpeCA9IHRoaXMuZ2V0RGlzcGxheVByZWZpeChjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIGNvbnRleHQpXG5cdFx0XHRjb25zdCBwcmVmaXhTdHlsZSA9IGRpc3BsYXlQcmVmaXggPT09ICdbU1NSXScgPyAnY29sb3I6ICNkOTQ2ZWY7IGZvbnQtd2VpZ2h0OiBib2xkJyA6ICdjb2xvcjogIzNiODJmNjsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRjb25zdCBsZXZlbFN0eWxlID0gJ2NvbG9yOiAjNGFkZTgwOyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYCVjJHtkaXNwbGF5UHJlZml4fSVjIERFQlVHJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdFx0Y29udGV4dFBhcnRzLmZvckVhY2gocGFydCA9PiBjb25zb2xlLmxvZyhgICAke3BhcnR9YCkpXG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYCVjJHtkaXNwbGF5UHJlZml4fSVjIERFQlVHJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5mb3JtYXRNZXNzYWdlKCdkZWJ1ZycsIG1lc3NhZ2UsIGNvbnRleHQpKVxuXHRcdH1cblx0fVxuXHRcblx0d2FybihtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogdm9pZCB7XG5cdFx0aWYgKGlzQnJvd3Nlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhcnRzID0gdGhpcy5mb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheVByZWZpeCA9IHRoaXMuZ2V0RGlzcGxheVByZWZpeChjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIGNvbnRleHQpXG5cdFx0XHRjb25zdCBwcmVmaXhTdHlsZSA9IGRpc3BsYXlQcmVmaXggPT09ICdbU1NSXScgPyAnY29sb3I6ICNkOTQ2ZWY7IGZvbnQtd2VpZ2h0OiBib2xkJyA6ICdjb2xvcjogIzNiODJmNjsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRjb25zdCBsZXZlbFN0eWxlID0gJ2NvbG9yOiAjZmJiZjI0OyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYCVjJHtkaXNwbGF5UHJlZml4fSVjIFdBUk4lYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0XHRjb250ZXh0UGFydHMuZm9yRWFjaChwYXJ0ID0+IGNvbnNvbGUud2FybihgICAke3BhcnR9YCkpXG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBXQVJOJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKHRoaXMuZm9ybWF0TWVzc2FnZSgnd2FybicsIG1lc3NhZ2UsIGNvbnRleHQpKVxuXHRcdH1cblx0fVxuXHRcblx0ZXJyb3IobWVzc2FnZTogc3RyaW5nLCBlcnJvcj86IEVycm9yIHwgdW5rbm93biwgY29udGV4dD86IExvZ0NvbnRleHQpOiB2b2lkIHtcblx0XHRjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcilcblx0XHRjb25zdCBiYXNlTWVzc2FnZSA9IGVycm9yID8gYCR7bWVzc2FnZX06ICR7ZXJyb3JNZXNzYWdlfWAgOiBtZXNzYWdlXG5cdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKGJhc2VNZXNzYWdlLCBjb250ZXh0KVxuXHRcdFxuXHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXJ0cyA9IHRoaXMuZm9ybWF0Q29udGV4dEZvckJyb3dzZXIoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlQcmVmaXggPSB0aGlzLmdldERpc3BsYXlQcmVmaXgoY29udGV4dClcblx0XHRcdGNvbnN0IHByZWZpeFN0eWxlID0gZGlzcGxheVByZWZpeCA9PT0gJ1tTU1JdJyA/ICdjb2xvcjogI2Q5NDZlZjsgZm9udC13ZWlnaHQ6IGJvbGQnIDogJ2NvbG9yOiAjM2I4MmY2OyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdGNvbnN0IGxldmVsU3R5bGUgPSAnY29sb3I6ICNlZjQ0NDQ7IGZvbnQtd2VpZ2h0OiBib2xkJ1xuXHRcdFx0XG5cdFx0XHRpZiAoY29udGV4dFBhcnRzLmxlbmd0aCA+IDAgfHwgZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cChgJWMke2Rpc3BsYXlQcmVmaXh9JWMgRVJST1IlYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0XHRpZiAoY29udGV4dFBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb250ZXh0UGFydHMuZm9yRWFjaChwYXJ0ID0+IGNvbnNvbGUuZXJyb3IoYCAgJHtwYXJ0fWApKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLnN0YWNrKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignU3RhY2sgdHJhY2U6JywgZXJyb3Iuc3RhY2spXG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBFUlJPUiVjICR7ZGlzcGxheU1lc3NhZ2V9YCwgcHJlZml4U3R5bGUsIGxldmVsU3R5bGUsICdjb2xvcjogaW5oZXJpdCcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5mb3JtYXRNZXNzYWdlKCdlcnJvcicsIGJhc2VNZXNzYWdlLCBjb250ZXh0KSlcblx0XHRcdGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLnN0YWNrKSB7XG5cdFx0XHRcdGNvbnN0IHN0YWNrVHJhY2UgPSBjb2xvcml6ZShlcnJvci5zdGFjaywgY29sb3JzLmRpbSArIGNvbG9ycy5yZWQpXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3Ioc3RhY2tUcmFjZSlcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLy8gRGVmYXVsdCBsb2dnZXIgaW5zdGFuY2UgZm9yIGFwcGxpY2F0aW9uIGNvZGUgKHdpbGwgYmUgc2V0IHRvIFtBUFBdIGJ5IGFwcCBpbml0aWFsaXphdGlvbilcbmV4cG9ydCBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKClcblxuLy8gRXhwb3J0IExvZ2dlciBjbGFzcyBmb3IgY3JlYXRpbmcgY3VzdG9tIGluc3RhbmNlc1xuZXhwb3J0IHtMb2dnZXJ9XG4iLAogICAgIi8qKlxuICogU1NSLXNwZWNpZmljIGxvZ2dlciBpbnN0YW5jZS5cbiAqIFNTUiBpbmZyYXN0cnVjdHVyZSBjb2RlIHNob3VsZCBpbXBvcnQge2xvZ2dlcn0gZnJvbSB0aGlzIGZpbGVcbiAqIHRvIGdldCBhIGxvZ2dlciBpbnN0YW5jZSB3aXRoIFtTU1JdIHByZWZpeC5cbiAqL1xuXG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi9sb2dnZXInXG5cbi8vIENyZWF0ZSBTU1IgbG9nZ2VyIGluc3RhbmNlIHdpdGggW1NTUl0gcHJlZml4XG5jb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKClcbmxvZ2dlci5zZXRQcmVmaXgoJ1tTU1JdJylcblxuZXhwb3J0IHtsb2dnZXJ9XG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuLi9yZW5kZXIvdm5vZGUnXG5pbXBvcnQgaHlwZXJzY3JpcHQgZnJvbSAnLi4vcmVuZGVyL2h5cGVyc2NyaXB0J1xuaW1wb3J0IGRlY29kZVVSSUNvbXBvbmVudFNhZmUgZnJvbSAnLi4vdXRpbC9kZWNvZGVVUklDb21wb25lbnRTYWZlJ1xuaW1wb3J0IGJ1aWxkUGF0aG5hbWUgZnJvbSAnLi4vcGF0aG5hbWUvYnVpbGQnXG5pbXBvcnQgcGFyc2VQYXRobmFtZSBmcm9tICcuLi9wYXRobmFtZS9wYXJzZSdcbmltcG9ydCBjb21waWxlVGVtcGxhdGUgZnJvbSAnLi4vcGF0aG5hbWUvY29tcGlsZVRlbXBsYXRlJ1xuaW1wb3J0IGNlbnNvciBmcm9tICcuLi91dGlsL2NlbnNvcidcbmltcG9ydCB7Z2V0UGF0aG5hbWUsIGdldFNlYXJjaCwgZ2V0SGFzaH0gZnJvbSAnLi4vdXRpbC91cmknXG5pbXBvcnQge2xvZ2dlcn0gZnJvbSAnLi4vc2VydmVyL3NzckxvZ2dlcidcblxuaW1wb3J0IHR5cGUge0NvbXBvbmVudFR5cGUsIFZub2RlIGFzIFZub2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyL3Zub2RlJ1xuXG4vLyBSZWRpcmVjdE9iamVjdCB3aWxsIGJlIGRlZmluZWQgYWZ0ZXIgUkVESVJFQ1Qgc3ltYm9sIGlzIGNyZWF0ZWRcbi8vIFVzaW5nIGEgdHlwZSB0aGF0IHJlZmVyZW5jZXMgdGhlIHN5bWJvbCBpbmRpcmVjdGx5XG5leHBvcnQgdHlwZSBSZWRpcmVjdE9iamVjdCA9IHtba2V5OiBzeW1ib2xdOiBzdHJpbmd9XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVSZXNvbHZlcjxBdHRycyA9IFJlY29yZDxzdHJpbmcsIGFueT4sIFN0YXRlID0gYW55PiB7XG5cdG9ubWF0Y2g/OiAoXG5cdFx0YXJnczogQXR0cnMsXG5cdFx0cmVxdWVzdGVkUGF0aDogc3RyaW5nLFxuXHRcdHJvdXRlOiBzdHJpbmcsXG5cdCkgPT4gQ29tcG9uZW50VHlwZTxBdHRycywgU3RhdGU+IHwgUHJvbWlzZTxDb21wb25lbnRUeXBlPEF0dHJzLCBTdGF0ZT4+IHwgUmVkaXJlY3RPYmplY3QgfCBQcm9taXNlPFJlZGlyZWN0T2JqZWN0PiB8IHZvaWRcblx0cmVuZGVyPzogKHZub2RlOiBWbm9kZVR5cGU8QXR0cnMsIFN0YXRlPikgPT4gVm5vZGVUeXBlXG59XG5cbmV4cG9ydCB0eXBlIFNTUlN0YXRlID0gUmVjb3JkPHN0cmluZywgYW55PlxuZXhwb3J0IHR5cGUgU1NSUmVzdWx0ID0gc3RyaW5nIHwge2h0bWw6IHN0cmluZzsgc3RhdGU6IFNTUlN0YXRlfVxuXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlIHtcblx0KHBhdGg6IHN0cmluZywgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgYW55Piwgc2hvdWxkUmVwbGFjZUhpc3Rvcnk/OiBib29sZWFuKTogdm9pZFxuXHQocGF0aDogc3RyaW5nLCBjb21wb25lbnQ6IENvbXBvbmVudFR5cGUsIHNob3VsZFJlcGxhY2VIaXN0b3J5PzogYm9vbGVhbik6IHZvaWRcblx0c2V0OiAocGF0aDogc3RyaW5nLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBkYXRhPzogYW55KSA9PiB2b2lkXG5cdGdldDogKCkgPT4gc3RyaW5nXG5cdHByZWZpeDogc3RyaW5nXG5cdGxpbms6ICh2bm9kZTogVm5vZGVUeXBlKSA9PiBzdHJpbmdcblx0cGFyYW06IChrZXk/OiBzdHJpbmcpID0+IGFueVxuXHRwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT5cblx0TGluazogQ29tcG9uZW50VHlwZVxuXHRTS0lQOiB7fVxuXHRSRURJUkVDVDogc3ltYm9sXG5cdHJlZGlyZWN0OiAocGF0aDogc3RyaW5nKSA9PiBSZWRpcmVjdE9iamVjdFxuXHRyZXNvbHZlOiAoXG5cdFx0cGF0aG5hbWU6IHN0cmluZyxcblx0XHRyb3V0ZXM6IFJlY29yZDxzdHJpbmcsIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyIHwge2NvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXJ9Pixcblx0XHRyZW5kZXJUb1N0cmluZzogKHZub2RlczogYW55KSA9PiBQcm9taXNlPFNTUlJlc3VsdD4sXG5cdFx0cHJlZml4Pzogc3RyaW5nLFxuXHQpID0+IFByb21pc2U8U1NSUmVzdWx0PlxufVxuXG5pbnRlcmZhY2UgTW91bnRSZWRyYXcge1xuXHRtb3VudDogKHJvb3Q6IEVsZW1lbnQsIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IG51bGwpID0+IHZvaWRcblx0cmVkcmF3OiAoKSA9PiB2b2lkXG59XG5cbmludGVyZmFjZSBSb3V0ZU9wdGlvbnMge1xuXHRyZXBsYWNlPzogYm9vbGVhblxuXHRzdGF0ZT86IGFueVxuXHR0aXRsZT86IHN0cmluZyB8IG51bGxcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGVyKCR3aW5kb3c6IGFueSwgbW91bnRSZWRyYXc6IE1vdW50UmVkcmF3KSB7XG5cdGxldCBwID0gUHJvbWlzZS5yZXNvbHZlKClcblxuXHRsZXQgc2NoZWR1bGVkID0gZmFsc2VcblxuXHRsZXQgcmVhZHkgPSBmYWxzZVxuXHRsZXQgaGFzQmVlblJlc29sdmVkID0gZmFsc2VcblxuXHRsZXQgZG9tOiBFbGVtZW50IHwgdW5kZWZpbmVkXG5cdGxldCBjb21waWxlZDogQXJyYXk8e3JvdXRlOiBzdHJpbmc7IGNvbXBvbmVudDogYW55OyBjaGVjazogKGRhdGE6IHtwYXRoOiBzdHJpbmc7IHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pn0pID0+IGJvb2xlYW59PiB8IHVuZGVmaW5lZFxuXHRsZXQgZmFsbGJhY2tSb3V0ZTogc3RyaW5nIHwgdW5kZWZpbmVkXG5cblx0bGV0IGN1cnJlbnRSZXNvbHZlcjogUm91dGVSZXNvbHZlciB8IG51bGwgPSBudWxsXG5cdGxldCBjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBzdHJpbmcgPSAnZGl2J1xuXHRsZXQgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXHRsZXQgY3VycmVudFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZFxuXHRsZXQgbGFzdFVwZGF0ZTogKChjb21wOiBhbnkpID0+IHZvaWQpIHwgbnVsbCA9IG51bGxcblxuXHRjb25zdCBSb3V0ZXJSb290OiBDb21wb25lbnRUeXBlID0ge1xuXHRcdG9ucmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJlYWR5ID0gaGFzQmVlblJlc29sdmVkID0gZmFsc2Vcblx0XHRcdCR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmaXJlQXN5bmMsIGZhbHNlKVxuXHRcdH0sXG5cdFx0dmlldzogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUaGUgcm91dGUgaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZC5cblx0XHRcdC8vIFRoZXJlZm9yZSwgdGhlIGZvbGxvd2luZyBlYXJseSByZXR1cm4gaXMgbm90IG5lZWRlZC5cblx0XHRcdC8vIGlmICghaGFzQmVlblJlc29sdmVkKSByZXR1cm5cblxuXHRcdFx0Ly8gUGFzcyBjdXJyZW50UGF0aCBpbiBhdHRycyBzbyBSb3V0ZVJlc29sdmVyLnJlbmRlciBjYW4gdXNlIGl0IGZvciByb3V0ZVBhdGguXG5cdFx0XHQvLyBVc2UgYXR0cnMua2V5IChub3QgY3VycmVudFBhdGgpIHNvIHRoYXQgcm91dGUgcGFyYW0gY2hhbmdlcyB3aXRoaW4gdGhlIHNhbWVcblx0XHRcdC8vIHJvdXRlIHBhdHRlcm4gdXBkYXRlIHRoZSBjb21wb25lbnQgaW5zdGVhZCBvZiBjYXVzaW5nIGEgZnVsbCByZW1vdW50LlxuXHRcdFx0Y29uc3Qgcm91dGVBdHRycyA9IHsuLi5hdHRycywgcm91dGVQYXRoOiBjdXJyZW50UGF0aCB8fCBhdHRycy5yb3V0ZVBhdGh9XG5cdFx0XHRjb25zdCB2bm9kZSA9IFZub2RlKGNvbXBvbmVudCwgYXR0cnMua2V5LCByb3V0ZUF0dHJzLCBudWxsLCBudWxsLCBudWxsKVxuXHRcdFx0aWYgKGN1cnJlbnRSZXNvbHZlcikgcmV0dXJuIGN1cnJlbnRSZXNvbHZlci5yZW5kZXIhKHZub2RlIGFzIGFueSlcblx0XHRcdC8vIFdyYXAgaW4gYSBmcmFnbWVudCB0byBwcmVzZXJ2ZSBleGlzdGluZyBrZXkgc2VtYW50aWNzXG5cdFx0XHRyZXR1cm4gW3Zub2RlXVxuXHRcdH0sXG5cdH1cblxuXHRjb25zdCBTS0lQID0gcm91dGUuU0tJUCA9IHt9XG5cdFxuXHQvLyBSZWRpcmVjdCBzeW1ib2wgZm9yIGlzb21vcnBoaWMgcmVkaXJlY3QgaGFuZGxpbmdcblx0Y29uc3QgUkVESVJFQ1QgPSByb3V0ZS5SRURJUkVDVCA9IFN5bWJvbCgnUkVESVJFQ1QnKVxuXHRcblx0Ly8gSGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSByZWRpcmVjdCBvYmplY3RzXG5cdHJvdXRlLnJlZGlyZWN0ID0gZnVuY3Rpb24ocGF0aDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHtbUkVESVJFQ1RdOiBwYXRofSBhcyBSZWRpcmVjdE9iamVjdFxuXHR9XG5cdFxuXHQvLyBUeXBlIGd1YXJkIHRvIGNoZWNrIGlmIHZhbHVlIGlzIGEgcmVkaXJlY3Qgb2JqZWN0XG5cdC8vIE5vdGU6IFdlIGNoZWNrIGZvciBhbnkgU3ltYm9sIGtleSB0aGF0IG1pZ2h0IGJlIGEgcmVkaXJlY3QsIG5vdCBqdXN0IG91ciBzcGVjaWZpYyBSRURJUkVDVCBzeW1ib2xcblx0Ly8gVGhpcyBhbGxvd3MgcmVkaXJlY3Qgb2JqZWN0cyBjcmVhdGVkIGJ5IGRpZmZlcmVudCByb3V0ZXIgaW5zdGFuY2VzIHRvIGJlIGRldGVjdGVkXG5cdGZ1bmN0aW9uIGlzUmVkaXJlY3QodmFsdWU6IGFueSk6IHZhbHVlIGlzIFJlZGlyZWN0T2JqZWN0IHtcblx0XHRpZiAodmFsdWUgPT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2Vcblx0XHQvLyBDaGVjayBpZiB0aGlzIG9iamVjdCBoYXMgb3VyIFJFRElSRUNUIHN5bWJvbFxuXHRcdGlmIChSRURJUkVDVCBpbiB2YWx1ZSkgcmV0dXJuIHRydWVcblx0XHQvLyBBbHNvIGNoZWNrIGZvciBhbnkgU3ltYm9sIGtleXMgdGhhdCBtaWdodCBiZSByZWRpcmVjdCBvYmplY3RzIGZyb20gb3RoZXIgcm91dGVyIGluc3RhbmNlc1xuXHRcdC8vIFRoaXMgaGFuZGxlcyB0aGUgY2FzZSB3aGVyZSByZWRpcmVjdCBvYmplY3RzIGFyZSBjcmVhdGVkIGJ5IGNsaWVudC1zaWRlIG0ucm91dGUucmVkaXJlY3Rcblx0XHQvLyBidXQgY2hlY2tlZCBieSBzZXJ2ZXItc2lkZSByb3V0ZXIgKG9yIHZpY2UgdmVyc2EpXG5cdFx0Y29uc3Qgc3ltYm9sS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHModmFsdWUpXG5cdFx0aWYgKHN5bWJvbEtleXMubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly8gQ2hlY2sgaWYgYW55IHN5bWJvbCBrZXkncyBkZXNjcmlwdGlvbiBzdWdnZXN0cyBpdCdzIGEgcmVkaXJlY3Rcblx0XHRcdC8vIE9yIGNoZWNrIGlmIHRoZSBvYmplY3QgaGFzIGEgc3RyaW5nIHByb3BlcnR5IHRoYXQgbG9va3MgbGlrZSBhIHBhdGhcblx0XHRcdGZvciAoY29uc3Qgc3ltIG9mIHN5bWJvbEtleXMpIHtcblx0XHRcdFx0Y29uc3QgZGVzYyA9IHN5bS5kZXNjcmlwdGlvbiB8fCAnJ1xuXHRcdFx0XHRpZiAoZGVzYy5pbmNsdWRlcygnUkVESVJFQ1QnKSB8fCBkZXNjID09PSAnUkVESVJFQ1QnKSB7XG5cdFx0XHRcdFx0Y29uc3QgcGF0aCA9IHZhbHVlW3N5bV1cblx0XHRcdFx0XHRpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnICYmIHBhdGguc3RhcnRzV2l0aCgnLycpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXHRcblx0Ly8gSGVscGVyIHRvIGV4dHJhY3QgcmVkaXJlY3QgcGF0aCBmcm9tIHJlZGlyZWN0IG9iamVjdCAoaGFuZGxlcyBkaWZmZXJlbnQgUkVESVJFQ1Qgc3ltYm9scylcblx0ZnVuY3Rpb24gZ2V0UmVkaXJlY3RQYXRoKHJlZGlyZWN0T2JqOiBSZWRpcmVjdE9iamVjdCk6IHN0cmluZyB7XG5cdFx0Ly8gRmlyc3QgdHJ5IG91ciBSRURJUkVDVCBzeW1ib2xcblx0XHRpZiAoUkVESVJFQ1QgaW4gcmVkaXJlY3RPYmopIHtcblx0XHRcdHJldHVybiByZWRpcmVjdE9ialtSRURJUkVDVF1cblx0XHR9XG5cdFx0Ly8gT3RoZXJ3aXNlLCBjaGVjayBhbGwgc3ltYm9sIGtleXNcblx0XHRjb25zdCBzeW1ib2xLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhyZWRpcmVjdE9iailcblx0XHRmb3IgKGNvbnN0IHN5bSBvZiBzeW1ib2xLZXlzKSB7XG5cdFx0XHRjb25zdCBwYXRoID0gcmVkaXJlY3RPYmpbc3ltXVxuXHRcdFx0aWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJyAmJiBwYXRoLnN0YXJ0c1dpdGgoJy8nKSkge1xuXHRcdFx0XHRyZXR1cm4gcGF0aFxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVkaXJlY3Qgb2JqZWN0OiBubyByZWRpcmVjdCBwYXRoIGZvdW5kJylcblx0fVxuXG5cdGZ1bmN0aW9uIHJlc29sdmVSb3V0ZSgpIHtcblx0XHRzY2hlZHVsZWQgPSBmYWxzZVxuXHRcdC8vIENvbnNpZGVyIHRoZSBwYXRobmFtZSBob2xpc3RpY2FsbHkuIFRoZSBwcmVmaXggbWlnaHQgZXZlbiBiZSBpbnZhbGlkLFxuXHRcdC8vIGJ1dCB0aGF0J3Mgbm90IG91ciBwcm9ibGVtLlxuXHRcdC8vIFVzZSBpc29tb3JwaGljIFVSSSBBUEkgdW5jb25kaXRpb25hbGx5IC0gaXQgaGFuZGxlcyBlbnZpcm9ubWVudCBkZXRlY3Rpb24gaW50ZXJuYWxseVxuXHRcdGNvbnN0IGhhc2ggPSBnZXRIYXNoKClcblx0XHRsZXQgcHJlZml4ID0gaGFzaFxuXHRcdGlmIChyb3V0ZS5wcmVmaXhbMF0gIT09ICcjJykge1xuXHRcdFx0Y29uc3Qgc2VhcmNoID0gZ2V0U2VhcmNoKClcblx0XHRcdHByZWZpeCA9IHNlYXJjaCArIHByZWZpeFxuXHRcdFx0aWYgKHJvdXRlLnByZWZpeFswXSAhPT0gJz8nKSB7XG5cdFx0XHRcdGNvbnN0IHBhdGhuYW1lID0gZ2V0UGF0aG5hbWUoKVxuXHRcdFx0XHRwcmVmaXggPSBwYXRobmFtZSArIHByZWZpeFxuXHRcdFx0XHRpZiAocHJlZml4WzBdICE9PSAnLycpIHByZWZpeCA9ICcvJyArIHByZWZpeFxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBwYXRoID0gZGVjb2RlVVJJQ29tcG9uZW50U2FmZShwcmVmaXgpLnNsaWNlKHJvdXRlLnByZWZpeC5sZW5ndGgpXG5cdFx0Y29uc3QgZGF0YSA9IHBhcnNlUGF0aG5hbWUocGF0aClcblxuXHRcdE9iamVjdC5hc3NpZ24oZGF0YS5wYXJhbXMsICR3aW5kb3cuaGlzdG9yeS5zdGF0ZSB8fCB7fSlcblxuXHRcdGZ1bmN0aW9uIHJlamVjdChlOiBhbnkpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSlcblx0XHRcdHJvdXRlLnNldChmYWxsYmFja1JvdXRlISwgbnVsbCwge3JlcGxhY2U6IHRydWV9KVxuXHRcdH1cblxuXHRcdGxvb3AoMClcblx0XHRmdW5jdGlvbiBsb29wKGk6IG51bWJlcikge1xuXHRcdFx0aWYgKCFjb21waWxlZCkgcmV0dXJuXG5cdFx0XHRmb3IgKDsgaSA8IGNvbXBpbGVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChjb21waWxlZFtpXS5jaGVjayhkYXRhKSkge1xuXHRcdFx0XHRcdGxldCBwYXlsb2FkID0gY29tcGlsZWRbaV0uY29tcG9uZW50XG5cdFx0XHRcdFx0Y29uc3QgbWF0Y2hlZFJvdXRlID0gY29tcGlsZWRbaV0ucm91dGVcblx0XHRcdFx0XHRjb25zdCBsb2NhbENvbXAgPSBwYXlsb2FkXG5cdFx0XHRcdFx0Ly8gU3RvcmUgdGhlIFJvdXRlUmVzb2x2ZXIgaWYgcGF5bG9hZCBoYXMgYm90aCBvbm1hdGNoIGFuZCByZW5kZXJcblx0XHRcdFx0XHQvLyBUaGlzIGFsbG93cyB1cyB0byBwcmVzZXJ2ZSB0aGUgcmVzb2x2ZXIgZXZlbiBhZnRlciBvbm1hdGNoIHJldHVybnMgYSBjb21wb25lbnRcblx0XHRcdFx0XHRjb25zdCByZXNvbHZlcldpdGhSZW5kZXIgPSBwYXlsb2FkICYmIHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JyAmJiBwYXlsb2FkLm9ubWF0Y2ggJiYgcGF5bG9hZC5yZW5kZXIgJiYgIXBheWxvYWQudmlldyAmJiB0eXBlb2YgcGF5bG9hZCAhPT0gJ2Z1bmN0aW9uJyA/IHBheWxvYWQgOiBudWxsXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29uc3QgdXBkYXRlID0gbGFzdFVwZGF0ZSA9IGZ1bmN0aW9uKGNvbXA6IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKHVwZGF0ZSAhPT0gbGFzdFVwZGF0ZSkgcmV0dXJuXG5cdFx0XHRcdFx0XHRpZiAoY29tcCA9PT0gU0tJUCkgcmV0dXJuIGxvb3AoaSArIDEpXG5cdFx0XHRcdFx0XHQvLyBIYW5kbGUgcmVkaXJlY3Qgb2JqZWN0czogZXhwbGljaXQgcmVkaXJlY3Qgc2lnbmFsXG5cdFx0XHRcdFx0XHRpZiAoaXNSZWRpcmVjdChjb21wKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBFeHRyYWN0IHJlZGlyZWN0IHRhcmdldCBwYXRoXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHJlZGlyZWN0UGF0aCA9IGNvbXBbUkVESVJFQ1RdXG5cdFx0XHRcdFx0XHRcdC8vIFRyaWdnZXIgbmF2aWdhdGlvbiB0byByZWRpcmVjdCB0YXJnZXRcblx0XHRcdFx0XHRcdFx0cm91dGUuc2V0KHJlZGlyZWN0UGF0aCwgbnVsbClcblx0XHRcdFx0XHRcdFx0Ly8gU2tpcCByZW5kZXJpbmcgY3VycmVudCByb3V0ZSAtIG5ldyByb3V0ZSByZXNvbHV0aW9uIHdpbGwgaGFuZGxlIHJlZGlyZWN0IHRhcmdldFxuXHRcdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIElmIHdlIGhhdmUgYSBwcmVzZXJ2ZWQgcmVzb2x2ZXIgd2l0aCByZW5kZXIsIHVzZSBpdFxuXHRcdFx0XHRcdFx0aWYgKHJlc29sdmVyV2l0aFJlbmRlcikge1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50UmVzb2x2ZXIgPSByZXNvbHZlcldpdGhSZW5kZXJcblx0XHRcdFx0XHRcdFx0Y29tcG9uZW50ID0gY29tcCAhPSBudWxsICYmICh0eXBlb2YgY29tcC52aWV3ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBjb21wID09PSAnZnVuY3Rpb24nKSA/IGNvbXAgOiAnZGl2J1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gSWYgY29tcCBpcyBhIFJvdXRlUmVzb2x2ZXIgd2l0aCByZW5kZXIsIHNldCBjdXJyZW50UmVzb2x2ZXIgaW5zdGVhZCBvZiBjb21wb25lbnRcblx0XHRcdFx0XHRcdGVsc2UgaWYgKGNvbXAgJiYgdHlwZW9mIGNvbXAgPT09ICdvYmplY3QnICYmIGNvbXAucmVuZGVyICYmICFjb21wLnZpZXcgJiYgdHlwZW9mIGNvbXAgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFJlc29sdmVyID0gY29tcFxuXHRcdFx0XHRcdFx0XHRjb21wb25lbnQgPSAnZGl2JyAvLyBQbGFjZWhvbGRlciwgd29uJ3QgYmUgdXNlZCBzaW5jZSBjdXJyZW50UmVzb2x2ZXIucmVuZGVyIHdpbGwgYmUgY2FsbGVkXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50UmVzb2x2ZXIgPSBudWxsXG5cdFx0XHRcdFx0XHRcdGNvbXBvbmVudCA9IGNvbXAgIT0gbnVsbCAmJiAodHlwZW9mIGNvbXAudmlldyA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgY29tcCA9PT0gJ2Z1bmN0aW9uJykgPyBjb21wIDogJ2Rpdidcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGF0dHJzID0gZGF0YS5wYXJhbXNcblx0XHRcdFx0XHRcdGN1cnJlbnRQYXRoID0gcGF0aFxuXHRcdFx0XHRcdFx0bGFzdFVwZGF0ZSA9IG51bGxcblx0XHRcdFx0XHRcdGlmIChoYXNCZWVuUmVzb2x2ZWQpIG1vdW50UmVkcmF3LnJlZHJhdygpXG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0aGFzQmVlblJlc29sdmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0XHRtb3VudFJlZHJhdy5tb3VudChkb20hLCBSb3V0ZXJSb290KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBUaGVyZSdzIG5vIHVuZGVyc3RhdGluZyBob3cgbXVjaCBJICp3aXNoKiBJIGNvdWxkXG5cdFx0XHRcdFx0Ly8gdXNlIGBhc3luY2AvYGF3YWl0YCBoZXJlLi4uXG5cdFx0XHRcdFx0aWYgKHBheWxvYWQudmlldyB8fCB0eXBlb2YgcGF5bG9hZCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0cGF5bG9hZCA9IHt9XG5cdFx0XHRcdFx0XHR1cGRhdGUobG9jYWxDb21wKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChwYXlsb2FkLm9ubWF0Y2gpIHtcblx0XHRcdFx0XHRcdHAudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBheWxvYWQub25tYXRjaCEoZGF0YS5wYXJhbXMsIHBhdGgsIG1hdGNoZWRSb3V0ZSlcblx0XHRcdFx0XHRcdH0pLnRoZW4odXBkYXRlLCBwYXRoID09PSBmYWxsYmFja1JvdXRlID8gbnVsbCA6IHJlamVjdClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAocGF5bG9hZC5yZW5kZXIpIHtcblx0XHRcdFx0XHRcdC8vIFJvdXRlUmVzb2x2ZXIgd2l0aCByZW5kZXIgbWV0aG9kIC0gdXBkYXRlIHdpdGggcmVzb2x2ZXIgaXRzZWxmXG5cdFx0XHRcdFx0XHR1cGRhdGUocGF5bG9hZClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB1cGRhdGUoJ2RpdicpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhdGggPT09IGZhbGxiYWNrUm91dGUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcmVzb2x2ZSBkZWZhdWx0IHJvdXRlICcgKyBmYWxsYmFja1JvdXRlICsgJy4nKVxuXHRcdFx0fVxuXHRcdFx0cm91dGUuc2V0KGZhbGxiYWNrUm91dGUhLCBudWxsLCB7cmVwbGFjZTogdHJ1ZX0pXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZmlyZUFzeW5jKCkge1xuXHRcdGlmICghc2NoZWR1bGVkKSB7XG5cdFx0XHRzY2hlZHVsZWQgPSB0cnVlXG5cdFx0XHQvLyBUT0RPOiBqdXN0IGRvIGBtb3VudFJlZHJhdy5yZWRyYXcoKWAgaGVyZSBhbmQgZWxpZGUgdGhlIHRpbWVyXG5cdFx0XHQvLyBkZXBlbmRlbmN5LiBOb3RlIHRoYXQgdGhpcyB3aWxsIG11Y2sgd2l0aCB0ZXN0cyBhICpsb3QqLCBzbyBpdCdzXG5cdFx0XHQvLyBub3QgYXMgZWFzeSBvZiBhIGNoYW5nZSBhcyBpdCBzb3VuZHMuXG5cdFx0XHRzZXRUaW1lb3V0KHJlc29sdmVSb3V0ZSlcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByb3V0ZShyb290OiBFbGVtZW50LCBkZWZhdWx0Um91dGU6IHN0cmluZywgcm91dGVzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlcj4pIHtcblx0XHRpZiAoIXJvb3QpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0RPTSBlbGVtZW50IGJlaW5nIHJlbmRlcmVkIHRvIGRvZXMgbm90IGV4aXN0LicpXG5cblx0XHRjb21waWxlZCA9IE9iamVjdC5rZXlzKHJvdXRlcykubWFwKGZ1bmN0aW9uKHJvdXRlUGF0aCkge1xuXHRcdFx0aWYgKHJvdXRlUGF0aFswXSAhPT0gJy8nKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1JvdXRlcyBtdXN0IHN0YXJ0IHdpdGggYSBcXCcvXFwnLicpXG5cdFx0XHRpZiAoKC86KFteXFwvXFwuLV0rKShcXC57M30pPzovKS50ZXN0KHJvdXRlUGF0aCkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKCdSb3V0ZSBwYXJhbWV0ZXIgbmFtZXMgbXVzdCBiZSBzZXBhcmF0ZWQgd2l0aCBlaXRoZXIgXFwnL1xcJywgXFwnLlxcJywgb3IgXFwnLVxcJy4nKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cm91dGU6IHJvdXRlUGF0aCxcblx0XHRcdFx0Y29tcG9uZW50OiByb3V0ZXNbcm91dGVQYXRoXSxcblx0XHRcdFx0Y2hlY2s6IGNvbXBpbGVUZW1wbGF0ZShyb3V0ZVBhdGgpLFxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0ZmFsbGJhY2tSb3V0ZSA9IGRlZmF1bHRSb3V0ZVxuXHRcdGlmIChkZWZhdWx0Um91dGUgIT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgZGVmYXVsdERhdGEgPSBwYXJzZVBhdGhuYW1lKGRlZmF1bHRSb3V0ZSlcblxuXHRcdFx0aWYgKCFjb21waWxlZC5zb21lKGZ1bmN0aW9uKGkpIHsgcmV0dXJuIGkuY2hlY2soZGVmYXVsdERhdGEpIH0pKSB7XG5cdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignRGVmYXVsdCByb3V0ZSBkb2VzblxcJ3QgbWF0Y2ggYW55IGtub3duIHJvdXRlcy4nKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRkb20gPSByb290XG5cblx0XHQkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZmlyZUFzeW5jLCBmYWxzZSlcblxuXHRcdHJlYWR5ID0gdHJ1ZVxuXG5cdFx0Ly8gVGhlIFJvdXRlclJvb3QgY29tcG9uZW50IGlzIG1vdW50ZWQgd2hlbiB0aGUgcm91dGUgaXMgZmlyc3QgcmVzb2x2ZWQuXG5cdFx0cmVzb2x2ZVJvdXRlKClcblx0fVxuXHRyb3V0ZS5zZXQgPSBmdW5jdGlvbihwYXRoOiBzdHJpbmcsIGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCBvcHRpb25zPzogUm91dGVPcHRpb25zKSB7XG5cdFx0aWYgKGxhc3RVcGRhdGUgIT0gbnVsbCkge1xuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblx0XHRcdG9wdGlvbnMucmVwbGFjZSA9IHRydWVcblx0XHR9XG5cdFx0bGFzdFVwZGF0ZSA9IG51bGxcblxuXHRcdHBhdGggPSBidWlsZFBhdGhuYW1lKHBhdGgsIGRhdGEgfHwge30pXG5cdFx0aWYgKHJlYWR5KSB7XG5cdFx0XHQvLyBSb3V0ZXIgaXMgaW5pdGlhbGl6ZWQgLSB1c2UgaGlzdG9yeSBBUEkgZm9yIG5hdmlnYXRpb25cblx0XHRcdGZpcmVBc3luYygpXG5cdFx0XHRjb25zdCBzdGF0ZSA9IG9wdGlvbnMgPyBvcHRpb25zLnN0YXRlIDogbnVsbFxuXHRcdFx0Y29uc3QgdGl0bGUgPSBvcHRpb25zID8gb3B0aW9ucy50aXRsZSA6IG51bGxcblx0XHRcdGlmICgkd2luZG93Py5oaXN0b3J5KSB7XG5cdFx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVwbGFjZSkgJHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIHJvdXRlLnByZWZpeCArIHBhdGgpXG5cdFx0XHRcdGVsc2UgJHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHJvdXRlLnByZWZpeCArIHBhdGgpXG5cdFx0XHR9XG5cdFx0XHQvLyBJbiBTU1IgY29udGV4dCAobm8gJHdpbmRvdyksIG5hdmlnYXRpb24gaXMgYSBuby1vcCBzaW5jZSB3ZSdyZSBqdXN0IHJlbmRlcmluZyBIVE1MXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gUm91dGVyIG5vdCB5ZXQgaW5pdGlhbGl6ZWQgLSB1c2UgbG9jYXRpb24uaHJlZiBmb3IgaW5pdGlhbCBuYXZpZ2F0aW9uXG5cdFx0XHRpZiAoJHdpbmRvdz8ubG9jYXRpb24pIHtcblx0XHRcdFx0JHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcm91dGUucHJlZml4ICsgcGF0aFxuXHRcdFx0fVxuXHRcdFx0Ly8gSW4gU1NSIGNvbnRleHQgKG5vICR3aW5kb3cpLCB0aGlzIGlzIGEgbm8tb3Agc2luY2Ugd2UncmUganVzdCByZW5kZXJpbmcgSFRNTFxuXHRcdH1cblx0fVxuXHRyb3V0ZS5nZXQgPSBmdW5jdGlvbigpOiBzdHJpbmcge1xuXHRcdC8vIElmIGN1cnJlbnRQYXRoIGlzIG5vdCBzZXQgKGUuZy4sIGR1cmluZyBTU1IgYmVmb3JlIHJvdXRlLnJlc29sdmUgaXMgY2FsbGVkKSxcblx0XHQvLyBmYWxsIGJhY2sgdG8gZXh0cmFjdGluZyBwYXRobmFtZSBmcm9tIF9fU1NSX1VSTF9fIHVzaW5nIHRoZSBpc29tb3JwaGljIFVSSSBBUElcblx0XHRpZiAoY3VycmVudFBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIGdldFBhdGhuYW1lKClcblx0XHR9XG5cdFx0cmV0dXJuIGN1cnJlbnRQYXRoID8/ICcnXG5cdH1cblx0cm91dGUucHJlZml4ID0gJyMhJ1xuXHRyb3V0ZS5saW5rID0gZnVuY3Rpb24odm5vZGU6IFZub2RlVHlwZSkge1xuXHRcdHJldHVybiByb3V0ZS5MaW5rLnZpZXcodm5vZGUpXG5cdH1cblx0cm91dGUuTGluayA9IHtcblx0XHR2aWV3OiBmdW5jdGlvbih2bm9kZTogVm5vZGVUeXBlKSB7XG5cdFx0XHQvLyBPbWl0IHRoZSB1c2VkIHBhcmFtZXRlcnMgZnJvbSB0aGUgcmVuZGVyZWQgZWxlbWVudCAtIHRoZXkgYXJlXG5cdFx0XHQvLyBpbnRlcm5hbC4gQWxzbywgY2Vuc29yIHRoZSB2YXJpb3VzIGxpZmVjeWNsZSBtZXRob2RzLlxuXHRcdFx0Ly9cblx0XHRcdC8vIFdlIGRvbid0IHN0cmlwIHRoZSBvdGhlciBwYXJhbWV0ZXJzIGJlY2F1c2UgZm9yIGNvbnZlbmllbmNlIHdlXG5cdFx0XHQvLyBsZXQgdGhlbSBiZSBzcGVjaWZpZWQgaW4gdGhlIHNlbGVjdG9yIGFzIHdlbGwuXG5cdFx0XHRjb25zdCBjaGlsZCA9IGh5cGVyc2NyaXB0KFxuXHRcdFx0XHR2bm9kZS5hdHRycz8uc2VsZWN0b3IgfHwgJ2EnLFxuXHRcdFx0XHRjZW5zb3Iodm5vZGUuYXR0cnMgfHwge30sIFsnb3B0aW9ucycsICdwYXJhbXMnLCAnc2VsZWN0b3InLCAnb25jbGljayddKSxcblx0XHRcdFx0dm5vZGUuY2hpbGRyZW4sXG5cdFx0XHQpXG5cdFx0XHRsZXQgb3B0aW9uczogUm91dGVPcHRpb25zIHwgdW5kZWZpbmVkXG5cdFx0XHRsZXQgb25jbGljazogYW55XG5cdFx0XHRsZXQgaHJlZjogc3RyaW5nXG5cblx0XHRcdC8vIExldCdzIHByb3ZpZGUgYSAqcmlnaHQqIHdheSB0byBkaXNhYmxlIGEgcm91dGUgbGluaywgcmF0aGVyIHRoYW5cblx0XHRcdC8vIGxldHRpbmcgcGVvcGxlIHNjcmV3IHVwIGFjY2Vzc2liaWxpdHkgb24gYWNjaWRlbnQuXG5cdFx0XHQvL1xuXHRcdFx0Ly8gVGhlIGF0dHJpYnV0ZSBpcyBjb2VyY2VkIHNvIHVzZXJzIGRvbid0IGdldCBzdXJwcmlzZWQgb3ZlclxuXHRcdFx0Ly8gYGRpc2FibGVkOiAwYCByZXN1bHRpbmcgaW4gYSBidXR0b24gdGhhdCdzIHNvbWVob3cgcm91dGFibGVcblx0XHRcdC8vIGRlc3BpdGUgYmVpbmcgdmlzaWJseSBkaXNhYmxlZC5cblx0XHRcdGlmIChjaGlsZC5hdHRycyEuZGlzYWJsZWQgPSBCb29sZWFuKGNoaWxkLmF0dHJzIS5kaXNhYmxlZCkpIHtcblx0XHRcdFx0Y2hpbGQuYXR0cnMhLmhyZWYgPSBudWxsXG5cdFx0XHRcdGNoaWxkLmF0dHJzIVsnYXJpYS1kaXNhYmxlZCddID0gJ3RydWUnXG5cdFx0XHRcdC8vIElmIHlvdSAqcmVhbGx5KiBkbyB3YW50IGFkZCBgb25jbGlja2Agb24gYSBkaXNhYmxlZCBsaW5rLCB1c2Vcblx0XHRcdFx0Ly8gYW4gYG9uY3JlYXRlYCBob29rIHRvIGFkZCBpdC5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9wdGlvbnMgPSB2bm9kZS5hdHRycz8ub3B0aW9uc1xuXHRcdFx0XHRvbmNsaWNrID0gdm5vZGUuYXR0cnM/Lm9uY2xpY2tcblx0XHRcdFx0Ly8gRWFzaWVyIHRvIGJ1aWxkIGl0IG5vdyB0byBrZWVwIGl0IGlzb21vcnBoaWMuXG5cdFx0XHRcdGhyZWYgPSBidWlsZFBhdGhuYW1lKGNoaWxkLmF0dHJzIS5ocmVmIHx8ICcnLCB2bm9kZS5hdHRycz8ucGFyYW1zIHx8IHt9KVxuXHRcdFx0XHQvLyBNYWtlIExpbmsgaXNvbW9ycGhpYyAtIHVzZSBlbXB0eSBwcmVmaXggb24gc2VydmVyIGZvciBwYXRobmFtZSByb3V0aW5nXG5cdFx0XHRcdC8vIE9uIHNlcnZlciAoJHdpbmRvdyBpcyBudWxsKTogYWx3YXlzIHVzZSBlbXB0eSBwcmVmaXggZm9yIGNsZWFuIFVSTHNcblx0XHRcdFx0Ly8gT24gY2xpZW50OiB1c2Ugcm91dGUucHJlZml4ICh3aGljaCBtYXkgYmUgJyMhJyBmb3IgaGFzaCByb3V0aW5nIG9yICcnIGZvciBwYXRobmFtZSByb3V0aW5nKVxuXHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgU1NSIGdlbmVyYXRlcyBjbGVhbiBwYXRobmFtZSBVUkxzIHdoaWxlIGNsaWVudCBjYW4gdXNlIGhhc2ggcm91dGluZyBpZiBjb25maWd1cmVkXG5cdFx0XHRcdGNvbnN0IGxpbmtQcmVmaXggPSAoJHdpbmRvdyA9PSBudWxsKSA/ICcnIDogcm91dGUucHJlZml4XG5cdFx0XHRcdGNoaWxkLmF0dHJzIS5ocmVmID0gbGlua1ByZWZpeCArIGhyZWZcblx0XHRcdFx0Y2hpbGQuYXR0cnMhLm9uY2xpY2sgPSBmdW5jdGlvbihlOiBhbnkpIHtcblx0XHRcdFx0XHRsZXQgcmVzdWx0OiBhbnlcblx0XHRcdFx0XHRpZiAodHlwZW9mIG9uY2xpY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IG9uY2xpY2suY2FsbChlLmN1cnJlbnRUYXJnZXQsIGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvbmNsaWNrID09IG51bGwgfHwgdHlwZW9mIG9uY2xpY2sgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0XHQvLyBkbyBub3RoaW5nXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygb25jbGljay5oYW5kbGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0b25jbGljay5oYW5kbGVFdmVudChlKVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEFkYXB0ZWQgZnJvbSBSZWFjdCBSb3V0ZXIncyBpbXBsZW1lbnRhdGlvbjpcblx0XHRcdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vUmVhY3RUcmFpbmluZy9yZWFjdC1yb3V0ZXIvYmxvYi81MjBhMGFjZDQ4YWUxYjA2NmViMGIwN2Q2ZDRkMTc5MGExZDAyNDgyL3BhY2thZ2VzL3JlYWN0LXJvdXRlci1kb20vbW9kdWxlcy9MaW5rLmpzXG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLyBUcnkgdG8gYmUgZmxleGlibGUgYW5kIGludHVpdGl2ZSBpbiBob3cgd2UgaGFuZGxlIGxpbmtzLlxuXHRcdFx0XHRcdC8vIEZ1biBmYWN0OiBsaW5rcyBhcmVuJ3QgYXMgb2J2aW91cyB0byBnZXQgcmlnaHQgYXMgeW91XG5cdFx0XHRcdFx0Ly8gd291bGQgZXhwZWN0LiBUaGVyZSdzIGEgbG90IG1vcmUgdmFsaWQgd2F5cyB0byBjbGljayBhXG5cdFx0XHRcdFx0Ly8gbGluayB0aGFuIHRoaXMsIGFuZCBvbmUgbWlnaHQgd2FudCB0byBub3Qgc2ltcGx5IGNsaWNrIGFcblx0XHRcdFx0XHQvLyBsaW5rLCBidXQgcmlnaHQgY2xpY2sgb3IgY29tbWFuZC1jbGljayBpdCB0byBjb3B5IHRoZVxuXHRcdFx0XHRcdC8vIGxpbmsgdGFyZ2V0LCBldGMuIE5vcGUsIHRoaXMgaXNuJ3QganVzdCBmb3IgYmxpbmQgcGVvcGxlLlxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdC8vIFNraXAgaWYgYG9uY2xpY2tgIHByZXZlbnRlZCBkZWZhdWx0XG5cdFx0XHRcdFx0XHRyZXN1bHQgIT09IGZhbHNlICYmICFlLmRlZmF1bHRQcmV2ZW50ZWQgJiZcblx0XHRcdFx0XHRcdC8vIElnbm9yZSBldmVyeXRoaW5nIGJ1dCBsZWZ0IGNsaWNrc1xuXHRcdFx0XHRcdFx0KGUuYnV0dG9uID09PSAwIHx8IGUud2hpY2ggPT09IDAgfHwgZS53aGljaCA9PT0gMSkgJiZcblx0XHRcdFx0XHRcdC8vIExldCB0aGUgYnJvd3NlciBoYW5kbGUgYHRhcmdldD1fYmxhbmtgLCBldGMuXG5cdFx0XHRcdFx0XHQoIWUuY3VycmVudFRhcmdldC50YXJnZXQgfHwgZS5jdXJyZW50VGFyZ2V0LnRhcmdldCA9PT0gJ19zZWxmJykgJiZcblx0XHRcdFx0XHRcdC8vIE5vIG1vZGlmaWVyIGtleXNcblx0XHRcdFx0XHRcdCFlLmN0cmxLZXkgJiYgIWUubWV0YUtleSAmJiAhZS5zaGlmdEtleSAmJiAhZS5hbHRLZXlcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmVseSBjYWxsIHByZXZlbnREZWZhdWx0IC0gZXZlbnQgbWlnaHQgYmUgd3JhcHBlZCBieSBNaXRocmlsXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGUucHJldmVudERlZmF1bHQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGUub3JpZ2luYWxFdmVudCAmJiB0eXBlb2YgZS5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdGUub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQoZSBhcyBhbnkpLnJlZHJhdyA9IGZhbHNlXG5cdFx0XHRcdFx0XHRyb3V0ZS5zZXQoaHJlZiwgbnVsbCwgb3B0aW9ucylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBjaGlsZFxuXHRcdH0sXG5cdH1cblx0cm91dGUucGFyYW0gPSBmdW5jdGlvbihrZXk/OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYXR0cnMgJiYga2V5ICE9IG51bGwgPyBhdHRyc1trZXldIDogYXR0cnNcblx0fVxuXHRyb3V0ZS5wYXJhbXMgPSBhdHRyc1xuXG5cdC8vIFNlcnZlci1zaWRlIHJvdXRlIHJlc29sdXRpb24gKGlzb21vcnBoaWMpXG5cdHJvdXRlLnJlc29sdmUgPSBhc3luYyBmdW5jdGlvbihcblx0XHRwYXRobmFtZTogc3RyaW5nLFxuXHRcdHJvdXRlczogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXIgfCB7Y29tcG9uZW50OiBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlcn0+LFxuXHRcdHJlbmRlclRvU3RyaW5nOiAodm5vZGVzOiBhbnkpID0+IFByb21pc2U8U1NSUmVzdWx0Pixcblx0XHRwcmVmaXg6IHN0cmluZyA9ICcnLFxuXHRcdHJlZGlyZWN0RGVwdGg6IG51bWJlciA9IDAsXG5cdCk6IFByb21pc2U8U1NSUmVzdWx0PiB7XG5cdFx0Ly8gUHJldmVudCBpbmZpbml0ZSByZWRpcmVjdCBsb29wc1xuXHRcdGNvbnN0IE1BWF9SRURJUkVDVF9ERVBUSCA9IDVcblx0XHRpZiAocmVkaXJlY3REZXB0aCA+IE1BWF9SRURJUkVDVF9ERVBUSCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBNYXhpbXVtIHJlZGlyZWN0IGRlcHRoICgke01BWF9SRURJUkVDVF9ERVBUSH0pIGV4Y2VlZGVkLiBQb3NzaWJsZSByZWRpcmVjdCBsb29wLmApXG5cdFx0fVxuXHRcdC8vIFNhdmUgY3VycmVudCBwcmVmaXggYW5kIHNldCB0byBwcm92aWRlZCBwcmVmaXggZm9yIFNTUlxuXHRcdC8vIFRoaXMgZW5zdXJlcyBMaW5rIGNvbXBvbmVudHMgdXNlIHRoZSBjb3JyZWN0IHByZWZpeCBkdXJpbmcgc2VydmVyLXNpZGUgcmVuZGVyaW5nXG5cdFx0Y29uc3Qgc2F2ZWRQcmVmaXggPSByb3V0ZS5wcmVmaXhcblx0XHRyb3V0ZS5wcmVmaXggPSBwcmVmaXhcblx0XHQvLyBTYXZlIGN1cnJlbnQgcGF0aCB0byByZXN0b3JlIGFmdGVyIFNTUlxuXHRcdGNvbnN0IHNhdmVkQ3VycmVudFBhdGggPSBjdXJyZW50UGF0aFxuXHRcdFxuXHRcdC8vIFNldCBjdXJyZW50UGF0aCBpbW1lZGlhdGVseSBzbyBtLnJvdXRlLmdldCgpIHdvcmtzIGR1cmluZyBTU1Jcblx0XHQvLyBVc2UgcGF0aG5hbWUgKGZ1bGwgcGF0aCkgLSB0aGlzIGlzIHdoYXQgbS5yb3V0ZS5nZXQoKSBzaG91bGQgcmV0dXJuXG5cdFx0Y3VycmVudFBhdGggPSBwYXRobmFtZSB8fCAnLydcblx0XHRcblx0XHR0cnkge1xuXHRcdFx0Ly8gQ29tcGlsZSByb3V0ZXMgKHNhbWUgbG9naWMgYXMgaW4gcm91dGUoKSBmdW5jdGlvbilcblx0XHRcdGNvbnN0IGNvbXBpbGVkID0gT2JqZWN0LmtleXMocm91dGVzKS5tYXAoZnVuY3Rpb24ocm91dGVQYXRoKSB7XG5cdFx0XHRcdGlmIChyb3V0ZVBhdGhbMF0gIT09ICcvJykgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdSb3V0ZXMgbXVzdCBzdGFydCB3aXRoIGEgXFwnL1xcJy4nKVxuXHRcdFx0XHRpZiAoKC86KFteXFwvXFwuLV0rKShcXC57M30pPzovKS50ZXN0KHJvdXRlUGF0aCkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1JvdXRlIHBhcmFtZXRlciBuYW1lcyBtdXN0IGJlIHNlcGFyYXRlZCB3aXRoIGVpdGhlciBcXCcvXFwnLCBcXCcuXFwnLCBvciBcXCctXFwnLicpXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gSGFuZGxlIGJvdGggZm9ybWF0czogZGlyZWN0IGNvbXBvbmVudC9yZXNvbHZlciBvciB7Y29tcG9uZW50OiAuLi59XG5cdFx0XHRcdGNvbnN0IHJvdXRlVmFsdWUgPSByb3V0ZXNbcm91dGVQYXRoXVxuXHRcdFx0XHRjb25zdCBjb21wb25lbnQgPSAocm91dGVWYWx1ZSAmJiB0eXBlb2Ygcm91dGVWYWx1ZSA9PT0gJ29iamVjdCcgJiYgJ2NvbXBvbmVudCcgaW4gcm91dGVWYWx1ZSlcblx0XHRcdFx0XHQ/IChyb3V0ZVZhbHVlIGFzIHtjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyfSkuY29tcG9uZW50XG5cdFx0XHRcdFx0OiByb3V0ZVZhbHVlIGFzIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0cm91dGU6IHJvdXRlUGF0aCxcblx0XHRcdFx0XHRjb21wb25lbnQ6IGNvbXBvbmVudCxcblx0XHRcdFx0XHRjaGVjazogY29tcGlsZVRlbXBsYXRlKHJvdXRlUGF0aCksXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cblx0XHRcdC8vIFBhcnNlIHBhdGhuYW1lXG5cdFx0XHRjb25zdCBwYXRoID0gZGVjb2RlVVJJQ29tcG9uZW50U2FmZShwYXRobmFtZSB8fCAnLycpLnNsaWNlKHByZWZpeC5sZW5ndGgpXG5cdFx0XHRjb25zdCBkYXRhID0gcGFyc2VQYXRobmFtZShwYXRoKVxuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgYXR0cnMgZm9yIFNTUiBzbyBtLnJvdXRlLnBhcmFtKCkgd29ya3MgZHVyaW5nIHNlcnZlci1zaWRlIHJlbmRlcmluZ1xuXHRcdFx0YXR0cnMgPSBkYXRhLnBhcmFtc1xuXG5cdFx0XHQvLyBGaW5kIG1hdGNoaW5nIHJvdXRlXG5cdFx0XHRmb3IgKGNvbnN0IHtyb3V0ZTogbWF0Y2hlZFJvdXRlLCBjb21wb25lbnQsIGNoZWNrfSBvZiBjb21waWxlZCkge1xuXHRcdFx0XHRpZiAoY2hlY2soZGF0YSkpIHtcblx0XHRcdFx0XHRsZXQgcGF5bG9hZCA9IGNvbXBvbmVudFxuXG5cdFx0XHRcdFx0Ly8gSGFuZGxlIFJvdXRlUmVzb2x2ZXJcblx0XHRcdFx0XHRpZiAocGF5bG9hZCAmJiB0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcgJiYgKCdvbm1hdGNoJyBpbiBwYXlsb2FkIHx8ICdyZW5kZXInIGluIHBheWxvYWQpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCByZXNvbHZlciA9IHBheWxvYWQgYXMgUm91dGVSZXNvbHZlclxuXHRcdFx0XHRcdFx0aWYgKHJlc29sdmVyLm9ubWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gcmVzb2x2ZXIub25tYXRjaChkYXRhLnBhcmFtcywgcGF0aG5hbWUsIG1hdGNoZWRSb3V0ZSlcblx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcblx0XHRcdFx0XHRcdFx0XHRwYXlsb2FkID0gYXdhaXQgcmVzdWx0XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRwYXlsb2FkID0gcmVzdWx0IGFzIGFueVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIE5vdGU6IElmIG9ubWF0Y2ggcmV0dXJucyB1bmRlZmluZWQsIHBheWxvYWQgcmVtYWlucyBhcyB0aGUgUm91dGVSZXNvbHZlclxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBDaGVjayBmb3IgcmVkaXJlY3QgQkVGT1JFIHByb2Nlc3NpbmcgYXMgY29tcG9uZW50XG5cdFx0XHRcdFx0XHQvLyBUaGlzIHByZXZlbnRzIHJlZGlyZWN0IG9iamVjdHMgZnJvbSBiZWluZyB0cmVhdGVkIGFzIGNvbXBvbmVudHNcblx0XHRcdFx0XHRcdGlmIChpc1JlZGlyZWN0KHBheWxvYWQpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEV4dHJhY3QgcmVkaXJlY3QgdGFyZ2V0IHBhdGggKGhhbmRsZXMgZGlmZmVyZW50IFJFRElSRUNUIHN5bWJvbHMpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHJlZGlyZWN0UGF0aCA9IGdldFJlZGlyZWN0UGF0aChwYXlsb2FkKVxuXHRcdFx0XHRcdFx0XHRsb2dnZXIuaW5mbyhgUmVkaXJlY3RpbmcgdG8gJHtyZWRpcmVjdFBhdGh9YCwge1xuXHRcdFx0XHRcdFx0XHRcdHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdHJvdXRlOiBtYXRjaGVkUm91dGUsXG5cdFx0XHRcdFx0XHRcdFx0cmVkaXJlY3RQYXRoLFxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQvLyBVcGRhdGUgX19TU1JfVVJMX18gdG8gcmVmbGVjdCByZWRpcmVjdCB0YXJnZXQgZm9yIHByb3BlciBVUkwgY29udGV4dFxuXHRcdFx0XHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgZ2V0Q3VycmVudFVybCgpIGFuZCBvdGhlciBVUkwtZGVwZW5kZW50IGNvZGUgd29yayBjb3JyZWN0bHlcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxTU1JVcmwgPSBnbG9iYWxUaGlzLl9fU1NSX1VSTF9fXG5cdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQ29uc3RydWN0IGZ1bGwgVVJMIGZvciByZWRpcmVjdCB0YXJnZXQgaWYgd2UgaGF2ZSBvcmlnaW5hbCBVUkwgY29udGV4dFxuXHRcdFx0XHRcdFx0XHRcdGlmIChvcmlnaW5hbFNTUlVybCAmJiB0eXBlb2Ygb3JpZ2luYWxTU1JVcmwgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFVybCA9IG5ldyBVUkwob3JpZ2luYWxTU1JVcmwpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEJ1aWxkIHJlZGlyZWN0IHRhcmdldCBVUkwgdXNpbmcgc2FtZSBvcmlnaW5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVkaXJlY3RVcmwgPSBuZXcgVVJMKHJlZGlyZWN0UGF0aCwgb3JpZ2luYWxVcmwub3JpZ2luKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRnbG9iYWxUaGlzLl9fU1NSX1VSTF9fID0gcmVkaXJlY3RVcmwuaHJlZlxuXHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIElmIFVSTCBjb25zdHJ1Y3Rpb24gZmFpbHMsIGp1c3QgdXNlIHJlZGlyZWN0IHBhdGggYXMtaXNcblx0XHRcdFx0XHRcdFx0XHRcdFx0Z2xvYmFsVGhpcy5fX1NTUl9VUkxfXyA9IHJlZGlyZWN0UGF0aFxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRnbG9iYWxUaGlzLl9fU1NSX1VSTF9fID0gcmVkaXJlY3RQYXRoXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdC8vIFJlY3Vyc2l2ZWx5IHJlc29sdmUgcmVkaXJlY3QgdGFyZ2V0IHJvdXRlXG5cdFx0XHRcdFx0XHRcdFx0Ly8gVGhpcyB3aWxsIHJldHVybiBTU1JSZXN1bHQgKHN0cmluZyBvciB7aHRtbCwgc3RhdGV9KVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlZGlyZWN0UmVzdWx0ID0gYXdhaXQgcm91dGUucmVzb2x2ZShyZWRpcmVjdFBhdGgsIHJvdXRlcywgcmVuZGVyVG9TdHJpbmcsIHByZWZpeCwgcmVkaXJlY3REZXB0aCArIDEpXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVkaXJlY3RIdG1sID0gdHlwZW9mIHJlZGlyZWN0UmVzdWx0ID09PSAnc3RyaW5nJyA/IHJlZGlyZWN0UmVzdWx0IDogcmVkaXJlY3RSZXN1bHQuaHRtbFxuXHRcdFx0XHRcdFx0XHRcdGlmICghcmVkaXJlY3RIdG1sIHx8IHJlZGlyZWN0SHRtbC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGxvZ2dlci53YXJuKCdFbXB0eSByZWRpcmVjdCByZXN1bHQnLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZWRpcmVjdFBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJvdXRlOiBtYXRjaGVkUm91dGUsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRsb2dnZXIuZGVidWcoJ1JlZGlyZWN0IHJlc29sdmVkJywge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXRobmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVkaXJlY3RQYXRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRodG1sU2l6ZTogcmVkaXJlY3RIdG1sLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZWRpcmVjdFJlc3VsdFxuXHRcdFx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFJlc3RvcmUgb3JpZ2luYWwgU1NSIFVSTCBhZnRlciByZWRpcmVjdCByZXNvbHV0aW9uXG5cdFx0XHRcdFx0XHRcdFx0Z2xvYmFsVGhpcy5fX1NTUl9VUkxfXyA9IG9yaWdpbmFsU1NSVXJsXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gSWYgcmVzb2x2ZXIgaGFzIHJlbmRlciwgdXNlIGl0XG5cdFx0XHRcdFx0XHRpZiAocmVzb2x2ZXIucmVuZGVyKSB7XG5cdFx0XHRcdFx0XHRcdC8vIE9ubHkgcmVuZGVyIGlmIHBheWxvYWQgaXMgYSB2YWxpZCBjb21wb25lbnQgKG9ubWF0Y2ggcmV0dXJuZWQgYSBjb21wb25lbnQpXG5cdFx0XHRcdFx0XHRcdC8vIElmIG9ubWF0Y2ggcmV0dXJuZWQgdW5kZWZpbmVkLCBwYXlsb2FkIGlzIHN0aWxsIHRoZSBSb3V0ZVJlc29sdmVyLCB3aGljaCBpcyBub3QgYSBjb21wb25lbnRcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXNDb21wb25lbnRUeXBlID0gcGF5bG9hZCAhPSBudWxsICYmIHBheWxvYWQgIT09IHJlc29sdmVyICYmIChcblx0XHRcdFx0XHRcdFx0XHR0eXBlb2YgcGF5bG9hZCA9PT0gJ2Z1bmN0aW9uJyB8fFxuXHRcdFx0XHRcdFx0XHRcdCh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcgJiYgJ3ZpZXcnIGluIHBheWxvYWQgJiYgdHlwZW9mIChwYXlsb2FkIGFzIGFueSkudmlldyA9PT0gJ2Z1bmN0aW9uJylcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0aWYgKGlzQ29tcG9uZW50VHlwZSkge1xuXHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBDcmVhdGUgY29tcG9uZW50IHZub2RlIHVzaW5nIGh5cGVyc2NyaXB0XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBjb21wb25lbnRWbm9kZSA9IGh5cGVyc2NyaXB0KHBheWxvYWQgYXMgQ29tcG9uZW50VHlwZSwgZGF0YS5wYXJhbXMpXG5cdFx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHRcdC8vIENhbGwgcmVzb2x2ZXIucmVuZGVyIHRvIGdldCB0aGUgbGF5b3V0LXdyYXBwZWQgdm5vZGVcblx0XHRcdFx0XHRcdFx0XHRcdC8vIHJlc29sdmVyLnJlbmRlciBkb2VzOiBtKGxheW91dCwgbnVsbCwgY29tcG9uZW50Vm5vZGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCByZW5kZXJlZFZub2RlID0gcmVzb2x2ZXIucmVuZGVyKGNvbXBvbmVudFZub2RlKVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgcmVuZGVyVG9TdHJpbmcocmVuZGVyZWRWbm9kZSlcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGh0bWwgPSB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyA/IHJlc3VsdCA6IHJlc3VsdC5odG1sXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoaHRtbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsb2dnZXIuaW5mbyhgUmVuZGVyZWQgcm91dGUgY29tcG9uZW50YCwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJvdXRlOiBtYXRjaGVkUm91dGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aHRtbFNpemU6IGh0bWwubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2goZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGxvZ2dlci5lcnJvcignUm91dGUgcmVuZGVyIGZhaWxlZCcsIGVycm9yLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyb3V0ZTogbWF0Y2hlZFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdHRocm93IGVycm9yXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHQvLyBJZiByZXNvbHZlciBoYXMgcmVuZGVyIGJ1dCBubyBvbm1hdGNoIChvciBvbm1hdGNoIHJldHVybmVkIHVuZGVmaW5lZCksXG5cdFx0XHRcdFx0XHRcdC8vIGNhbGwgcmVuZGVyIGRpcmVjdGx5IHdpdGggYSB2bm9kZSB0aGF0IGhhcyByb3V0ZVBhdGggaW4gYXR0cnNcblx0XHRcdFx0XHRcdFx0Ly8gVGhpcyBhbGxvd3MgcmVuZGVyLW9ubHkgcmVzb2x2ZXJzIHRvIHdvcmtcblx0XHRcdFx0XHRcdFx0aWYgKCFyZXNvbHZlci5vbm1hdGNoIHx8IHBheWxvYWQgPT09IHJlc29sdmVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZygnQ2FsbGluZyByZW5kZXItb25seSByZXNvbHZlcicsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJvdXRlOiBtYXRjaGVkUm91dGUsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQ3JlYXRlIGEgdm5vZGUgd2l0aCB0aGUgcmVzb2x2ZXIgYXMgdGFnIGFuZCByb3V0ZVBhdGggaW4gYXR0cnNcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFVzZSBWbm9kZSgpIGRpcmVjdGx5IHNpbmNlIHJlc29sdmVyIGlzIG5vdCBhIGNvbXBvbmVudFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVzb2x2ZXJWbm9kZSA9IFZub2RlKHJlc29sdmVyIGFzIGFueSwgcGF0aG5hbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Li4uZGF0YS5wYXJhbXMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJvdXRlUGF0aDogcGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBudWxsLCBudWxsLCBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVuZGVyZWRWbm9kZSA9IHJlc29sdmVyLnJlbmRlcihyZXNvbHZlclZub2RlKVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgcmVuZGVyVG9TdHJpbmcocmVuZGVyZWRWbm9kZSlcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGh0bWwgPSB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyA/IHJlc3VsdCA6IHJlc3VsdC5odG1sXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoaHRtbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsb2dnZXIuaW5mbyhgUmVuZGVyZWQgcm91dGUgd2l0aCByZW5kZXItb25seSByZXNvbHZlcmAsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwYXRobmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyb3V0ZTogbWF0Y2hlZFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGh0bWxTaXplOiBodG1sLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRsb2dnZXIuZXJyb3IoJ1JvdXRlIHJlbmRlci1vbmx5IHJlc29sdmVyIGZhaWxlZCcsIGVycm9yLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyb3V0ZTogbWF0Y2hlZFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdHRocm93IGVycm9yXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIElmIHBheWxvYWQgaXMgbm90IGEgdmFsaWQgY29tcG9uZW50LCBza2lwIHJlbmRlcmluZ1xuXHRcdFx0XHRcdFx0XHQvLyBUaGlzIGhhcHBlbnMgd2hlbiBvbm1hdGNoIHJldHVybnMgdW5kZWZpbmVkIC0gcmVuZGVyIG5lZWRzIGEgY29tcG9uZW50IHRvIHdvcmsgd2l0aFxuXHRcdFx0XHRcdFx0XHQvLyBJbiB0aGlzIGNhc2UsIHdlIHNob3VsZCBmYWxsIHRocm91Z2ggdG8gdGhlIGNvbXBvbmVudCByZW5kZXJpbmcgbG9naWMgYmVsb3dcblx0XHRcdFx0XHRcdFx0Ly8gd2hpY2ggd2lsbCBoYW5kbGUgdGhlIFJvdXRlUmVzb2x2ZXIgYXMgYSBjb21wb25lbnQgaWYgaXQgaGFzIGEgdmlldyBtZXRob2Rcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBSZW5kZXIgY29tcG9uZW50XG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgcGF5bG9hZCBpcyBhIENvbXBvbmVudFR5cGUgKG5vdCBhIFJvdXRlUmVzb2x2ZXIpXG5cdFx0XHRcdFx0Y29uc3QgaXNDb21wb25lbnRUeXBlID0gcGF5bG9hZCAhPSBudWxsICYmIChcblx0XHRcdFx0XHRcdHR5cGVvZiBwYXlsb2FkID09PSAnZnVuY3Rpb24nIHx8XG5cdFx0XHRcdFx0XHQodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnICYmICd2aWV3JyBpbiBwYXlsb2FkICYmIHR5cGVvZiAocGF5bG9hZCBhcyBhbnkpLnZpZXcgPT09ICdmdW5jdGlvbicpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdGlmIChpc0NvbXBvbmVudFR5cGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHZub2RlID0gaHlwZXJzY3JpcHQocGF5bG9hZCBhcyBDb21wb25lbnRUeXBlLCBkYXRhLnBhcmFtcylcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlbmRlclRvU3RyaW5nKHZub2RlKVxuXHRcdFx0XHRcdFx0Ly8gSGFuZGxlIGJvdGggc3RyaW5nIChiYWNrd2FyZCBjb21wYXRpYmlsaXR5KSBhbmQge2h0bWwsIHN0YXRlfSByZXR1cm4gdHlwZXNcblx0XHRcdFx0XHRcdHJldHVybiB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyA/IHJlc3VsdCA6IHJlc3VsdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEZhbGxiYWNrIHRvIGRpdlxuXHRcdFx0XHRcdGNvbnN0IHZub2RlID0gaHlwZXJzY3JpcHQoJ2RpdicsIGRhdGEucGFyYW1zKVxuXHRcdFx0XHRcdHJldHVybiBhd2FpdCByZW5kZXJUb1N0cmluZyh2bm9kZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBObyByb3V0ZSBmb3VuZFxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBObyByb3V0ZSBmb3VuZCBmb3IgJHtwYXRobmFtZX1gKVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHQvLyBSZXN0b3JlIG9yaWdpbmFsIHByZWZpeCBhbmQgY3VycmVudFBhdGhcblx0XHRcdHJvdXRlLnByZWZpeCA9IHNhdmVkUHJlZml4XG5cdFx0XHRjdXJyZW50UGF0aCA9IHNhdmVkQ3VycmVudFBhdGhcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcm91dGUgYXMgdW5rbm93biBhcyBSb3V0ZSAmICgocm9vdDogRWxlbWVudCwgZGVmYXVsdFJvdXRlOiBzdHJpbmcsIHJvdXRlczogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXI+KSA9PiB2b2lkKSAmIHtyZWRpcmVjdDogKHBhdGg6IHN0cmluZykgPT4gUmVkaXJlY3RPYmplY3R9XG59XG4iLAogICAgIi8vIFNTUiBhbmQgaHlkcmF0aW9uIHV0aWxpdGllc1xuXG5pbXBvcnQge2xvZ2dlcn0gZnJvbSAnLi4vc2VydmVyL2xvZ2dlcidcblxuLy8gRGV2ZWxvcG1lbnQtb25seSBoeWRyYXRpb24gZGVidWdnaW5nXG5leHBvcnQgY29uc3QgSFlEUkFUSU9OX0RFQlVHID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52Py5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXG5cbi8vIFRocm90dGxlIGh5ZHJhdGlvbiBlcnJvciBsb2dnaW5nIHRvIGF2b2lkIHBlcmZvcm1hbmNlIGlzc3Vlc1xubGV0IGh5ZHJhdGlvbkVycm9yQ291bnQgPSAwXG5jb25zdCBNQVhfSFlEUkFUSU9OX0VSUk9SUyA9IDEwIC8vIExpbWl0IG51bWJlciBvZiBlcnJvcnMgbG9nZ2VkIHBlciByZW5kZXIgY3ljbGVcblxuLy8gUmVzZXQgZXJyb3IgY291bnQgYXQgdGhlIHN0YXJ0IG9mIGVhY2ggcmVuZGVyIGN5Y2xlXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRIeWRyYXRpb25FcnJvckNvdW50KCk6IHZvaWQge1xuXHRoeWRyYXRpb25FcnJvckNvdW50ID0gMFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50TmFtZSh2bm9kZTogYW55KTogc3RyaW5nIHtcblx0aWYgKCF2bm9kZSkgcmV0dXJuICdVbmtub3duJ1xuXHRpZiAodHlwZW9mIHZub2RlLnRhZyA9PT0gJ3N0cmluZycpIHJldHVybiB2bm9kZS50YWdcblx0aWYgKHZub2RlLnRhZz8ubmFtZSkgcmV0dXJuIHZub2RlLnRhZy5uYW1lXG5cdGlmICh2bm9kZS50YWc/LmRpc3BsYXlOYW1lKSByZXR1cm4gdm5vZGUudGFnLmRpc3BsYXlOYW1lXG5cdGlmICh2bm9kZS5zdGF0ZT8uY29uc3RydWN0b3I/Lm5hbWUpIHJldHVybiB2bm9kZS5zdGF0ZS5jb25zdHJ1Y3Rvci5uYW1lXG5cdHJldHVybiAnVW5rbm93bidcbn1cblxuLy8gRm9ybWF0IGEgRE9NIGVsZW1lbnQgYXMgYW4gb3BlbmluZyB0YWcgc3RyaW5nXG5mdW5jdGlvbiBmb3JtYXRET01FbGVtZW50KGVsOiBFbGVtZW50KToge3RhZ05hbWU6IHN0cmluZzsgb3BlblRhZzogc3RyaW5nOyBjbG9zZVRhZzogc3RyaW5nfSB7XG5cdGNvbnN0IHRhZ05hbWUgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKClcblx0bGV0IG9wZW5UYWcgPSBgPCR7dGFnTmFtZX1gXG5cblx0Ly8gQWRkIGltcG9ydGFudCBhdHRyaWJ1dGVzXG5cdGlmIChlbC5pZCkge1xuXHRcdG9wZW5UYWcgKz0gYCBpZD1cIiR7ZWwuaWR9XCJgXG5cdH1cblx0aWYgKGVsLmNsYXNzTmFtZSAmJiB0eXBlb2YgZWwuY2xhc3NOYW1lID09PSAnc3RyaW5nJykge1xuXHRcdGNvbnN0IGNsYXNzZXMgPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKS5maWx0ZXIoYyA9PiBjKS5zbGljZSgwLCAzKS5qb2luKCcgJylcblx0XHRpZiAoY2xhc3Nlcykge1xuXHRcdFx0b3BlblRhZyArPSBgIGNsYXNzTmFtZT1cIiR7Y2xhc3Nlc30ke2VsLmNsYXNzTmFtZS5zcGxpdCgnICcpLmxlbmd0aCA+IDMgPyAnLi4uJyA6ICcnfVwiYFxuXHRcdH1cblx0fVxuXG5cdG9wZW5UYWcgKz0gJz4nXG5cdHJldHVybiB7dGFnTmFtZSwgb3BlblRhZywgY2xvc2VUYWc6IGA8LyR7dGFnTmFtZX0+YH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFZET01UcmVlKHZub2RlOiBhbnksIG1heERlcHRoOiBudW1iZXIgPSA2LCBjdXJyZW50RGVwdGg6IG51bWJlciA9IDAsIHNob3dDb21wb25lbnRJbnN0YW5jZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xuXHRpZiAoIXZub2RlIHx8IGN1cnJlbnREZXB0aCA+PSBtYXhEZXB0aCkgcmV0dXJuICcnXG5cblx0Y29uc3QgaW5kZW50ID0gJyAgJy5yZXBlYXQoY3VycmVudERlcHRoKVxuXG5cdC8vIEhhbmRsZSB0ZXh0IG5vZGVzXG5cdGlmICh2bm9kZS50YWcgPT09ICcjJykge1xuXHRcdGNvbnN0IHRleHQgPSBTdHJpbmcodm5vZGUuY2hpbGRyZW4gfHwgdm5vZGUudGV4dCB8fCAnJykuc3Vic3RyaW5nKDAsIDUwKVxuXHRcdHJldHVybiBgJHtpbmRlbnR9XCIke3RleHR9JHtTdHJpbmcodm5vZGUuY2hpbGRyZW4gfHwgdm5vZGUudGV4dCB8fCAnJykubGVuZ3RoID4gNTAgPyAnLi4uJyA6ICcnfVwiYFxuXHR9XG5cblx0Ly8gSGFuZGxlIGZyYWdtZW50c1xuXHRpZiAodm5vZGUudGFnID09PSAnWycpIHtcblx0XHRpZiAoIXZub2RlLmNoaWxkcmVuIHx8ICFBcnJheS5pc0FycmF5KHZub2RlLmNoaWxkcmVuKSB8fCB2bm9kZS5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBgJHtpbmRlbnR9W2ZyYWdtZW50XWBcblx0XHR9XG5cdFx0Y29uc3QgdmFsaWRDaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuLmZpbHRlcigoYzogYW55KSA9PiBjICE9IG51bGwpLnNsaWNlKDAsIDgpXG5cdFx0bGV0IHJlc3VsdCA9IGAke2luZGVudH1bZnJhZ21lbnRdXFxuYFxuXHRcdGZvciAoY29uc3QgY2hpbGQgb2YgdmFsaWRDaGlsZHJlbikge1xuXHRcdFx0cmVzdWx0ICs9IGZvcm1hdFZET01UcmVlKGNoaWxkLCBtYXhEZXB0aCwgY3VycmVudERlcHRoICsgMSwgc2hvd0NvbXBvbmVudEluc3RhbmNlKSArICdcXG4nXG5cdFx0fVxuXHRcdGlmICh2bm9kZS5jaGlsZHJlbi5maWx0ZXIoKGM6IGFueSkgPT4gYyAhPSBudWxsKS5sZW5ndGggPiA4KSB7XG5cdFx0XHRyZXN1bHQgKz0gYCR7aW5kZW50fSAgLi4uICgke3Zub2RlLmNoaWxkcmVuLmZpbHRlcigoYzogYW55KSA9PiBjICE9IG51bGwpLmxlbmd0aCAtIDh9IG1vcmUpXFxuYFxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0LnRyaW1FbmQoKVxuXHR9XG5cblx0Y29uc3QgaXNDb21wb25lbnQgPSB0eXBlb2Ygdm5vZGUudGFnICE9PSAnc3RyaW5nJ1xuXHRjb25zdCB0YWdOYW1lID0gaXNDb21wb25lbnQgPyBnZXRDb21wb25lbnROYW1lKHZub2RlKSA6IHZub2RlLnRhZ1xuXG5cdGxldCByZXN1bHQgPSBgJHtpbmRlbnR9PCR7dGFnTmFtZX1gXG5cblx0Ly8gQWRkIGtleSBpZiBwcmVzZW50XG5cdGlmICh2bm9kZS5hdHRycz8ua2V5KSB7XG5cdFx0cmVzdWx0ICs9IGAga2V5PVwiJHt2bm9kZS5hdHRycy5rZXl9XCJgXG5cdH1cblxuXHQvLyBBZGQgYSBmZXcgaW1wb3J0YW50IGF0dHJpYnV0ZXMgZm9yIGRlYnVnZ2luZ1xuXHRpZiAodm5vZGUuYXR0cnMpIHtcblx0XHRjb25zdCBpbXBvcnRhbnRBdHRycyA9IFsnaWQnLCAnY2xhc3MnLCAnY2xhc3NOYW1lJ11cblx0XHRmb3IgKGNvbnN0IGF0dHIgb2YgaW1wb3J0YW50QXR0cnMpIHtcblx0XHRcdGlmICh2bm9kZS5hdHRyc1thdHRyXSkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IHR5cGVvZiB2bm9kZS5hdHRyc1thdHRyXSA9PT0gJ3N0cmluZydcblx0XHRcdFx0XHQ/IHZub2RlLmF0dHJzW2F0dHJdXG5cdFx0XHRcdFx0OiBTdHJpbmcodm5vZGUuYXR0cnNbYXR0cl0pXG5cdFx0XHRcdHJlc3VsdCArPSBgICR7YXR0cn09XCIke3ZhbHVlLnN1YnN0cmluZygwLCAzMCl9JHt2YWx1ZS5sZW5ndGggPiAzMCA/ICcuLi4nIDogJyd9XCJgXG5cdFx0XHRcdGJyZWFrIC8vIE9ubHkgc2hvdyBmaXJzdCBpbXBvcnRhbnQgYXR0ciB0byBrZWVwIGl0IGNvbmNpc2Vcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXN1bHQgKz0gJz4nXG5cblx0Ly8gRm9yIGNvbXBvbmVudHMsIHNob3cgdGhlaXIgcmVuZGVyZWQgaW5zdGFuY2UgKHdoYXQgdGhlIGNvbXBvbmVudCBhY3R1YWxseSByZW5kZXJzKVxuXHQvLyBUaGlzIGdpdmVzIHVzIHBhcmVudCBjb250ZXh0IHdpdGhvdXQgcGVyZm9ybWFuY2UgY29zdFxuXHRpZiAoaXNDb21wb25lbnQgJiYgc2hvd0NvbXBvbmVudEluc3RhbmNlICYmIHZub2RlLmluc3RhbmNlICYmIGN1cnJlbnREZXB0aCA8IG1heERlcHRoIC0gMSkge1xuXHRcdGNvbnN0IGluc3RhbmNlVHJlZSA9IGZvcm1hdFZET01UcmVlKHZub2RlLmluc3RhbmNlLCBtYXhEZXB0aCwgY3VycmVudERlcHRoICsgMSwgc2hvd0NvbXBvbmVudEluc3RhbmNlKVxuXHRcdGlmIChpbnN0YW5jZVRyZWUpIHtcblx0XHRcdHJlc3VsdCArPSAnXFxuJyArIGluc3RhbmNlVHJlZVxuXHRcdH1cblx0fVxuXG5cdC8vIEFkZCBjaGlsZHJlblxuXHRpZiAodm5vZGUuY2hpbGRyZW4gJiYgQXJyYXkuaXNBcnJheSh2bm9kZS5jaGlsZHJlbikgJiYgY3VycmVudERlcHRoIDwgbWF4RGVwdGggLSAxKSB7XG5cdFx0Y29uc3QgdmFsaWRDaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuLmZpbHRlcigoYzogYW55KSA9PiBjICE9IG51bGwpLnNsaWNlKDAsIDEwKVxuXHRcdGlmICh2YWxpZENoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdHJlc3VsdCArPSAnXFxuJ1xuXHRcdFx0Zm9yIChjb25zdCBjaGlsZCBvZiB2YWxpZENoaWxkcmVuKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY2hpbGQgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBjaGlsZCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHRjb25zdCB0ZXh0ID0gU3RyaW5nKGNoaWxkKS5zdWJzdHJpbmcoMCwgNTApXG5cdFx0XHRcdFx0cmVzdWx0ICs9IGAke2luZGVudH0gIFwiJHt0ZXh0fSR7U3RyaW5nKGNoaWxkKS5sZW5ndGggPiA1MCA/ICcuLi4nIDogJyd9XCJcXG5gXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgY2hpbGRUcmVlID0gZm9ybWF0VkRPTVRyZWUoY2hpbGQsIG1heERlcHRoLCBjdXJyZW50RGVwdGggKyAxLCBzaG93Q29tcG9uZW50SW5zdGFuY2UpXG5cdFx0XHRcdFx0aWYgKGNoaWxkVHJlZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IGNoaWxkVHJlZSArICdcXG4nXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAodm5vZGUuY2hpbGRyZW4uZmlsdGVyKChjOiBhbnkpID0+IGMgIT0gbnVsbCkubGVuZ3RoID4gMTApIHtcblx0XHRcdFx0cmVzdWx0ICs9IGAke2luZGVudH0gIC4uLiAoJHt2bm9kZS5jaGlsZHJlbi5maWx0ZXIoKGM6IGFueSkgPT4gYyAhPSBudWxsKS5sZW5ndGggLSAxMH0gbW9yZSBjaGlsZHJlbilcXG5gXG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgaWYgKHZub2RlLnRleHQgIT0gbnVsbCkge1xuXHRcdGNvbnN0IHRleHQgPSBTdHJpbmcodm5vZGUudGV4dCkuc3Vic3RyaW5nKDAsIDUwKVxuXHRcdHJlc3VsdCArPSBgIFwiJHt0ZXh0fSR7U3RyaW5nKHZub2RlLnRleHQpLmxlbmd0aCA+IDUwID8gJy4uLicgOiAnJ31cImBcblx0fVxuXG5cdHJlc3VsdCArPSBgJHtpbmRlbnR9PC8ke3RhZ05hbWV9PmBcblxuXHRyZXR1cm4gcmVzdWx0XG59XG5cbi8vIENvbWJpbmUgRE9NIHBhcmVudCBjaGFpbiB3aXRoIFZET00gc3RydWN0dXJlIGludG8gYSBzaW5nbGUgSFRNTC1saWtlIHRyZWVcbmZ1bmN0aW9uIGZvcm1hdENvbWJpbmVkU3RydWN0dXJlKHBhcmVudDogRWxlbWVudCB8IE5vZGUgfCBudWxsLCB2bm9kZTogYW55LCBtYXhQYXJlbnRzOiBudW1iZXIgPSA0KTogc3RyaW5nIHtcblx0aWYgKCFwYXJlbnQgJiYgIXZub2RlKSByZXR1cm4gJydcblxuXHQvLyBDb2xsZWN0IERPTSBwYXJlbnRzIChmcm9tIG91dGVybW9zdCB0byBpbm5lcm1vc3QpXG5cdGNvbnN0IGRvbUVsZW1lbnRzOiB7b3BlblRhZzogc3RyaW5nOyBjbG9zZVRhZzogc3RyaW5nfVtdID0gW11cblx0bGV0IGN1cnJlbnQ6IE5vZGUgfCBudWxsID0gcGFyZW50XG5cdGxldCBkZXB0aCA9IDBcblxuXHR3aGlsZSAoY3VycmVudCAmJiBkZXB0aCA8IG1heFBhcmVudHMpIHtcblx0XHRpZiAoY3VycmVudC5ub2RlVHlwZSA9PT0gMSkgeyAvLyBFbGVtZW50IG5vZGVcblx0XHRcdGNvbnN0IGVsID0gY3VycmVudCBhcyBFbGVtZW50XG5cdFx0XHQvLyBTa2lwIGh0bWwgYW5kIGJvZHkgdGFncyAtIHRoZXkncmUgbm90IHVzZWZ1bCBjb250ZXh0XG5cdFx0XHRpZiAoZWwudGFnTmFtZSAhPT0gJ0hUTUwnICYmIGVsLnRhZ05hbWUgIT09ICdCT0RZJykge1xuXHRcdFx0XHRkb21FbGVtZW50cy51bnNoaWZ0KGZvcm1hdERPTUVsZW1lbnQoZWwpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50IHx8IGN1cnJlbnQucGFyZW50Tm9kZVxuXHRcdGRlcHRoKytcblx0fVxuXG5cdC8vIEJ1aWxkIHRoZSBjb21iaW5lZCBvdXRwdXRcblx0Y29uc3QgbGluZXM6IHN0cmluZ1tdID0gW11cblxuXHQvLyBPcGVuaW5nIHRhZ3MgZm9yIERPTSBwYXJlbnRzXG5cdGRvbUVsZW1lbnRzLmZvckVhY2goKGVsLCBpKSA9PiB7XG5cdFx0bGluZXMucHVzaCgnICAnLnJlcGVhdChpKSArIGVsLm9wZW5UYWcpXG5cdH0pXG5cblx0Ly8gVkRPTSBzdHJ1Y3R1cmUgKGluZGVudGVkIGluc2lkZSB0aGUgRE9NIHBhcmVudHMpXG5cdGlmICh2bm9kZSkge1xuXHRcdGNvbnN0IHZkb21JbmRlbnQgPSBkb21FbGVtZW50cy5sZW5ndGhcblx0XHRjb25zdCB2ZG9tVHJlZSA9IGZvcm1hdFZET01UcmVlKHZub2RlLCA0LCAwLCB0cnVlKVxuXHRcdGlmICh2ZG9tVHJlZSkge1xuXHRcdFx0Ly8gSW5kZW50IGVhY2ggbGluZSBvZiB0aGUgVkRPTSB0cmVlXG5cdFx0XHRjb25zdCB2ZG9tTGluZXMgPSB2ZG9tVHJlZS5zcGxpdCgnXFxuJylcblx0XHRcdHZkb21MaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xuXHRcdFx0XHRsaW5lcy5wdXNoKCcgICcucmVwZWF0KHZkb21JbmRlbnQpICsgbGluZSlcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2xvc2luZyB0YWdzIGZvciBET00gcGFyZW50cyAoaW4gcmV2ZXJzZSBvcmRlcilcblx0Zm9yIChsZXQgaSA9IGRvbUVsZW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0bGluZXMucHVzaCgnICAnLnJlcGVhdChpKSArIGRvbUVsZW1lbnRzW2ldLmNsb3NlVGFnKVxuXHR9XG5cblx0cmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ29tcG9uZW50UGF0aCh2bm9kZTogYW55LCBjb250ZXh0Pzoge29sZFZub2RlPzogYW55OyBuZXdWbm9kZT86IGFueX0pOiBzdHJpbmdbXSB7XG5cdGNvbnN0IHBhdGg6IHN0cmluZ1tdID0gW11cblxuXHRjb25zdCB0cmF2ZXJzZVZub2RlID0gKHY6IGFueSwgZGVwdGg6IG51bWJlciA9IDApOiBib29sZWFuID0+IHtcblx0XHRpZiAoIXYgfHwgZGVwdGggPiAxMCkgcmV0dXJuIGZhbHNlXG5cblx0XHRjb25zdCBuYW1lID0gZ2V0Q29tcG9uZW50TmFtZSh2KVxuXHRcdGNvbnN0IGlzQ29tcG9uZW50ID0gdHlwZW9mIHYudGFnICE9PSAnc3RyaW5nJyAmJiBuYW1lICE9PSAnVW5rbm93bicgJiYgbmFtZSAhPT0gJ0NvbXBvbmVudCcgJiYgbmFtZSAhPT0gJ0Fub255bW91c0NvbXBvbmVudCdcblxuXHRcdGlmIChpc0NvbXBvbmVudCkge1xuXHRcdFx0cGF0aC5wdXNoKG5hbWUpXG5cdFx0fVxuXG5cdFx0aWYgKHYuaW5zdGFuY2UgJiYgZGVwdGggPCAyKSB7XG5cdFx0XHRpZiAodHJhdmVyc2VWbm9kZSh2Lmluc3RhbmNlLCBkZXB0aCArIDEpKSByZXR1cm4gdHJ1ZVxuXHRcdH1cblxuXHRcdGlmICh2LmNoaWxkcmVuICYmIEFycmF5LmlzQXJyYXkodi5jaGlsZHJlbikgJiYgZGVwdGggPCAyKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKHYuY2hpbGRyZW4ubGVuZ3RoLCAzKTsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IGNoaWxkID0gdi5jaGlsZHJlbltpXVxuXHRcdFx0XHRpZiAoY2hpbGQgJiYgdHJhdmVyc2VWbm9kZShjaGlsZCwgZGVwdGggKyAxKSkgcmV0dXJuIHRydWVcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdGlmIChjb250ZXh0Py5uZXdWbm9kZSkge1xuXHRcdHRyYXZlcnNlVm5vZGUoY29udGV4dC5uZXdWbm9kZSlcblx0XHRpZiAocGF0aC5sZW5ndGggPiAwKSByZXR1cm4gcGF0aFxuXHR9XG5cdGlmIChjb250ZXh0Py5vbGRWbm9kZSkge1xuXHRcdHRyYXZlcnNlVm5vZGUoY29udGV4dC5vbGRWbm9kZSlcblx0XHRpZiAocGF0aC5sZW5ndGggPiAwKSByZXR1cm4gcGF0aFxuXHR9XG5cblx0aWYgKHZub2RlKSB7XG5cdFx0dHJhdmVyc2VWbm9kZSh2bm9kZSlcblx0fVxuXG5cdHJldHVybiBwYXRoXG59XG5cbmZ1bmN0aW9uIGZvcm1hdENvbXBvbmVudEhpZXJhcmNoeSh2bm9kZTogYW55LCBjb250ZXh0Pzoge29sZFZub2RlPzogYW55OyBuZXdWbm9kZT86IGFueX0pOiBzdHJpbmcge1xuXHRpZiAoIXZub2RlKSByZXR1cm4gJ1Vua25vd24nXG5cblx0Y29uc3QgcGF0aCA9IGJ1aWxkQ29tcG9uZW50UGF0aCh2bm9kZSwgY29udGV4dClcblx0Y29uc3QgaW1tZWRpYXRlTmFtZSA9IGdldENvbXBvbmVudE5hbWUodm5vZGUpXG5cdGNvbnN0IGlzRWxlbWVudCA9IHR5cGVvZiB2bm9kZS50YWcgPT09ICdzdHJpbmcnXG5cblx0aWYgKHBhdGgubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IHBhdGhTdHIgPSBwYXRoLmpvaW4oJyDihpIgJylcblx0XHRpZiAoaXNFbGVtZW50ICYmIGltbWVkaWF0ZU5hbWUgIT09IHBhdGhbcGF0aC5sZW5ndGggLSAxXSkge1xuXHRcdFx0cmV0dXJuIGAke2ltbWVkaWF0ZU5hbWV9IGluICR7cGF0aFN0cn1gXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBwYXRoU3RyXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGltbWVkaWF0ZU5hbWVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIeWRyYXRpb25FcnJvckNvbnRleHQge1xuXHRwYXJlbnQ/OiBFbGVtZW50XG5cdG5vZGU/OiBOb2RlXG5cdG1hdGNoZWROb2Rlcz86IFNldDxOb2RlPlxuXHRvbGRWbm9kZT86IGFueVxuXHRuZXdWbm9kZT86IGFueVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9nSHlkcmF0aW9uRXJyb3IoXG5cdG9wZXJhdGlvbjogc3RyaW5nLFxuXHR2bm9kZTogYW55LFxuXHRfZWxlbWVudDogRWxlbWVudCB8IG51bGwsXG5cdGVycm9yOiBFcnJvcixcblx0Y29udGV4dD86IEh5ZHJhdGlvbkVycm9yQ29udGV4dCxcbik6IHZvaWQge1xuXHQvLyBVcGRhdGUgaHlkcmF0aW9uIHN0YXRpc3RpY3Ncblx0dXBkYXRlSHlkcmF0aW9uU3RhdHModm5vZGUpXG5cdFxuXHQvLyBUaHJvdHRsZSBlcnJvciBsb2dnaW5nIHRvIGF2b2lkIHBlcmZvcm1hbmNlIGlzc3Vlc1xuXHRoeWRyYXRpb25FcnJvckNvdW50Kytcblx0aWYgKGh5ZHJhdGlvbkVycm9yQ291bnQgPiBNQVhfSFlEUkFUSU9OX0VSUk9SUykge1xuXHRcdGlmIChoeWRyYXRpb25FcnJvckNvdW50ID09PSBNQVhfSFlEUkFUSU9OX0VSUk9SUyArIDEpIHtcblx0XHRcdGNvbnN0IHRvcENvbXBvbmVudHMgPSBBcnJheS5mcm9tKGh5ZHJhdGlvblN0YXRzLmNvbXBvbmVudE1pc21hdGNoZXMuZW50cmllcygpKVxuXHRcdFx0XHQuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pXG5cdFx0XHRcdC5zbGljZSgwLCA1KVxuXHRcdFx0XHQubWFwKChbbmFtZSwgY291bnRdKSA9PiBgJHtuYW1lfTogJHtjb3VudH1gKVxuXHRcdFx0XHQuam9pbignLCAnKVxuXHRcdFx0XG5cdFx0XHRsb2dnZXIud2FybihgSHlkcmF0aW9uIGVycm9ycyB0aHJvdHRsZWQ6IE1vcmUgdGhhbiAke01BWF9IWURSQVRJT05fRVJST1JTfSBlcnJvcnMgZGV0ZWN0ZWQuIFN1cHByZXNzaW5nIGZ1cnRoZXIgbG9ncyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlLmAsIHtcblx0XHRcdFx0dG90YWxNaXNtYXRjaGVzOiBoeWRyYXRpb25TdGF0cy50b3RhbE1pc21hdGNoZXMsXG5cdFx0XHRcdHRvcENvbXBvbmVudHM6IHRvcENvbXBvbmVudHMgfHwgJ25vbmUnLFxuXHRcdFx0fSlcblx0XHR9XG5cdFx0cmV0dXJuXG5cdH1cblxuXHQvLyBCdWlsZCB1c2VyLWZyaWVuZGx5IGNvbXBvbmVudCBoaWVyYXJjaHlcblx0Y29uc3QgY29tcG9uZW50SGllcmFyY2h5ID0gZm9ybWF0Q29tcG9uZW50SGllcmFyY2h5KHZub2RlLCBjb250ZXh0KVxuXG5cdC8vIExvZyBoeWRyYXRpb24gZXJyb3Igd2l0aCBzdHJ1Y3R1cmVkIGNvbnRleHRcblx0Y29uc3QgbG9nQ29udGV4dDogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0XHRjb21wb25lbnRQYXRoOiBjb21wb25lbnRIaWVyYXJjaHksXG5cdFx0b3BlcmF0aW9uLFxuXHR9XG5cdFxuXHRpZiAoY29udGV4dD8ubm9kZSkge1xuXHRcdGxvZ0NvbnRleHQuYWZmZWN0ZWROb2RlID0gY29udGV4dC5ub2RlLm5vZGVUeXBlID09PSAxXG5cdFx0XHQ/IGAkeyhjb250ZXh0Lm5vZGUgYXMgRWxlbWVudCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpfWBcblx0XHRcdDogJ3RleHQnXG5cdH1cblx0XG5cdC8vIEluY2x1ZGUgc3RydWN0dXJlIGluZm8gaW4gZGVidWcgbW9kZVxuXHRpZiAoSFlEUkFUSU9OX0RFQlVHKSB7XG5cdFx0Y29uc3Qgdm5vZGVUb1Nob3cgPSBjb250ZXh0Py5vbGRWbm9kZSB8fCB2bm9kZSB8fCBjb250ZXh0Py5uZXdWbm9kZVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBjb21iaW5lZFN0cnVjdHVyZSA9IGZvcm1hdENvbWJpbmVkU3RydWN0dXJlKGNvbnRleHQ/LnBhcmVudCB8fCBudWxsLCB2bm9kZVRvU2hvdywgNClcblx0XHRcdGlmIChjb21iaW5lZFN0cnVjdHVyZSkge1xuXHRcdFx0XHRsb2dDb250ZXh0LnN0cnVjdHVyZSA9IGNvbWJpbmVkU3RydWN0dXJlXG5cdFx0XHR9XG5cdFx0fSBjYXRjaChfZSkge1xuXHRcdFx0Ly8gRmFsbGJhY2s6IHRyeSB0byBzaG93IGF0IGxlYXN0IHRoZSBWRE9NIHN0cnVjdHVyZVxuXHRcdFx0aWYgKHZub2RlVG9TaG93KSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgdmRvbVRyZWUgPSBmb3JtYXRWRE9NVHJlZSh2bm9kZVRvU2hvdywgNCwgMCwgdHJ1ZSlcblx0XHRcdFx0XHRpZiAodmRvbVRyZWUpIHtcblx0XHRcdFx0XHRcdGxvZ0NvbnRleHQudmRvbVN0cnVjdHVyZSA9IHZkb21UcmVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoKF9lMikge1xuXHRcdFx0XHRcdGxvZ0NvbnRleHQuY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50TmFtZSh2bm9kZVRvU2hvdylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBTaG93IHdoYXQncyBiZWluZyByZW1vdmVkIHZzIHdoYXQncyByZXBsYWNpbmcgaXQgKGlmIGJvdGggZXhpc3QpXG5cdFx0aWYgKGNvbnRleHQ/Lm9sZFZub2RlICYmIGNvbnRleHQ/Lm5ld1Zub2RlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvbGRUcmVlID0gZm9ybWF0VkRPTVRyZWUoY29udGV4dC5vbGRWbm9kZSwgMylcblx0XHRcdFx0Y29uc3QgbmV3VHJlZSA9IGZvcm1hdFZET01UcmVlKGNvbnRleHQubmV3Vm5vZGUsIDMpXG5cdFx0XHRcdGlmIChvbGRUcmVlKSBsb2dDb250ZXh0LnJlbW92aW5nID0gb2xkVHJlZVxuXHRcdFx0XHRpZiAobmV3VHJlZSkgbG9nQ29udGV4dC5yZXBsYWNpbmdXaXRoID0gbmV3VHJlZVxuXHRcdFx0fSBjYXRjaChfZSkge1xuXHRcdFx0XHQvLyBTaWxlbnRseSBmYWlsIGlmIGZvcm1hdHRpbmcgZG9lc24ndCB3b3JrXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRpZiAob3BlcmF0aW9uLmluY2x1ZGVzKCdyZW1vdmVDaGlsZCcpIHx8IG9wZXJhdGlvbi5pbmNsdWRlcygncmVtb3ZlRE9NJykpIHtcblx0XHRsb2dDb250ZXh0LmhhbmRsZWRHcmFjZWZ1bGx5ID0gdHJ1ZVxuXHR9XG5cdFxuXHRsb2dnZXIuZXJyb3IoYEh5ZHJhdGlvbiBlcnJvcjogJHtvcGVyYXRpb259YCwgZXJyb3IsIGxvZ0NvbnRleHQpXG59XG5cbi8vIFRyYWNrIGh5ZHJhdGlvbiBzdGF0aXN0aWNzIGZvciBkZWJ1Z2dpbmdcbmludGVyZmFjZSBIeWRyYXRpb25TdGF0cyB7XG5cdHRvdGFsTWlzbWF0Y2hlczogbnVtYmVyXG5cdGNvbXBvbmVudE1pc21hdGNoZXM6IE1hcDxzdHJpbmcsIG51bWJlcj5cblx0bGFzdE1pc21hdGNoVGltZTogbnVtYmVyXG59XG5cbmxldCBoeWRyYXRpb25TdGF0czogSHlkcmF0aW9uU3RhdHMgPSB7XG5cdHRvdGFsTWlzbWF0Y2hlczogMCxcblx0Y29tcG9uZW50TWlzbWF0Y2hlczogbmV3IE1hcCgpLFxuXHRsYXN0TWlzbWF0Y2hUaW1lOiAwLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SHlkcmF0aW9uU3RhdHMoKTogSHlkcmF0aW9uU3RhdHMge1xuXHRyZXR1cm4gey4uLmh5ZHJhdGlvblN0YXRzLCBjb21wb25lbnRNaXNtYXRjaGVzOiBuZXcgTWFwKGh5ZHJhdGlvblN0YXRzLmNvbXBvbmVudE1pc21hdGNoZXMpfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRIeWRyYXRpb25TdGF0cygpOiB2b2lkIHtcblx0aHlkcmF0aW9uU3RhdHMgPSB7XG5cdFx0dG90YWxNaXNtYXRjaGVzOiAwLFxuXHRcdGNvbXBvbmVudE1pc21hdGNoZXM6IG5ldyBNYXAoKSxcblx0XHRsYXN0TWlzbWF0Y2hUaW1lOiAwLFxuXHR9XG59XG5cbi8vIFVwZGF0ZSBzdGF0cyB3aGVuIGh5ZHJhdGlvbiBlcnJvciBvY2N1cnNcbmZ1bmN0aW9uIHVwZGF0ZUh5ZHJhdGlvblN0YXRzKHZub2RlOiBhbnkpOiB2b2lkIHtcblx0aHlkcmF0aW9uU3RhdHMudG90YWxNaXNtYXRjaGVzKytcblx0aHlkcmF0aW9uU3RhdHMubGFzdE1pc21hdGNoVGltZSA9IERhdGUubm93KClcblx0Y29uc3QgY29tcG9uZW50TmFtZSA9IGdldENvbXBvbmVudE5hbWUodm5vZGUpXG5cdGNvbnN0IGN1cnJlbnRDb3VudCA9IGh5ZHJhdGlvblN0YXRzLmNvbXBvbmVudE1pc21hdGNoZXMuZ2V0KGNvbXBvbmVudE5hbWUpIHx8IDBcblx0aHlkcmF0aW9uU3RhdHMuY29tcG9uZW50TWlzbWF0Y2hlcy5zZXQoY29tcG9uZW50TmFtZSwgY3VycmVudENvdW50ICsgMSlcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgbmV3IFdlYWtNYXA8Tm9kZSwgbnVtYmVyPigpXG4iLAogICAgImltcG9ydCBkZWxheWVkUmVtb3ZhbCBmcm9tICcuL2RlbGF5ZWRSZW1vdmFsJ1xuXG5pbXBvcnQgdHlwZSB7Vm5vZGV9IGZyb20gJy4vdm5vZGUnXG5cbmZ1bmN0aW9uKiBkb21Gb3Iodm5vZGU6IFZub2RlKTogR2VuZXJhdG9yPE5vZGUsIHZvaWQsIHVua25vd24+IHtcblx0Ly8gVG8gYXZvaWQgdW5pbnRlbmRlZCBtYW5nbGluZyBvZiB0aGUgaW50ZXJuYWwgYnVuZGxlcixcblx0Ly8gcGFyYW1ldGVyIGRlc3RydWN0dXJpbmcgaXMgbm90IHVzZWQgaGVyZS5cblx0bGV0IGRvbSA9IHZub2RlLmRvbVxuXHRsZXQgZG9tU2l6ZSA9IHZub2RlLmRvbVNpemVcblx0Y29uc3QgZ2VuZXJhdGlvbiA9IGRlbGF5ZWRSZW1vdmFsLmdldChkb20hKVxuXHRkbyB7XG5cdFx0Y29uc3QgbmV4dFNpYmxpbmcgPSBkb20hLm5leHRTaWJsaW5nXG5cblx0XHRpZiAoZGVsYXllZFJlbW92YWwuZ2V0KGRvbSEpID09PSBnZW5lcmF0aW9uKSB7XG5cdFx0XHR5aWVsZCBkb20hXG5cdFx0XHRkb21TaXplIS0tXG5cdFx0fVxuXG5cdFx0ZG9tID0gbmV4dFNpYmxpbmcgYXMgTm9kZSB8IG51bGxcblx0fVxuXHR3aGlsZSAoZG9tU2l6ZSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZG9tRm9yXG4iLAogICAgImltcG9ydCB7c2V0Q3VycmVudENvbXBvbmVudCwgY2xlYXJDdXJyZW50Q29tcG9uZW50LCBjbGVhckNvbXBvbmVudERlcGVuZGVuY2llc30gZnJvbSAnLi4vc2lnbmFsJ1xuaW1wb3J0IHtsb2dIeWRyYXRpb25FcnJvciwgcmVzZXRIeWRyYXRpb25FcnJvckNvdW50fSBmcm9tICcuLi91dGlsL3NzcidcbmltcG9ydCB7bG9nZ2VyfSBmcm9tICcuLi9zZXJ2ZXIvbG9nZ2VyJ1xuXG5pbXBvcnQgVm5vZGUgZnJvbSAnLi92bm9kZSdcbmltcG9ydCBkZWxheWVkUmVtb3ZhbCBmcm9tICcuL2RlbGF5ZWRSZW1vdmFsJ1xuaW1wb3J0IGRvbUZvciBmcm9tICcuL2RvbUZvcidcbmltcG9ydCBjYWNoZWRBdHRyc0lzU3RhdGljTWFwIGZyb20gJy4vY2FjaGVkQXR0cnNJc1N0YXRpY01hcCdcblxuaW1wb3J0IHR5cGUge1Zub2RlIGFzIFZub2RlVHlwZSwgQ2hpbGRyZW59IGZyb20gJy4vdm5vZGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlckZhY3RvcnkoKSB7XG5cdGNvbnN0IG5hbWVTcGFjZTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcblx0XHRzdmc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsXG5cdFx0bWF0aDogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUwnLFxuXHR9XG5cblx0bGV0IGN1cnJlbnRSZWRyYXc6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZFxuXHRsZXQgY3VycmVudFJlbmRlcjogYW55XG5cdC8vIFRyYWNrIGh5ZHJhdGlvbiBtaXNtYXRjaGVzIGZvciBvdmVycmlkZSBtb2RlXG5cdGxldCBoeWRyYXRpb25NaXNtYXRjaENvdW50ID0gMFxuXHRjb25zdCBNQVhfSFlEUkFUSU9OX01JU01BVENIRVMgPSA1XG5cblx0ZnVuY3Rpb24gZ2V0RG9jdW1lbnQoZG9tOiBOb2RlKTogRG9jdW1lbnQge1xuXHRcdHJldHVybiBkb20ub3duZXJEb2N1bWVudCFcblx0fVxuXG5cdGZ1bmN0aW9uIGdldE5hbWVTcGFjZSh2bm9kZTogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdm5vZGUuYXR0cnMgJiYgdm5vZGUuYXR0cnMueG1sbnMgfHwgbmFtZVNwYWNlW3Zub2RlLnRhZ11cblx0fVxuXG5cdC8vIHNhbml0eSBjaGVjayB0byBkaXNjb3VyYWdlIHBlb3BsZSBmcm9tIGRvaW5nIGB2bm9kZS5zdGF0ZSA9IC4uLmBcblx0ZnVuY3Rpb24gY2hlY2tTdGF0ZSh2bm9kZTogYW55LCBvcmlnaW5hbDogYW55KSB7XG5cdFx0aWYgKHZub2RlLnN0YXRlICE9PSBvcmlnaW5hbCkgdGhyb3cgbmV3IEVycm9yKCdcXCd2bm9kZS5zdGF0ZVxcJyBtdXN0IG5vdCBiZSBtb2RpZmllZC4nKVxuXHR9XG5cblx0Ly8gTm90ZTogdGhlIGhvb2sgaXMgcGFzc2VkIGFzIHRoZSBgdGhpc2AgYXJndW1lbnQgdG8gYWxsb3cgcHJveHlpbmcgdGhlXG5cdC8vIGFyZ3VtZW50cyB3aXRob3V0IHJlcXVpcmluZyBhIGZ1bGwgYXJyYXkgYWxsb2NhdGlvbiB0byBkbyBzby4gSXQgYWxzb1xuXHQvLyB0YWtlcyBhZHZhbnRhZ2Ugb2YgdGhlIGZhY3QgdGhlIGN1cnJlbnQgYHZub2RlYCBpcyB0aGUgZmlyc3QgYXJndW1lbnQgaW5cblx0Ly8gYWxsIGxpZmVjeWNsZSBtZXRob2RzLlxuXHRmdW5jdGlvbiBjYWxsSG9vayh0aGlzOiBhbnksIHZub2RlOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0aWYgKHRoaXMgPT0gbnVsbCB8fCB0eXBlb2YgdGhpcy5hcHBseSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Y29uc3QgdGFnTmFtZSA9IHR5cGVvZiB2bm9kZT8udGFnID09PSAnZnVuY3Rpb24nID8gdm5vZGUudGFnPy5uYW1lIDogdm5vZGU/LnRhZ1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgY2FsbEhvb2s6IGV4cGVjdGVkIGEgZnVuY3Rpb24gd2l0aCAuYXBwbHkgKGUuZy4gY29tcG9uZW50LnZpZXcpLCBnb3QgJHt0YWdOYW1lID8/IHZub2RlPy50YWd9LiBDaGVjayB0aGF0IHRoZSBjb21wb25lbnQgaGFzIGEgdmlldy5gKVxuXHRcdH1cblx0XHRjb25zdCBvcmlnaW5hbCA9IHZub2RlLnN0YXRlXG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB0aGlzLmFwcGx5KG9yaWdpbmFsLCBbdm5vZGUsIC4uLmFyZ3NdKVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRjaGVja1N0YXRlKHZub2RlLCBvcmlnaW5hbClcblx0XHR9XG5cdH1cblxuXHQvLyBJRTExIChhdCBsZWFzdCkgdGhyb3dzIGFuIFVuc3BlY2lmaWVkRXJyb3Igd2hlbiBhY2Nlc3NpbmcgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCB3aGVuXG5cdC8vIGluc2lkZSBhbiBpZnJhbWUuIENhdGNoIGFuZCBzd2FsbG93IHRoaXMgZXJyb3IsIGFuZCBoZWF2eS1oYW5kaWRseSByZXR1cm4gbnVsbC5cblx0ZnVuY3Rpb24gYWN0aXZlRWxlbWVudChkb206IE5vZGUpOiBFbGVtZW50IHwgbnVsbCB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBnZXREb2N1bWVudChkb20pLmFjdGl2ZUVsZW1lbnRcblx0XHR9IGNhdGNoKF9lKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxuXHQvLyBjcmVhdGVcblx0ZnVuY3Rpb24gY3JlYXRlTm9kZXMocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGVzOiAoVm5vZGVUeXBlIHwgbnVsbClbXSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0Ly8gVHJhY2sgd2hpY2ggRE9NIG5vZGVzIHdlJ3ZlIG1hdGNoZWQgZHVyaW5nIGh5ZHJhdGlvbiB0byBhdm9pZCByZXVzaW5nIHRoZSBzYW1lIG5vZGUgdHdpY2Vcblx0XHQvLyBDcmVhdGUgYSBuZXcgc2V0IGlmIG5vdCBwcm92aWRlZCBhbmQgd2UncmUgaHlkcmF0aW5nIGF0IHRoZSByb290IGxldmVsXG5cdFx0Y29uc3QgY3JlYXRlZE1hdGNoZWROb2RlcyA9IG1hdGNoZWROb2RlcyA9PSBudWxsICYmIGlzSHlkcmF0aW5nICYmIG5leHRTaWJsaW5nID09IG51bGxcblx0XHRpZiAoY3JlYXRlZE1hdGNoZWROb2Rlcykge1xuXHRcdFx0bWF0Y2hlZE5vZGVzID0gbmV3IFNldDxOb2RlPigpXG5cdFx0fVxuXHRcdGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHRjb25zdCB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0Y3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZywgbWF0Y2hlZE5vZGVzKVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBBZnRlciBjcmVhdGluZy9tYXRjaGluZyBhbGwgbm9kZXMsIHJlbW92ZSBhbnkgdW5tYXRjaGVkIG5vZGVzIHRoYXQgcmVtYWluXG5cdFx0Ly8gT25seSBkbyB0aGlzIGF0IHRoZSByb290IGxldmVsIHRvIGF2b2lkIHJlbW92aW5nIG5vZGVzIHRoYXQgYXJlIHBhcnQgb2YgbWF0Y2hlZCBzdWJ0cmVlc1xuXHRcdGlmIChjcmVhdGVkTWF0Y2hlZE5vZGVzICYmIG1hdGNoZWROb2RlcyAmJiBwYXJlbnQuZmlyc3RDaGlsZCAmJiBuZXh0U2libGluZyA9PSBudWxsKSB7XG5cdFx0XHRsZXQgbm9kZTogTm9kZSB8IG51bGwgPSBwYXJlbnQuZmlyc3RDaGlsZFxuXHRcdFx0d2hpbGUgKG5vZGUpIHtcblx0XHRcdFx0Y29uc3QgbmV4dDogTm9kZSB8IG51bGwgPSBub2RlLm5leHRTaWJsaW5nXG5cdFx0XHRcdGlmICghbWF0Y2hlZE5vZGVzLmhhcyhub2RlKSkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQobm9kZSlcblx0XHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGVycm9yID0gZSBhcyBFcnJvclxuXHRcdFx0XHRcdFx0bG9nSHlkcmF0aW9uRXJyb3IoXG5cdFx0XHRcdFx0XHRcdCdyZW1vdmVDaGlsZCAocm9vdCBsZXZlbCBjbGVhbnVwKScsXG5cdFx0XHRcdFx0XHRcdG51bGwsIC8vIE5vIHZub2RlIGF0IHJvb3QgbGV2ZWxcblx0XHRcdFx0XHRcdFx0cGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHR7cGFyZW50OiBwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogdW5kZWZpbmVkLCBub2RlLCBtYXRjaGVkTm9kZXN9LFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0Ly8gRG9uJ3QgcmUtdGhyb3cgLSB3ZSd2ZSBhbHJlYWR5IGxvZ2dlZCB0aGUgZXJyb3Igd2l0aCBhbGwgZGV0YWlsc1xuXHRcdFx0XHRcdFx0Ly8gUmUtdGhyb3dpbmcgY2F1c2VzIHRoZSBicm93c2VyIHRvIGxvZyB0aGUgRE9NRXhjZXB0aW9uIHN0YWNrIHRyYWNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdG5vZGUgPSBuZXh0XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UsIG1hdGNoZWROb2RlczogU2V0PE5vZGU+IHwgbnVsbCA9IG51bGwpIHtcblx0XHRjb25zdCB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAodHlwZW9mIHRhZyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHZub2RlLnN0YXRlID0ge31cblx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSBpbml0TGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdFx0c3dpdGNoICh0YWcpIHtcblx0XHRcdFx0Y2FzZSAnIyc6IGNyZWF0ZVRleHQocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nLCBtYXRjaGVkTm9kZXMpOyBicmVha1xuXHRcdFx0XHRjYXNlICc8JzogY3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBucywgbmV4dFNpYmxpbmcpOyBicmVha1xuXHRcdFx0XHRjYXNlICdbJzogY3JlYXRlRnJhZ21lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcyk7IGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6IGNyZWF0ZUVsZW1lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcylcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBjcmVhdGVDb21wb25lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcylcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVUZXh0KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSwgbWF0Y2hlZE5vZGVzOiBTZXQ8Tm9kZT4gfCBudWxsID0gbnVsbCkge1xuXHRcdGxldCB0ZXh0Tm9kZTogVGV4dFxuXHRcdGlmIChpc0h5ZHJhdGluZyAmJiBwYXJlbnQuZmlyc3RDaGlsZCAmJiBuZXh0U2libGluZyA9PSBudWxsICYmIG1hdGNoZWROb2Rlcykge1xuXHRcdFx0Ly8gRHVyaW5nIGh5ZHJhdGlvbiwgdHJ5IHRvIHJldXNlIGV4aXN0aW5nIHRleHQgbm9kZVxuXHRcdFx0Ly8gTm9ybWFsaXplIHRleHQgZm9yIGNvbXBhcmlzb24gKHRyaW0gd2hpdGVzcGFjZSBkaWZmZXJlbmNlcylcblx0XHRcdGNvbnN0IGV4cGVjdGVkVGV4dCA9IFN0cmluZyh2bm9kZS5jaGlsZHJlbiB8fCAnJykudHJpbSgpXG5cdFx0XHRsZXQgY2FuZGlkYXRlOiBOb2RlIHwgbnVsbCA9IHBhcmVudC5maXJzdENoaWxkXG5cdFx0XHR3aGlsZSAoY2FuZGlkYXRlKSB7XG5cdFx0XHRcdGlmIChjYW5kaWRhdGUubm9kZVR5cGUgPT09IDMgJiYgIW1hdGNoZWROb2Rlcy5oYXMoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbmRpZGF0ZVRleHQgPSBjYW5kaWRhdGUgYXMgVGV4dFxuXHRcdFx0XHRcdGNvbnN0IGNhbmRpZGF0ZVZhbHVlID0gY2FuZGlkYXRlVGV4dC5ub2RlVmFsdWUgfHwgJydcblx0XHRcdFx0XHQvLyBFeGFjdCBtYXRjaCBwcmVmZXJyZWQsIGJ1dCBhbHNvIGFjY2VwdCB0cmltbWVkIG1hdGNoIGZvciB3aGl0ZXNwYWNlIGRpZmZlcmVuY2VzXG5cdFx0XHRcdFx0aWYgKGNhbmRpZGF0ZVZhbHVlID09PSBTdHJpbmcodm5vZGUuY2hpbGRyZW4pIHx8IFxuXHRcdFx0XHRcdFx0KGV4cGVjdGVkVGV4dCAmJiBjYW5kaWRhdGVWYWx1ZS50cmltKCkgPT09IGV4cGVjdGVkVGV4dCkpIHtcblx0XHRcdFx0XHRcdHRleHROb2RlID0gY2FuZGlkYXRlVGV4dFxuXHRcdFx0XHRcdFx0bWF0Y2hlZE5vZGVzLmFkZCh0ZXh0Tm9kZSlcblx0XHRcdFx0XHRcdC8vIFVwZGF0ZSB0ZXh0IGNvbnRlbnQgaWYgdGhlcmUncyBhIG1pbm9yIGRpZmZlcmVuY2UgKHdoaXRlc3BhY2Ugbm9ybWFsaXphdGlvbilcblx0XHRcdFx0XHRcdGlmIChjYW5kaWRhdGVWYWx1ZSAhPT0gU3RyaW5nKHZub2RlLmNoaWxkcmVuKSkge1xuXHRcdFx0XHRcdFx0XHR0ZXh0Tm9kZS5ub2RlVmFsdWUgPSBTdHJpbmcodm5vZGUuY2hpbGRyZW4pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBEb24ndCByZW1vdmUvcmVpbnNlcnQgLSBqdXN0IHJldXNlIHRoZSBleGlzdGluZyBub2RlIGluIHBsYWNlXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjYW5kaWRhdGUgPSBjYW5kaWRhdGUubmV4dFNpYmxpbmdcblx0XHRcdH1cblx0XHRcdC8vIElmIG5vIG1hdGNoaW5nIHRleHQgbm9kZSBmb3VuZCwgY3JlYXRlIG5ldyBvbmVcblx0XHRcdGlmICghdGV4dE5vZGUhKSB7XG5cdFx0XHRcdHRleHROb2RlID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZVRleHROb2RlKHZub2RlLmNoaWxkcmVuKVxuXHRcdFx0XHRpbnNlcnRET00ocGFyZW50LCB0ZXh0Tm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRleHROb2RlID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZVRleHROb2RlKHZub2RlLmNoaWxkcmVuKVxuXHRcdFx0aW5zZXJ0RE9NKHBhcmVudCwgdGV4dE5vZGUsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSB0ZXh0Tm9kZVxuXHR9XG5cdGNvbnN0IHBvc3NpYmxlUGFyZW50czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtjYXB0aW9uOiAndGFibGUnLCB0aGVhZDogJ3RhYmxlJywgdGJvZHk6ICd0YWJsZScsIHRmb290OiAndGFibGUnLCB0cjogJ3Rib2R5JywgdGg6ICd0cicsIHRkOiAndHInLCBjb2xncm91cDogJ3RhYmxlJywgY29sOiAnY29sZ3JvdXAnfVxuXHRmdW5jdGlvbiBjcmVhdGVIVE1MKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCkge1xuXHRcdGNvbnN0IG1hdGNoID0gdm5vZGUuY2hpbGRyZW4ubWF0Y2goL15cXHMqPzwoXFx3KykvaW0pIHx8IFtdXG5cdFx0Ly8gbm90IHVzaW5nIHRoZSBwcm9wZXIgcGFyZW50IG1ha2VzIHRoZSBjaGlsZCBlbGVtZW50KHMpIHZhbmlzaC5cblx0XHQvLyAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcblx0XHQvLyAgICAgZGl2LmlubmVySFRNTCA9IFwiPHRkPmk8L3RkPjx0ZD5qPC90ZD5cIlxuXHRcdC8vICAgICBjb25zb2xlLmxvZyhkaXYuaW5uZXJIVE1MKVxuXHRcdC8vIC0tPiBcImlqXCIsIG5vIDx0ZD4gaW4gc2lnaHQuXG5cdFx0bGV0IHRlbXAgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRWxlbWVudChwb3NzaWJsZVBhcmVudHNbbWF0Y2hbMV1dIHx8ICdkaXYnKVxuXHRcdGlmIChucyA9PT0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJykge1xuXHRcdFx0dGVtcC5pbm5lckhUTUwgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+JyArIHZub2RlLmNoaWxkcmVuICsgJzwvc3ZnPidcblx0XHRcdHRlbXAgPSB0ZW1wLmZpcnN0Q2hpbGQgYXMgSFRNTEVsZW1lbnRcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGVtcC5pbm5lckhUTUwgPSB2bm9kZS5jaGlsZHJlblxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSB0ZW1wLmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gdGVtcC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdGNvbnN0IGZyYWdtZW50ID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdGxldCBjaGlsZDogTm9kZSB8IG51bGxcblx0XHR3aGlsZSAoKGNoaWxkID0gdGVtcC5maXJzdENoaWxkKSAhPSBudWxsKSB7XG5cdFx0XHRmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZClcblx0XHR9XG5cdFx0aW5zZXJ0RE9NKHBhcmVudCwgZnJhZ21lbnQsIG5leHRTaWJsaW5nKVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUZyYWdtZW50KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0Y29uc3QgZnJhZ21lbnQgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0aWYgKHZub2RlLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGNyZWF0ZU5vZGVzKGZyYWdtZW50LCBjaGlsZHJlbiwgMCwgY2hpbGRyZW4ubGVuZ3RoLCBob29rcywgbnVsbCwgbnMsIGlzSHlkcmF0aW5nLCBtYXRjaGVkTm9kZXMpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IGZyYWdtZW50LmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGhcblx0XHRpbnNlcnRET00ocGFyZW50LCBmcmFnbWVudCwgbmV4dFNpYmxpbmcpXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlRWxlbWVudChwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSwgbWF0Y2hlZE5vZGVzOiBTZXQ8Tm9kZT4gfCBudWxsID0gbnVsbCkge1xuXHRcdGNvbnN0IHRhZyA9IHZub2RlLnRhZ1xuXHRcdGNvbnN0IGF0dHJzID0gdm5vZGUuYXR0cnNcblx0XHRjb25zdCBpcyA9IHZub2RlLmlzXG5cblx0XHRucyA9IGdldE5hbWVTcGFjZSh2bm9kZSkgfHwgbnNcblxuXHRcdGxldCBlbGVtZW50OiBFbGVtZW50XG5cdFx0aWYgKGlzSHlkcmF0aW5nICYmIHBhcmVudC5maXJzdENoaWxkICYmIG5leHRTaWJsaW5nID09IG51bGwgJiYgbWF0Y2hlZE5vZGVzKSB7XG5cdFx0XHQvLyBEdXJpbmcgaHlkcmF0aW9uLCB0cnkgdG8gcmV1c2UgZXhpc3RpbmcgRE9NIG5vZGVcblx0XHRcdC8vIE9ubHkgbWF0Y2ggaWYgd2UncmUgYXBwZW5kaW5nIChuZXh0U2libGluZyA9PSBudWxsKSB0byBwcmVzZXJ2ZSBvcmRlclxuXHRcdFx0Ly8gRmluZCB0aGUgZmlyc3QgdW5tYXRjaGVkIGNoaWxkIGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSB0YWdcblx0XHRcdC8vIE1vcmUgbGVuaWVudCBtYXRjaGluZzogc2tpcCB0ZXh0IG5vZGVzIGFuZCBjb21tZW50cywgYWxsb3cgdGFnIG5hbWUgY2FzZSBkaWZmZXJlbmNlc1xuXHRcdFx0bGV0IGNhbmRpZGF0ZTogTm9kZSB8IG51bGwgPSBwYXJlbnQuZmlyc3RDaGlsZFxuXHRcdFx0bGV0IGZhbGxiYWNrQ2FuZGlkYXRlOiBFbGVtZW50IHwgbnVsbCA9IG51bGxcblx0XHRcdHdoaWxlIChjYW5kaWRhdGUpIHtcblx0XHRcdFx0Ly8gU2tpcCB0ZXh0IG5vZGVzLCBjb21tZW50cywgYW5kIGFscmVhZHkgbWF0Y2hlZCBub2Rlc1xuXHRcdFx0XHRpZiAoY2FuZGlkYXRlLm5vZGVUeXBlID09PSAxICYmICFtYXRjaGVkTm9kZXMuaGFzKGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0XHRjb25zdCBjYW5kaWRhdGVFbCA9IGNhbmRpZGF0ZSBhcyBFbGVtZW50XG5cdFx0XHRcdFx0Ly8gQ2FzZS1pbnNlbnNpdGl2ZSB0YWcgbWF0Y2hpbmcgKGJyb3dzZXJzIG5vcm1hbGl6ZSB0byB1cHBlcmNhc2UgZm9yIHNvbWUgdGFncylcblx0XHRcdFx0XHQvLyBVc2UgdGFnTmFtZSBpZiBhdmFpbGFibGUsIGZhbGxiYWNrIHRvIG5vZGVOYW1lIChmb3IgRE9NIG1vY2tzKVxuXHRcdFx0XHRcdGNvbnN0IGNhbmRpZGF0ZVRhZyA9IChjYW5kaWRhdGVFbCBhcyBhbnkpLnRhZ05hbWUgfHwgY2FuZGlkYXRlRWwubm9kZU5hbWVcblx0XHRcdFx0XHRpZiAoY2FuZGlkYXRlVGFnICYmIGNhbmRpZGF0ZVRhZy50b0xvd2VyQ2FzZSgpID09PSB0YWcudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdFx0Ly8gUHJlZmVyIGV4YWN0IG1hdGNoIChpcyBhdHRyaWJ1dGUgbWF0Y2hlcyBpZiBzcGVjaWZpZWQpXG5cdFx0XHRcdFx0XHRpZiAoIWlzIHx8IGNhbmRpZGF0ZUVsLmdldEF0dHJpYnV0ZSgnaXMnKSA9PT0gaXMpIHtcblx0XHRcdFx0XHRcdFx0ZWxlbWVudCA9IGNhbmRpZGF0ZUVsXG5cdFx0XHRcdFx0XHRcdG1hdGNoZWROb2Rlcy5hZGQoZWxlbWVudClcblx0XHRcdFx0XHRcdFx0Ly8gRG9uJ3QgcmVtb3ZlL3JlaW5zZXJ0IC0ganVzdCByZXVzZSB0aGUgZXhpc3Rpbmcgbm9kZSBpbiBwbGFjZVxuXHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gS2VlcCB0cmFjayBvZiBmaXJzdCBtYXRjaGluZyB0YWcgYXMgZmFsbGJhY2sgKGV2ZW4gaWYgaXMgYXR0cmlidXRlIGRvZXNuJ3QgbWF0Y2gpXG5cdFx0XHRcdFx0XHRpZiAoIWZhbGxiYWNrQ2FuZGlkYXRlKSB7XG5cdFx0XHRcdFx0XHRcdGZhbGxiYWNrQ2FuZGlkYXRlID0gY2FuZGlkYXRlRWxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FuZGlkYXRlID0gY2FuZGlkYXRlLm5leHRTaWJsaW5nXG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBubyBleGFjdCBtYXRjaCBmb3VuZCBidXQgd2UgaGF2ZSBhIGZhbGxiYWNrLCB1c2UgaXRcblx0XHRcdC8vIFRoaXMgaGFuZGxlcyBjYXNlcyB3aGVyZSBpcyBhdHRyaWJ1dGUgZGlmZmVycyBidXQgdGFnIG1hdGNoZXNcblx0XHRcdGlmICghZWxlbWVudCEgJiYgZmFsbGJhY2tDYW5kaWRhdGUpIHtcblx0XHRcdFx0ZWxlbWVudCA9IGZhbGxiYWNrQ2FuZGlkYXRlXG5cdFx0XHRcdG1hdGNoZWROb2Rlcy5hZGQoZWxlbWVudClcblx0XHRcdH1cblx0XHRcdC8vIElmIHN0aWxsIG5vIG1hdGNoaW5nIGVsZW1lbnQgZm91bmQsIGNyZWF0ZSBuZXcgb25lXG5cdFx0XHRpZiAoIWVsZW1lbnQhKSB7XG5cdFx0XHRcdGVsZW1lbnQgPSBucyA/XG5cdFx0XHRcdFx0aXMgPyBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcsIHtpczogaXN9IGFzIGFueSkgOiBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcpIDpcblx0XHRcdFx0XHRpcyA/IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZywge2lzOiBpc30gYXMgYW55KSA6IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZylcblx0XHRcdFx0aW5zZXJ0RE9NKHBhcmVudCwgZWxlbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE5vcm1hbCBjcmVhdGlvbiBwYXRoXG5cdFx0XHRlbGVtZW50ID0gbnMgP1xuXHRcdFx0XHRpcyA/IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50TlMobnMsIHRhZywge2lzOiBpc30gYXMgYW55KSA6IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50TlMobnMsIHRhZykgOlxuXHRcdFx0XHRpcyA/IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZywge2lzOiBpc30gYXMgYW55KSA6IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZylcblx0XHRcdGluc2VydERPTShwYXJlbnQsIGVsZW1lbnQsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSBlbGVtZW50XG5cblx0XHRpZiAoYXR0cnMgIT0gbnVsbCkge1xuXHRcdFx0c2V0QXR0cnModm5vZGUsIGF0dHJzLCBucylcblx0XHR9XG5cblx0XHRpZiAoIW1heWJlU2V0Q29udGVudEVkaXRhYmxlKHZub2RlKSkge1xuXHRcdFx0aWYgKHZub2RlLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0XHQvLyBEdXJpbmcgaHlkcmF0aW9uLCBpZiB3ZSByZXVzZWQgYW4gZWxlbWVudCwgaXQgYWxyZWFkeSBoYXMgY2hpbGRyZW5cblx0XHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1hdGNoZWROb2RlcyBzZXQgZm9yIHRoaXMgZWxlbWVudCdzIGNoaWxkcmVuIHRvIGF2b2lkIGR1cGxpY2F0ZXNcblx0XHRcdFx0Y29uc3QgY2hpbGRNYXRjaGVkTm9kZXMgPSAoaXNIeWRyYXRpbmcgJiYgZWxlbWVudC5maXJzdENoaWxkKSA/IG5ldyBTZXQ8Tm9kZT4oKSA6IG51bGxcblx0XHRcdFx0Y3JlYXRlTm9kZXMoZWxlbWVudCwgY2hpbGRyZW4sIDAsIGNoaWxkcmVuLmxlbmd0aCwgaG9va3MsIG51bGwsIG5zLCBpc0h5ZHJhdGluZywgY2hpbGRNYXRjaGVkTm9kZXMpXG5cdFx0XHRcdC8vIEFmdGVyIGNyZWF0aW5nL21hdGNoaW5nIGNoaWxkcmVuLCByZW1vdmUgYW55IHVubWF0Y2hlZCBub2RlcyB0aGF0IHJlbWFpblxuXHRcdFx0XHQvLyBPbmx5IHJlbW92ZSB1bm1hdGNoZWQgbm9kZXMgaWYgd2UgYWN0dWFsbHkgbWF0Y2hlZCBzb21lIG5vZGVzICh0byBhdm9pZCBjbGVhcmluZyBldmVyeXRoaW5nKVxuXHRcdFx0XHRpZiAoaXNIeWRyYXRpbmcgJiYgY2hpbGRNYXRjaGVkTm9kZXMgJiYgZWxlbWVudC5maXJzdENoaWxkICYmIGNoaWxkTWF0Y2hlZE5vZGVzLnNpemUgPiAwKSB7XG5cdFx0XHRcdFx0bGV0IG5vZGU6IE5vZGUgfCBudWxsID0gZWxlbWVudC5maXJzdENoaWxkXG5cdFx0XHRcdFx0d2hpbGUgKG5vZGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG5leHQ6IE5vZGUgfCBudWxsID0gbm9kZS5uZXh0U2libGluZ1xuXHRcdFx0XHRcdFx0aWYgKCFjaGlsZE1hdGNoZWROb2Rlcy5oYXMobm9kZSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gVmVyaWZ5IG5vZGUgaXMgc3RpbGwgYSBjaGlsZCBiZWZvcmUgYXR0ZW1wdGluZyByZW1vdmFsXG5cdFx0XHRcdFx0XHRcdGlmIChlbGVtZW50LmNvbnRhaW5zICYmIGVsZW1lbnQuY29udGFpbnMobm9kZSkpIHtcblx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxlbWVudC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0XHRcdFx0XHRcdFx0aHlkcmF0aW9uTWlzbWF0Y2hDb3VudCsrXG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBlcnJvciA9IGUgYXMgRXJyb3Jcblx0XHRcdFx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIG5vZGUgd2FzIGFscmVhZHkgcmVtb3ZlZCAobm90IGEgY2hpbGQgYW55bW9yZSlcblx0XHRcdFx0XHRcdFx0XHRcdGlmICghZWxlbWVudC5jb250YWlucyB8fCAhZWxlbWVudC5jb250YWlucyhub2RlKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBOb2RlIGFscmVhZHkgcmVtb3ZlZCwgc2tpcCBzaWxlbnRseVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRub2RlID0gbmV4dFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aHlkcmF0aW9uTWlzbWF0Y2hDb3VudCsrXG5cdFx0XHRcdFx0XHRcdFx0XHRsb2dIeWRyYXRpb25FcnJvcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0J3JlbW92ZUNoaWxkIChlbGVtZW50IGNoaWxkcmVuIGNsZWFudXApJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0dm5vZGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cGFyZW50OiBlbGVtZW50LCBub2RlLCBtYXRjaGVkTm9kZXM6IGNoaWxkTWF0Y2hlZE5vZGVzfSxcblx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHRcdC8vIERvbid0IHJlLXRocm93IC0gd2UndmUgYWxyZWFkeSBsb2dnZWQgdGhlIGVycm9yIHdpdGggYWxsIGRldGFpbHNcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFJlLXRocm93aW5nIGNhdXNlcyB0aGUgYnJvd3NlciB0byBsb2cgdGhlIERPTUV4Y2VwdGlvbiBzdGFjayB0cmFjZVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvLyBOb2RlIG5vdCBpbiBwYXJlbnQsIGFscmVhZHkgcmVtb3ZlZCAtIHNraXAgc2lsZW50bHlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5vZGUgPSBuZXh0XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdzZWxlY3QnICYmIGF0dHJzICE9IG51bGwpIHNldExhdGVTZWxlY3RBdHRycyh2bm9kZSwgYXR0cnMpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGluaXRDb21wb25lbnQodm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0bGV0IHNlbnRpbmVsOiBhbnlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZy52aWV3ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IE9iamVjdC5jcmVhdGUodm5vZGUudGFnKVxuXHRcdFx0c2VudGluZWwgPSB2bm9kZS5zdGF0ZS52aWV3XG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuXG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0dm5vZGUuc3RhdGUgPSB2b2lkIDBcblx0XHRcdHNlbnRpbmVsID0gdm5vZGUudGFnXG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuXG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHRcdHZub2RlLnN0YXRlID0gKHZub2RlLnRhZy5wcm90b3R5cGUgIT0gbnVsbCAmJiB0eXBlb2Ygdm5vZGUudGFnLnByb3RvdHlwZS52aWV3ID09PSAnZnVuY3Rpb24nKSA/IG5ldyB2bm9kZS50YWcodm5vZGUpIDogdm5vZGUudGFnKHZub2RlKVxuXHRcdH1cblx0XHRpbml0TGlmZWN5Y2xlKHZub2RlLnN0YXRlLCB2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSBpbml0TGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdFxuXHRcdC8vIFRyYWNrIGNvbXBvbmVudCBmb3Igc2lnbmFsIGRlcGVuZGVuY3kgdHJhY2tpbmdcblx0XHQvLyBTdG9yZSBtYXBwaW5nIGZyb20gdm5vZGUuc3RhdGUgdG8gdm5vZGUudGFnIChjb21wb25lbnQgb2JqZWN0KSBmb3IgcmVkcmF3XG5cdFx0aWYgKHZub2RlLnN0YXRlICYmIHZub2RlLnRhZyAmJiAhaXNIeWRyYXRpbmcpIHtcblx0XHRcdDsoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Db21wb25lbnQgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Db21wb25lbnQgfHwgbmV3IFdlYWtNYXAoKVxuXHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudC5zZXQodm5vZGUuc3RhdGUsIHZub2RlLnRhZylcblx0XHR9XG5cdFx0Ly8gQWx3YXlzIHRyYWNrIGNvbXBvbmVudCBkZXBlbmRlbmNpZXMgZm9yIHNpZ25hbCB0cmFja2luZyAoZXZlbiBkdXJpbmcgaHlkcmF0aW9uKVxuXHRcdC8vIFRoaXMgYWxsb3dzIHNpZ25hbHMgdG8ga25vdyB3aGljaCBjb21wb25lbnRzIGRlcGVuZCBvbiB0aGVtXG5cdFx0Ly8gV2Ugb25seSBza2lwIG9uaW5pdCBkdXJpbmcgaHlkcmF0aW9uLCBub3Qgc2lnbmFsIHRyYWNraW5nXG5cdFx0Ly8gT25seSBzZXQgY3VycmVudENvbXBvbmVudCBpZiB2bm9kZS5zdGF0ZSBleGlzdHMgKGl0IG1pZ2h0IGJlIHVuZGVmaW5lZCBmb3Igc29tZSBjb21wb25lbnQgdHlwZXMpXG5cdFx0aWYgKHZub2RlLnN0YXRlICE9IG51bGwpIHtcblx0XHRcdHNldEN1cnJlbnRDb21wb25lbnQodm5vZGUuc3RhdGUpXG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHR2bm9kZS5pbnN0YW5jZSA9IFZub2RlLm5vcm1hbGl6ZShjYWxsSG9vay5jYWxsKHZub2RlLnN0YXRlLnZpZXcsIHZub2RlKSlcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKHZub2RlLnN0YXRlICE9IG51bGwpIHtcblx0XHRcdFx0Y2xlYXJDdXJyZW50Q29tcG9uZW50KClcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHZub2RlLmluc3RhbmNlID09PSB2bm9kZSkgdGhyb3cgRXJyb3IoJ0EgdmlldyBjYW5ub3QgcmV0dXJuIHRoZSB2bm9kZSBpdCByZWNlaXZlZCBhcyBhcmd1bWVudCcpXG5cdFx0c2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgPSBudWxsXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0aW5pdENvbXBvbmVudCh2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSB7XG5cdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nLCBtYXRjaGVkTm9kZXMpXG5cdFx0XHR2bm9kZS5kb20gPSB2bm9kZS5pbnN0YW5jZS5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSB2bm9kZS5pbnN0YW5jZS5kb21TaXplXG5cdFx0XHRcblx0XHRcdC8vIFN0b3JlIGNvbXBvbmVudCdzIERPTSBlbGVtZW50IGZvciBmaW5lLWdyYWluZWQgcmVkcmF3IChub3QgZHVyaW5nIGh5ZHJhdGlvbilcblx0XHRcdGlmICh2bm9kZS5zdGF0ZSAmJiB2bm9kZS5kb20gJiYgIWlzSHlkcmF0aW5nKSB7XG5cdFx0XHRcdDsoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gfHwgbmV3IFdlYWtNYXAoKVxuXHRcdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tLnNldCh2bm9kZS5zdGF0ZSwgdm5vZGUuZG9tKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbVNpemUgPSAwXG5cdFx0fVxuXHR9XG5cblx0Ly8gdXBkYXRlXG5cdGZ1bmN0aW9uIHVwZGF0ZU5vZGVzKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIG9sZDogKFZub2RlVHlwZSB8IG51bGwpW10gfCBudWxsLCB2bm9kZXM6IChWbm9kZVR5cGUgfCBudWxsKVtdIHwgbnVsbCwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRpZiAob2xkID09PSB2bm9kZXMgfHwgb2xkID09IG51bGwgJiYgdm5vZGVzID09IG51bGwpIHJldHVyblxuXHRcdGVsc2UgaWYgKG9sZCA9PSBudWxsIHx8IG9sZC5sZW5ndGggPT09IDApIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzISwgMCwgdm5vZGVzIS5sZW5ndGgsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdGVsc2UgaWYgKHZub2RlcyA9PSBudWxsIHx8IHZub2Rlcy5sZW5ndGggPT09IDApIHJlbW92ZU5vZGVzKHBhcmVudCwgb2xkLCAwLCBvbGQubGVuZ3RoKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgaXNPbGRLZXllZCA9IG9sZFswXSAhPSBudWxsICYmIG9sZFswXSEua2V5ICE9IG51bGxcblx0XHRcdGNvbnN0IGlzS2V5ZWQgPSB2bm9kZXNbMF0gIT0gbnVsbCAmJiB2bm9kZXNbMF0hLmtleSAhPSBudWxsXG5cdFx0XHRsZXQgc3RhcnQgPSAwLCBvbGRTdGFydCA9IDAsIG86IGFueSwgdjogYW55XG5cdFx0XHRpZiAoaXNPbGRLZXllZCAhPT0gaXNLZXllZCkge1xuXHRcdFx0XHRyZW1vdmVOb2RlcyhwYXJlbnQsIG9sZCwgMCwgb2xkLmxlbmd0aClcblx0XHRcdFx0Y3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIDAsIHZub2Rlcy5sZW5ndGgsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0fSBlbHNlIGlmICghaXNLZXllZCkge1xuXHRcdFx0XHQvLyBEb24ndCBpbmRleCBwYXN0IHRoZSBlbmQgb2YgZWl0aGVyIGxpc3QgKGNhdXNlcyBkZW9wdHMpLlxuXHRcdFx0XHRjb25zdCBjb21tb25MZW5ndGggPSBvbGQubGVuZ3RoIDwgdm5vZGVzLmxlbmd0aCA/IG9sZC5sZW5ndGggOiB2bm9kZXMubGVuZ3RoXG5cdFx0XHRcdC8vIFJld2luZCBpZiBuZWNlc3NhcnkgdG8gdGhlIGZpcnN0IG5vbi1udWxsIGluZGV4IG9uIGVpdGhlciBzaWRlLlxuXHRcdFx0XHQvLyBXZSBjb3VsZCBhbHRlcm5hdGl2ZWx5IGVpdGhlciBleHBsaWNpdGx5IGNyZWF0ZSBvciByZW1vdmUgbm9kZXMgd2hlbiBgc3RhcnQgIT09IG9sZFN0YXJ0YFxuXHRcdFx0XHQvLyBidXQgdGhhdCB3b3VsZCBiZSBvcHRpbWl6aW5nIGZvciBzcGFyc2UgbGlzdHMgd2hpY2ggYXJlIG1vcmUgcmFyZSB0aGFuIGRlbnNlIG9uZXMuXG5cdFx0XHRcdHdoaWxlIChvbGRTdGFydCA8IG9sZC5sZW5ndGggJiYgb2xkW29sZFN0YXJ0XSA9PSBudWxsKSBvbGRTdGFydCsrXG5cdFx0XHRcdHdoaWxlIChzdGFydCA8IHZub2Rlcy5sZW5ndGggJiYgdm5vZGVzW3N0YXJ0XSA9PSBudWxsKSBzdGFydCsrXG5cdFx0XHRcdHN0YXJ0ID0gc3RhcnQgPCBvbGRTdGFydCA/IHN0YXJ0IDogb2xkU3RhcnRcblx0XHRcdFx0Zm9yICg7IHN0YXJ0IDwgY29tbW9uTGVuZ3RoOyBzdGFydCsrKSB7XG5cdFx0XHRcdFx0byA9IG9sZFtzdGFydF1cblx0XHRcdFx0XHR2ID0gdm5vZGVzW3N0YXJ0XVxuXHRcdFx0XHRcdGlmIChvID09PSB2IHx8IG8gPT0gbnVsbCAmJiB2ID09IG51bGwpIGNvbnRpbnVlXG5cdFx0XHRcdFx0ZWxzZSBpZiAobyA9PSBudWxsKSBjcmVhdGVOb2RlKHBhcmVudCwgdiwgaG9va3MsIG5zLCBnZXROZXh0U2libGluZyhvbGQsIHN0YXJ0ICsgMSwgb2xkLmxlbmd0aCwgbmV4dFNpYmxpbmcpLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0XHRlbHNlIGlmICh2ID09IG51bGwpIHJlbW92ZU5vZGUocGFyZW50LCBvKVxuXHRcdFx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG8sIHYsIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIHN0YXJ0ICsgMSwgb2xkLmxlbmd0aCwgbmV4dFNpYmxpbmcpLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9sZC5sZW5ndGggPiBjb21tb25MZW5ndGgpIHJlbW92ZU5vZGVzKHBhcmVudCwgb2xkLCBzdGFydCwgb2xkLmxlbmd0aClcblx0XHRcdFx0aWYgKHZub2Rlcy5sZW5ndGggPiBjb21tb25MZW5ndGgpIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgdm5vZGVzLmxlbmd0aCwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBrZXllZCBkaWZmXG5cdFx0XHRcdGxldCBvbGRFbmQgPSBvbGQubGVuZ3RoIC0gMSwgZW5kID0gdm5vZGVzLmxlbmd0aCAtIDEsIG9lOiBhbnksIHZlOiBhbnksIHRvcFNpYmxpbmc6IE5vZGUgfCBudWxsXG5cblx0XHRcdFx0Ly8gYm90dG9tLXVwXG5cdFx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdFx0b2UgPSBvbGRbb2xkRW5kXVxuXHRcdFx0XHRcdHZlID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0XHRpZiAob2UgPT0gbnVsbCB8fCB2ZSA9PSBudWxsIHx8IG9lLmtleSAhPT0gdmUua2V5KSBicmVha1xuXHRcdFx0XHRcdGlmIChvZSAhPT0gdmUpIHVwZGF0ZU5vZGUocGFyZW50LCBvZSwgdmUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRvbGRFbmQtLSwgZW5kLS1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyB0b3AtZG93blxuXHRcdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHRcdG8gPSBvbGRbb2xkU3RhcnRdXG5cdFx0XHRcdFx0diA9IHZub2Rlc1tzdGFydF1cblx0XHRcdFx0XHRpZiAobyA9PSBudWxsIHx8IHYgPT0gbnVsbCB8fCBvLmtleSAhPT0gdi5rZXkpIGJyZWFrXG5cdFx0XHRcdFx0b2xkU3RhcnQrKywgc3RhcnQrK1xuXHRcdFx0XHRcdGlmIChvICE9PSB2KSB1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEsIG5leHRTaWJsaW5nKSwgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHN3YXBzIGFuZCBsaXN0IHJldmVyc2Fsc1xuXHRcdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHRcdGlmIChzdGFydCA9PT0gZW5kKSBicmVha1xuXHRcdFx0XHRcdG8gPSBvbGRbb2xkU3RhcnRdXG5cdFx0XHRcdFx0dmUgPSB2bm9kZXNbZW5kXVxuXHRcdFx0XHRcdG9lID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHR2ID0gdm5vZGVzW3N0YXJ0XVxuXHRcdFx0XHRcdGlmIChvID09IG51bGwgfHwgdmUgPT0gbnVsbCB8fCBvZSA9PSBudWxsIHx8IHYgPT0gbnVsbCB8fCBvLmtleSAhPT0gdmUua2V5IHx8IG9lLmtleSAhPT0gdi5rZXkpIGJyZWFrXG5cdFx0XHRcdFx0dG9wU2libGluZyA9IGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG9sZEVuZCwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0bW92ZURPTShwYXJlbnQsIG9lLCB0b3BTaWJsaW5nKVxuXHRcdFx0XHRcdGlmIChvZSAhPT0gdikgdXBkYXRlTm9kZShwYXJlbnQsIG9lLCB2LCBob29rcywgdG9wU2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICgrK3N0YXJ0IDw9IC0tZW5kKSBtb3ZlRE9NKHBhcmVudCwgbywgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0aWYgKG8gIT09IHZlKSB1cGRhdGVOb2RlKHBhcmVudCwgbywgdmUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRvbGRTdGFydCsrOyBvbGRFbmQtLVxuXHRcdFx0XHRcdG9lID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tlbmRdXG5cdFx0XHRcdFx0byA9IG9sZFtvbGRTdGFydF1cblx0XHRcdFx0XHR2ID0gdm5vZGVzW3N0YXJ0XVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGJvdHRvbSB1cCBvbmNlIGFnYWluXG5cdFx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdFx0b2UgPSBvbGRbb2xkRW5kXVxuXHRcdFx0XHRcdHZlID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0XHRpZiAob2UgPT0gbnVsbCB8fCB2ZSA9PSBudWxsIHx8IG9lLmtleSAhPT0gdmUua2V5KSBicmVha1xuXHRcdFx0XHRcdGlmIChvZSAhPT0gdmUpIHVwZGF0ZU5vZGUocGFyZW50LCBvZSwgdmUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRvbGRFbmQtLSwgZW5kLS1cblx0XHRcdFx0XHRvZSA9IG9sZFtvbGRFbmRdXG5cdFx0XHRcdFx0dmUgPSB2bm9kZXNbZW5kXVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzdGFydCA+IGVuZCkgcmVtb3ZlTm9kZXMocGFyZW50LCBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQgKyAxKVxuXHRcdFx0XHRlbHNlIGlmIChvbGRTdGFydCA+IG9sZEVuZCkgY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIHN0YXJ0LCBlbmQgKyAxLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaW5zcGlyZWQgYnkgaXZpIGh0dHBzOi8vZ2l0aHViLmNvbS9pdmlqcy9pdmkvIGJ5IEJvcmlzIEthdWxcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbE5leHRTaWJsaW5nID0gbmV4dFNpYmxpbmdcblx0XHRcdFx0XHRsZXQgcG9zID0gMjE0NzQ4MzY0NywgbWF0Y2hlZCA9IDBcblx0XHRcdFx0XHRjb25zdCBvbGRJbmRpY2VzID0gbmV3IEFycmF5KGVuZCAtIHN0YXJ0ICsgMSkuZmlsbCgtMSlcblx0XHRcdFx0XHRjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAodm5vZGVzW2ldICE9IG51bGwpIG1hcFt2bm9kZXNbaV0hLmtleSFdID0gaVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3IgKGxldCBpID0gb2xkRW5kOyBpID49IG9sZFN0YXJ0OyBpLS0pIHtcblx0XHRcdFx0XHRcdG9lID0gb2xkW2ldXG5cdFx0XHRcdFx0XHRpZiAob2UgPT0gbnVsbCkgY29udGludWVcblx0XHRcdFx0XHRcdGNvbnN0IG5ld0luZGV4ID0gbWFwW29lLmtleSFdXG5cdFx0XHRcdFx0XHRpZiAobmV3SW5kZXggIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRwb3MgPSAobmV3SW5kZXggPCBwb3MpID8gbmV3SW5kZXggOiAtMSAvLyBiZWNvbWVzIC0xIGlmIG5vZGVzIHdlcmUgcmUtb3JkZXJlZFxuXHRcdFx0XHRcdFx0XHRvbGRJbmRpY2VzW25ld0luZGV4IC0gc3RhcnRdID0gaVxuXHRcdFx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tuZXdJbmRleF1cblx0XHRcdFx0XHRcdFx0b2xkW2ldID0gbnVsbFxuXHRcdFx0XHRcdFx0XHRpZiAob2UgIT09IHZlKSB1cGRhdGVOb2RlKHBhcmVudCwgb2UsIHZlLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0XHRcdFx0aWYgKHZlICE9IG51bGwgJiYgdmUuZG9tICE9IG51bGwpIG5leHRTaWJsaW5nID0gdmUuZG9tXG5cdFx0XHRcdFx0XHRcdG1hdGNoZWQrK1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRuZXh0U2libGluZyA9IG9yaWdpbmFsTmV4dFNpYmxpbmdcblx0XHRcdFx0XHRpZiAobWF0Y2hlZCAhPT0gb2xkRW5kIC0gb2xkU3RhcnQgKyAxKSByZW1vdmVOb2RlcyhwYXJlbnQsIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEpXG5cdFx0XHRcdFx0aWYgKG1hdGNoZWQgPT09IDApIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgZW5kICsgMSwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAocG9zID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHQvLyB0aGUgaW5kaWNlcyBvZiB0aGUgaW5kaWNlcyBvZiB0aGUgaXRlbXMgdGhhdCBhcmUgcGFydCBvZiB0aGVcblx0XHRcdFx0XHRcdFx0Ly8gbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIGluIHRoZSBvbGRJbmRpY2VzIGxpc3Rcblx0XHRcdFx0XHRcdFx0Y29uc3QgbGlzSW5kaWNlcyA9IG1ha2VMaXNJbmRpY2VzKG9sZEluZGljZXMpXG5cdFx0XHRcdFx0XHRcdGxldCBsaSA9IGxpc0luZGljZXMubGVuZ3RoIC0gMVxuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gZW5kOyBpID49IHN0YXJ0OyBpLS0pIHtcblx0XHRcdFx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tpXVxuXHRcdFx0XHRcdFx0XHRcdGlmICh2ZSA9PSBudWxsKSBjb250aW51ZVxuXHRcdFx0XHRcdFx0XHRcdGlmIChvbGRJbmRpY2VzW2kgLSBzdGFydF0gPT09IC0xKSBjcmVhdGVOb2RlKHBhcmVudCwgdmUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGxpc0luZGljZXNbbGldID09PSBpIC0gc3RhcnQpIGxpLS1cblx0XHRcdFx0XHRcdFx0XHRcdGVsc2UgbW92ZURPTShwYXJlbnQsIHZlLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZlLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IHZlLmRvbVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gZW5kOyBpID49IHN0YXJ0OyBpLS0pIHtcblx0XHRcdFx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tpXVxuXHRcdFx0XHRcdFx0XHRcdGlmICh2ZSA9PSBudWxsKSBjb250aW51ZVxuXHRcdFx0XHRcdFx0XHRcdGlmIChvbGRJbmRpY2VzW2kgLSBzdGFydF0gPT09IC0xKSBjcmVhdGVOb2RlKHBhcmVudCwgdmUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVOb2RlKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIG9sZDogYW55LCB2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdGNvbnN0IG9sZFRhZyA9IG9sZC50YWcsIHRhZyA9IHZub2RlLnRhZ1xuXHRcdGlmIChvbGRUYWcgPT09IHRhZyAmJiBvbGQuaXMgPT09IHZub2RlLmlzKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IG9sZC5zdGF0ZVxuXHRcdFx0dm5vZGUuZXZlbnRzID0gb2xkLmV2ZW50c1xuXHRcdFx0aWYgKHNob3VsZE5vdFVwZGF0ZSh2bm9kZSwgb2xkKSkgcmV0dXJuXG5cdFx0XHRpZiAodHlwZW9mIG9sZFRhZyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIHtcblx0XHRcdFx0XHR1cGRhdGVMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcylcblx0XHRcdFx0fVxuXHRcdFx0XHRzd2l0Y2ggKG9sZFRhZykge1xuXHRcdFx0XHRcdGNhc2UgJyMnOiB1cGRhdGVUZXh0KG9sZCwgdm5vZGUpOyBicmVha1xuXHRcdFx0XHRcdGNhc2UgJzwnOiB1cGRhdGVIVE1MKHBhcmVudCwgb2xkLCB2bm9kZSwgbnMsIG5leHRTaWJsaW5nKTsgYnJlYWtcblx0XHRcdFx0XHRjYXNlICdbJzogdXBkYXRlRnJhZ21lbnQocGFyZW50LCBvbGQsIHZub2RlLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZyk7IGJyZWFrXG5cdFx0XHRcdFx0ZGVmYXVsdDogdXBkYXRlRWxlbWVudChvbGQsIHZub2RlLCBob29rcywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHVwZGF0ZUNvbXBvbmVudChwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJlbW92ZU5vZGUocGFyZW50LCBvbGQsIHZub2RlKSAvLyBQYXNzIG5ldyB2bm9kZSBmb3IgY29udGV4dFxuXHRcdFx0Y3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlVGV4dChvbGQ6IGFueSwgdm5vZGU6IGFueSkge1xuXHRcdGlmIChvbGQuY2hpbGRyZW4udG9TdHJpbmcoKSAhPT0gdm5vZGUuY2hpbGRyZW4udG9TdHJpbmcoKSkge1xuXHRcdFx0b2xkLmRvbS5ub2RlVmFsdWUgPSB2bm9kZS5jaGlsZHJlblxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlSFRNTChwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCBvbGQ6IGFueSwgdm5vZGU6IGFueSwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsKSB7XG5cdFx0aWYgKG9sZC5jaGlsZHJlbiAhPT0gdm5vZGUuY2hpbGRyZW4pIHtcblx0XHRcdHJlbW92ZURPTShwYXJlbnQsIG9sZClcblx0XHRcdGNyZWF0ZUhUTUwocGFyZW50LCB2bm9kZSwgbnMsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVGcmFnbWVudChwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCBvbGQ6IGFueSwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHR1cGRhdGVOb2RlcyhwYXJlbnQsIG9sZC5jaGlsZHJlbiwgdm5vZGUuY2hpbGRyZW4sIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdGxldCBkb21TaXplID0gMFxuXHRcdGNvbnN0IGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHR2bm9kZS5kb20gPSBudWxsXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRpZiAoY2hpbGQgIT0gbnVsbCAmJiBjaGlsZC5kb20gIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmICh2bm9kZS5kb20gPT0gbnVsbCkgdm5vZGUuZG9tID0gY2hpbGQuZG9tXG5cdFx0XHRcdFx0ZG9tU2l6ZSArPSBjaGlsZC5kb21TaXplIHx8IDFcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2bm9kZS5kb21TaXplID0gZG9tU2l6ZVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnQob2xkOiBhbnksIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdGNvbnN0IGVsZW1lbnQgPSB2bm9kZS5kb20gPSBvbGQuZG9tXG5cdFx0bnMgPSBnZXROYW1lU3BhY2Uodm5vZGUpIHx8IG5zXG5cblx0XHRpZiAob2xkLmF0dHJzICE9IHZub2RlLmF0dHJzIHx8ICh2bm9kZS5hdHRycyAhPSBudWxsICYmICFjYWNoZWRBdHRyc0lzU3RhdGljTWFwLmdldCh2bm9kZS5hdHRycykpKSB7XG5cdFx0XHR1cGRhdGVBdHRycyh2bm9kZSwgb2xkLmF0dHJzLCB2bm9kZS5hdHRycywgbnMpXG5cdFx0fVxuXHRcdGlmICghbWF5YmVTZXRDb250ZW50RWRpdGFibGUodm5vZGUpKSB7XG5cdFx0XHR1cGRhdGVOb2RlcyhlbGVtZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCBob29rcywgbnVsbCwgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVDb21wb25lbnQocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgb2xkOiBhbnksIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Ly8gVHJhY2sgY29tcG9uZW50IGZvciBzaWduYWwgZGVwZW5kZW5jeSB0cmFja2luZ1xuXHRcdC8vIFN0b3JlIG1hcHBpbmcgZnJvbSB2bm9kZS5zdGF0ZSB0byB2bm9kZS50YWcgKGNvbXBvbmVudCBvYmplY3QpIGZvciByZWRyYXdcblx0XHRpZiAodm5vZGUuc3RhdGUgJiYgdm5vZGUudGFnICYmICFpc0h5ZHJhdGluZykge1xuXHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCA9IChnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCB8fCBuZXcgV2Vha01hcCgpXG5cdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvQ29tcG9uZW50LnNldCh2bm9kZS5zdGF0ZSwgdm5vZGUudGFnKVxuXHRcdH1cblx0XHQvLyBBbHdheXMgdHJhY2sgY29tcG9uZW50IGRlcGVuZGVuY2llcyBmb3Igc2lnbmFsIHRyYWNraW5nIChldmVuIGR1cmluZyBoeWRyYXRpb24pXG5cdFx0Ly8gVGhpcyBhbGxvd3Mgc2lnbmFscyB0byBrbm93IHdoaWNoIGNvbXBvbmVudHMgZGVwZW5kIG9uIHRoZW1cblx0XHQvLyBXZSBvbmx5IHNraXAgb25pbml0IGR1cmluZyBoeWRyYXRpb24sIG5vdCBzaWduYWwgdHJhY2tpbmdcblx0XHQvLyBPbmx5IHNldCBjdXJyZW50Q29tcG9uZW50IGlmIHZub2RlLnN0YXRlIGV4aXN0cyAoaXQgbWlnaHQgYmUgdW5kZWZpbmVkIGZvciBzb21lIGNvbXBvbmVudCB0eXBlcylcblx0XHRpZiAodm5vZGUuc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0c2V0Q3VycmVudENvbXBvbmVudCh2bm9kZS5zdGF0ZSlcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKGNhbGxIb29rLmNhbGwodm5vZGUuc3RhdGUudmlldywgdm5vZGUpKVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAodm5vZGUuc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRjbGVhckN1cnJlbnRDb21wb25lbnQoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgPT09IHZub2RlKSB0aHJvdyBFcnJvcignQSB2aWV3IGNhbm5vdCByZXR1cm4gdGhlIHZub2RlIGl0IHJlY2VpdmVkIGFzIGFyZ3VtZW50Jylcblx0XHR1cGRhdGVMaWZlY3ljbGUodm5vZGUuc3RhdGUsIHZub2RlLCBob29rcylcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkgdXBkYXRlTGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdGlmIChvbGQuaW5zdGFuY2UgPT0gbnVsbCkgY3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLmluc3RhbmNlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZylcblx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG9sZC5pbnN0YW5jZSwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0dm5vZGUuZG9tID0gdm5vZGUuaW5zdGFuY2UuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gdm5vZGUuaW5zdGFuY2UuZG9tU2l6ZVxuXHRcdFx0XG5cdFx0XHQvLyBTdG9yZSBjb21wb25lbnQncyBET00gZWxlbWVudCBmb3IgZmluZS1ncmFpbmVkIHJlZHJhdyAobm90IGR1cmluZyBoeWRyYXRpb24pXG5cdFx0XHRpZiAodm5vZGUuc3RhdGUgJiYgdm5vZGUuZG9tICYmICFpc0h5ZHJhdGluZykge1xuXHRcdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tIHx8IG5ldyBXZWFrTWFwKClcblx0XHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0RvbS5zZXQodm5vZGUuc3RhdGUsIHZub2RlLmRvbSlcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAob2xkLmluc3RhbmNlICE9IG51bGwpIHJlbW92ZU5vZGUocGFyZW50LCBvbGQuaW5zdGFuY2UpXG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdH1cblx0fVxuXHQvLyBMaWZ0ZWQgZnJvbSBpdmkgaHR0cHM6Ly9naXRodWIuY29tL2l2aWpzL2l2aS9cblx0Ly8gdGFrZXMgYSBsaXN0IG9mIHVuaXF1ZSBudW1iZXJzICgtMSBpcyBzcGVjaWFsIGFuZCBjYW5cblx0Ly8gb2NjdXIgbXVsdGlwbGUgdGltZXMpIGFuZCByZXR1cm5zIGFuIGFycmF5IHdpdGggdGhlIGluZGljZXNcblx0Ly8gb2YgdGhlIGl0ZW1zIHRoYXQgYXJlIHBhcnQgb2YgdGhlIGxvbmdlc3QgaW5jcmVhc2luZ1xuXHQvLyBzdWJzZXF1ZW5jZVxuXHRjb25zdCBsaXNUZW1wOiBudW1iZXJbXSA9IFtdXG5cdGZ1bmN0aW9uIG1ha2VMaXNJbmRpY2VzKGE6IG51bWJlcltdKTogbnVtYmVyW10ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFswXVxuXHRcdGxldCB1ID0gMCwgdiA9IDBcblx0XHRjb25zdCBpbCA9IGxpc1RlbXAubGVuZ3RoID0gYS5sZW5ndGhcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGlsOyBpKyspIGxpc1RlbXBbaV0gPSBhW2ldXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbDsgKytpKSB7XG5cdFx0XHRpZiAoYVtpXSA9PT0gLTEpIGNvbnRpbnVlXG5cdFx0XHRjb25zdCBqID0gcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXVxuXHRcdFx0aWYgKGFbal0gPCBhW2ldKSB7XG5cdFx0XHRcdGxpc1RlbXBbaV0gPSBqXG5cdFx0XHRcdHJlc3VsdC5wdXNoKGkpXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHR9XG5cdFx0XHR1ID0gMFxuXHRcdFx0diA9IHJlc3VsdC5sZW5ndGggLSAxXG5cdFx0XHR3aGlsZSAodSA8IHYpIHtcblx0XHRcdFx0Ly8gRmFzdCBpbnRlZ2VyIGF2ZXJhZ2Ugd2l0aG91dCBvdmVyZmxvdy5cblx0XHRcdFx0IFxuXHRcdFx0XHRjb25zdCBjID0gKHUgPj4+IDEpICsgKHYgPj4+IDEpICsgKHUgJiB2ICYgMSlcblx0XHRcdFx0aWYgKGFbcmVzdWx0W2NdXSA8IGFbaV0pIHtcblx0XHRcdFx0XHR1ID0gYyArIDFcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR2ID0gY1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoYVtpXSA8IGFbcmVzdWx0W3VdXSkge1xuXHRcdFx0XHRpZiAodSA+IDApIGxpc1RlbXBbaV0gPSByZXN1bHRbdSAtIDFdXG5cdFx0XHRcdHJlc3VsdFt1XSA9IGlcblx0XHRcdH1cblx0XHR9XG5cdFx0dSA9IHJlc3VsdC5sZW5ndGhcblx0XHR2ID0gcmVzdWx0W3UgLSAxXVxuXHRcdHdoaWxlICh1LS0gPiAwKSB7XG5cdFx0XHRyZXN1bHRbdV0gPSB2XG5cdFx0XHR2ID0gbGlzVGVtcFt2XVxuXHRcdH1cblx0XHRsaXNUZW1wLmxlbmd0aCA9IDBcblx0XHRyZXR1cm4gcmVzdWx0XG5cdH1cblxuXHRmdW5jdGlvbiBnZXROZXh0U2libGluZyh2bm9kZXM6IChWbm9kZVR5cGUgfCBudWxsKVtdLCBpOiBudW1iZXIsIGVuZDogbnVtYmVyLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwpOiBOb2RlIHwgbnVsbCB7XG5cdFx0Zm9yICg7IGkgPCBlbmQ7IGkrKykge1xuXHRcdFx0aWYgKHZub2Rlc1tpXSAhPSBudWxsICYmIHZub2Rlc1tpXSEuZG9tICE9IG51bGwpIHJldHVybiB2bm9kZXNbaV0hLmRvbSFcblx0XHR9XG5cdFx0cmV0dXJuIG5leHRTaWJsaW5nXG5cdH1cblxuXHQvLyBUaGlzIGhhbmRsZXMgZnJhZ21lbnRzIHdpdGggem9tYmllIGNoaWxkcmVuIChyZW1vdmVkIGZyb20gdmRvbSwgYnV0IHBlcnNpc3RlZCBpbiBET00gdGhyb3VnaCBvbmJlZm9yZXJlbW92ZSlcblx0ZnVuY3Rpb24gbW92ZURPTShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwpIHtcblx0XHRpZiAodm5vZGUuZG9tICE9IG51bGwpIHtcblx0XHRcdGxldCB0YXJnZXQ6IE5vZGVcblx0XHRcdGlmICh2bm9kZS5kb21TaXplID09IG51bGwgfHwgdm5vZGUuZG9tU2l6ZSA9PT0gMSkge1xuXHRcdFx0XHQvLyBkb24ndCBhbGxvY2F0ZSBmb3IgdGhlIGNvbW1vbiBjYXNlXG5cdFx0XHRcdHRhcmdldCA9IHZub2RlLmRvbVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0ID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdFx0XHRmb3IgKGNvbnN0IGRvbSBvZiBkb21Gb3Iodm5vZGUpKSB0YXJnZXQuYXBwZW5kQ2hpbGQoZG9tKVxuXHRcdFx0fVxuXHRcdFx0aW5zZXJ0RE9NKHBhcmVudCwgdGFyZ2V0LCBuZXh0U2libGluZylcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBpbnNlcnRET00ocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgZG9tOiBOb2RlLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwpIHtcblx0XHRpZiAobmV4dFNpYmxpbmcgIT0gbnVsbCkgcGFyZW50Lmluc2VydEJlZm9yZShkb20sIG5leHRTaWJsaW5nKVxuXHRcdGVsc2UgcGFyZW50LmFwcGVuZENoaWxkKGRvbSlcblx0fVxuXG5cdGZ1bmN0aW9uIG1heWJlU2V0Q29udGVudEVkaXRhYmxlKHZub2RlOiBhbnkpOiBib29sZWFuIHtcblx0XHRpZiAodm5vZGUuYXR0cnMgPT0gbnVsbCB8fCAoXG5cdFx0XHR2bm9kZS5hdHRycy5jb250ZW50ZWRpdGFibGUgPT0gbnVsbCAmJiAvLyBhdHRyaWJ1dGVcblx0XHRcdHZub2RlLmF0dHJzLmNvbnRlbnRFZGl0YWJsZSA9PSBudWxsIC8vIHByb3BlcnR5XG5cdFx0KSkgcmV0dXJuIGZhbHNlXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdGlmIChjaGlsZHJlbiAhPSBudWxsICYmIGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBjaGlsZHJlblswXS50YWcgPT09ICc8Jykge1xuXHRcdFx0Y29uc3QgY29udGVudCA9IGNoaWxkcmVuWzBdLmNoaWxkcmVuXG5cdFx0XHRpZiAodm5vZGUuZG9tLmlubmVySFRNTCAhPT0gY29udGVudCkgdm5vZGUuZG9tLmlubmVySFRNTCA9IGNvbnRlbnRcblx0XHR9XG5cdFx0ZWxzZSBpZiAoY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbi5sZW5ndGggIT09IDApIHRocm93IG5ldyBFcnJvcignQ2hpbGQgbm9kZSBvZiBhIGNvbnRlbnRlZGl0YWJsZSBtdXN0IGJlIHRydXN0ZWQuJylcblx0XHRyZXR1cm4gdHJ1ZVxuXHR9XG5cblx0Ly8gcmVtb3ZlXG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGVzKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlczogKFZub2RlVHlwZSB8IG51bGwpW10sIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG5cdFx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdGNvbnN0IHZub2RlID0gdm5vZGVzW2ldXG5cdFx0XHRpZiAodm5vZGUgIT0gbnVsbCkgcmVtb3ZlTm9kZShwYXJlbnQsIHZub2RlKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB0cnlCbG9ja1JlbW92ZShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBzb3VyY2U6IGFueSwgY291bnRlcjoge3Y6IG51bWJlcn0pIHtcblx0XHRjb25zdCBvcmlnaW5hbCA9IHZub2RlLnN0YXRlXG5cdFx0Y29uc3QgcmVzdWx0ID0gY2FsbEhvb2suY2FsbChzb3VyY2Uub25iZWZvcmVyZW1vdmUsIHZub2RlKVxuXHRcdGlmIChyZXN1bHQgPT0gbnVsbCkgcmV0dXJuXG5cblx0XHRjb25zdCBnZW5lcmF0aW9uID0gY3VycmVudFJlbmRlclxuXHRcdGZvciAoY29uc3QgZG9tIG9mIGRvbUZvcih2bm9kZSkpIGRlbGF5ZWRSZW1vdmFsLnNldChkb20sIGdlbmVyYXRpb24pXG5cdFx0Y291bnRlci52KytcblxuXHRcdFByb21pc2UucmVzb2x2ZShyZXN1bHQpLmZpbmFsbHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRjaGVja1N0YXRlKHZub2RlLCBvcmlnaW5hbClcblx0XHRcdHRyeVJlc3VtZVJlbW92ZShwYXJlbnQsIHZub2RlLCBjb3VudGVyKVxuXHRcdH0pXG5cdH1cblx0ZnVuY3Rpb24gdHJ5UmVzdW1lUmVtb3ZlKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIGNvdW50ZXI6IHt2OiBudW1iZXJ9LCBuZXdWbm9kZT86IGFueSkge1xuXHRcdGlmICgtLWNvdW50ZXIudiA9PT0gMCkge1xuXHRcdFx0b25yZW1vdmUodm5vZGUpXG5cdFx0XHRyZW1vdmVET00ocGFyZW50LCB2bm9kZSwgbmV3Vm5vZGUpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGUocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgbmV3Vm5vZGU/OiBhbnkpIHtcblx0XHRjb25zdCBjb3VudGVyID0ge3Y6IDF9XG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09ICdzdHJpbmcnICYmIHR5cGVvZiB2bm9kZS5zdGF0ZS5vbmJlZm9yZXJlbW92ZSA9PT0gJ2Z1bmN0aW9uJykgdHJ5QmxvY2tSZW1vdmUocGFyZW50LCB2bm9kZSwgdm5vZGUuc3RhdGUsIGNvdW50ZXIpXG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbmJlZm9yZXJlbW92ZSA9PT0gJ2Z1bmN0aW9uJykgdHJ5QmxvY2tSZW1vdmUocGFyZW50LCB2bm9kZSwgdm5vZGUuYXR0cnMsIGNvdW50ZXIpXG5cdFx0dHJ5UmVzdW1lUmVtb3ZlKHBhcmVudCwgdm5vZGUsIGNvdW50ZXIsIG5ld1Zub2RlKVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZURPTShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBuZXdWbm9kZT86IGFueSkge1xuXHRcdGlmICh2bm9kZS5kb20gPT0gbnVsbCkgcmV0dXJuXG5cdFx0aWYgKHZub2RlLmRvbVNpemUgPT0gbnVsbCB8fCB2bm9kZS5kb21TaXplID09PSAxKSB7XG5cdFx0XHQvLyBDaGVjayBpZiBub2RlIGlzIHN0aWxsIGEgY2hpbGQgYmVmb3JlIGF0dGVtcHRpbmcgcmVtb3ZhbFxuXHRcdFx0Y29uc3Qgbm9kZSA9IHZub2RlLmRvbVxuXHRcdFx0aWYgKHBhcmVudC5jb250YWlucyAmJiBwYXJlbnQuY29udGFpbnMobm9kZSkpIHtcblx0XHRcdFx0Ly8gVmVyaWZ5IG5vZGUgaXMgYWN0dWFsbHkgYSBkaXJlY3Qgb3IgaW5kaXJlY3QgY2hpbGRcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQobm9kZSlcblx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0Y29uc3QgZXJyb3IgPSBlIGFzIEVycm9yXG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgbm9kZSB3YXMgYWxyZWFkeSByZW1vdmVkIChub3QgYSBjaGlsZCBhbnltb3JlKVxuXHRcdFx0XHRcdGlmICghcGFyZW50LmNvbnRhaW5zIHx8ICFwYXJlbnQuY29udGFpbnMobm9kZSkpIHtcblx0XHRcdFx0XHRcdC8vIE5vZGUgYWxyZWFkeSByZW1vdmVkLCBza2lwIHNpbGVudGx5XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bG9nSHlkcmF0aW9uRXJyb3IoXG5cdFx0XHRcdFx0XHQncmVtb3ZlRE9NIChzaW5nbGUgbm9kZSknLFxuXHRcdFx0XHRcdFx0dm5vZGUsXG5cdFx0XHRcdFx0XHRwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogbnVsbCxcblx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0e3BhcmVudDogcGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IHVuZGVmaW5lZCwgbm9kZTogdm5vZGUuZG9tLCBvbGRWbm9kZTogdm5vZGUsIG5ld1Zub2RlOiBuZXdWbm9kZX0sXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC8vIERvbid0IHJlLXRocm93IC0gd2UndmUgYWxyZWFkeSBsb2dnZWQgdGhlIGVycm9yIHdpdGggYWxsIGRldGFpbHNcblx0XHRcdFx0XHQvLyBSZS10aHJvd2luZyBjYXVzZXMgdGhlIGJyb3dzZXIgdG8gbG9nIHRoZSBET01FeGNlcHRpb24gc3RhY2sgdHJhY2Vcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gTm9kZSBub3QgaW4gcGFyZW50LCBhbHJlYWR5IHJlbW92ZWQgLSBza2lwIHNpbGVudGx5XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAoY29uc3QgZG9tIG9mIGRvbUZvcih2bm9kZSkpIHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgbm9kZSBpcyBzdGlsbCBhIGNoaWxkIGJlZm9yZSBhdHRlbXB0aW5nIHJlbW92YWxcblx0XHRcdFx0aWYgKHBhcmVudC5jb250YWlucyAmJiBwYXJlbnQuY29udGFpbnMoZG9tKSkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQoZG9tKVxuXHRcdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgZXJyb3IgPSBlIGFzIEVycm9yXG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiBub2RlIHdhcyBhbHJlYWR5IHJlbW92ZWQgKG5vdCBhIGNoaWxkIGFueW1vcmUpXG5cdFx0XHRcdFx0XHRpZiAoIXBhcmVudC5jb250YWlucyB8fCAhcGFyZW50LmNvbnRhaW5zKGRvbSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gTm9kZSBhbHJlYWR5IHJlbW92ZWQsIHNraXAgc2lsZW50bHlcblx0XHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGxvZ0h5ZHJhdGlvbkVycm9yKFxuXHRcdFx0XHRcdFx0XHQncmVtb3ZlRE9NIChtdWx0aXBsZSBub2RlcyknLFxuXHRcdFx0XHRcdFx0XHR2bm9kZSxcblx0XHRcdFx0XHRcdFx0cGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHR7cGFyZW50OiBwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogdW5kZWZpbmVkLCBub2RlOiBkb20sIG9sZFZub2RlOiB2bm9kZSwgbmV3Vm5vZGU6IG5ld1Zub2RlfSxcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdC8vIERvbid0IHJlLXRocm93IC0gd2UndmUgYWxyZWFkeSBsb2dnZWQgdGhlIGVycm9yIHdpdGggYWxsIGRldGFpbHNcblx0XHRcdFx0XHRcdC8vIFJlLXRocm93aW5nIGNhdXNlcyB0aGUgYnJvd3NlciB0byBsb2cgdGhlIERPTUV4Y2VwdGlvbiBzdGFjayB0cmFjZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBOb2RlIG5vdCBpbiBwYXJlbnQsIGFscmVhZHkgcmVtb3ZlZCAtIHNraXAgc2lsZW50bHlcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvbnJlbW92ZSh2bm9kZTogYW55KSB7XG5cdFx0Ly8gQ2xlYW4gdXAgc2lnbmFsIGRlcGVuZGVuY2llcyB3aGVuIGNvbXBvbmVudCBpcyByZW1vdmVkXG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09ICdzdHJpbmcnICYmIHZub2RlLnN0YXRlICE9IG51bGwpIHtcblx0XHRcdGNsZWFyQ29tcG9uZW50RGVwZW5kZW5jaWVzKHZub2RlLnN0YXRlKVxuXHRcdH1cblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZub2RlLnN0YXRlLm9ucmVtb3ZlID09PSAnZnVuY3Rpb24nKSBjYWxsSG9vay5jYWxsKHZub2RlLnN0YXRlLm9ucmVtb3ZlLCB2bm9kZSlcblx0XHRpZiAodm5vZGUuYXR0cnMgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9ucmVtb3ZlID09PSAnZnVuY3Rpb24nKSBjYWxsSG9vay5jYWxsKHZub2RlLmF0dHJzLm9ucmVtb3ZlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZycpIHtcblx0XHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSBvbnJlbW92ZSh2bm9kZS5pbnN0YW5jZSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHZub2RlLmV2ZW50cyAhPSBudWxsKSB2bm9kZS5ldmVudHMuXyA9IG51bGxcblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsKSBvbnJlbW92ZShjaGlsZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIGF0dHJzXG5cdGZ1bmN0aW9uIHNldEF0dHJzKHZub2RlOiBhbnksIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcblx0XHRcdHNldEF0dHIodm5vZGUsIGtleSwgbnVsbCwgYXR0cnNba2V5XSwgbnMpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHNldEF0dHIodm5vZGU6IGFueSwga2V5OiBzdHJpbmcsIG9sZDogYW55LCB2YWx1ZTogYW55LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGtleSA9PT0gJ2tleScgfHwgdmFsdWUgPT0gbnVsbCB8fCBpc0xpZmVjeWNsZU1ldGhvZChrZXkpIHx8IChvbGQgPT09IHZhbHVlICYmICFpc0Zvcm1BdHRyaWJ1dGUodm5vZGUsIGtleSkpICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVyblxuXHRcdGlmIChrZXlbMF0gPT09ICdvJyAmJiBrZXlbMV0gPT09ICduJykgcmV0dXJuIHVwZGF0ZUV2ZW50KHZub2RlLCBrZXksIHZhbHVlKVxuXHRcdGlmIChrZXkuc2xpY2UoMCwgNikgPT09ICd4bGluazonKSB2bm9kZS5kb20uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBrZXkuc2xpY2UoNiksIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGtleSA9PT0gJ3N0eWxlJykgdXBkYXRlU3R5bGUodm5vZGUuZG9tLCBvbGQsIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGhhc1Byb3BlcnR5S2V5KHZub2RlLCBrZXksIG5zKSkge1xuXHRcdFx0aWYgKGtleSA9PT0gJ3ZhbHVlJykge1xuXHRcdFx0XHQvLyBPbmx5IGRvIHRoZSBjb2VyY2lvbiBpZiB3ZSdyZSBhY3R1YWxseSBnb2luZyB0byBjaGVjayB0aGUgdmFsdWUuXG5cdFx0XHRcdC8vIHNldHRpbmcgaW5wdXRbdmFsdWVdIHRvIHNhbWUgdmFsdWUgYnkgdHlwaW5nIG9uIGZvY3VzZWQgZWxlbWVudCBtb3ZlcyBjdXJzb3IgdG8gZW5kIGluIENocm9tZVxuXHRcdFx0XHQvLyBzZXR0aW5nIGlucHV0W3R5cGU9ZmlsZV1bdmFsdWVdIHRvIHNhbWUgdmFsdWUgY2F1c2VzIGFuIGVycm9yIHRvIGJlIGdlbmVyYXRlZCBpZiBpdCdzIG5vbi1lbXB0eVxuXHRcdFx0XHQvLyBtaW5sZW5ndGgvbWF4bGVuZ3RoIHZhbGlkYXRpb24gaXNuJ3QgcGVyZm9ybWVkIG9uIHNjcmlwdC1zZXQgdmFsdWVzKCMyMjU2KVxuXHRcdFx0XHRpZiAoKHZub2RlLnRhZyA9PT0gJ2lucHV0JyB8fCB2bm9kZS50YWcgPT09ICd0ZXh0YXJlYScpICYmIHZub2RlLmRvbS52YWx1ZSA9PT0gJycgKyB2YWx1ZSkgcmV0dXJuXG5cdFx0XHRcdC8vIHNldHRpbmcgc2VsZWN0W3ZhbHVlXSB0byBzYW1lIHZhbHVlIHdoaWxlIGhhdmluZyBzZWxlY3Qgb3BlbiBibGlua3Mgc2VsZWN0IGRyb3Bkb3duIGluIENocm9tZVxuXHRcdFx0XHRpZiAodm5vZGUudGFnID09PSAnc2VsZWN0JyAmJiBvbGQgIT09IG51bGwgJiYgdm5vZGUuZG9tLnZhbHVlID09PSAnJyArIHZhbHVlKSByZXR1cm5cblx0XHRcdFx0Ly8gc2V0dGluZyBvcHRpb25bdmFsdWVdIHRvIHNhbWUgdmFsdWUgd2hpbGUgaGF2aW5nIHNlbGVjdCBvcGVuIGJsaW5rcyBzZWxlY3QgZHJvcGRvd24gaW4gQ2hyb21lXG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdvcHRpb24nICYmIG9sZCAhPT0gbnVsbCAmJiB2bm9kZS5kb20udmFsdWUgPT09ICcnICsgdmFsdWUpIHJldHVyblxuXHRcdFx0XHQvLyBzZXR0aW5nIGlucHV0W3R5cGU9ZmlsZV1bdmFsdWVdIHRvIGRpZmZlcmVudCB2YWx1ZSBpcyBhbiBlcnJvciBpZiBpdCdzIG5vbi1lbXB0eVxuXHRcdFx0XHQvLyBOb3QgaWRlYWwsIGJ1dCBpdCBhdCBsZWFzdCB3b3JrcyBhcm91bmQgdGhlIG1vc3QgY29tbW9uIHNvdXJjZSBvZiB1bmNhdWdodCBleGNlcHRpb25zIGZvciBub3cuXG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdpbnB1dCcgJiYgdm5vZGUuYXR0cnMudHlwZSA9PT0gJ2ZpbGUnICYmICcnICsgdmFsdWUgIT09ICcnKSB7IGNvbnNvbGUuZXJyb3IoJ2B2YWx1ZWAgaXMgcmVhZC1vbmx5IG9uIGZpbGUgaW5wdXRzIScpOyByZXR1cm4gfVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgeW91IGFzc2lnbiBhbiBpbnB1dCB0eXBlIHRoYXQgaXMgbm90IHN1cHBvcnRlZCBieSBJRSAxMSB3aXRoIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvbiwgYW4gZXJyb3Igd2lsbCBvY2N1ci5cblx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdpbnB1dCcgJiYga2V5ID09PSAndHlwZScpIHZub2RlLmRvbS5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSlcblx0XHRcdGVsc2Ugdm5vZGUuZG9tW2tleV0gPSB2YWx1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcblx0XHRcdFx0aWYgKHZhbHVlKSB2bm9kZS5kb20uc2V0QXR0cmlidXRlKGtleSwgJycpXG5cdFx0XHRcdGVsc2Ugdm5vZGUuZG9tLnJlbW92ZUF0dHJpYnV0ZShrZXkpXG5cdFx0XHR9XG5cdFx0XHRlbHNlIHZub2RlLmRvbS5zZXRBdHRyaWJ1dGUoa2V5ID09PSAnY2xhc3NOYW1lJyA/ICdjbGFzcycgOiBrZXksIHZhbHVlKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiByZW1vdmVBdHRyKHZub2RlOiBhbnksIGtleTogc3RyaW5nLCBvbGQ6IGFueSwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXkgPT09ICdrZXknIHx8IG9sZCA9PSBudWxsIHx8IGlzTGlmZWN5Y2xlTWV0aG9kKGtleSkpIHJldHVyblxuXHRcdGlmIChrZXlbMF0gPT09ICdvJyAmJiBrZXlbMV0gPT09ICduJykgdXBkYXRlRXZlbnQodm5vZGUsIGtleSwgdW5kZWZpbmVkKVxuXHRcdGVsc2UgaWYgKGtleSA9PT0gJ3N0eWxlJykgdXBkYXRlU3R5bGUodm5vZGUuZG9tLCBvbGQsIG51bGwpXG5cdFx0ZWxzZSBpZiAoXG5cdFx0XHRoYXNQcm9wZXJ0eUtleSh2bm9kZSwga2V5LCBucylcblx0XHRcdCYmIGtleSAhPT0gJ2NsYXNzTmFtZSdcblx0XHRcdCYmIGtleSAhPT0gJ3RpdGxlJyAvLyBjcmVhdGVzIFwibnVsbFwiIGFzIHRpdGxlXG5cdFx0XHQmJiAhKGtleSA9PT0gJ3ZhbHVlJyAmJiAoXG5cdFx0XHRcdHZub2RlLnRhZyA9PT0gJ29wdGlvbidcblx0XHRcdFx0fHwgdm5vZGUudGFnID09PSAnc2VsZWN0JyAmJiB2bm9kZS5kb20uc2VsZWN0ZWRJbmRleCA9PT0gLTEgJiYgdm5vZGUuZG9tID09PSBhY3RpdmVFbGVtZW50KHZub2RlLmRvbSlcblx0XHRcdCkpXG5cdFx0XHQmJiAhKHZub2RlLnRhZyA9PT0gJ2lucHV0JyAmJiBrZXkgPT09ICd0eXBlJylcblx0XHQpIHtcblx0XHRcdHZub2RlLmRvbVtrZXldID0gbnVsbFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBuc0xhc3RJbmRleCA9IGtleS5pbmRleE9mKCc6Jylcblx0XHRcdGlmIChuc0xhc3RJbmRleCAhPT0gLTEpIGtleSA9IGtleS5zbGljZShuc0xhc3RJbmRleCArIDEpXG5cdFx0XHRpZiAob2xkICE9PSBmYWxzZSkgdm5vZGUuZG9tLnJlbW92ZUF0dHJpYnV0ZShrZXkgPT09ICdjbGFzc05hbWUnID8gJ2NsYXNzJyA6IGtleSlcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gc2V0TGF0ZVNlbGVjdEF0dHJzKHZub2RlOiBhbnksIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG5cdFx0aWYgKCd2YWx1ZScgaW4gYXR0cnMpIHtcblx0XHRcdGlmIChhdHRycy52YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRpZiAodm5vZGUuZG9tLnNlbGVjdGVkSW5kZXggIT09IC0xKSB2bm9kZS5kb20udmFsdWUgPSBudWxsXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBub3JtYWxpemVkID0gJycgKyBhdHRycy52YWx1ZVxuXHRcdFx0XHRpZiAodm5vZGUuZG9tLnZhbHVlICE9PSBub3JtYWxpemVkIHx8IHZub2RlLmRvbS5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRcdHZub2RlLmRvbS52YWx1ZSA9IG5vcm1hbGl6ZWRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoJ3NlbGVjdGVkSW5kZXgnIGluIGF0dHJzKSBzZXRBdHRyKHZub2RlLCAnc2VsZWN0ZWRJbmRleCcsIG51bGwsIGF0dHJzLnNlbGVjdGVkSW5kZXgsIHVuZGVmaW5lZClcblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVBdHRycyh2bm9kZTogYW55LCBvbGQ6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0XHQvLyBTb21lIGF0dHJpYnV0ZXMgbWF5IE5PVCBiZSBjYXNlLXNlbnNpdGl2ZSAoZS5nLiBkYXRhLSoqKiksXG5cdFx0Ly8gc28gcmVtb3ZhbCBzaG91bGQgYmUgZG9uZSBmaXJzdCB0byBwcmV2ZW50IGFjY2lkZW50YWwgcmVtb3ZhbCBmb3IgbmV3bHkgc2V0dGluZyB2YWx1ZXMuXG5cdFx0bGV0IHZhbDogYW55XG5cdFx0aWYgKG9sZCAhPSBudWxsKSB7XG5cdFx0XHRpZiAob2xkID09PSBhdHRycyAmJiAhY2FjaGVkQXR0cnNJc1N0YXRpY01hcC5oYXMoYXR0cnMhKSkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ0RvblxcJ3QgcmV1c2UgYXR0cnMgb2JqZWN0LCB1c2UgbmV3IG9iamVjdCBmb3IgZXZlcnkgcmVkcmF3LCB0aGlzIHdpbGwgdGhyb3cgaW4gbmV4dCBtYWpvcicpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBvbGQpIHtcblx0XHRcdFx0aWYgKCgodmFsID0gb2xkW2tleV0pICE9IG51bGwpICYmIChhdHRycyA9PSBudWxsIHx8IGF0dHJzW2tleV0gPT0gbnVsbCkpIHtcblx0XHRcdFx0XHRyZW1vdmVBdHRyKHZub2RlLCBrZXksIHZhbCwgbnMpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGF0dHJzICE9IG51bGwpIHtcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG5cdFx0XHRcdHNldEF0dHIodm5vZGUsIGtleSwgb2xkICYmIG9sZFtrZXldLCBhdHRyc1trZXldLCBucylcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gaXNGb3JtQXR0cmlidXRlKHZub2RlOiBhbnksIGF0dHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBhdHRyID09PSAndmFsdWUnIHx8IGF0dHIgPT09ICdjaGVja2VkJyB8fCBhdHRyID09PSAnc2VsZWN0ZWRJbmRleCcgfHwgYXR0ciA9PT0gJ3NlbGVjdGVkJyAmJiAodm5vZGUuZG9tID09PSBhY3RpdmVFbGVtZW50KHZub2RlLmRvbSkgfHwgdm5vZGUudGFnID09PSAnb3B0aW9uJyAmJiB2bm9kZS5kb20ucGFyZW50Tm9kZSA9PT0gYWN0aXZlRWxlbWVudCh2bm9kZS5kb20pKVxuXHR9XG5cdGZ1bmN0aW9uIGlzTGlmZWN5Y2xlTWV0aG9kKGF0dHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBhdHRyID09PSAnb25pbml0JyB8fCBhdHRyID09PSAnb25jcmVhdGUnIHx8IGF0dHIgPT09ICdvbnVwZGF0ZScgfHwgYXR0ciA9PT0gJ29ucmVtb3ZlJyB8fCBhdHRyID09PSAnb25iZWZvcmVyZW1vdmUnIHx8IGF0dHIgPT09ICdvbmJlZm9yZXVwZGF0ZSdcblx0fVxuXHRmdW5jdGlvbiBoYXNQcm9wZXJ0eUtleSh2bm9kZTogYW55LCBrZXk6IHN0cmluZywgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuXHRcdC8vIEZpbHRlciBvdXQgbmFtZXNwYWNlZCBrZXlzXG5cdFx0cmV0dXJuIG5zID09PSB1bmRlZmluZWQgJiYgKFxuXHRcdFx0Ly8gSWYgaXQncyBhIGN1c3RvbSBlbGVtZW50LCBqdXN0IGtlZXAgaXQuXG5cdFx0XHR2bm9kZS50YWcuaW5kZXhPZignLScpID4gLTEgfHwgdm5vZGUuaXMgfHxcblx0XHRcdC8vIElmIGl0J3MgYSBub3JtYWwgZWxlbWVudCwgbGV0J3MgdHJ5IHRvIGF2b2lkIGEgZmV3IGJyb3dzZXIgYnVncy5cblx0XHRcdGtleSAhPT0gJ2hyZWYnICYmIGtleSAhPT0gJ2xpc3QnICYmIGtleSAhPT0gJ2Zvcm0nICYmIGtleSAhPT0gJ3dpZHRoJyAmJiBrZXkgIT09ICdoZWlnaHQnLy8gJiYga2V5ICE9PSBcInR5cGVcIlxuXHRcdFx0Ly8gRGVmZXIgdGhlIHByb3BlcnR5IGNoZWNrIHVudGlsICphZnRlciogd2UgY2hlY2sgZXZlcnl0aGluZy5cblx0XHQpICYmIGtleSBpbiB2bm9kZS5kb21cblx0fVxuXG5cdC8vIHN0eWxlXG5cdGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBvbGQ6IGFueSwgc3R5bGU6IGFueSkge1xuXHRcdGlmIChvbGQgPT09IHN0eWxlKSB7XG5cdFx0XHQvLyBTdHlsZXMgYXJlIGVxdWl2YWxlbnQsIGRvIG5vdGhpbmcuXG5cdFx0fSBlbHNlIGlmIChzdHlsZSA9PSBudWxsKSB7XG5cdFx0XHQvLyBOZXcgc3R5bGUgaXMgbWlzc2luZywganVzdCBjbGVhciBpdC5cblx0XHRcdGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9ICcnXG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygc3R5bGUgIT09ICdvYmplY3QnKSB7XG5cdFx0XHQvLyBOZXcgc3R5bGUgaXMgYSBzdHJpbmcsIGxldCBlbmdpbmUgZGVhbCB3aXRoIHBhdGNoaW5nLlxuXHRcdFx0ZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gc3R5bGVcblx0XHR9IGVsc2UgaWYgKG9sZCA9PSBudWxsIHx8IHR5cGVvZiBvbGQgIT09ICdvYmplY3QnKSB7XG5cdFx0XHQvLyBgb2xkYCBpcyBtaXNzaW5nIG9yIGEgc3RyaW5nLCBgc3R5bGVgIGlzIGFuIG9iamVjdC5cblx0XHRcdGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9ICcnXG5cdFx0XHQvLyBBZGQgbmV3IHN0eWxlIHByb3BlcnRpZXNcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIHN0eWxlKSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gc3R5bGVba2V5XVxuXHRcdFx0XHRpZiAodmFsdWUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmIChrZXkuaW5jbHVkZXMoJy0nKSkgZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0ZWxzZSAoZWxlbWVudC5zdHlsZSBhcyBhbnkpW2tleV0gPSBTdHJpbmcodmFsdWUpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQm90aCBvbGQgJiBuZXcgYXJlIChkaWZmZXJlbnQpIG9iamVjdHMuXG5cdFx0XHQvLyBSZW1vdmUgc3R5bGUgcHJvcGVydGllcyB0aGF0IG5vIGxvbmdlciBleGlzdFxuXHRcdFx0Ly8gU3R5bGUgcHJvcGVydGllcyBtYXkgaGF2ZSB0d28gY2FzZXMoZGFzaC1jYXNlIGFuZCBjYW1lbENhc2UpLFxuXHRcdFx0Ly8gc28gcmVtb3ZhbCBzaG91bGQgYmUgZG9uZSBmaXJzdCB0byBwcmV2ZW50IGFjY2lkZW50YWwgcmVtb3ZhbCBmb3IgbmV3bHkgc2V0dGluZyB2YWx1ZXMuXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBvbGQpIHtcblx0XHRcdFx0aWYgKG9sZFtrZXldICE9IG51bGwgJiYgc3R5bGVba2V5XSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKGtleS5pbmNsdWRlcygnLScpKSBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSlcblx0XHRcdFx0XHRlbHNlIChlbGVtZW50LnN0eWxlIGFzIGFueSlba2V5XSA9ICcnXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIFVwZGF0ZSBzdHlsZSBwcm9wZXJ0aWVzIHRoYXQgaGF2ZSBjaGFuZ2VkXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBzdHlsZSkge1xuXHRcdFx0XHRsZXQgdmFsdWUgPSBzdHlsZVtrZXldXG5cdFx0XHRcdGlmICh2YWx1ZSAhPSBudWxsICYmICh2YWx1ZSA9IFN0cmluZyh2YWx1ZSkpICE9PSBTdHJpbmcob2xkW2tleV0pKSB7XG5cdFx0XHRcdFx0aWYgKGtleS5pbmNsdWRlcygnLScpKSBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUpXG5cdFx0XHRcdFx0ZWxzZSAoZWxlbWVudC5zdHlsZSBhcyBhbnkpW2tleV0gPSB2YWx1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gSGVyZSdzIGFuIGV4cGxhbmF0aW9uIG9mIGhvdyB0aGlzIHdvcmtzOlxuXHQvLyAxLiBUaGUgZXZlbnQgbmFtZXMgYXJlIGFsd2F5cyAoYnkgZGVzaWduKSBwcmVmaXhlZCBieSBgb25gLlxuXHQvLyAyLiBUaGUgRXZlbnRMaXN0ZW5lciBpbnRlcmZhY2UgYWNjZXB0cyBlaXRoZXIgYSBmdW5jdGlvbiBvciBhbiBvYmplY3Rcblx0Ly8gICAgd2l0aCBhIGBoYW5kbGVFdmVudGAgbWV0aG9kLlxuXHQvLyAzLiBUaGUgb2JqZWN0IGRvZXMgbm90IGluaGVyaXQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAsIHRvIGF2b2lkXG5cdC8vICAgIGFueSBwb3RlbnRpYWwgaW50ZXJmZXJlbmNlIHdpdGggdGhhdCAoZS5nLiBzZXR0ZXJzKS5cblx0Ly8gNC4gVGhlIGV2ZW50IG5hbWUgaXMgcmVtYXBwZWQgdG8gdGhlIGhhbmRsZXIgYmVmb3JlIGNhbGxpbmcgaXQuXG5cdC8vIDUuIEluIGZ1bmN0aW9uLWJhc2VkIGV2ZW50IGhhbmRsZXJzLCBgZXYudGFyZ2V0ID09PSB0aGlzYC4gV2UgcmVwbGljYXRlXG5cdC8vICAgIHRoYXQgYmVsb3cuXG5cdC8vIDYuIEluIGZ1bmN0aW9uLWJhc2VkIGV2ZW50IGhhbmRsZXJzLCBgcmV0dXJuIGZhbHNlYCBwcmV2ZW50cyB0aGUgZGVmYXVsdFxuXHQvLyAgICBhY3Rpb24gYW5kIHN0b3BzIGV2ZW50IHByb3BhZ2F0aW9uLiBXZSByZXBsaWNhdGUgdGhhdCBiZWxvdy5cblx0ZnVuY3Rpb24gRXZlbnREaWN0KHRoaXM6IGFueSkge1xuXHRcdC8vIFNhdmUgdGhpcywgc28gdGhlIGN1cnJlbnQgcmVkcmF3IGlzIGNvcnJlY3RseSB0cmFja2VkLlxuXHRcdHRoaXMuXyA9IGN1cnJlbnRSZWRyYXdcblx0fVxuXHRFdmVudERpY3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXHRFdmVudERpY3QucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oZXY6IGFueSkge1xuXHRcdGNvbnN0IGhhbmRsZXIgPSB0aGlzWydvbicgKyBldi50eXBlXVxuXHRcdGxldCByZXN1bHQ6IGFueVxuXHRcdGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykgcmVzdWx0ID0gaGFuZGxlci5jYWxsKGV2LmN1cnJlbnRUYXJnZXQsIGV2KVxuXHRcdGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyLmhhbmRsZUV2ZW50ID09PSAnZnVuY3Rpb24nKSBoYW5kbGVyLmhhbmRsZUV2ZW50KGV2KVxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzXG5cdFx0aWYgKHNlbGYuXyAhPSBudWxsKSB7XG5cdFx0XHRpZiAoZXYucmVkcmF3ICE9PSBmYWxzZSkgKDAsIHNlbGYuXykoKVxuXHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRQcm9taXNlLnJlc29sdmUocmVzdWx0KS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmIChzZWxmLl8gIT0gbnVsbCAmJiBldi5yZWRyYXcgIT09IGZhbHNlKSAoMCwgc2VsZi5fKSgpXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG5cdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldi5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdH1cblx0fVxuXG5cdC8vIGV2ZW50XG5cdGZ1bmN0aW9uIHVwZGF0ZUV2ZW50KHZub2RlOiBhbnksIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG5cdFx0aWYgKHZub2RlLmV2ZW50cyAhPSBudWxsKSB7XG5cdFx0XHR2bm9kZS5ldmVudHMuXyA9IGN1cnJlbnRSZWRyYXdcblx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5XSA9PT0gdmFsdWUpIHJldHVyblxuXHRcdFx0aWYgKHZhbHVlICE9IG51bGwgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSkge1xuXHRcdFx0XHRpZiAodm5vZGUuZXZlbnRzW2tleV0gPT0gbnVsbCkgdm5vZGUuZG9tLmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2bm9kZS5ldmVudHMsIGZhbHNlKVxuXHRcdFx0XHR2bm9kZS5ldmVudHNba2V5XSA9IHZhbHVlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAodm5vZGUuZXZlbnRzW2tleV0gIT0gbnVsbCkgdm5vZGUuZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2bm9kZS5ldmVudHMsIGZhbHNlKVxuXHRcdFx0XHR2bm9kZS5ldmVudHNba2V5XSA9IHVuZGVmaW5lZFxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodmFsdWUgIT0gbnVsbCAmJiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpKSB7XG5cdFx0XHR2bm9kZS5ldmVudHMgPSBuZXcgKEV2ZW50RGljdCBhcyBhbnkpKClcblx0XHRcdHZub2RlLmRvbS5hZGRFdmVudExpc3RlbmVyKGtleS5zbGljZSgyKSwgdm5vZGUuZXZlbnRzLCBmYWxzZSlcblx0XHRcdHZub2RlLmV2ZW50c1trZXldID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvLyBsaWZlY3ljbGVcblx0ZnVuY3Rpb24gaW5pdExpZmVjeWNsZShzb3VyY2U6IGFueSwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Ly8gQWx3YXlzIGNhbGwgb25pbml0LCBidXQgcGFzcyBjb250ZXh0IHNvIGNvbXBvbmVudHMgY2FuIG1ha2UgaW50ZWxsaWdlbnQgZGVjaXNpb25zXG5cdFx0Ly8gQ29tcG9uZW50cyBjYW4gY2hlY2sgY29udGV4dC5pc1NTUiBvciBjb250ZXh0LmlzSHlkcmF0aW5nIHRvIGNvbmRpdGlvbmFsbHkgbG9hZCBkYXRhXG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25pbml0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0ge1xuXHRcdFx0XHRpc1NTUjogZmFsc2UsXG5cdFx0XHRcdGlzSHlkcmF0aW5nOiBpc0h5ZHJhdGluZyxcblx0XHRcdH1cblx0XHRcdGNvbnN0IHJlc3VsdCA9IGNhbGxIb29rLmNhbGwoc291cmNlLm9uaW5pdCwgdm5vZGUsIGNvbnRleHQpXG5cdFx0XHQvLyBBdXRvLXJlZHJhdyB3aGVuIGFzeW5jIG9uaW5pdCBjb21wbGV0ZXMgKGNsaWVudC1zaWRlIG9ubHkpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nICYmIGN1cnJlbnRSZWRyYXcgIT0gbnVsbCkge1xuXHRcdFx0XHRQcm9taXNlLnJlc29sdmUocmVzdWx0KS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmIChjdXJyZW50UmVkcmF3ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3IgLSBDb21tYSBvcGVyYXRvciBpbnRlbnRpb25hbGx5IHVzZWQgdG8gY2FsbCB3aXRob3V0ICd0aGlzJyBiaW5kaW5nXG5cdFx0XHRcdFx0XHQoMCwgY3VycmVudFJlZHJhdykoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25jcmVhdGUgPT09ICdmdW5jdGlvbicpIGhvb2tzLnB1c2goY2FsbEhvb2suYmluZChzb3VyY2Uub25jcmVhdGUsIHZub2RlKSlcblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVMaWZlY3ljbGUoc291cmNlOiBhbnksIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPikge1xuXHRcdGlmICh0eXBlb2Ygc291cmNlLm9udXBkYXRlID09PSAnZnVuY3Rpb24nKSBob29rcy5wdXNoKGNhbGxIb29rLmJpbmQoc291cmNlLm9udXBkYXRlLCB2bm9kZSkpXG5cdH1cblx0ZnVuY3Rpb24gc2hvdWxkTm90VXBkYXRlKHZub2RlOiBhbnksIG9sZDogYW55KTogYm9vbGVhbiB7XG5cdFx0ZG8ge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9uYmVmb3JldXBkYXRlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdGNvbnN0IGZvcmNlID0gY2FsbEhvb2suY2FsbCh2bm9kZS5hdHRycy5vbmJlZm9yZXVwZGF0ZSwgdm5vZGUsIG9sZClcblx0XHRcdFx0aWYgKGZvcmNlICE9PSB1bmRlZmluZWQgJiYgIWZvcmNlKSBicmVha1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09ICdzdHJpbmcnICYmIHR5cGVvZiB2bm9kZS5zdGF0ZS5vbmJlZm9yZXVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRjb25zdCBmb3JjZSA9IGNhbGxIb29rLmNhbGwodm5vZGUuc3RhdGUub25iZWZvcmV1cGRhdGUsIHZub2RlLCBvbGQpXG5cdFx0XHRcdGlmIChmb3JjZSAhPT0gdW5kZWZpbmVkICYmICFmb3JjZSkgYnJlYWtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH0gd2hpbGUgKGZhbHNlKSAgXG5cdFx0dm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdHZub2RlLmluc3RhbmNlID0gb2xkLmluc3RhbmNlXG5cdFx0Ly8gT25lIHdvdWxkIHRoaW5rIGhhdmluZyB0aGUgYWN0dWFsIGxhdGVzdCBhdHRyaWJ1dGVzIHdvdWxkIGJlIGlkZWFsLFxuXHRcdC8vIGJ1dCBpdCBkb2Vzbid0IGxldCB1cyBwcm9wZXJseSBkaWZmIGJhc2VkIG9uIG91ciBjdXJyZW50IGludGVybmFsXG5cdFx0Ly8gcmVwcmVzZW50YXRpb24uIFdlIGhhdmUgdG8gc2F2ZSBub3Qgb25seSB0aGUgb2xkIERPTSBpbmZvLCBidXQgYWxzb1xuXHRcdC8vIHRoZSBhdHRyaWJ1dGVzIHVzZWQgdG8gY3JlYXRlIGl0LCBhcyB3ZSBkaWZmICp0aGF0Kiwgbm90IGFnYWluc3QgdGhlXG5cdFx0Ly8gRE9NIGRpcmVjdGx5ICh3aXRoIGEgZmV3IGV4Y2VwdGlvbnMgaW4gYHNldEF0dHJgKS4gQW5kLCBvZiBjb3Vyc2UsIHdlXG5cdFx0Ly8gbmVlZCB0byBzYXZlIHRoZSBjaGlsZHJlbiBhbmQgdGV4dCBhcyB0aGV5IGFyZSBjb25jZXB0dWFsbHkgbm90XG5cdFx0Ly8gdW5saWtlIHNwZWNpYWwgXCJhdHRyaWJ1dGVzXCIgaW50ZXJuYWxseS5cblx0XHR2bm9kZS5hdHRycyA9IG9sZC5hdHRyc1xuXHRcdHZub2RlLmNoaWxkcmVuID0gb2xkLmNoaWxkcmVuXG5cdFx0dm5vZGUudGV4dCA9IG9sZC50ZXh0XG5cdFx0cmV0dXJuIHRydWVcblx0fVxuXG5cdGxldCBjdXJyZW50RE9NOiBFbGVtZW50IHwgbnVsbCA9IG51bGxcblxuXHRyZXR1cm4gZnVuY3Rpb24oZG9tOiBFbGVtZW50LCB2bm9kZXM6IENoaWxkcmVuIHwgVm5vZGVUeXBlIHwgbnVsbCwgcmVkcmF3PzogKCkgPT4gdm9pZCkge1xuXHRcdGlmICghZG9tKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdET00gZWxlbWVudCBiZWluZyByZW5kZXJlZCB0byBkb2VzIG5vdCBleGlzdC4nKVxuXHRcdGlmIChjdXJyZW50RE9NICE9IG51bGwgJiYgZG9tLmNvbnRhaW5zKGN1cnJlbnRET00pKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdOb2RlIGlzIGN1cnJlbnRseSBiZWluZyByZW5kZXJlZCB0byBhbmQgdGh1cyBpcyBsb2NrZWQuJylcblx0XHR9XG5cdFx0Y29uc3QgcHJldlJlZHJhdyA9IGN1cnJlbnRSZWRyYXdcblx0XHRjb25zdCBwcmV2RE9NID0gY3VycmVudERPTVxuXHRcdGNvbnN0IGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdXG5cdFx0Y29uc3QgYWN0aXZlID0gYWN0aXZlRWxlbWVudChkb20pXG5cdFx0Y29uc3QgbmFtZXNwYWNlID0gZG9tLm5hbWVzcGFjZVVSSVxuXG5cdFx0Y3VycmVudERPTSA9IGRvbVxuXHRcdGN1cnJlbnRSZWRyYXcgPSB0eXBlb2YgcmVkcmF3ID09PSAnZnVuY3Rpb24nID8gcmVkcmF3IDogdW5kZWZpbmVkXG5cdFx0Y3VycmVudFJlbmRlciA9IHt9XG5cdFx0Ly8gUmVzZXQgaHlkcmF0aW9uIGVycm9yIGNvdW50ZXIgYW5kIG1pc21hdGNoIGNvdW50IGF0IHN0YXJ0IG9mIGVhY2ggcmVuZGVyIGN5Y2xlXG5cdFx0cmVzZXRIeWRyYXRpb25FcnJvckNvdW50KClcblx0XHRoeWRyYXRpb25NaXNtYXRjaENvdW50ID0gMFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBEZXRlY3QgaHlkcmF0aW9uOiBET00gaGFzIGNoaWxkcmVuIGJ1dCBubyB2bm9kZXMgdHJhY2tlZFxuXHRcdFx0Ly8gT25seSBjaGVjayBjaGlsZHJlbiBmb3IgRWxlbWVudCBub2RlcyAoRG9jdW1lbnRGcmFnbWVudCBkb2Vzbid0IGhhdmUgY2hpbGRyZW4gcHJvcGVydHkpXG5cdFx0XHRsZXQgaXNIeWRyYXRpbmcgPSAoZG9tIGFzIGFueSkudm5vZGVzID09IG51bGwgJiYgXG5cdFx0XHRcdGRvbS5ub2RlVHlwZSA9PT0gMSAmJiAvLyBFbGVtZW50IG5vZGVcblx0XHRcdFx0J2NoaWxkcmVuJyBpbiBkb20gJiZcblx0XHRcdFx0KGRvbSBhcyBFbGVtZW50KS5jaGlsZHJlbi5sZW5ndGggPiAwXG5cdFx0XHRcblx0XHRcdC8vIEZpcnN0IHRpbWUgcmVuZGVyaW5nIGludG8gYSBub2RlIGNsZWFycyBpdCBvdXQgKHVubGVzcyBoeWRyYXRpbmcpXG5cdFx0XHRpZiAoIWlzSHlkcmF0aW5nICYmIChkb20gYXMgYW55KS52bm9kZXMgPT0gbnVsbCkgZG9tLnRleHRDb250ZW50ID0gJydcblx0XHRcdGNvbnN0IG5vcm1hbGl6ZWQgPSAoVm5vZGUgYXMgYW55KS5ub3JtYWxpemVDaGlsZHJlbihBcnJheS5pc0FycmF5KHZub2RlcykgPyB2bm9kZXMgOiBbdm5vZGVzXSlcblx0XHRcdHVwZGF0ZU5vZGVzKGRvbSwgKGRvbSBhcyBhbnkpLnZub2Rlcywgbm9ybWFsaXplZCwgaG9va3MsIG51bGwsIChuYW1lc3BhY2UgPT09ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJyA/IHVuZGVmaW5lZCA6IG5hbWVzcGFjZSkgYXMgc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZylcblx0XHRcdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgd2UndmUgZXhjZWVkZWQgbWlzbWF0Y2ggdGhyZXNob2xkIGFmdGVyIHByb2Nlc3Npbmcgbm9kZXNcblx0XHRcdC8vIElmIHNvLCBjbGVhciBhbmQgcmUtcmVuZGVyIGZyb20gc2NyYXRjaCAoY2xpZW50IFZET00gd2lucylcblx0XHRcdGlmIChpc0h5ZHJhdGluZyAmJiBoeWRyYXRpb25NaXNtYXRjaENvdW50ID4gTUFYX0hZRFJBVElPTl9NSVNNQVRDSEVTKSB7XG5cdFx0XHRcdGxvZ2dlci53YXJuKGBIeWRyYXRpb24gbWlzbWF0Y2ggdGhyZXNob2xkIGV4Y2VlZGVkLiBDbGVhcmluZyBwYXJlbnQgYW5kIHJlLXJlbmRlcmluZyBmcm9tIGNsaWVudCBWRE9NLmAsIHtcblx0XHRcdFx0XHRtaXNtYXRjaENvdW50OiBoeWRyYXRpb25NaXNtYXRjaENvdW50LFxuXHRcdFx0XHRcdHRocmVzaG9sZDogTUFYX0hZRFJBVElPTl9NSVNNQVRDSEVTLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRkb20udGV4dENvbnRlbnQgPSAnJ1xuXHRcdFx0XHRoeWRyYXRpb25NaXNtYXRjaENvdW50ID0gMFxuXHRcdFx0XHQvLyBDbGVhciBvbGQgdm5vZGVzIGFuZCByZS1yZW5kZXIgd2l0aG91dCBoeWRyYXRpb24gZmxhZ1xuXHRcdFx0XHQ7KGRvbSBhcyBhbnkpLnZub2RlcyA9IG51bGxcblx0XHRcdFx0Ly8gUmUtcmVuZGVyIHdpdGggZnJlc2ggaG9va3MgYXJyYXkgKGhvb2tzIGZyb20gZmlyc3QgcmVuZGVyIGFyZSBkaXNjYXJkZWQpXG5cdFx0XHRcdGNvbnN0IG92ZXJyaWRlSG9va3M6IEFycmF5PCgpID0+IHZvaWQ+ID0gW11cblx0XHRcdFx0dXBkYXRlTm9kZXMoZG9tLCBudWxsLCBub3JtYWxpemVkLCBvdmVycmlkZUhvb2tzLCBudWxsLCAobmFtZXNwYWNlID09PSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcgPyB1bmRlZmluZWQgOiBuYW1lc3BhY2UpIGFzIHN0cmluZyB8IHVuZGVmaW5lZCwgZmFsc2UpXG5cdFx0XHRcdC8vIEV4ZWN1dGUgaG9va3MgZnJvbSBvdmVycmlkZSByZW5kZXJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvdmVycmlkZUhvb2tzLmxlbmd0aDsgaSsrKSBvdmVycmlkZUhvb2tzW2ldKClcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Oyhkb20gYXMgYW55KS52bm9kZXMgPSBub3JtYWxpemVkXG5cdFx0XHQvLyBgZG9jdW1lbnQuYWN0aXZlRWxlbWVudGAgY2FuIHJldHVybiBudWxsOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9pbnRlcmFjdGlvbi5odG1sI2RvbS1kb2N1bWVudC1hY3RpdmVlbGVtZW50XG5cdFx0XHRpZiAoYWN0aXZlICE9IG51bGwgJiYgYWN0aXZlRWxlbWVudChkb20pICE9PSBhY3RpdmUgJiYgdHlwZW9mIChhY3RpdmUgYXMgYW55KS5mb2N1cyA9PT0gJ2Z1bmN0aW9uJykgKGFjdGl2ZSBhcyBhbnkpLmZvY3VzKClcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyBpKyspIGhvb2tzW2ldKClcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Y3VycmVudFJlZHJhdyA9IHByZXZSZWRyYXdcblx0XHRcdGN1cnJlbnRET00gPSBwcmV2RE9NXG5cdFx0fVxuXHR9XG59XG4iLAogICAgIi8qKlxuICogSXNvbW9ycGhpYyBuZXh0X3RpY2sgdXRpbGl0eVxuICogXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIGFmdGVyIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBzdGFjayBjb21wbGV0ZXMuXG4gKiBcbiAqIC0gSW4gYnJvd3NlcjogVXNlcyBxdWV1ZU1pY3JvdGFzayBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZSwgZmFsbHMgYmFjayB0byBQcm9taXNlLnJlc29sdmUoKVxuICogLSBJbiBTU1I6IFJlc29sdmVzIGltbWVkaWF0ZWx5IHNpbmNlIFNTUiByZW5kZXJpbmcgaXMgc3luY2hyb25vdXMgYW5kIHRoZXJlJ3Mgbm8gZXZlbnQgbG9vcFxuICogXG4gKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgb24gdGhlIG5leHQgdGlja1xuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5hc3luYyBmdW5jdGlvbiBuZXh0X3RpY2soKTogUHJvbWlzZTx2b2lkPiB7XG5cdC8vIENoZWNrIGlmIHdlJ3JlIGluIFNTUiBtb2RlXG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgKGdsb2JhbFRoaXMgYXMgYW55KS5fX1NTUl9NT0RFX18pIHtcblx0XHQvLyBJbiBTU1IgbW9kZSwgcmVzb2x2ZSBpbW1lZGlhdGVseSBzaW5jZSBTU1IgcmVuZGVyaW5nIGlzIHN5bmNocm9ub3VzXG5cdFx0Ly8gYW5kIHRoZXJlJ3Mgbm8gZXZlbnQgbG9vcCB0byBkZWZlciB0b1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHR9XG5cblx0Ly8gQnJvd3NlciBtb2RlOiB1c2UgcXVldWVNaWNyb3Rhc2sgZm9yIG9wdGltYWwgcGVyZm9ybWFuY2Vcblx0aWYgKHR5cGVvZiBxdWV1ZU1pY3JvdGFzayAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdHF1ZXVlTWljcm90YXNrKHJlc29sdmUpXG5cdFx0fSlcblx0fVxuXG5cdC8vIEZhbGxiYWNrOiB1c2UgUHJvbWlzZS5yZXNvbHZlKCkgZm9yIG9sZGVyIGVudmlyb25tZW50c1xuXHRpZiAodHlwZW9mIFByb21pc2UgIT09ICd1bmRlZmluZWQnICYmIFByb21pc2UucmVzb2x2ZSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHR9XG5cblx0Ly8gTGFzdCByZXNvcnQ6IHNldFRpbWVvdXQgKHNob3VsZG4ndCBoYXBwZW4gaW4gbW9kZXJuIGVudmlyb25tZW50cylcblx0aWYgKHR5cGVvZiBzZXRUaW1lb3V0ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZTogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLCAwKVxuXHRcdH0pXG5cdH1cblxuXHQvLyBJZiBub3RoaW5nIGlzIGF2YWlsYWJsZSwgcmVzb2x2ZSBpbW1lZGlhdGVseVxuXHQvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gaW4gcHJhY3RpY2UsIGJ1dCBUeXBlU2NyaXB0IG5lZWRzIGEgcmV0dXJuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKSBhcyBQcm9taXNlPHZvaWQ+XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5leHRfdGlja1xuZXhwb3J0IHtuZXh0X3RpY2t9XG4iLAogICAgImltcG9ydCB7c2lnbmFsLCBjb21wdXRlZCwgU2lnbmFsLCBDb21wdXRlZFNpZ25hbH0gZnJvbSAnLi9zaWduYWwnXG5pbXBvcnQge2dldFNTUkNvbnRleHR9IGZyb20gJy4vc3NyQ29udGV4dCdcblxuLy8gV2Vha01hcCB0byBzdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZXMgZm9yIGFycmF5c1xuY29uc3QgYXJyYXlQYXJlbnRTaWduYWxNYXAgPSBuZXcgV2Vha01hcDxhbnksIFNpZ25hbDxhbnk+PigpXG5cbi8vIERlZmVycmVkIGNvbXB1dGVkIGV2YWx1YXRpb24gKEFEUi0wMDEzKTogZ2F0ZSBjb21wdXRlZHMgdW50aWwgYWxsb3dDb21wdXRlZCgpIGlzIGNhbGxlZFxuY29uc3Qgc3RhdGVEZWZlcnJlZEZsYWdzID0gbmV3IFdlYWtNYXA8b2JqZWN0LCB7IGFsbG93ZWQ6IGJvb2xlYW4gfT4oKVxuLy8gU3RvcmUgX19yb290U3RhdGUgaW4gYSBXZWFrTWFwIHRvIGF2b2lkIHByb3h5IGdldCByZWN1cnNpb24gd2hlbiByZWFkaW5nICh3cmFwcGVkIGFzIGFueSkuX19yb290U3RhdGVcbmNvbnN0IHN0YXRlUm9vdE1hcCA9IG5ldyBXZWFrTWFwPG9iamVjdCwgYW55PigpXG5cbmZ1bmN0aW9uIGdldERlZmVycmVkQWxsb3dlZChzdGF0ZU9iajogYW55KTogYm9vbGVhbiB7XG5cdGNvbnN0IHJvb3QgPSAoc3RhdGVPYmogJiYgKHN0YXRlUm9vdE1hcC5nZXQoc3RhdGVPYmopID8/IHN0YXRlT2JqKSkgfHwgc3RhdGVPYmpcblx0Y29uc3QgZmxhZ3MgPSByb290ID8gc3RhdGVEZWZlcnJlZEZsYWdzLmdldChyb290KSA6IHVuZGVmaW5lZFxuXHRyZXR1cm4gIWZsYWdzIHx8IGZsYWdzLmFsbG93ZWRcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RhdGVDb21wdXRlZDxUPih3cmFwcGVkOiBhbnksIGNvbXB1dGVGbjogKCkgPT4gVCwgc2hvdWxkRGVmZXI6IGJvb2xlYW4pOiBDb21wdXRlZFNpZ25hbDxUPiB7XG5cdGlmICghc2hvdWxkRGVmZXIpIHJldHVybiBjb21wdXRlZChjb21wdXRlRm4pXG5cdHJldHVybiBjb21wdXRlZCgoKSA9PiB7XG5cdFx0aWYgKCFnZXREZWZlcnJlZEFsbG93ZWQod3JhcHBlZCkpIHJldHVybiB1bmRlZmluZWQgYXMgVFxuXHRcdHJldHVybiBjb21wdXRlRm4oKVxuXHR9KVxufVxuXG4vKiogUmVjdXJzaXZlbHkgbWFyayBhbGwgQ29tcHV0ZWRTaWduYWxzIGluIGEgc3RhdGUgdHJlZSBkaXJ0eSAodXNlZCB3aGVuIG9wZW5pbmcgZGVmZXJyZWQgZ2F0ZSkuICovXG5mdW5jdGlvbiBtYXJrQWxsQ29tcHV0ZWRzRGlydHkoc3RhdGVPYmo6IGFueSk6IHZvaWQge1xuXHRpZiAoIXN0YXRlT2JqIHx8ICEoc3RhdGVPYmogYXMgYW55KS5fX2lzU3RhdGUpIHJldHVyblxuXHRjb25zdCBzaWduYWxNYXAgPSAoc3RhdGVPYmogYXMgYW55KS5fX3NpZ25hbE1hcFxuXHRpZiAoIXNpZ25hbE1hcCB8fCAhKHNpZ25hbE1hcCBpbnN0YW5jZW9mIE1hcCkpIHJldHVyblxuXHRzaWduYWxNYXAuZm9yRWFjaCgoc2lnOiBhbnkpID0+IHtcblx0XHRpZiAoc2lnIGluc3RhbmNlb2YgQ29tcHV0ZWRTaWduYWwpIHtcblx0XHRcdHNpZy5tYXJrRGlydHkoKVxuXHRcdH0gZWxzZSBpZiAoc2lnICYmIHR5cGVvZiBzaWcgPT09ICdvYmplY3QnICYmIHNpZy52YWx1ZSAmJiAoc2lnLnZhbHVlIGFzIGFueSkuX19pc1N0YXRlKSB7XG5cdFx0XHRtYXJrQWxsQ29tcHV0ZWRzRGlydHkoc2lnLnZhbHVlKVxuXHRcdH1cblx0fSlcbn1cblxuLy8gVHlwZSBndWFyZCB0byBjaGVjayBpZiB2YWx1ZSBpcyBhIFNpZ25hbFxuZnVuY3Rpb24gaXNTaWduYWw8VD4odmFsdWU6IGFueSk6IHZhbHVlIGlzIFNpZ25hbDxUPiB7XG5cdHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFNpZ25hbCB8fCB2YWx1ZSBpbnN0YW5jZW9mIENvbXB1dGVkU2lnbmFsXG59XG5cbi8vIFR5cGUgZ3VhcmQgdG8gY2hlY2sgaWYgdmFsdWUgaXMgYWxyZWFkeSBhIHN0YXRlIChoYXMgYmVlbiB3cmFwcGVkKVxuZnVuY3Rpb24gaXNTdGF0ZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICh2YWx1ZSBhcyBhbnkpLl9faXNTdGF0ZSA9PT0gdHJ1ZVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgdmFsdWUgaXMgYSBnZXQvc2V0IGRlc2NyaXB0b3Igb2JqZWN0IChsaWtlIEphdmFTY3JpcHQgcHJvcGVydHkgZGVzY3JpcHRvcnMpXG4gKiBVc2VkIHRvIGRldGVjdCBjb21wdXRlZCBwcm9wZXJ0aWVzIGRlZmluZWQgYXMgeyBnZXQ6ICgpID0+IFQsIHNldD86ICh2YWx1ZTogVCkgPT4gdm9pZCB9XG4gKi9cbmZ1bmN0aW9uIGlzR2V0U2V0RGVzY3JpcHRvcih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIFxuXHQgICAgICAgKHR5cGVvZiB2YWx1ZS5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbHVlLnNldCA9PT0gJ2Z1bmN0aW9uJylcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgdmFsdWUgdG8gYSBzaWduYWwgaWYgaXQncyBub3QgYWxyZWFkeSBvbmVcbiAqL1xuZnVuY3Rpb24gdG9TaWduYWw8VD4odmFsdWU6IFQpOiBTaWduYWw8VD4gfCBDb21wdXRlZFNpZ25hbDxUPiB7XG5cdGlmIChpc1NpZ25hbCh2YWx1ZSkpIHtcblx0XHRyZXR1cm4gdmFsdWUgYXMgU2lnbmFsPFQ+IHwgQ29tcHV0ZWRTaWduYWw8VD5cblx0fVxuXHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0Ly8gRnVuY3Rpb24gcHJvcGVydGllcyBiZWNvbWUgY29tcHV0ZWQgc2lnbmFsc1xuXHRcdHJldHVybiBjb21wdXRlZCh2YWx1ZSBhcyAoKSA9PiBUKVxuXHR9XG5cdHJldHVybiBzaWduYWwodmFsdWUpXG59XG5cbi8vIFN0YXRlIHJlZ2lzdHJ5IGZvciBTU1Igc2VyaWFsaXphdGlvblxuLy8gU3RvcmVzIGJvdGggc3RhdGUgaW5zdGFuY2UgYW5kIG9yaWdpbmFsIGluaXRpYWwgc3RhdGUgKHdpdGggY29tcHV0ZWQgcHJvcGVydGllcylcbmludGVyZmFjZSBTdGF0ZVJlZ2lzdHJ5RW50cnkge1xuXHRzdGF0ZTogYW55XG5cdGluaXRpYWw6IGFueVxufVxuXG5jb25zdCBnbG9iYWxTdGF0ZVJlZ2lzdHJ5ID0gbmV3IE1hcDxzdHJpbmcsIFN0YXRlUmVnaXN0cnlFbnRyeT4oKVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlZ2lzdHJ5IHRvIHVzZTogcGVyLXJlcXVlc3QgcmVnaXN0cnkgd2hlbiBpbnNpZGUgYW4gU1NSXG4gKiBydW5XaXRoQ29udGV4dCgpLCBvdGhlcndpc2UgdGhlIGdsb2JhbCByZWdpc3RyeSAoY2xpZW50IG9yIHRlc3RzKS5cbiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudFN0YXRlUmVnaXN0cnkoKTogTWFwPHN0cmluZywgU3RhdGVSZWdpc3RyeUVudHJ5PiB7XG5cdGNvbnN0IGN0eCA9IGdldFNTUkNvbnRleHQoKVxuXHRpZiAoY3R4Py5zdGF0ZVJlZ2lzdHJ5KSB7XG5cdFx0cmV0dXJuIGN0eC5zdGF0ZVJlZ2lzdHJ5IGFzIE1hcDxzdHJpbmcsIFN0YXRlUmVnaXN0cnlFbnRyeT5cblx0fVxuXHRyZXR1cm4gZ2xvYmFsU3RhdGVSZWdpc3RyeVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgc3RhdGUgZm9yIFNTUiBzZXJpYWxpemF0aW9uXG4gKiBDYWxsZWQgYXV0b21hdGljYWxseSB3aGVuIHN0YXRlIGlzIGNyZWF0ZWQgd2l0aCBhIG5hbWVcbiAqIEBwYXJhbSBuYW1lIC0gVW5pcXVlIG5hbWUgZm9yIHRoZSBzdGF0ZVxuICogQHBhcmFtIHN0YXRlSW5zdGFuY2UgLSBUaGUgc3RhdGUgaW5zdGFuY2UgdG8gcmVnaXN0ZXJcbiAqIEBwYXJhbSBpbml0aWFsIC0gT3JpZ2luYWwgaW5pdGlhbCBzdGF0ZSAod2l0aCBjb21wdXRlZCBwcm9wZXJ0aWVzKSBmb3IgcmVzdG9yYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU3RhdGUobmFtZTogc3RyaW5nLCBzdGF0ZUluc3RhbmNlOiBhbnksIGluaXRpYWw6IGFueSk6IHZvaWQge1xuXHRpZiAoIW5hbWUgfHwgdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8IG5hbWUudHJpbSgpID09PSAnJykge1xuXHRcdHRocm93IG5ldyBFcnJvcignU3RhdGUgbmFtZSBpcyByZXF1aXJlZCBhbmQgbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcnKVxuXHR9XG5cblx0Y29uc3QgcmVnaXN0cnkgPSBnZXRDdXJyZW50U3RhdGVSZWdpc3RyeSgpXG5cblx0Ly8gV2FybiBpbiBkZXZlbG9wbWVudCBpZiBuYW1lIGNvbGxpc2lvbiBkZXRlY3RlZFxuXHRpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52Py5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG5cdFx0aWYgKHJlZ2lzdHJ5LmhhcyhuYW1lKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBTdGF0ZSBuYW1lIGNvbGxpc2lvbiBkZXRlY3RlZDogXCIke25hbWV9XCIuIExhc3QgcmVnaXN0ZXJlZCBzdGF0ZSB3aWxsIGJlIHVzZWQuYClcblx0XHR9XG5cdH1cblxuXHRyZWdpc3RyeS5zZXQobmFtZSwge3N0YXRlOiBzdGF0ZUluc3RhbmNlLCBpbml0aWFsfSlcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIHJlZ2lzdHJ5IGVudHJ5IGZvciBhbiBleGlzdGluZyBzdGF0ZVxuICogVXNlZCBieSBTdG9yZSB0byB1cGRhdGUgaXRzIFwiaW5pdGlhbFwiIHN0YXRlIGFmdGVyIGxvYWQoKSBpcyBjYWxsZWRcbiAqIEBwYXJhbSBzdGF0ZUluc3RhbmNlIC0gVGhlIHN0YXRlIGluc3RhbmNlIHRvIHVwZGF0ZVxuICogQHBhcmFtIGluaXRpYWwgLSBOZXcgaW5pdGlhbCBzdGF0ZSAobWVyZ2VkIHRlbXBsYXRlcyBmb3IgU3RvcmUpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTdGF0ZVJlZ2lzdHJ5KHN0YXRlSW5zdGFuY2U6IGFueSwgaW5pdGlhbDogYW55KTogdm9pZCB7XG5cdGNvbnN0IHJlZ2lzdHJ5ID0gZ2V0Q3VycmVudFN0YXRlUmVnaXN0cnkoKVxuXHQvLyBGaW5kIHRoZSByZWdpc3RyeSBlbnRyeSBmb3IgdGhpcyBzdGF0ZSBhbmQgdXBkYXRlIGl0cyBpbml0aWFsIHZhbHVlXG5cdGZvciAoY29uc3QgW25hbWUsIGVudHJ5XSBvZiByZWdpc3RyeS5lbnRyaWVzKCkpIHtcblx0XHRpZiAoZW50cnkuc3RhdGUgPT09IHN0YXRlSW5zdGFuY2UpIHtcblx0XHRcdHJlZ2lzdHJ5LnNldChuYW1lLCB7c3RhdGU6IHN0YXRlSW5zdGFuY2UsIGluaXRpYWx9KVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHR9XG5cdC8vIElmIG5vdCBmb3VuZCwgdGhpcyBpcyBhbiBlcnJvciBjYXNlIC0gc3RhdGUgc2hvdWxkIGJlIHJlZ2lzdGVyZWRcblx0dGhyb3cgbmV3IEVycm9yKCdTdGF0ZSBpbnN0YW5jZSBub3QgZm91bmQgaW4gcmVnaXN0cnkuIFN0YXRlIG11c3QgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgdXBkYXRpbmcuJylcbn1cblxuLyoqXG4gKiBHZXQgYWxsIHJlZ2lzdGVyZWQgc3RhdGVzXG4gKiBSZXR1cm5zIE1hcCBvZiBzdGF0ZSBuYW1lcyB0byByZWdpc3RyeSBlbnRyaWVzIChzdGF0ZSBpbnN0YW5jZSBhbmQgaW5pdGlhbCBzdGF0ZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlZ2lzdGVyZWRTdGF0ZXMoKTogTWFwPHN0cmluZywgU3RhdGVSZWdpc3RyeUVudHJ5PiB7XG5cdHJldHVybiBnZXRDdXJyZW50U3RhdGVSZWdpc3RyeSgpXG59XG5cbi8qKlxuICogQ29weSBzdGF0ZXMgZnJvbSBnbG9iYWwgcmVnaXN0cnkgdG8gU1NSIGNvbnRleHQuXG4gKiBVc2VkIHdoZW4gYXBwIG1vZHVsZXMgbG9hZCBhdCBzdGFydHVwIChyZWdpc3RlcmluZyB0byBnbG9iYWwpIGJ1dCBTU1IgbmVlZHNcbiAqIHRoZW0gaW4gdGhlIHBlci1yZXF1ZXN0IGNvbnRleHQgZm9yIHNlcmlhbGl6YXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5R2xvYmFsU3RhdGVzVG9Db250ZXh0KGNvbnRleHQ6IHtzdGF0ZVJlZ2lzdHJ5OiBNYXA8c3RyaW5nLCBTdGF0ZVJlZ2lzdHJ5RW50cnk+fSk6IHZvaWQge1xuXHRmb3IgKGNvbnN0IFtuYW1lLCBlbnRyeV0gb2YgZ2xvYmFsU3RhdGVSZWdpc3RyeS5lbnRyaWVzKCkpIHtcblx0XHRjb250ZXh0LnN0YXRlUmVnaXN0cnkuc2V0KG5hbWUsIGVudHJ5KVxuXHR9XG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHN0YXRlIHJlZ2lzdHJ5ICh1c2VmdWwgZm9yIHRlc3Rpbmcgb3IgYWZ0ZXIgc2VyaWFsaXphdGlvbikuXG4gKiBDbGVhcnMgdGhlIGN1cnJlbnQgcmVnaXN0cnkgKHBlci1yZXF1ZXN0IGluIFNTUiwgZ2xvYmFsIG9uIGNsaWVudCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclN0YXRlUmVnaXN0cnkoKTogdm9pZCB7XG5cdGdldEN1cnJlbnRTdGF0ZVJlZ2lzdHJ5KCkuY2xlYXIoKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlT3B0aW9ucyB7XG5cdC8qKiBXaGVuIHRydWUsIGNvbXB1dGVkIHByb3BlcnRpZXMgYXJlIG5vdCBldmFsdWF0ZWQgdW50aWwgYWxsb3dDb21wdXRlZCgpIGlzIGNhbGxlZCAoQURSLTAwMTMpLiAqL1xuXHRkZWZlckNvbXB1dGVkPzogYm9vbGVhblxufVxuXG4vKipcbiAqIERlZXAgc2lnbmFsIHN0YXRlIC0gd3JhcHMgb2JqZWN0cy9hcnJheXMgd2l0aCBQcm94eSB0byBtYWtlIHRoZW0gcmVhY3RpdmVcbiAqIEBwYXJhbSBpbml0aWFsIC0gSW5pdGlhbCBzdGF0ZSBvYmplY3RcbiAqIEBwYXJhbSBuYW1lIC0gT3B0aW9uYWwgbmFtZSBmb3IgU1NSIHNlcmlhbGl6YXRpb24vaHlkcmF0aW9uLiBXaGVuIG9taXR0ZWQsIHN0YXRlIGlzIG5vdCByZWdpc3RlcmVkIChzdWl0YWJsZSBmb3IgY2xpZW50LW9ubHkgYXBwcykuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBkZWZlckNvbXB1dGVkOiB3aGVuIHRydWUsIGNvbXB1dGVkcyByZXR1cm4gdW5kZWZpbmVkIHVudGlsIGFsbG93Q29tcHV0ZWQoKSBpcyBjYWxsZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55Pj4oaW5pdGlhbDogVCwgbmFtZT86IHN0cmluZywgb3B0aW9ucz86IFN0YXRlT3B0aW9ucyk6IFN0YXRlPFQ+IHtcblx0Y29uc3Qgc2lnbmFsTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNpZ25hbDxhbnk+IHwgQ29tcHV0ZWRTaWduYWw8YW55Pj4oKVxuXHRjb25zdCBzdGF0ZUNhY2hlID0gbmV3IFdlYWtNYXA8b2JqZWN0LCBhbnk+KClcblx0Y29uc3QgZGVmZXJDb21wdXRlZCA9ICEhb3B0aW9ucz8uZGVmZXJDb21wdXRlZFxuXG5cdC8vIENvbnRleHQgcGFzc2VkIHRocm91Z2ggcmVjdXJzaXZlIGluaXRpYWxpemVTaWduYWxzIGZvciBkZWZlcnJlZCBjb21wdXRlZHMgYW5kIHJvb3QgcmVmZXJlbmNlXG5cdGludGVyZmFjZSBJbml0Q29udGV4dCB7XG5cdFx0ZGVmZXJDb21wdXRlZDogYm9vbGVhblxuXHRcdHJvb3RTdGF0ZT86IGFueVxuXHR9XG5cblx0Ly8gQ29udmVydCBpbml0aWFsIHZhbHVlcyB0byBzaWduYWxzXG5cdC8vIHBhcmVudFNpZ25hbE1hcCBpcyBvcHRpb25hbCAtIGlmIHByb3ZpZGVkLCBuZXN0ZWQgc3RhdGVzIHdpbGwgdXNlIGl0XG5cdC8vIElmIG5vdCBwcm92aWRlZCwgZWFjaCBuZXN0ZWQgc3RhdGUgZ2V0cyBpdHMgb3duIHNpZ25hbE1hcFxuXHRmdW5jdGlvbiBpbml0aWFsaXplU2lnbmFscyhvYmo6IGFueSwgcGFyZW50U2lnbmFsTWFwPzogTWFwPHN0cmluZywgU2lnbmFsPGFueT4gfCBDb21wdXRlZFNpZ25hbDxhbnk+PiwgY29udGV4dD86IEluaXRDb250ZXh0KTogYW55IHtcblx0XHRpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gb2JqXG5cdFx0fVxuXG5cdFx0Ly8gQ2hlY2sgaWYgYWxyZWFkeSB3cmFwcGVkXG5cdFx0aWYgKGlzU3RhdGUob2JqKSkge1xuXHRcdFx0cmV0dXJuIG9ialxuXHRcdH1cblxuXHRcdC8vIENoZWNrIGNhY2hlXG5cdFx0aWYgKHN0YXRlQ2FjaGUuaGFzKG9iaikpIHtcblx0XHRcdHJldHVybiBzdGF0ZUNhY2hlLmdldChvYmopXG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGFycmF5c1xuXHRcdGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcblx0XHRcdC8vIEFycmF5cyBkb24ndCBnZXQgdGhlaXIgb3duIHNpZ25hbE1hcCAtIHRoZXkgdXNlIHRoZSBwYXJlbnQnc1xuXHRcdFx0Ly8gTmVzdGVkIG9iamVjdHMgQU5EIGFycmF5cyBzaG91bGQgYmUgcmVjdXJzaXZlbHkgd3JhcHBlZFxuXHRcdFx0Y29uc3Qgc2lnbmFscyA9IG9iai5tYXAoKGl0ZW06IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAodHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmIGl0ZW0gIT09IG51bGwpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNpdmVseSB3cmFwIG5lc3RlZCBvYmplY3RzIEFORCBhcnJheXMgaW4gUHJveGllc1xuXHRcdFx0XHRcdHJldHVybiBpbml0aWFsaXplU2lnbmFscyhpdGVtLCB1bmRlZmluZWQsIGNvbnRleHQpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRvU2lnbmFsKGl0ZW0pXG5cdFx0XHR9KVxuXHRcdFx0XG5cdFx0XHQvLyBMaXN0IG9mIG11dGF0aW5nIGFycmF5IG1ldGhvZHMgdGhhdCBzaG91bGQgdHJpZ2dlciB0aGUgcGFyZW50IHNpZ25hbFxuXHRcdFx0Y29uc3QgbXV0YXRpbmdNZXRob2RzID0gWydzcGxpY2UnLCAncHVzaCcsICdwb3AnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdyZXZlcnNlJywgJ3NvcnQnLCAnZmlsbCcsICdjb3B5V2l0aGluJ11cblx0XHRcdFxuXHRcdFx0Ly8gV3JhcCB0aGUgc2lnbmFscyBhcnJheSBkaXJlY3RseSAobm90IGEgY29weSkgc28gbXV0YXRpb25zIHN0YXkgaW4gc3luY1xuXHRcdFx0Ly8gU3RvcmUgcGFyZW50IHNpZ25hbCByZWZlcmVuY2UgZGlyZWN0bHkgb24gdGhlIFByb3h5IGZvciByZWxpYWJsZSBsb29rdXBcblx0XHRcdGNvbnN0IHdyYXBwZWQgPSBuZXcgUHJveHkoc2lnbmFscywge1xuXHRcdFx0XHRnZXQodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdFx0aWYgKHByb3AgPT09ICdfX2lzU3RhdGUnKSByZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdGlmIChwcm9wID09PSAnX19zaWduYWxzJykgcmV0dXJuIHNpZ25hbHNcblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gJ19fcGFyZW50U2lnbmFsJykge1xuXHRcdFx0XHRcdFx0Ly8gQWxsb3cgYWNjZXNzaW5nIHBhcmVudCBzaWduYWwgZGlyZWN0bHkgZm9yIGRlYnVnZ2luZ1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHByb3AgPT09IFN5bWJvbC50b1N0cmluZ1RhZykgcmV0dXJuICdBcnJheScgLy8gTWFrZSBBcnJheS5pc0FycmF5KCkgd29ya1xuXHRcdFx0XHRcdGlmIChwcm9wID09PSBTeW1ib2wuaXRlcmF0b3IpIHtcblx0XHRcdFx0XHRcdC8vIFByb3ZpZGUgY3VzdG9tIGl0ZXJhdG9yIHRoYXQgdW53cmFwcyBTaWduYWwgdmFsdWVzXG5cdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24qICgpIHtcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzaWduYWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsc1tpXVxuXHRcdFx0XHRcdFx0XHRcdHlpZWxkIGlzU2lnbmFsKHNpZykgPyBzaWcudmFsdWUgOiBzaWdcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gJ2xlbmd0aCcpIHJldHVybiBzaWduYWxzLmxlbmd0aFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IHByb3BTdHIgPSBTdHJpbmcocHJvcClcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBDaGVjayBmb3IgJCBwcmVmaXggY29udmVudGlvbiAoZGVlcHNpZ25hbC1zdHlsZTogcmV0dXJucyByYXcgc2lnbmFsKVxuXHRcdFx0XHRcdGlmIChwcm9wU3RyLnN0YXJ0c1dpdGgoJyQnKSAmJiBwcm9wU3RyLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGluZGV4U3RyID0gcHJvcFN0ci5zbGljZSgxKVxuXHRcdFx0XHRcdFx0aWYgKCFpc05hTihOdW1iZXIoaW5kZXhTdHIpKSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBpbmRleCA9IE51bWJlcihpbmRleFN0cilcblx0XHRcdFx0XHRcdFx0aWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCBzaWduYWxzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHNbaW5kZXhdXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGlzU2lnbmFsKHNpZykgPyBzaWcgOiBzaWdcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnICYmICFpc05hTihOdW1iZXIocHJvcCkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBpbmRleCA9IE51bWJlcihwcm9wKVxuXHRcdFx0XHRcdFx0aWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCBzaWduYWxzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWxzW2luZGV4XVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gaXNTaWduYWwoc2lnKSA/IHNpZy52YWx1ZSA6IHNpZ1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcClcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBGb3IgYXJyYXkgbWV0aG9kcyB0aGF0IGl0ZXJhdGUgKG1hcCwgZmlsdGVyLCBmb3JFYWNoLCBldGMuKSwgYmluZCB0byB3cmFwcGVkIFByb3h5XG5cdFx0XHRcdFx0Ly8gc28gdGhleSBnbyB0aHJvdWdoIG91ciBnZXQgdHJhcCBmb3IgZWxlbWVudCBhY2Nlc3Ncblx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIEFycmF5LmlzQXJyYXkodGFyZ2V0KSkge1xuXHRcdFx0XHRcdFx0Ly8gQXJyYXkgaXRlcmF0aW9uIG1ldGhvZHMgbmVlZCB0byB1c2UgdGhlIFByb3h5IHNvIGVsZW1lbnQgYWNjZXNzIGlzIHVud3JhcHBlZFxuXHRcdFx0XHRcdFx0Y29uc3QgaXRlcmF0aW9uTWV0aG9kcyA9IFsnbWFwJywgJ2ZpbHRlcicsICdmb3JFYWNoJywgJ3NvbWUnLCAnZXZlcnknLCAnZmluZCcsICdmaW5kSW5kZXgnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0J11cblx0XHRcdFx0XHRcdC8vIFNlYXJjaCBtZXRob2RzIGFsc28gbmVlZCB1bndyYXBwZWQgdmFsdWVzIGZvciBjb21wYXJpc29uXG5cdFx0XHRcdFx0XHRjb25zdCBzZWFyY2hNZXRob2RzID0gWydpbmNsdWRlcycsICdpbmRleE9mJywgJ2xhc3RJbmRleE9mJ11cblx0XHRcdFx0XHRcdC8vIE1ldGhvZHMgdGhhdCByZXR1cm4gbmV3IGFycmF5cyBvciBzdHJpbmdzIG5lZWQgdW53cmFwcGVkIHZhbHVlc1xuXHRcdFx0XHRcdFx0Y29uc3QgcmV0dXJuTWV0aG9kcyA9IFsnc2xpY2UnLCAnY29uY2F0JywgJ2ZsYXQnLCAnZmxhdE1hcCcsICdqb2luJywgJ3RvU3RyaW5nJywgJ3RvTG9jYWxlU3RyaW5nJ11cblx0XHRcdFx0XHRcdC8vIEl0ZXJhdG9yIG1ldGhvZHMgbmVlZCB1bndyYXBwZWQgdmFsdWVzXG5cdFx0XHRcdFx0XHRjb25zdCBpdGVyYXRvck1ldGhvZHMgPSBbJ2VudHJpZXMnLCAna2V5cycsICd2YWx1ZXMnXVxuXHRcdFx0XHRcdFx0aWYgKGl0ZXJhdGlvbk1ldGhvZHMuaW5jbHVkZXMocHJvcFN0cikgfHwgc2VhcmNoTWV0aG9kcy5pbmNsdWRlcyhwcm9wU3RyKSB8fCBcblx0XHRcdFx0XHRcdFx0cmV0dXJuTWV0aG9kcy5pbmNsdWRlcyhwcm9wU3RyKSB8fCBpdGVyYXRvck1ldGhvZHMuaW5jbHVkZXMocHJvcFN0cikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLmJpbmQod3JhcHBlZClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gSW50ZXJjZXB0IG11dGF0aW5nIG1ldGhvZHMgdG8gdHJpZ2dlciBwYXJlbnQgc2lnbmFsXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBtdXRhdGluZ01ldGhvZHMuaW5jbHVkZXMocHJvcFN0cikpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiguLi5hcmdzOiBhbnlbXSkge1xuXHRcdFx0XHRcdFx0XHQvLyBGb3Igc3BsaWNlLCB3ZSBuZWVkIHRvIGhhbmRsZSBpdCBzcGVjaWFsbHkgdG8gY29udmVydCBuZXcgaXRlbXMgdG8gc2lnbmFsc1xuXHRcdFx0XHRcdFx0XHRpZiAocHJvcFN0ciA9PT0gJ3NwbGljZScpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdGFydCA9IGFyZ3NbMF0gPz8gMFxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRlbGV0ZUNvdW50ID0gYXJnc1sxXSA/PyAoc2lnbmFscy5sZW5ndGggLSBzdGFydClcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBuZXdJdGVtcyA9IGFyZ3Muc2xpY2UoMilcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHQvLyBDb252ZXJ0IG5ldyBpdGVtcyAtIG5lc3RlZCBhcnJheXMvb2JqZWN0cyBiZWNvbWUgUHJveGllcywgcHJpbWl0aXZlcyBiZWNvbWUgU2lnbmFsc1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5ld1NpZ25hbHMgPSBuZXdJdGVtcy5tYXAoKGl0ZW06IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJiBpdGVtICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFdyYXAgb2JqZWN0cy9hcnJheXMgaW4gUHJveGllcyAoTk9UIGluIFNpZ25hbHMgLSB0aGUgUHJveHkgSVMgdGhlIHZhbHVlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaW5pdGlhbGl6ZVNpZ25hbHMoaXRlbSwgdW5kZWZpbmVkLCBjb250ZXh0KVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRvU2lnbmFsKGl0ZW0pXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHQvLyBVcGRhdGUgdGhlIHNpZ25hbHMgYXJyYXkgKHRhcmdldCBpcyBzaWduYWxzIGFycmF5KVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlbW92ZWQgPSBzaWduYWxzLnNwbGljZShzdGFydCwgZGVsZXRlQ291bnQsIC4uLm5ld1NpZ25hbHMpXG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0Ly8gTG9vayB1cCBwYXJlbnQgc2lnbmFsIEFGVEVSIG11dGF0aW9uIHRvIGVuc3VyZSB3ZSBoYXZlIHRoZSBsYXRlc3QgcmVmZXJlbmNlXG5cdFx0XHRcdFx0XHRcdFx0Ly8gVGhpcyBlbnN1cmVzIHdlIGdldCB0aGUgc2lnbmFsIGV2ZW4gaWYgaXQgd2FzIHN0b3JlZCBhZnRlciBhY2Nlc3NpbmcgdGhlIG1ldGhvZFxuXHRcdFx0XHRcdFx0XHRcdC8vIFRyeSBXZWFrTWFwIGZpcnN0LCB0aGVuIGZhbGxiYWNrIHRvIGRpcmVjdCBwcm9wZXJ0eSBhY2Nlc3Ncblx0XHRcdFx0XHRcdFx0XHRjb25zdCBwYXJlbnRTaWduYWwgPSBhcnJheVBhcmVudFNpZ25hbE1hcC5nZXQod3JhcHBlZCkgfHwgKHdyYXBwZWQgYXMgYW55KS5fcGFyZW50U2lnbmFsXG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVHJpZ2dlciBwYXJlbnQgc2lnbmFsIGlmIGl0IGV4aXN0c1xuXHRcdFx0XHRcdFx0XHRcdC8vIE5vdGlmeSBzdWJzY3JpYmVycyBkaXJlY3RseSBzaW5jZSB0aGUgYXJyYXkgcmVmZXJlbmNlIGhhc24ndCBjaGFuZ2VkXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudFNpZ25hbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQWNjZXNzIHRoZSBzaWduYWwncyBpbnRlcm5hbCBzdWJzY3JpYmVycyBhbmQgbm90aWZ5IHRoZW1cblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHN1YnNjcmliZXJzID0gKHBhcmVudFNpZ25hbCBhcyBhbnkpLl9zdWJzY3JpYmVyc1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHN1YnNjcmliZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXJzLmZvckVhY2goKGZuOiAoKSA9PiB2b2lkKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHNpZ25hbCBzdWJzY3JpYmVyOicsIGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQWxzbyB0cmlnZ2VyIGNvbXBvbmVudCByZWRyYXdzIGlmIGNhbGxiYWNrIGlzIHNldFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gX19yZWRyYXdDYWxsYmFjayBpcyBzZXQgb24gdGhlIHNpZ25hbCBmdW5jdGlvbiBpdHNlbGZcblx0XHRcdFx0XHRcdFx0XHRcdGlmICgoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQ7KHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2socGFyZW50U2lnbmFsKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHQvLyBSZXR1cm4gcmVtb3ZlZCBpdGVtcyAodW53cmFwcGVkKVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZW1vdmVkLm1hcChzaWcgPT4gaXNTaWduYWwoc2lnKSA/IHNpZy52YWx1ZSA6IHNpZylcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBGb3Igb3RoZXIgbXV0YXRpbmcgbWV0aG9kcywgY29udmVydCBuZXcgaXRlbXMgdG8gc2lnbmFscyBmaXJzdFxuXHRcdFx0XHRcdFx0XHRcdGxldCByZXN1bHRcblx0XHRcdFx0XHRcdFx0XHRpZiAocHJvcFN0ciA9PT0gJ3B1c2gnIHx8IHByb3BTdHIgPT09ICd1bnNoaWZ0Jykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgbmV3SXRlbXMgPSBhcmdzXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBDb252ZXJ0IG5ldyBpdGVtcyAtIG5lc3RlZCBhcnJheXMvb2JqZWN0cyBiZWNvbWUgUHJveGllcywgcHJpbWl0aXZlcyBiZWNvbWUgU2lnbmFsc1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgbmV3U2lnbmFscyA9IG5ld0l0ZW1zLm1hcCgoaXRlbTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFdyYXAgb2JqZWN0cy9hcnJheXMgaW4gUHJveGllcyAoTk9UIGluIFNpZ25hbHMgLSB0aGUgUHJveHkgSVMgdGhlIHZhbHVlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBpbml0aWFsaXplU2lnbmFscyhpdGVtLCB1bmRlZmluZWQsIGNvbnRleHQpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRvU2lnbmFsKGl0ZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHByb3BTdHIgPT09ICdwdXNoJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLnB1c2goLi4ubmV3U2lnbmFscylcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHNpZ25hbHMudW5zaGlmdCguLi5uZXdTaWduYWxzKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFN0ciA9PT0gJ3BvcCcgfHwgcHJvcFN0ciA9PT0gJ3NoaWZ0Jykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQ2FsbCBvbiBzaWduYWxzIGFycmF5IGRpcmVjdGx5IGFuZCB1bndyYXAgcmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJvcFN0ciA9PT0gJ3BvcCcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFscy5wb3AoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWcgIT09IHVuZGVmaW5lZCA/IChpc1NpZ25hbChzaWcpID8gc2lnLnZhbHVlIDogc2lnKSA6IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFscy5zaGlmdCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHNpZyAhPT0gdW5kZWZpbmVkID8gKGlzU2lnbmFsKHNpZykgPyBzaWcudmFsdWUgOiBzaWcpIDogdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwcm9wU3RyID09PSAncmV2ZXJzZScgfHwgcHJvcFN0ciA9PT0gJ3NvcnQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBGb3IgcmV2ZXJzZS9zb3J0LCBhcHBseSB0byBzaWduYWxzIGFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJvcFN0ciA9PT0gJ3JldmVyc2UnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNpZ25hbHMucmV2ZXJzZSgpXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBzb3J0IG5lZWRzIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0aGF0IHdvcmtzIG9uIHNpZ25hbHNcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29tcGFyYXRvciA9IGFyZ3NbMF1cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGNvbXBhcmF0b3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzaWduYWxzLnNvcnQoKGEsIGIpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFWYWwgPSBpc1NpZ25hbChhKSA/IGEudmFsdWUgOiBhXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBiVmFsID0gaXNTaWduYWwoYikgPyBiLnZhbHVlIDogYlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGNvbXBhcmF0b3IoYVZhbCwgYlZhbClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNpZ25hbHMuc29ydCgoYSwgYikgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYVZhbCA9IGlzU2lnbmFsKGEpID8gYS52YWx1ZSA6IGFcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGJWYWwgPSBpc1NpZ25hbChiKSA/IGIudmFsdWUgOiBiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYVZhbCA8IGJWYWwgPyAtMSA6IGFWYWwgPiBiVmFsID8gMSA6IDBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBSZXR1cm4gd3JhcHBlZCBQcm94eSAobm90IHJhdyBzaWduYWxzIGFycmF5KSBzbyBjaGFpbmVkIGNhbGxzIGxpa2Vcblx0XHRcdFx0XHRcdFx0XHRcdC8vIC5zb3J0KCkubWFwKCkgcmVjZWl2ZSB1bndyYXBwZWQgdmFsdWVzIGluIHRoZSBjYWxsYmFja1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gd3JhcHBlZFxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFN0ciA9PT0gJ2ZpbGwnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmaWxsVmFsdWUgPSBhcmdzWzBdXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdGFydCA9IGFyZ3NbMV0gPz8gMFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZW5kID0gYXJnc1syXSA/PyBzaWduYWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZmlsbFNpZ25hbCA9IHRvU2lnbmFsKGZpbGxWYWx1ZSlcblx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNpZ25hbHNbaV0gPSBmaWxsU2lnbmFsXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBGb3Igb3RoZXIgbWV0aG9kcywganVzdCBhcHBseSB0byB0YXJnZXRcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHZhbHVlLmFwcGx5KHRhcmdldCwgYXJncylcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVHJpZ2dlciBwYXJlbnQgc2lnbmFsIGlmIGl0IGV4aXN0cyAobG9vayB1cCBhZ2FpbiBpbiBjYXNlIGl0IHdhcyBzdG9yZWQpXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudFBhcmVudFNpZ25hbCA9IGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHRcdFx0XHRpZiAoY3VycmVudFBhcmVudFNpZ25hbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gTm90aWZ5IHN1YnNjcmliZXJzIGRpcmVjdGx5IHNpbmNlIHRoZSBhcnJheSByZWZlcmVuY2UgaGFzbid0IGNoYW5nZWRcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHN1YnNjcmliZXJzID0gKGN1cnJlbnRQYXJlbnRTaWduYWwgYXMgYW55KS5fc3Vic2NyaWJlcnNcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChzdWJzY3JpYmVycykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBzaWduYWwgc3Vic2NyaWJlcjonLCBlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdC8vIEFsc28gdHJpZ2dlciBjb21wb25lbnQgcmVkcmF3cyBpZiBjYWxsYmFjayBpcyBzZXRcblx0XHRcdFx0XHRcdFx0XHRcdC8vIF9fcmVkcmF3Q2FsbGJhY2sgaXMgc2V0IG9uIHRoZSBzaWduYWwgZnVuY3Rpb24gaXRzZWxmXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoKHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0OyhzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKGN1cnJlbnRQYXJlbnRTaWduYWwpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUuYmluZCh0YXJnZXQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKE51bWJlcihwcm9wKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGluZGV4ID0gTnVtYmVyKHByb3ApXG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHNpZ25hbHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHNbaW5kZXhdXG5cdFx0XHRcdFx0XHRcdGlmIChpc1NpZ25hbChzaWcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2lnLnZhbHVlID0gdmFsdWVcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRzaWduYWxzW2luZGV4XSA9IHRvU2lnbmFsKHZhbHVlKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIFRyaWdnZXIgcGFyZW50IHNpZ25hbCBvbiBlbGVtZW50IGFzc2lnbm1lbnQgKGxvb2sgdXAgd2hlbiBjYWxsZWQpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcmVudFNpZ25hbCA9IGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudFNpZ25hbCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIE5vdGlmeSBzdWJzY3JpYmVycyBkaXJlY3RseSBzaW5jZSB0aGUgYXJyYXkgcmVmZXJlbmNlIGhhc24ndCBjaGFuZ2VkXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc3Vic2NyaWJlcnMgPSAocGFyZW50U2lnbmFsIGFzIGFueSkuX3N1YnNjcmliZXJzXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHN1YnNjcmliZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW4gc2lnbmFsIHN1YnNjcmliZXI6JywgZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQWxzbyB0cmlnZ2VyIGNvbXBvbmVudCByZWRyYXdzIGlmIGNhbGxiYWNrIGlzIHNldFxuXHRcdFx0XHRcdFx0XHRcdGlmICgoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdFx0OyhzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKHBhcmVudFNpZ25hbClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcCA9PT0gJ2xlbmd0aCcpIHtcblx0XHRcdFx0XHRcdFx0c2lnbmFscy5sZW5ndGggPSBOdW1iZXIodmFsdWUpXG5cdFx0XHRcdFx0XHRcdC8vIFRyaWdnZXIgcGFyZW50IHNpZ25hbCBvbiBsZW5ndGggY2hhbmdlIChsb29rIHVwIHdoZW4gY2FsbGVkKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBwYXJlbnRTaWduYWwgPSBhcnJheVBhcmVudFNpZ25hbE1hcC5nZXQod3JhcHBlZCkgfHwgKHdyYXBwZWQgYXMgYW55KS5fcGFyZW50U2lnbmFsXG5cdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRTaWduYWwpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBOb3RpZnkgc3Vic2NyaWJlcnMgZGlyZWN0bHkgc2luY2UgdGhlIGFycmF5IHJlZmVyZW5jZSBoYXNuJ3QgY2hhbmdlZFxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHN1YnNjcmliZXJzID0gKHBhcmVudFNpZ25hbCBhcyBhbnkpLl9zdWJzY3JpYmVyc1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzdWJzY3JpYmVycykge1xuXHRcdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlcnMuZm9yRWFjaCgoZm46ICgpID0+IHZvaWQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHNpZ25hbCBzdWJzY3JpYmVyOicsIGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdC8vIEFsc28gdHJpZ2dlciBjb21wb25lbnQgcmVkcmF3cyBpZiBjYWxsYmFjayBpcyBzZXRcblx0XHRcdFx0XHRcdFx0XHRpZiAoKHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdFx0XHRcdDsoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjayhwYXJlbnRTaWduYWwpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3AsIHZhbHVlKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvd25LZXlzKF90YXJnZXQpIHtcblx0XHRcdFx0XHQvLyBSZXR1cm4gYXJyYXkgaW5kaWNlcyBhcyBrZXlzIGZvciBwcm9wZXIgZW51bWVyYXRpb24gKG5lZWRlZCBmb3IgQnVuJ3MgdG9FcXVhbClcblx0XHRcdFx0XHRjb25zdCBrZXlzOiAoc3RyaW5nIHwgc3ltYm9sKVtdID0gW11cblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNpZ25hbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGtleXMucHVzaChTdHJpbmcoaSkpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGtleXMucHVzaCgnbGVuZ3RoJylcblx0XHRcdFx0XHRyZXR1cm4ga2V5c1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdFx0Ly8gUHJvdmlkZSBwcm9wZXJ0eSBkZXNjcmlwdG9ycyBmb3IgYXJyYXkgaW5kaWNlcyAobmVlZGVkIGZvciBCdW4ncyB0b0VxdWFsKVxuXHRcdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKE51bWJlcihwcm9wKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGluZGV4ID0gTnVtYmVyKHByb3ApXG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHNpZ25hbHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWU6ICgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWxzW2luZGV4XVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGlzU2lnbmFsKHNpZykgPyBzaWcudmFsdWUgOiBzaWdcblx0XHRcdFx0XHRcdFx0XHR9KSgpLFxuXHRcdFx0XHRcdFx0XHRcdHdyaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChwcm9wID09PSAnbGVuZ3RoJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHZhbHVlOiBzaWduYWxzLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0d3JpdGFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0c3RhdGVDYWNoZS5zZXQob2JqLCB3cmFwcGVkKVxuXHRcdFx0cmV0dXJuIHdyYXBwZWRcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgb2JqZWN0c1xuXHRcdC8vIFN0b3JlIG9yaWdpbmFsIGtleXMgZm9yIFNTUiBzZXJpYWxpemF0aW9uICh0byBkaXN0aW5ndWlzaCBuZXN0ZWQgc3RhdGUga2V5cyBmcm9tIHBhcmVudCBrZXlzKVxuXHRcdGNvbnN0IG9yaWdpbmFsS2V5cyA9IG5ldyBTZXQoT2JqZWN0LmtleXMob2JqKSlcblx0XHQvLyBFYWNoIG5lc3RlZCBzdGF0ZSBnZXRzIGl0cyBvd24gc2lnbmFsTWFwICh1bmxlc3MgcGFyZW50U2lnbmFsTWFwIGlzIGV4cGxpY2l0bHkgcHJvdmlkZWQpXG5cdFx0Ly8gVGhpcyBwcmV2ZW50cyBuZXN0ZWQgc3RhdGVzIGZyb20gc2hhcmluZyB0aGUgcGFyZW50J3Mgc2lnbmFsTWFwXG5cdFx0Y29uc3QgbmVzdGVkU2lnbmFsTWFwID0gcGFyZW50U2lnbmFsTWFwIHx8IG5ldyBNYXA8c3RyaW5nLCBTaWduYWw8YW55PiB8IENvbXB1dGVkU2lnbmFsPGFueT4+KClcblx0XHRjb25zdCB3cmFwcGVkID0gbmV3IFByb3h5KG9iaiwge1xuXHRcdFx0Z2V0KHRhcmdldCwgcHJvcCkge1xuXHRcdFx0XHRpZiAocHJvcCA9PT0gJ19fb3JpZ2luYWxLZXlzJykgcmV0dXJuIG9yaWdpbmFsS2V5c1xuXHRcdFx0XHRpZiAocHJvcCA9PT0gJ19faXNTdGF0ZScpIHJldHVybiB0cnVlXG5cdFx0XHRcdC8vIENoZWNrIGlmIF9fc2lnbmFsTWFwIHdhcyBleHBsaWNpdGx5IHNldCB0byBudWxsIChmb3IgZXJyb3IgdGVzdGluZylcblx0XHRcdFx0Ly8gSWYgc28sIHJldHVybiBudWxsOyBvdGhlcndpc2UgcmV0dXJuIHRoZSBuZXN0ZWRTaWduYWxNYXBcblx0XHRcdFx0aWYgKHByb3AgPT09ICdfX3NpZ25hbE1hcCcpIHtcblx0XHRcdFx0XHRjb25zdCBleHBsaWNpdFZhbHVlID0gUmVmbGVjdC5nZXQodGFyZ2V0LCAnX19zaWduYWxNYXAnKVxuXHRcdFx0XHRcdHJldHVybiBleHBsaWNpdFZhbHVlICE9PSB1bmRlZmluZWQgPyBleHBsaWNpdFZhbHVlIDogbmVzdGVkU2lnbmFsTWFwXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHByb3AgPT09ICdfX3Jvb3RTdGF0ZScpIHJldHVybiBzdGF0ZVJvb3RNYXAuZ2V0KHdyYXBwZWQpID8/IHdyYXBwZWRcblx0XHRcdFx0Ly8gQURSLTAwMTM6IGFsbG93Q29tcHV0ZWQoKSBvcGVucyB0aGUgZGVmZXJyZWQtY29tcHV0ZWQgZ2F0ZSBhbmQgbWFya3MgYWxsIGNvbXB1dGVkcyBkaXJ0eVxuXHRcdFx0XHRpZiAocHJvcCA9PT0gJ2FsbG93Q29tcHV0ZWQnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uIGFsbG93Q29tcHV0ZWQodGhpczogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCByb290ID0gKHRoaXMgJiYgKHN0YXRlUm9vdE1hcC5nZXQodGhpcykgPz8gdGhpcykpIHx8IHRoaXNcblx0XHRcdFx0XHRcdGNvbnN0IGZsYWdzID0gcm9vdCA/IHN0YXRlRGVmZXJyZWRGbGFncy5nZXQocm9vdCkgOiB1bmRlZmluZWRcblx0XHRcdFx0XHRcdGlmIChmbGFncykgZmxhZ3MuYWxsb3dlZCA9IHRydWVcblx0XHRcdFx0XHRcdG1hcmtBbGxDb21wdXRlZHNEaXJ0eShyb290KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgcHJvcFN0ciA9IFN0cmluZyhwcm9wKVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQ2hlY2sgZm9yICQgcHJlZml4IGNvbnZlbnRpb24gKGRlZXBzaWduYWwtc3R5bGU6IHJldHVybnMgcmF3IHNpZ25hbClcblx0XHRcdFx0aWYgKHByb3BTdHIuc3RhcnRzV2l0aCgnJCcpICYmIHByb3BTdHIubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdGNvbnN0IGtleSA9IHByb3BTdHIuc2xpY2UoMSkgLy8gUmVtb3ZlICQgcHJlZml4XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gRW5zdXJlIHNpZ25hbCBleGlzdHMgLSBpbml0aWFsaXplIGlmIG5lZWRlZFxuXHRcdFx0XHRcdC8vIFVzZSB0aGUgc2FtZSBpbml0aWFsaXphdGlvbiBsb2dpYyBhcyByZWd1bGFyIHByb3BlcnR5IGFjY2Vzc1xuXHRcdFx0XHRcdGlmICghbmVzdGVkU2lnbmFsTWFwLmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0XHQvLyBGaXJzdCB0cnkgdG8gZ2V0IGZyb20gdGFyZ2V0IChvcmlnaW5hbCBvYmplY3QpXG5cdFx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFZhbHVlID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXkpXG5cdFx0XHRcdFx0XHRpZiAob3JpZ2luYWxWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY3JlYXRlU3RhdGVDb21wdXRlZCh3cmFwcGVkLCAoKSA9PiBvcmlnaW5hbFZhbHVlLmNhbGwod3JhcHBlZCksICEhY29udGV4dD8uZGVmZXJDb21wdXRlZClcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoaXNHZXRTZXREZXNjcmlwdG9yKG9yaWdpbmFsVmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gR2V0L3NldCBkZXNjcmlwdG9yIC0+IGNvbXB1dGVkIHNpZ25hbCBmcm9tIGdldCBmdW5jdGlvblxuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZS5nZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY3JlYXRlU3RhdGVDb21wdXRlZCh3cmFwcGVkLCAoKSA9PiBvcmlnaW5hbFZhbHVlLmdldC5jYWxsKHdyYXBwZWQpLCAhIWNvbnRleHQ/LmRlZmVyQ29tcHV0ZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIE9ubHkgc2V0dGVyLCBubyBnZXR0ZXIgLSB0cmVhdCBhcyByZWd1bGFyIHNpZ25hbCB3aXRoIHVuZGVmaW5lZCBpbml0aWFsIHZhbHVlXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwodW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdvYmplY3QnICYmIG9yaWdpbmFsVmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly8gR2V0IHRoZSBhbHJlYWR5LXdyYXBwZWQgc3RhdGUgZnJvbSB0aGUgd3JhcHBlZCBvYmplY3Rcblx0XHRcdFx0XHRcdFx0Ly8gRG9uJ3QgY2FsbCBpbml0aWFsaXplU2lnbmFscyBhZ2FpbiBhcyBpdCB3b3VsZCBjcmVhdGUgYSBuZXcgd3JhcHBlZCBhcnJheVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gKHdyYXBwZWQgYXMgYW55KVtrZXldXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG5lc3RlZFN0YXRlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBGYWxsYmFjazogaW5pdGlhbGl6ZSBpZiBub3QgYWxyZWFkeSB3cmFwcGVkXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBjaGlsZENvbnRleHQgPSBjb250ZXh0ID8geyAuLi5jb250ZXh0LCByb290U3RhdGU6IHN0YXRlUm9vdE1hcC5nZXQod3JhcHBlZCkgPz8gd3JhcHBlZCB9IDogdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBpbml0aWFsaXplZCA9IGluaXRpYWxpemVTaWduYWxzKG9yaWdpbmFsVmFsdWUsIHVuZGVmaW5lZCwgY2hpbGRDb250ZXh0KVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKGluaXRpYWxpemVkKVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoaW5pdGlhbGl6ZWQpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldChpbml0aWFsaXplZCwgc2lnKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKG5lc3RlZFN0YXRlKVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gU3RvcmUgcGFyZW50IHNpZ25hbCByZWZlcmVuY2UgZm9yIGFycmF5c1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkobmVzdGVkU3RhdGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldChuZXN0ZWRTdGF0ZSwgc2lnKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gdG9TaWduYWwob3JpZ2luYWxWYWx1ZSlcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBQcm9wZXJ0eSBkb2Vzbid0IGV4aXN0IC0gcmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIFJldHVybiByYXcgc2lnbmFsIG9iamVjdCAobm90IHRoZSB2YWx1ZSlcblx0XHRcdFx0XHRyZXR1cm4gbmVzdGVkU2lnbmFsTWFwLmdldChrZXkpXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGNvbnN0IGtleSA9IHByb3BTdHJcblx0XHRcdFx0XG5cdFx0XHRcdC8vIENoZWNrIGlmIHdlIGhhdmUgYSBzaWduYWwgZm9yIHRoaXMgcHJvcGVydHlcblx0XHRcdFx0aWYgKCFuZXN0ZWRTaWduYWxNYXAuaGFzKGtleSkpIHtcblx0XHRcdFx0XHQvLyBUcnkgdG8gZ2V0IGZyb20gdGFyZ2V0IGZpcnN0IChvcmlnaW5hbCBvYmplY3QgcHJvcGVydGllcylcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFZhbHVlID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wKVxuXHRcdFx0XHRcdGlmIChvcmlnaW5hbFZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdC8vIEluaXRpYWxpemUgc2lnbmFsIGZvciB0aGlzIHByb3BlcnR5XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0Ly8gRnVuY3Rpb24gcHJvcGVydHkgLT4gY29tcHV0ZWQgc2lnbmFsXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY3JlYXRlU3RhdGVDb21wdXRlZCh3cmFwcGVkLCAoKSA9PiBvcmlnaW5hbFZhbHVlLmNhbGwod3JhcHBlZCksICEhY29udGV4dD8uZGVmZXJDb21wdXRlZClcblx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIGNvbXB1dGVkU2lnKVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChpc0dldFNldERlc2NyaXB0b3Iob3JpZ2luYWxWYWx1ZSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gR2V0L3NldCBkZXNjcmlwdG9yIC0+IGNvbXB1dGVkIHNpZ25hbCBmcm9tIGdldCBmdW5jdGlvblxuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29tcHV0ZWRTaWcgPSBjcmVhdGVTdGF0ZUNvbXB1dGVkKHdyYXBwZWQsICgpID0+IG9yaWdpbmFsVmFsdWUuZ2V0LmNhbGwod3JhcHBlZCksICEhY29udGV4dD8uZGVmZXJDb21wdXRlZClcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT25seSBzZXR0ZXIsIG5vIGdldHRlciAtIHRyZWF0IGFzIHJlZ3VsYXIgc2lnbmFsIHdpdGggdW5kZWZpbmVkIGluaXRpYWwgdmFsdWVcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwodW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdvYmplY3QnICYmIG9yaWdpbmFsVmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly8gTmVzdGVkIG9iamVjdCAtPiByZWN1cnNpdmUgc3RhdGUgd2l0aCBpdHMgb3duIHNpZ25hbE1hcFxuXHRcdFx0XHRcdFx0XHRjb25zdCBjaGlsZENvbnRleHQgPSBjb250ZXh0ID8geyAuLi5jb250ZXh0LCByb290U3RhdGU6IHN0YXRlUm9vdE1hcC5nZXQod3JhcHBlZCkgPz8gd3JhcHBlZCB9IDogdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gaW5pdGlhbGl6ZVNpZ25hbHMob3JpZ2luYWxWYWx1ZSwgdW5kZWZpbmVkLCBjaGlsZENvbnRleHQpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChuZXN0ZWRTdGF0ZSlcblx0XHRcdFx0XHRcdFx0Ly8gU3RvcmUgcGFyZW50IHNpZ25hbCByZWZlcmVuY2UgZm9yIGFycmF5c1xuXHRcdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShuZXN0ZWRTdGF0ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZylcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gUHJpbWl0aXZlIHZhbHVlIC0+IHNpZ25hbFxuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSB0b1NpZ25hbChvcmlnaW5hbFZhbHVlKVxuXHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBQcm9wZXJ0eSBkb2Vzbid0IGV4aXN0IGluIG9yaWdpbmFsIG9iamVjdFxuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGNvbXB1dGVkIHByb3BlcnR5IHRoYXQgd2FzIGFkZGVkIGR5bmFtaWNhbGx5XG5cdFx0XHRcdFx0XHQvLyBGb3Igbm93LCByZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3Qgc2lnID0gbmVzdGVkU2lnbmFsTWFwLmdldChrZXkpXG5cdFx0XHRcdGlmIChzaWcpIHtcblx0XHRcdFx0XHQvLyBBY2Nlc3Mgc2lnbmFsLnZhbHVlIHRvIHRyYWNrIGNvbXBvbmVudCBkZXBlbmRlbmN5XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBzaWcudmFsdWVcblx0XHRcdFx0XHQvLyBBbHdheXMgZW5zdXJlIHBhcmVudCBzaWduYWwgaXMgc3RvcmVkIGZvciBhcnJheXMgKGluIGNhc2UgaXQgd2Fzbid0IHN0b3JlZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24pXG5cdFx0XHRcdFx0Ly8gQ2hlY2sgZm9yIHdyYXBwZWQgYXJyYXlzIGJ5IGxvb2tpbmcgZm9yIF9faXNTdGF0ZSBhbmQgX19zaWduYWxzIHByb3BlcnRpZXNcblx0XHRcdFx0XHQvLyBBcnJheS5pc0FycmF5KCkgbWF5IHJldHVybiBmYWxzZSBmb3IgUHJveGllcywgc28gd2UgY2hlY2sgX19pc1N0YXRlIGluc3RlYWRcblx0XHRcdFx0XHRpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRcdFx0aWYgKCh2YWx1ZSBhcyBhbnkpLl9faXNTdGF0ZSA9PT0gdHJ1ZSAmJiBBcnJheS5pc0FycmF5KCh2YWx1ZSBhcyBhbnkpLl9fc2lnbmFscykpIHtcblx0XHRcdFx0XHRcdFx0Ly8gVGhpcyBpcyBhIHdyYXBwZWQgYXJyYXkgLSBzdG9yZSBwYXJlbnQgc2lnbmFsXG5cdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldCh2YWx1ZSwgc2lnIGFzIFNpZ25hbDxhbnk+KVxuXHRcdFx0XHRcdFx0XHQvLyBBbHNvIHN0b3JlIGRpcmVjdGx5IG9uIHRoZSBQcm94eSBhcyBhIGZhbGxiYWNrXG5cdFx0XHRcdFx0XHRcdDsodmFsdWUgYXMgYW55KS5fcGFyZW50U2lnbmFsID0gc2lnIGFzIFNpZ25hbDxhbnk+XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFJlZ3VsYXIgYXJyYXkgKHNob3VsZG4ndCBoYXBwZW4gYnV0IGp1c3QgaW4gY2FzZSlcblx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KHZhbHVlLCBzaWcgYXMgU2lnbmFsPGFueT4pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRmFsbGJhY2sgdG8gb3JpZ2luYWwgcHJvcGVydHlcblx0XHRcdFx0cmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcClcblx0XHRcdH0sXG5cdFx0XHRzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuXHRcdFx0XHRjb25zdCBrZXkgPSBTdHJpbmcocHJvcClcblx0XHRcdFx0XG5cdFx0XHRcdC8vIEFsbG93IHNldHRpbmcgX19zaWduYWxNYXAgdG8gbnVsbCBmb3IgdGVzdGluZyBlcnJvciBjYXNlc1xuXHRcdFx0XHQvLyBCdXQgd2UnbGwgY2hlY2sgaWYgaXQncyBhY3R1YWxseSBhIE1hcCB3aGVuIHNlcmlhbGl6aW5nL2Rlc2VyaWFsaXppbmdcblx0XHRcdFx0aWYgKGtleSA9PT0gJ19fc2lnbmFsTWFwJykge1xuXHRcdFx0XHRcdC8vIFN0b3JlIHRoZSB2YWx1ZSBkaXJlY3RseSBvbiB0aGUgdGFyZ2V0IChieXBhc3MgcHJveHkpXG5cdFx0XHRcdFx0Ly8gVGhpcyBhbGxvd3MgdGVzdHMgdG8gY29ycnVwdCB0aGUgc3RhdGUgZm9yIGVycm9yIGhhbmRsaW5nIHRlc3RzXG5cdFx0XHRcdFx0UmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSlcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBQcmV2ZW50IHNldHRpbmcgb3RoZXIgaW50ZXJuYWwgcHJvcGVydGllc1xuXHRcdFx0XHRpZiAoa2V5ID09PSAnX19pc1N0YXRlJyB8fCBrZXkgPT09ICdfX29yaWdpbmFsS2V5cycgfHwga2V5ID09PSAnX19zaWduYWxzJykge1xuXHRcdFx0XHRcdC8vIFNpbGVudGx5IGlnbm9yZSBhdHRlbXB0cyB0byBzZXQgaW50ZXJuYWwgcHJvcGVydGllc1xuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRoZSBvcmlnaW5hbCBwcm9wZXJ0eSB3YXMgYSBnZXQvc2V0IGRlc2NyaXB0b3Jcblx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxWYWx1ZSA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcClcblx0XHRcdFx0aWYgKGlzR2V0U2V0RGVzY3JpcHRvcihvcmlnaW5hbFZhbHVlKSkge1xuXHRcdFx0XHRcdC8vIEhhbmRsZSBnZXQvc2V0IGRlc2NyaXB0b3Jcblx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUuc2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHQvLyBDYWxsIHRoZSBzZXR0ZXIgZnVuY3Rpb25cblx0XHRcdFx0XHRcdG9yaWdpbmFsVmFsdWUuc2V0LmNhbGwod3JhcHBlZCwgdmFsdWUpXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHQvLyBSZWFkLW9ubHkgcHJvcGVydHkgKGdldCBidXQgbm8gc2V0KVxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDYW5ub3Qgc2V0IHJlYWQtb25seSBjb21wdXRlZCBwcm9wZXJ0eSBcIiR7a2V5fVwiYClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRoZSBuZXcgdmFsdWUgYmVpbmcgc2V0IGlzIGEgZ2V0L3NldCBkZXNjcmlwdG9yXG5cdFx0XHRcdGlmIChpc0dldFNldERlc2NyaXB0b3IodmFsdWUpKSB7XG5cdFx0XHRcdFx0Ly8gUmVwbGFjZSB3aXRoIGNvbXB1dGVkIHNpZ25hbCBmcm9tIGdldCBmdW5jdGlvblxuXHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNyZWF0ZVN0YXRlQ29tcHV0ZWQod3JhcHBlZCwgKCkgPT4gdmFsdWUuZ2V0LmNhbGwod3JhcHBlZCksICEhY29udGV4dD8uZGVmZXJDb21wdXRlZClcblx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRcdC8vIEFsc28gdXBkYXRlIHRoZSB0YXJnZXQgc28gc2V0dGVyIGNhbiBiZSBmb3VuZCBsYXRlclxuXHRcdFx0XHRcdFx0UmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSlcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIE9ubHkgc2V0dGVyLCBubyBnZXR0ZXIgLSB0cmVhdCBhcyByZWd1bGFyIHNpZ25hbCB3aXRoIHVuZGVmaW5lZCBpbml0aWFsIHZhbHVlXG5cdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwodW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gU2tpcCBjb21wdXRlZCBwcm9wZXJ0aWVzIChmdW5jdGlvbnMpXG5cdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHQvLyBSZXBsYWNlIGNvbXB1dGVkIHNpZ25hbFxuXHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY3JlYXRlU3RhdGVDb21wdXRlZCh3cmFwcGVkLCAoKSA9PiB2YWx1ZS5jYWxsKHdyYXBwZWQpLCAhIWNvbnRleHQ/LmRlZmVyQ29tcHV0ZWQpXG5cdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIGNvbXB1dGVkU2lnKVxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBVcGRhdGUgb3IgY3JlYXRlIHNpZ25hbFxuXHRcdFx0XHRpZiAobmVzdGVkU2lnbmFsTWFwLmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2lnID0gbmVzdGVkU2lnbmFsTWFwLmdldChrZXkpXG5cdFx0XHRcdFx0aWYgKHNpZyAmJiAhKHNpZyBpbnN0YW5jZW9mIENvbXB1dGVkU2lnbmFsKSkge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly8gTmVzdGVkIG9iamVjdCAtPiByZWN1cnNpdmUgc3RhdGUgd2l0aCBpdHMgb3duIHNpZ25hbE1hcFxuXHRcdFx0XHRcdFx0XHRjb25zdCBjaGlsZENvbnRleHQgPSBjb250ZXh0ID8geyAuLi5jb250ZXh0LCByb290U3RhdGU6IHN0YXRlUm9vdE1hcC5nZXQod3JhcHBlZCkgPz8gd3JhcHBlZCB9IDogdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gaW5pdGlhbGl6ZVNpZ25hbHModmFsdWUsIHVuZGVmaW5lZCwgY2hpbGRDb250ZXh0KVxuXHRcdFx0XHRcdFx0XHQvLyBTdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZSBmb3IgYXJyYXlzXG5cdFx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5lc3RlZFN0YXRlKSkge1xuXHRcdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldChuZXN0ZWRTdGF0ZSwgc2lnIGFzIFNpZ25hbDxhbnk+KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdDsoc2lnIGFzIFNpZ25hbDxhbnk+KS52YWx1ZSA9IG5lc3RlZFN0YXRlXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQ7KHNpZyBhcyBTaWduYWw8YW55PikudmFsdWUgPSB2YWx1ZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBSZXBsYWNlIGNvbXB1dGVkIHdpdGggcmVndWxhciBzaWduYWxcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsICYmIEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNoaWxkQ29udGV4dCA9IGNvbnRleHQgPyB7IC4uLmNvbnRleHQsIHJvb3RTdGF0ZTogc3RhdGVSb290TWFwLmdldCh3cmFwcGVkKSA/PyB3cmFwcGVkIH0gOiB1bmRlZmluZWRcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmVzdGVkU3RhdGUgPSBpbml0aWFsaXplU2lnbmFscyh2YWx1ZSwgdW5kZWZpbmVkLCBjaGlsZENvbnRleHQpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChuZXN0ZWRTdGF0ZSlcblx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KG5lc3RlZFN0YXRlLCBzaWcpXG5cdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgdG9TaWduYWwodmFsdWUpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBDcmVhdGUgbmV3IHNpZ25hbFxuXHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjaGlsZENvbnRleHQgPSBjb250ZXh0ID8geyAuLi5jb250ZXh0LCByb290U3RhdGU6IHN0YXRlUm9vdE1hcC5nZXQod3JhcHBlZCkgPz8gd3JhcHBlZCB9IDogdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRjb25zdCBuZXN0ZWRTdGF0ZSA9IGluaXRpYWxpemVTaWduYWxzKHZhbHVlLCB1bmRlZmluZWQsIGNoaWxkQ29udGV4dClcblx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChuZXN0ZWRTdGF0ZSlcblx0XHRcdFx0XHRcdC8vIFN0b3JlIHBhcmVudCBzaWduYWwgcmVmZXJlbmNlIGZvciBhcnJheXNcblx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5lc3RlZFN0YXRlKSkge1xuXHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCB0b1NpZ25hbCh2YWx1ZSkpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdH0sXG5cdFx0XHRoYXModGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdGlmIChwcm9wID09PSAnX19pc1N0YXRlJyB8fCBwcm9wID09PSAnX19zaWduYWxNYXAnKSByZXR1cm4gdHJ1ZVxuXHRcdFx0XHRjb25zdCBwcm9wU3RyID0gU3RyaW5nKHByb3ApXG5cdFx0XHRcdC8vIENoZWNrIGZvciAkIHByZWZpeFxuXHRcdFx0XHRpZiAocHJvcFN0ci5zdGFydHNXaXRoKCckJykgJiYgcHJvcFN0ci5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0Y29uc3Qga2V5ID0gcHJvcFN0ci5zbGljZSgxKVxuXHRcdFx0XHRcdHJldHVybiBuZXN0ZWRTaWduYWxNYXAuaGFzKGtleSkgfHwgUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG5lc3RlZFNpZ25hbE1hcC5oYXMocHJvcFN0cikgfHwgUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wKVxuXHRcdFx0fSxcblx0XHRcdG93bktleXModGFyZ2V0KSB7XG5cdFx0XHRcdGNvbnN0IGtleXMgPSBuZXcgU2V0KFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpKVxuXHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuZm9yRWFjaCgoXywga2V5KSA9PiB7XG5cdFx0XHRcdFx0a2V5cy5hZGQoa2V5KVxuXHRcdFx0XHRcdGtleXMuYWRkKCckJyArIGtleSkgLy8gQWxzbyBpbmNsdWRlICQgcHJlZml4IGtleXNcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuIEFycmF5LmZyb20oa2V5cylcblx0XHRcdH0sXG5cdFx0XHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdGNvbnN0IHByb3BTdHIgPSBTdHJpbmcocHJvcClcblx0XHRcdFx0Ly8gSGFuZGxlICQgcHJlZml4XG5cdFx0XHRcdGlmIChwcm9wU3RyLnN0YXJ0c1dpdGgoJyQnKSAmJiBwcm9wU3RyLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRjb25zdCBrZXkgPSBwcm9wU3RyLnNsaWNlKDEpXG5cdFx0XHRcdFx0aWYgKG5lc3RlZFNpZ25hbE1hcC5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG5lc3RlZFNpZ25hbE1hcC5oYXMocHJvcFN0cikpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcClcblx0XHRcdH0sXG5cdFx0XHRkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3ApIHtcblx0XHRcdFx0Y29uc3Qga2V5ID0gU3RyaW5nKHByb3ApXG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHNpZ25hbCB0byB1bmRlZmluZWQgdG8gbm90aWZ5IHN1YnNjcmliZXJzXG5cdFx0XHRcdGlmIChuZXN0ZWRTaWduYWxNYXAuaGFzKGtleSkpIHtcblx0XHRcdFx0XHRjb25zdCBzaWcgPSBuZXN0ZWRTaWduYWxNYXAuZ2V0KGtleSlcblx0XHRcdFx0XHRpZiAoc2lnICYmICEoc2lnIGluc3RhbmNlb2YgQ29tcHV0ZWRTaWduYWwpKSB7XG5cdFx0XHRcdFx0XHQvLyBTZXQgc2lnbmFsIHZhbHVlIHRvIHVuZGVmaW5lZCB0byBub3RpZnkgc3Vic2NyaWJlcnNcblx0XHRcdFx0XHRcdDsoc2lnIGFzIFNpZ25hbDxhbnk+KS52YWx1ZSA9IHVuZGVmaW5lZFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBSZW1vdmUgZnJvbSB0aGUgc2lnbmFsIG1hcFxuXHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5kZWxldGUoa2V5KVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBEZWxldGUgZnJvbSB0YXJnZXRcblx0XHRcdFx0cmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wKVxuXHRcdFx0fSxcblx0XHR9KVxuXG5cdFx0c3RhdGVSb290TWFwLnNldCh3cmFwcGVkLCBjb250ZXh0Py5yb290U3RhdGUgPz8gd3JhcHBlZClcblx0XHRzdGF0ZUNhY2hlLnNldChvYmosIHdyYXBwZWQpXG5cdFx0cmV0dXJuIHdyYXBwZWRcblx0fVxuXG5cdGNvbnN0IGluaXRDb250ZXh0OiBJbml0Q29udGV4dCB8IHVuZGVmaW5lZCA9IGRlZmVyQ29tcHV0ZWQgPyB7IGRlZmVyQ29tcHV0ZWQ6IHRydWUgfSA6IHVuZGVmaW5lZFxuXHRjb25zdCB3cmFwcGVkID0gaW5pdGlhbGl6ZVNpZ25hbHMoaW5pdGlhbCwgdW5kZWZpbmVkLCBpbml0Q29udGV4dCkgYXMgU3RhdGU8VD5cblx0c3RhdGVSb290TWFwLnNldCh3cmFwcGVkLCB3cmFwcGVkKVxuXHRpZiAoZGVmZXJDb21wdXRlZCkge1xuXHRcdHN0YXRlRGVmZXJyZWRGbGFncy5zZXQod3JhcHBlZCwgeyBhbGxvd2VkOiBmYWxzZSB9KVxuXHR9XG5cdFxuXHQvLyBQcmUtaW5pdGlhbGl6ZSBhbGwgc2lnbmFscyBmcm9tIHRoZSBpbml0aWFsIG9iamVjdCBzbyB0aGV5J3JlIGF2YWlsYWJsZSBpbW1lZGlhdGVseVxuXHQvLyBUaGlzIGVuc3VyZXMgJHMuJHByb3BlcnR5IHdvcmtzIGV2ZW4gaWYgJHMucHJvcGVydHkgaGFzbid0IGJlZW4gYWNjZXNzZWQgeWV0XG5cdGlmICh0eXBlb2YgaW5pdGlhbCA9PT0gJ29iamVjdCcgJiYgaW5pdGlhbCAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShpbml0aWFsKSkge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGluaXRpYWwpIHtcblx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaW5pdGlhbCwga2V5KSkge1xuXHRcdFx0XHRpZiAoIXNpZ25hbE1hcC5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gaW5pdGlhbFtrZXldXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29tcHV0ZWRTaWcgPSBjcmVhdGVTdGF0ZUNvbXB1dGVkKHdyYXBwZWQsICgpID0+IHZhbHVlLmNhbGwod3JhcHBlZCksIGRlZmVyQ29tcHV0ZWQpXG5cdFx0XHRcdFx0XHRzaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChpc0dldFNldERlc2NyaXB0b3IodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHQvLyBHZXQvc2V0IGRlc2NyaXB0b3IgLT4gY29tcHV0ZWQgc2lnbmFsIGZyb20gZ2V0IGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNyZWF0ZVN0YXRlQ29tcHV0ZWQod3JhcHBlZCwgKCkgPT4gdmFsdWUuZ2V0LmNhbGwod3JhcHBlZCksIGRlZmVyQ29tcHV0ZWQpXG5cdFx0XHRcdFx0XHRcdHNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIE9ubHkgc2V0dGVyLCBubyBnZXR0ZXIgLSB0cmVhdCBhcyByZWd1bGFyIHNpZ25hbCB3aXRoIHVuZGVmaW5lZCBpbml0aWFsIHZhbHVlXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbCh1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRcdHNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHQvLyBHZXQgdGhlIGFscmVhZHktd3JhcHBlZCBzdGF0ZSBmcm9tIHN0YXRlQ2FjaGUgKGJ5cGFzcyBQcm94eSB0byBnZXQgdGhlIGFjdHVhbCB3cmFwcGVkIHZhbHVlKVxuXHRcdFx0XHRcdFx0Ly8gVGhpcyBlbnN1cmVzIHdlIGdldCB0aGUgc2FtZSB3cmFwcGVkIGFycmF5IHRoYXQgd2FzIGNyZWF0ZWQgZHVyaW5nIGluaXRpYWxpemVTaWduYWxzXG5cdFx0XHRcdFx0XHRjb25zdCBwcmVJbml0Q29udGV4dCA9IGluaXRDb250ZXh0ID8geyAuLi5pbml0Q29udGV4dCwgcm9vdFN0YXRlOiB3cmFwcGVkIH0gOiB1bmRlZmluZWRcblx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gc3RhdGVDYWNoZS5oYXModmFsdWUpID8gc3RhdGVDYWNoZS5nZXQodmFsdWUpIDogaW5pdGlhbGl6ZVNpZ25hbHModmFsdWUsIHVuZGVmaW5lZCwgcHJlSW5pdENvbnRleHQpXG5cdFx0XHRcdFx0XHRpZiAobmVzdGVkU3RhdGUgJiYgKG5lc3RlZFN0YXRlIGFzIGFueSkuX19pc1N0YXRlKSBzdGF0ZVJvb3RNYXAuc2V0KG5lc3RlZFN0YXRlLCB3cmFwcGVkKVxuXHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKG5lc3RlZFN0YXRlKVxuXHRcdFx0XHRcdFx0Ly8gQWx3YXlzIHN0b3JlIHBhcmVudCBzaWduYWwgcmVmZXJlbmNlIGZvciBhcnJheXNcblx0XHRcdFx0XHRcdC8vIENoZWNrIGZvciB3cmFwcGVkIGFycmF5cyBieSBsb29raW5nIGZvciBfX2lzU3RhdGUgYW5kIF9fc2lnbmFscyBwcm9wZXJ0aWVzXG5cdFx0XHRcdFx0XHQvLyBBcnJheS5pc0FycmF5KCkgbWF5IHJldHVybiBmYWxzZSBmb3IgUHJveGllcywgc28gd2UgY2hlY2sgX19pc1N0YXRlIGluc3RlYWRcblx0XHRcdFx0XHRcdGlmIChuZXN0ZWRTdGF0ZSAmJiB0eXBlb2YgbmVzdGVkU3RhdGUgPT09ICdvYmplY3QnICYmIFxuXHRcdFx0XHRcdFx0XHQoKG5lc3RlZFN0YXRlIGFzIGFueSkuX19pc1N0YXRlID09PSB0cnVlICYmIEFycmF5LmlzQXJyYXkoKG5lc3RlZFN0YXRlIGFzIGFueSkuX19zaWduYWxzKSkpIHtcblx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KG5lc3RlZFN0YXRlLCBzaWcpXG5cdFx0XHRcdFx0XHRcdC8vIEFsc28gc3RvcmUgZGlyZWN0bHkgb24gdGhlIFByb3h5IGFzIGEgZmFsbGJhY2tcblx0XHRcdFx0XHRcdFx0OyhuZXN0ZWRTdGF0ZSBhcyBhbnkpLl9wYXJlbnRTaWduYWwgPSBzaWdcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShuZXN0ZWRTdGF0ZSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gRmFsbGJhY2sgZm9yIHJlZ3VsYXIgYXJyYXlzIChzaG91bGRuJ3QgaGFwcGVuIGJ1dCBqdXN0IGluIGNhc2UpXG5cdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldChuZXN0ZWRTdGF0ZSwgc2lnKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gdG9TaWduYWwodmFsdWUpXG5cdFx0XHRcdFx0XHRzaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0Ly8gUmVnaXN0ZXIgc3RhdGUgZm9yIFNTUiBzZXJpYWxpemF0aW9uIHdoZW4gbmFtZSBpcyBwcm92aWRlZCAocmVxdWlyZWQgZm9yIGh5ZHJhdGlvbilcblx0aWYgKG5hbWUgJiYgdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIG5hbWUudHJpbSgpICE9PSAnJykge1xuXHRcdHJlZ2lzdGVyU3RhdGUobmFtZSwgd3JhcHBlZCwgaW5pdGlhbClcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkXG59XG5cbi8qKlxuICogTWFwcGVkIHR5cGUgdGhhdCBhZGRzICRwcm9wIGZvciBlYWNoIGtleSwgcmV0dXJuaW5nIHRoZSBTaWduYWwgZm9yIHRoYXQgcHJvcGVydHkuXG4gKiAtIFByaW1pdGl2ZXM6ICRwcm9wID0+IFNpZ25hbDxUW0tdPlxuICogLSBOZXN0ZWQgb2JqZWN0czogJHByb3AgPT4gU2lnbmFsPFN0YXRlPFRbS10+PlxuICogLSBGdW5jdGlvbnM6ICRwcm9wID0+IENvbXB1dGVkU2lnbmFsIChjb21wdXRlZCBmcm9tIGdldHRlcilcbiAqL1xudHlwZSBTdGF0ZVNpZ25hbHM8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4+ID0ge1xuXHRbSyBpbiBrZXlvZiBUIGFzIEsgZXh0ZW5kcyBzdHJpbmcgPyBgJCR7S31gIDogbmV2ZXJdOiBUW0tdIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnlcblx0XHQ/IENvbXB1dGVkU2lnbmFsPGFueT5cblx0XHQ6IFRbS10gZXh0ZW5kcyBvYmplY3Rcblx0XHRcdD8gU2lnbmFsPFN0YXRlPFRbS10+PlxuXHRcdFx0OiBTaWduYWw8VFtLXT5cbn1cblxuLyoqXG4gKiBTdGF0ZSB0eXBlIC0gcmVhY3RpdmUgb2JqZWN0IHdpdGggc2lnbmFsLWJhc2VkIHByb3BlcnRpZXNcbiAqXG4gKiBTdXBwb3J0czpcbiAqIC0gUmVndWxhciBhY2Nlc3M6IGBzdGF0ZS5wcm9wYCByZXR1cm5zIHVud3JhcHBlZCB2YWx1ZVxuICogLSBTaWduYWwgYWNjZXNzOiBgc3RhdGUuJHByb3BgIHJldHVybnMgU2lnbmFsIGluc3RhbmNlICgkIHByZWZpeCBjb252ZW50aW9uKVxuICogLSBGdW5jdGlvbnMgYmVjb21lIGNvbXB1dGVkIHNpZ25hbHNcbiAqIC0gTmVzdGVkIG9iamVjdHMgYmVjb21lIFN0YXRlIGluc3RhbmNlcyAocmVjdXJzaXZlbHkpXG4gKi9cbmV4cG9ydCB0eXBlIFN0YXRlPFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+PiA9IHtcblx0W0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IGluZmVyIFJcblx0XHQ/IFJcblx0XHQ6IFRbS10gZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cdFx0XHQ/IFN0YXRlPFRbS10+XG5cdFx0XHQ6IFRbS11cbn0gJiBTdGF0ZVNpZ25hbHM8VD5cblxuLyoqXG4gKiBXYXRjaCBhIHNpZ25hbCBmb3IgY2hhbmdlc1xuICogQHBhcmFtIHNpZ25hbCAtIFRoZSBzaWduYWwgdG8gd2F0Y2hcbiAqIEBwYXJhbSBjYWxsYmFjayAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHNpZ25hbCB2YWx1ZSBjaGFuZ2VzXG4gKiBAcmV0dXJucyBVbnN1YnNjcmliZSBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gd2F0Y2g8VD4oXG5cdHNpZ25hbDogU2lnbmFsPFQ+IHwgQ29tcHV0ZWRTaWduYWw8VD4sXG5cdGNhbGxiYWNrOiAobmV3VmFsdWU6IFQsIG9sZFZhbHVlOiBUKSA9PiB2b2lkLFxuKTogKCkgPT4gdm9pZCB7XG5cdGNvbnN0IHVud2F0Y2ggPSBzaWduYWwud2F0Y2goY2FsbGJhY2spXG5cdFxuXHQvLyBSZWdpc3RlciB3YXRjaGVyIGluIFNTUiBjb250ZXh0IGZvciBjbGVhbnVwIGF0IGVuZCBvZiByZXF1ZXN0XG5cdGlmIChnbG9iYWxUaGlzLl9fU1NSX01PREVfXykge1xuXHRcdGNvbnN0IGNvbnRleHQgPSBnZXRTU1JDb250ZXh0KClcblx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0aWYgKCFjb250ZXh0LndhdGNoZXJzKSB7XG5cdFx0XHRcdGNvbnRleHQud2F0Y2hlcnMgPSBbXVxuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC53YXRjaGVycy5wdXNoKHVud2F0Y2gpXG5cdFx0XHQvLyBEdXJpbmcgU1NSLCBmaXJlIHdhdGNoZXIgaW1tZWRpYXRlbHkgd2l0aCBjdXJyZW50IHZhbHVlIHRvIGNhdGNoIGFueSBjaGFuZ2VzXG5cdFx0XHQvLyB0aGF0IGhhcHBlbmVkIGJlZm9yZSB3YXRjaGVyIHJlZ2lzdHJhdGlvbiAoZS5nLiwgZnJvbSByZXN0b3JlX2ZpbHRlcnNfc29ydClcblx0XHRcdC8vIFVzZSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCkgdG8gZGVmZXIgZXhlY3V0aW9uIHVudGlsIGFmdGVyIHVud2F0Y2ggaXMgcmV0dXJuZWQsXG5cdFx0XHQvLyBzbyBjYWxsYmFja3MgdGhhdCByZWZlcmVuY2UgdW53YXRjaCB3b24ndCBjYXVzZSBSZWZlcmVuY2VFcnJvclxuXHRcdFx0UHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudFZhbHVlID0gc2lnbmFsLnBlZWsoKVxuXHRcdFx0XHRcdGNhbGxiYWNrKGN1cnJlbnRWYWx1ZSwgY3VycmVudFZhbHVlKVxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBmaXJpbmcgaW5pdGlhbCB3YXRjaGVyIGNhbGxiYWNrOicsIGUpXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gdW53YXRjaFxufVxuIiwKICAgICJpbXBvcnQge0NvbXB1dGVkU2lnbmFsfSBmcm9tICcuLi9zaWduYWwnXG5pbXBvcnQge2dldFJlZ2lzdGVyZWRTdGF0ZXN9IGZyb20gJy4uL3N0YXRlJ1xuaW1wb3J0IHtsb2dnZXJ9IGZyb20gJy4uL3NlcnZlci9zc3JMb2dnZXInXG5cbmltcG9ydCB0eXBlIHtTdGF0ZX0gZnJvbSAnLi4vc3RhdGUnXG5cbi8qKlxuICogQ2hlY2sgaWYgYSB2YWx1ZSBpcyBhIHN0YXRlIChoYXMgX19pc1N0YXRlIGZsYWcpXG4gKi9cbmZ1bmN0aW9uIGlzU3RhdGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAodmFsdWUgYXMgYW55KS5fX2lzU3RhdGUgPT09IHRydWVcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgYSBzaW5nbGUgc3RhdGUgdG8gcGxhaW4gb2JqZWN0XG4gKiBFeHRyYWN0cyBzaWduYWwgdmFsdWVzIGJ5IGFjY2Vzc2luZyBzdGF0ZSBwcm9wZXJ0aWVzIGRpcmVjdGx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVTdG9yZShzdGF0ZTogU3RhdGU8YW55Pik6IGFueSB7XG5cdGlmICghaXNTdGF0ZShzdGF0ZSkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGlzIG5vdCBhIHN0YXRlJylcblx0fVxuXG5cdGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG5cdGNvbnN0IHZpc2l0ZWQgPSBuZXcgV2Vha1NldDxvYmplY3Q+KClcblx0XG5cdC8vIEFkZCB0aGUgcm9vdCBzdGF0ZSB0byB2aXNpdGVkIGZpcnN0IHRvIGRldGVjdCBjaXJjdWxhciByZWZzXG5cdHZpc2l0ZWQuYWRkKHN0YXRlKVxuXHRcblx0Ly8gQ2hlY2sgaWYgc2lnbmFsTWFwIGV4aXN0cyBhbmQgaXMgYSBNYXAgLSBpZiBub3QsIHRoaXMgaXMgYW4gZXJyb3IgY2FzZVxuXHRjb25zdCBzaWduYWxNYXAgPSAoc3RhdGUgYXMgYW55KS5fX3NpZ25hbE1hcFxuXHRpZiAoIXNpZ25hbE1hcCB8fCAhKHNpZ25hbE1hcCBpbnN0YW5jZW9mIE1hcCkpIHtcblx0XHQvLyBUaHJvdyBlcnJvciBzbyBzZXJpYWxpemVBbGxTdGF0ZXMgY2FuIGNhdGNoIGl0IGFuZCBza2lwIHRoaXMgc3RhdGVcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1N0YXRlIHNpZ25hbE1hcCBpcyBudWxsLCB1bmRlZmluZWQsIG9yIG5vdCBhIE1hcCBpbnN0YW5jZScpXG5cdH1cblxuXHRmdW5jdGlvbiBzZXJpYWxpemVWYWx1ZSh2YWx1ZTogYW55KTogYW55IHtcblx0XHQvLyBIYW5kbGUgbnVsbC91bmRlZmluZWRcblx0XHRpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIHByaW1pdGl2ZXNcblx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGNpcmN1bGFyIHJlZmVyZW5jZXNcblx0XHQvLyBDaGVjayBiZWZvcmUgYWRkaW5nIHRvIHZpc2l0ZWQgdG8gYXZvaWQgZmFsc2UgcG9zaXRpdmVzXG5cdFx0aWYgKHZpc2l0ZWQuaGFzKHZhbHVlKSkge1xuXHRcdFx0cmV0dXJuIG51bGwgLy8gQ2lyY3VsYXIgcmVmZXJlbmNlIC0gc2VyaWFsaXplIGFzIG51bGxcblx0XHR9XG5cdFx0XG5cdFx0Ly8gTWFyayBhcyB2aXNpdGVkIEJFRk9SRSBwcm9jZXNzaW5nIHRvIGRldGVjdCBjaXJjdWxhciByZWZzXG5cdFx0dmlzaXRlZC5hZGQodmFsdWUpXG5cblx0XHQvLyBIYW5kbGUgc3RhdGVzIChuZXN0ZWQgc3RhdGVzIGFuZCBhcnJheXMpXG5cdFx0aWYgKGlzU3RhdGUodmFsdWUpKSB7XG5cdFx0XHRcblx0XHRcdC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gYXJyYXkgc3RhdGVcblx0XHRcdGNvbnN0IHNpZ25hbHMgPSAodmFsdWUgYXMgYW55KS5fX3NpZ25hbHNcblx0XHRcdGlmIChzaWduYWxzICYmIEFycmF5LmlzQXJyYXkoc2lnbmFscykpIHtcblx0XHRcdFx0Ly8gQXJyYXkgc3RhdGUgLSBzZXJpYWxpemUgZWFjaCBlbGVtZW50XG5cdFx0XHRcdGNvbnN0IGFycmF5UmVzdWx0ID0gc2lnbmFscy5tYXAoKHNpZ25hbDogYW55KSA9PiB7XG5cdFx0XHRcdFx0aWYgKHNpZ25hbCBpbnN0YW5jZW9mIENvbXB1dGVkU2lnbmFsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIEdldCB0aGUgYWN0dWFsIHZhbHVlIGZyb20gdGhlIHNpZ25hbFxuXHRcdFx0XHRcdC8vIElmIGl0J3MgYSBTaWduYWwgaW5zdGFuY2UsIGdldCBpdHMgdmFsdWU7IG90aGVyd2lzZSBpdCdzIGFscmVhZHkgdGhlIHZhbHVlIChjb3VsZCBiZSBhIHN0YXRlKVxuXHRcdFx0XHRcdGxldCBzaWdWYWx1ZTogYW55XG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIFNpZ25hbCBpbnN0YW5jZSAoaGFzIHZhbHVlIHByb3BlcnR5IGFuZCBpcyBhbiBpbnN0YW5jZSBvZiBTaWduYWwvQ29tcHV0ZWRTaWduYWwpXG5cdFx0XHRcdFx0aWYgKHNpZ25hbCAmJiB0eXBlb2Ygc2lnbmFsID09PSAnb2JqZWN0JyAmJiAndmFsdWUnIGluIHNpZ25hbCAmJiAhaXNTdGF0ZShzaWduYWwpKSB7XG5cdFx0XHRcdFx0XHRzaWdWYWx1ZSA9IHNpZ25hbC52YWx1ZVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gSXQncyBlaXRoZXIgYSBwcmltaXRpdmUgb3IgYSBzdGF0ZSAobmVzdGVkIG9iamVjdClcblx0XHRcdFx0XHRcdHNpZ1ZhbHVlID0gc2lnbmFsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIElmIHNpZ1ZhbHVlIGlzIGEgc3RhdGUgKG5lc3RlZCBvYmplY3QgaW4gYXJyYXkpLCBzZXJpYWxpemUgaXRcblx0XHRcdFx0XHQvLyBUaGlzIHdpbGwgdXNlIF9fb3JpZ2luYWxLZXlzIHRvIGZpbHRlciBwYXJlbnQga2V5c1xuXHRcdFx0XHRcdGNvbnN0IHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVWYWx1ZShzaWdWYWx1ZSlcblx0XHRcdFx0XHQvLyBJZiBjaXJjdWxhciByZWZlcmVuY2Ugd2FzIGRldGVjdGVkLCBpdCByZXR1cm5zIG51bGwgLSBrZWVwIGl0XG5cdFx0XHRcdFx0cmV0dXJuIHNlcmlhbGl6ZWRcblx0XHRcdFx0fSkuZmlsdGVyKChpdGVtOiBhbnkpID0+IGl0ZW0gIT09IHVuZGVmaW5lZClcblx0XHRcdFx0cmV0dXJuIGFycmF5UmVzdWx0XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIE9iamVjdCBzdGF0ZSAtIHNlcmlhbGl6ZSBieSBhY2Nlc3NpbmcgcHJvcGVydGllcyBkaXJlY3RseSB0aHJvdWdoIHByb3h5XG5cdFx0XHQvLyBVc2Ugb3JpZ2luYWxLZXlzIHRvIGZpbHRlciBvdXQgcGFyZW50IHN0YXRlIGtleXNcblx0XHRcdGNvbnN0IG5lc3RlZFJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG5cdFx0XHRjb25zdCBuZXN0ZWRPcmlnaW5hbEtleXMgPSAodmFsdWUgYXMgYW55KS5fX29yaWdpbmFsS2V5cyBhcyBTZXQ8c3RyaW5nPiB8IHVuZGVmaW5lZFxuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoa2V5LnN0YXJ0c1dpdGgoJyQnKSB8fCBrZXkgPT09ICdfX2lzU3RhdGUnIHx8IGtleSA9PT0gJ19fc2lnbmFsTWFwJyB8fCBrZXkgPT09ICdfX3NpZ25hbHMnIHx8IGtleSA9PT0gJ19fb3JpZ2luYWxLZXlzJykge1xuXHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIEZvciBuZXN0ZWQgc3RhdGVzLCBvbmx5IHNlcmlhbGl6ZSBrZXlzIHRoYXQgYmVsb25nIHRvIHRoaXMgc3RhdGUgKG5vdCBwYXJlbnQga2V5cylcblx0XHRcdFx0aWYgKG5lc3RlZE9yaWdpbmFsS2V5cyAmJiAhbmVzdGVkT3JpZ2luYWxLZXlzLmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHQvLyBDaGVjayBpZiB0aGlzIGlzIGEgQ29tcHV0ZWRTaWduYWwgYnkgYWNjZXNzaW5nICRrZXlcblx0XHRcdFx0XHRjb25zdCBzaWduYWwgPSAodmFsdWUgYXMgYW55KVsnJCcgKyBrZXldXG5cdFx0XHRcdFx0aWYgKHNpZ25hbCBpbnN0YW5jZW9mIENvbXB1dGVkU2lnbmFsKSB7XG5cdFx0XHRcdFx0XHQvLyBTa2lwIGNvbXB1dGVkIHNpZ25hbHNcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IHByb3BWYWx1ZSA9ICh2YWx1ZSBhcyBhbnkpW2tleV1cblx0XHRcdFx0XHRjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplVmFsdWUocHJvcFZhbHVlKVxuXHRcdFx0XHRcdC8vIEluY2x1ZGUgbnVsbCB2YWx1ZXMgKHRoZXkgbWlnaHQgYmUgY2lyY3VsYXIgcmVmIG1hcmtlcnMpXG5cdFx0XHRcdFx0bmVzdGVkUmVzdWx0W2tleV0gPSBzZXJpYWxpemVkXG5cdFx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRcdC8vIFNraXAgaWYgYWNjZXNzIGZhaWxzXG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gRG9uJ3QgZGVsZXRlIGZyb20gdmlzaXRlZCBoZXJlIC0gaXQgd2lsbCBiZSBjbGVhbmVkIHVwIHdoZW4gd2UgZmluaXNoIHNlcmlhbGl6aW5nIHRoaXMgdmFsdWVcblx0XHRcdHJldHVybiBuZXN0ZWRSZXN1bHRcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgcGxhaW4gYXJyYXlzXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRjb25zdCBhcnJheVJlc3VsdCA9IHZhbHVlLm1hcChpdGVtID0+IHNlcmlhbGl6ZVZhbHVlKGl0ZW0pKVxuXHRcdFx0cmV0dXJuIGFycmF5UmVzdWx0XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIHBsYWluIG9iamVjdHNcblx0XHRjb25zdCBvYmpSZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXHRcdGZvciAoY29uc3Qga2V5IGluIHZhbHVlKSB7XG5cdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSB7XG5cdFx0XHRcdGNvbnN0IHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVWYWx1ZSh2YWx1ZVtrZXldKVxuXHRcdFx0XHQvLyBJbmNsdWRlIG51bGwgdmFsdWVzICh0aGV5IG1pZ2h0IGJlIGNpcmN1bGFyIHJlZiBtYXJrZXJzKVxuXHRcdFx0XHRvYmpSZXN1bHRba2V5XSA9IHNlcmlhbGl6ZWRcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gRG9uJ3QgZGVsZXRlIGZyb20gdmlzaXRlZCAtIGxldCBpdCBiZSBjbGVhbmVkIHVwIG5hdHVyYWxseVxuXHRcdHJldHVybiBvYmpSZXN1bHRcblx0fVxuXG5cdC8vIFNlcmlhbGl6ZSBieSBpdGVyYXRpbmcgb3ZlciBzdGF0ZSBwcm9wZXJ0aWVzIGRpcmVjdGx5XG5cdC8vIEZvciB0b3AtbGV2ZWwgc3RhdGUsIHNlcmlhbGl6ZSBhbGwga2V5cyAoaW5jbHVkaW5nIGR5bmFtaWNhbGx5IGFkZGVkIG9uZXMpXG5cdC8vIFVzZSAkIHByZWZpeCB0byBjaGVjayBpZiBwcm9wZXJ0eSBpcyBhIENvbXB1dGVkU2lnbmFsXG5cdGZvciAoY29uc3Qga2V5IGluIHN0YXRlKSB7XG5cdFx0aWYgKGtleS5zdGFydHNXaXRoKCckJykgfHwga2V5ID09PSAnX19pc1N0YXRlJyB8fCBrZXkgPT09ICdfX3NpZ25hbE1hcCcgfHwga2V5ID09PSAnX19zaWduYWxzJyB8fCBrZXkgPT09ICdfX29yaWdpbmFsS2V5cycpIHtcblx0XHRcdGNvbnRpbnVlXG5cdFx0fVxuXHRcdFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBDaGVjayBpZiB0aGlzIGlzIGEgQ29tcHV0ZWRTaWduYWwgYnkgYWNjZXNzaW5nICRrZXlcblx0XHRcdGNvbnN0IHNpZ25hbCA9IChzdGF0ZSBhcyBhbnkpWyckJyArIGtleV1cblx0XHRcdGlmIChzaWduYWwgaW5zdGFuY2VvZiBDb21wdXRlZFNpZ25hbCkge1xuXHRcdFx0XHQvLyBTa2lwIGNvbXB1dGVkIHNpZ25hbHMgKHRoZXkncmUgZnVuY3Rpb25zLCByZWNyZWF0ZWQgb24gY2xpZW50KVxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCB2YWx1ZSA9IChzdGF0ZSBhcyBhbnkpW2tleV1cblx0XHRcdHJlc3VsdFtrZXldID0gc2VyaWFsaXplVmFsdWUodmFsdWUpXG5cdFx0fSBjYXRjaCB7XG5cdFx0XHQvLyBTa2lwIGlmIGFjY2VzcyBmYWlsc1xuXHRcdFx0Y29udGludWVcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogRGVzZXJpYWxpemUgc3RhdGUgaW50byBhIHN0YXRlXG4gKiBSZXN0b3JlcyBzaWduYWwgdmFsdWVzIGZyb20gc2VyaWFsaXplZCBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZVN0b3JlKHN0YXRlOiBTdGF0ZTxhbnk+LCBzZXJpYWxpemVkOiBhbnkpOiB2b2lkIHtcblx0aWYgKCFpc1N0YXRlKHN0YXRlKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVmFsdWUgaXMgbm90IGEgc3RhdGUnKVxuXHR9XG5cblx0aWYgKCFzZXJpYWxpemVkIHx8IHR5cGVvZiBzZXJpYWxpemVkICE9PSAnb2JqZWN0Jykge1xuXHRcdHJldHVyblxuXHR9XG5cblx0Y29uc3Qgc2lnbmFsTWFwID0gKHN0YXRlIGFzIGFueSkuX19zaWduYWxNYXAgYXMgTWFwPHN0cmluZywgYW55PlxuXHRpZiAoIXNpZ25hbE1hcCB8fCAhKHNpZ25hbE1hcCBpbnN0YW5jZW9mIE1hcCkpIHtcblx0XHQvLyBUaHJvdyBlcnJvciBzbyBkZXNlcmlhbGl6ZUFsbFN0YXRlcyBjYW4gY2F0Y2ggaXQgYW5kIHNraXAgdGhpcyBzdGF0ZVxuXHRcdHRocm93IG5ldyBFcnJvcignU3RhdGUgc2lnbmFsTWFwIGlzIG51bGwsIHVuZGVmaW5lZCwgb3Igbm90IGEgTWFwIGluc3RhbmNlJylcblx0fVxuXG5cdGZ1bmN0aW9uIGRlc2VyaWFsaXplVmFsdWUodmFsdWU6IGFueSk6IGFueSB7XG5cdFx0Ly8gSGFuZGxlIG51bGwvdW5kZWZpbmVkXG5cdFx0aWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBwcmltaXRpdmVzXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBhcnJheXNcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiBkZXNlcmlhbGl6ZVZhbHVlKGl0ZW0pKVxuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBwbGFpbiBvYmplY3RzIChjb3VsZCBiZSBuZXN0ZWQgc3RhdGVzKVxuXHRcdC8vIENoZWNrIGlmIHRoaXMgbG9va3MgbGlrZSBhIHNlcmlhbGl6ZWQgc3RhdGUgKGhhcyBzdGF0ZS1saWtlIHN0cnVjdHVyZSlcblx0XHQvLyBGb3Igbm93LCB0cmVhdCBhbGwgb2JqZWN0cyBhcyBwbGFpbiBvYmplY3RzIC0gbmVzdGVkIHN0YXRlcyB3aWxsIGJlIGhhbmRsZWRcblx0XHQvLyB3aGVuIHRoZXkncmUgYXNzaWduZWQgdG8gc3RhdGUgcHJvcGVydGllc1xuXHRcdGNvbnN0IG9ialJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gdmFsdWUpIHtcblx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpIHtcblx0XHRcdFx0b2JqUmVzdWx0W2tleV0gPSBkZXNlcmlhbGl6ZVZhbHVlKHZhbHVlW2tleV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvYmpSZXN1bHRcblx0fVxuXG5cdC8vIERlc2VyaWFsaXplIGVhY2gga2V5IGluIHNlcmlhbGl6ZWQgZGF0YVxuXHRmb3IgKGNvbnN0IGtleSBpbiBzZXJpYWxpemVkKSB7XG5cdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzZXJpYWxpemVkLCBrZXkpKSB7XG5cdFx0XHRjb25zdCBzZXJpYWxpemVkVmFsdWUgPSBzZXJpYWxpemVkW2tleV1cblx0XHRcdGNvbnN0IGRlc2VyaWFsaXplZFZhbHVlID0gZGVzZXJpYWxpemVWYWx1ZShzZXJpYWxpemVkVmFsdWUpXG5cblx0XHRcdC8vIENoZWNrIGlmIHNpZ25hbCBleGlzdHMgaW4gc3RhdGVcblx0XHRcdGlmIChzaWduYWxNYXAgJiYgc2lnbmFsTWFwLmhhcyhrZXkpKSB7XG5cdFx0XHRcdGNvbnN0IHNpZ25hbCA9IHNpZ25hbE1hcC5nZXQoa2V5KVxuXHRcdFx0XHQvLyBEb24ndCB1cGRhdGUgQ29tcHV0ZWRTaWduYWwgKHRoZXkncmUgcmVhZC1vbmx5KVxuXHRcdFx0XHRpZiAoc2lnbmFsICYmICEoc2lnbmFsIGluc3RhbmNlb2YgQ29tcHV0ZWRTaWduYWwpKSB7XG5cdFx0XHRcdFx0c2lnbmFsLnZhbHVlID0gZGVzZXJpYWxpemVkVmFsdWVcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gU2lnbmFsIGRvZXNuJ3QgZXhpc3QgLSB1c2UgcHJveHkgc2V0dGVyIHRvIGNyZWF0ZSBpdFxuXHRcdFx0XHQvLyBCdXQgb25seSBpZiBzaWduYWxNYXAgZXhpc3RzIChlcnJvciBjYXNlOiBzaWduYWxNYXAgaXMgbnVsbClcblx0XHRcdFx0Ly8gSWYgc2lnbmFsTWFwIGlzIG51bGwsIHdlIGNhbid0IGNyZWF0ZSBuZXcgc2lnbmFscywgc28gc2tpcFxuXHRcdFx0XHRpZiAoc2lnbmFsTWFwKSB7XG5cdFx0XHRcdFx0OyhzdGF0ZSBhcyBhbnkpW2tleV0gPSBkZXNlcmlhbGl6ZWRWYWx1ZVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIElmIHNpZ25hbE1hcCBpcyBudWxsLCBza2lwIHRoaXMga2V5IChlcnJvciBjYXNlKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSBhbGwgcmVnaXN0ZXJlZCBzdGF0ZXNcbiAqIFJldHVybnMgYSBSZWNvcmQgbWFwcGluZyBzdGF0ZSBuYW1lcyB0byBzZXJpYWxpemVkIHN0YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVBbGxTdGF0ZXMoKTogUmVjb3JkPHN0cmluZywgYW55PiB7XG5cdGNvbnN0IHJlZ2lzdGVyZWRTdGF0ZXMgPSBnZXRSZWdpc3RlcmVkU3RhdGVzKClcblx0Y29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblxuXHRmb3IgKGNvbnN0IFtuYW1lLCBlbnRyeV0gb2YgcmVnaXN0ZXJlZFN0YXRlcy5lbnRyaWVzKCkpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzdWx0W25hbWVdID0gc2VyaWFsaXplU3RvcmUoZW50cnkuc3RhdGUpXG5cdFx0fSBjYXRjaChlcnJvcikge1xuXHRcdFx0Ly8gTG9nIGVycm9yIGJ1dCBjb250aW51ZSB3aXRoIG90aGVyIHN0YXRlc1xuXHRcdFx0bG9nZ2VyLmVycm9yKGBFcnJvciBzZXJpYWxpemluZyBzdGF0ZWAsIGVycm9yLCB7c3RhdGVOYW1lOiBuYW1lfSlcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogRGVzZXJpYWxpemUgYWxsIHN0YXRlcyBmcm9tIHNlcmlhbGl6ZWQgZGF0YVxuICogUmVzdG9yZXMgc3RhdGUgaW50byByZWdpc3RlcmVkIHN0YXRlc1xuICovXG4vKipcbiAqIFJlc3RvcmUgY29tcHV0ZWQgcHJvcGVydGllcyBmcm9tIGluaXRpYWwgc3RhdGVcbiAqIEV4dHJhY3RzIGZ1bmN0aW9uIHByb3BlcnRpZXMgYW5kIHNldHMgdGhlbSBvbiBzdGF0ZSBpbnN0YW5jZVxuICogU3RhdGUgcHJveHkgd2lsbCBhdXRvbWF0aWNhbGx5IGNvbnZlcnQgdGhlbSB0byBDb21wdXRlZFNpZ25hbCBpbnN0YW5jZXNcbiAqL1xuZnVuY3Rpb24gcmVzdG9yZUNvbXB1dGVkUHJvcGVydGllcyhzdGF0ZTogU3RhdGU8YW55PiwgaW5pdGlhbDogYW55KTogdm9pZCB7XG5cdGlmICghaW5pdGlhbCB8fCB0eXBlb2YgaW5pdGlhbCAhPT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm5cblx0fVxuXHRcblx0ZnVuY3Rpb24gaXNPYmplY3QodjogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHYpXG5cdH1cblx0XG5cdGZ1bmN0aW9uIHJlc3RvcmUob2JqOiBhbnksIHRhcmdldDogYW55LCBwcmVmaXg6IHN0cmluZyA9ICcnKTogdm9pZCB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG5cdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IG9ialtrZXldXG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Ly8gU2V0IGZ1bmN0aW9uIHByb3BlcnR5IC0gc3RhdGUgcHJveHkgd2lsbCBjb252ZXJ0IHRvIENvbXB1dGVkU2lnbmFsXG5cdFx0XHRcdFx0Y29uc3Qga2V5cyA9IHByZWZpeCA/IHByZWZpeC5zcGxpdCgnLicpLmZpbHRlcihrID0+IGspIDogW11cblx0XHRcdFx0XHRsZXQgdGFyZ2V0U3RhdGUgPSB0YXJnZXRcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmICghdGFyZ2V0U3RhdGVba2V5c1tpXV0pIHtcblx0XHRcdFx0XHRcdFx0Ly8gTmVzdGVkIHN0YXRlIGRvZXNuJ3QgZXhpc3QgeWV0LCBza2lwXG5cdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGFyZ2V0U3RhdGUgPSB0YXJnZXRTdGF0ZVtrZXlzW2ldXVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBDbGVhciBhbnkgZXhpc3Rpbmcgc2lnbmFsIGluIHNpZ25hbE1hcCBzbyBmdW5jdGlvbiBpcyByZS1pbml0aWFsaXplZCBhcyBDb21wdXRlZFNpZ25hbFxuXHRcdFx0XHRcdGlmICh0YXJnZXRTdGF0ZSAmJiB0eXBlb2YgdGFyZ2V0U3RhdGUgPT09ICdvYmplY3QnICYmICh0YXJnZXRTdGF0ZSBhcyBhbnkpLl9faXNTdGF0ZSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc2lnbmFsTWFwID0gKHRhcmdldFN0YXRlIGFzIGFueSkuX19zaWduYWxNYXBcblx0XHRcdFx0XHRcdGlmIChzaWduYWxNYXAgJiYgc2lnbmFsTWFwIGluc3RhbmNlb2YgTWFwKSB7XG5cdFx0XHRcdFx0XHRcdHNpZ25hbE1hcC5kZWxldGUoa2V5KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0YXJnZXRTdGF0ZVtrZXldID0gdmFsdWVcblx0XHRcdFx0fSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNpdmVseSByZXN0b3JlIG5lc3RlZCBjb21wdXRlZCBwcm9wZXJ0aWVzXG5cdFx0XHRcdFx0Y29uc3QgbmVzdGVkUHJlZml4ID0gcHJlZml4ID8gYCR7cHJlZml4fS4ke2tleX1gIDoga2V5XG5cdFx0XHRcdFx0cmVzdG9yZSh2YWx1ZSwgdGFyZ2V0LCBuZXN0ZWRQcmVmaXgpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdHJlc3RvcmUoaW5pdGlhbCwgc3RhdGUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZUFsbFN0YXRlcyhzZXJpYWxpemVkOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZCB7XG5cdGlmICghc2VyaWFsaXplZCB8fCB0eXBlb2Ygc2VyaWFsaXplZCAhPT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm5cblx0fVxuXG5cdGNvbnN0IHJlZ2lzdGVyZWRTdGF0ZXMgPSBnZXRSZWdpc3RlcmVkU3RhdGVzKClcblxuXHQvLyBGaXJzdCwgZGVzZXJpYWxpemUgYWxsIHN0YXRlc1xuXHRmb3IgKGNvbnN0IFtuYW1lLCBzZXJpYWxpemVkU3RhdGVdIG9mIE9iamVjdC5lbnRyaWVzKHNlcmlhbGl6ZWQpKSB7XG5cdFx0Y29uc3QgZW50cnkgPSByZWdpc3RlcmVkU3RhdGVzLmdldChuYW1lKVxuXHRcdFxuXHRcdGlmICghZW50cnkpIHtcblx0XHRcdC8vIFN0YXRlIG5vdCByZWdpc3RlcmVkIG9uIGNsaWVudCAtIHdhcm4gaW4gZGV2ZWxvcG1lbnRcblx0XHRcdGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnY/Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcblx0XHRcdFx0bG9nZ2VyLndhcm4oYFN0YXRlIG5vdCBmb3VuZCBpbiByZWdpc3RyeS4gU2tpcHBpbmcgZGVzZXJpYWxpemF0aW9uLmAsIHtzdGF0ZU5hbWU6IG5hbWV9KVxuXHRcdFx0fVxuXHRcdFx0Y29udGludWVcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0ZGVzZXJpYWxpemVTdG9yZShlbnRyeS5zdGF0ZSwgc2VyaWFsaXplZFN0YXRlKVxuXHRcdH0gY2F0Y2goZXJyb3IpIHtcblx0XHRcdC8vIExvZyBlcnJvciBidXQgY29udGludWUgd2l0aCBvdGhlciBzdGF0ZXNcblx0XHRcdGxvZ2dlci5lcnJvcihgRXJyb3IgZGVzZXJpYWxpemluZyBzdGF0ZWAsIGVycm9yLCB7c3RhdGVOYW1lOiBuYW1lfSlcblx0XHR9XG5cdH1cblx0XG5cdC8vIEFmdGVyIGRlc2VyaWFsaXppbmcsIHJlc3RvcmUgY29tcHV0ZWQgcHJvcGVydGllcyBmcm9tIG9yaWdpbmFsIGluaXRpYWwgc3RhdGVzXG5cdC8vIFRoaXMgZW5zdXJlcyBjb21wdXRlZCBwcm9wZXJ0aWVzIHdvcmsgYWZ0ZXIgU1NSIGRlc2VyaWFsaXphdGlvblxuXHRmb3IgKGNvbnN0IFtuYW1lLCBlbnRyeV0gb2YgcmVnaXN0ZXJlZFN0YXRlcy5lbnRyaWVzKCkpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzdG9yZUNvbXB1dGVkUHJvcGVydGllcyhlbnRyeS5zdGF0ZSwgZW50cnkuaW5pdGlhbClcblx0XHR9IGNhdGNoKGVycm9yKSB7XG5cdFx0XHQvLyBMb2cgZXJyb3IgYnV0IGNvbnRpbnVlIHdpdGggb3RoZXIgc3RhdGVzXG5cdFx0XHRsb2dnZXIuZXJyb3IoYEVycm9yIHJlc3RvcmluZyBjb21wdXRlZCBwcm9wZXJ0aWVzIGZvciBzdGF0ZWAsIGVycm9yLCB7c3RhdGVOYW1lOiBuYW1lfSlcblx0XHR9XG5cdH1cbn1cbiIsCiAgICAiaW1wb3J0IHtzdGF0ZSwgU3RhdGUsIHVwZGF0ZVN0YXRlUmVnaXN0cnl9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQge3NlcmlhbGl6ZVN0b3JlLCBkZXNlcmlhbGl6ZVN0b3JlfSBmcm9tICcuL3JlbmRlci9zc3JTdGF0ZSdcbmltcG9ydCB7Q29tcHV0ZWRTaWduYWx9IGZyb20gJy4vc2lnbmFsJ1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gcmVzdG9yZSBjb21wdXRlZCBwcm9wZXJ0aWVzIChzYW1lIGFzIGluIHNzclN0YXRlLnRzKVxuZnVuY3Rpb24gcmVzdG9yZUNvbXB1dGVkUHJvcGVydGllcyhzdGF0ZTogU3RhdGU8YW55PiwgaW5pdGlhbDogYW55KTogdm9pZCB7XG5cdGlmICghaW5pdGlhbCB8fCB0eXBlb2YgaW5pdGlhbCAhPT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm5cblx0fVxuXHRcblx0ZnVuY3Rpb24gaXNfb2JqZWN0KHY6IGFueSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2KVxuXHR9XG5cdFxuXHRmdW5jdGlvbiByZXN0b3JlKG9iajogYW55LCB0YXJnZXQ6IGFueSwgcHJlZml4OiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuXHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBvYmpba2V5XVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdC8vIFNldCBmdW5jdGlvbiBwcm9wZXJ0eSAtIHN0YXRlIHByb3h5IHdpbGwgY29udmVydCB0byBDb21wdXRlZFNpZ25hbFxuXHRcdFx0XHRcdGNvbnN0IGtleXMgPSBwcmVmaXggPyBwcmVmaXguc3BsaXQoJy4nKS5maWx0ZXIoayA9PiBrKSA6IFtdXG5cdFx0XHRcdFx0bGV0IHRhcmdldFN0YXRlID0gdGFyZ2V0XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXRhcmdldFN0YXRlIHx8ICF0YXJnZXRTdGF0ZVtrZXlzW2ldXSkge1xuXHRcdFx0XHRcdFx0XHQvLyBOZXN0ZWQgc3RhdGUgZG9lc24ndCBleGlzdCB5ZXQsIHNraXBcblx0XHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0YXJnZXRTdGF0ZSA9IHRhcmdldFN0YXRlW2tleXNbaV1dXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0YXJnZXRTdGF0ZSkge1xuXHRcdFx0XHRcdFx0Ly8gQ2xlYXIgYW55IGV4aXN0aW5nIHNpZ25hbCBpbiBzaWduYWxNYXAgc28gZnVuY3Rpb24gaXMgcmUtaW5pdGlhbGl6ZWQgYXMgQ29tcHV0ZWRTaWduYWxcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdGFyZ2V0U3RhdGUgPT09ICdvYmplY3QnICYmICh0YXJnZXRTdGF0ZSBhcyBhbnkpLl9faXNTdGF0ZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWduYWxNYXAgPSAodGFyZ2V0U3RhdGUgYXMgYW55KS5fX3NpZ25hbE1hcFxuXHRcdFx0XHRcdFx0XHRpZiAoc2lnbmFsTWFwICYmIHNpZ25hbE1hcCBpbnN0YW5jZW9mIE1hcCkge1xuXHRcdFx0XHRcdFx0XHRcdHNpZ25hbE1hcC5kZWxldGUoa2V5KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0YXJnZXRTdGF0ZVtrZXldID0gdmFsdWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNfb2JqZWN0KHZhbHVlKSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2l2ZWx5IHJlc3RvcmUgbmVzdGVkIGNvbXB1dGVkIHByb3BlcnRpZXNcblx0XHRcdFx0XHRjb25zdCBuZXN0ZWRQcmVmaXggPSBwcmVmaXggPyBgJHtwcmVmaXh9LiR7a2V5fWAgOiBrZXlcblx0XHRcdFx0XHRyZXN0b3JlKHZhbHVlLCB0YXJnZXQsIG5lc3RlZFByZWZpeClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0cmVzdG9yZShpbml0aWFsLCBzdGF0ZSlcbn1cblxuLy8gVXRpbGl0eSBmdW5jdGlvbnMgZm9yIFN0b3JlIGNsYXNzXG5mdW5jdGlvbiBpc1N0YXRlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgKHZhbHVlIGFzIGFueSkuX19pc1N0YXRlID09PSB0cnVlXG59XG5cbmZ1bmN0aW9uIGlzX29iamVjdCh2OiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHYpXG59XG5cbmZ1bmN0aW9uIGNvcHlfb2JqZWN0PFQ+KG9iajogVCk6IFQge1xuXHRyZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKVxufVxuXG4vKipcbiAqIERlZXAgY29weSBvYmplY3Qgd2hpbGUgcHJlc2VydmluZyBmdW5jdGlvbnMgKGNvbXB1dGVkIHByb3BlcnRpZXMpXG4gKiBVc2VkIGZvciBtZXJnaW5nIHRlbXBsYXRlcyB0aGF0IG1heSBjb250YWluIGNvbXB1dGVkIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gY29weV9vYmplY3RfcHJlc2VydmVfZnVuY3Rpb25zPFQ+KG9iajogVCk6IFQge1xuXHRpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIG9ialxuXHR9XG5cdFxuXHRpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG5cdFx0cmV0dXJuIG9iai5tYXAoaXRlbSA9PiBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMoaXRlbSkpIGFzIFRcblx0fVxuXHRcblx0aWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gb2JqIGFzIFRcblx0fVxuXHRcblx0Y29uc3QgcmVzdWx0OiBhbnkgPSB7fVxuXHRmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcblx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSAob2JqIGFzIGFueSlba2V5XVxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHQvLyBQcmVzZXJ2ZSBmdW5jdGlvbnMgKGNvbXB1dGVkIHByb3BlcnRpZXMpXG5cdFx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWVcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERlZXAgY29weSBvdGhlciB2YWx1ZXNcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnModmFsdWUpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQgYXMgVFxufVxuXG5mdW5jdGlvbiBtZXJnZV9kZWVwKHRhcmdldDogYW55LCAuLi5zb3VyY2VzOiBhbnlbXSk6IGFueSB7XG5cdGlmICghc291cmNlcy5sZW5ndGgpIHJldHVybiB0YXJnZXRcblx0Y29uc3Qgc291cmNlID0gc291cmNlcy5zaGlmdCgpXG5cblx0aWYgKGlzX29iamVjdCh0YXJnZXQpICYmIGlzX29iamVjdChzb3VyY2UpKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShzb3VyY2Vba2V5XSkgJiYgQXJyYXkuaXNBcnJheSh0YXJnZXRba2V5XSkpIHtcblx0XHRcdFx0Ly8gU3BsaWNlIHRoZSBjb250ZW50cyBvZiBzb3VyY2Vba2V5XSBpbnRvIHRhcmdldFtrZXldXG5cdFx0XHRcdHRhcmdldFtrZXldLnNwbGljZSgwLCB0YXJnZXRba2V5XS5sZW5ndGgsIC4uLnNvdXJjZVtrZXldKVxuXHRcdFx0fSBlbHNlIGlmIChpc19vYmplY3Qoc291cmNlW2tleV0pKSB7XG5cdFx0XHRcdGlmICghdGFyZ2V0W2tleV0pIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7W2tleV06IHt9fSlcblx0XHRcdFx0bWVyZ2VfZGVlcCh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRPYmplY3QuYXNzaWduKHRhcmdldCwge1trZXldOiBzb3VyY2Vba2V5XX0pXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG1lcmdlX2RlZXAodGFyZ2V0LCAuLi5zb3VyY2VzKVxufVxuXG5jb25zdCBERUZBVUxUX0xPT0tVUF9WRVJJRllfSU5URVJWQUwgPSAxMDAwICogMTAgLy8gMTAgc2Vjb25kc1xuY29uc3QgREVGQVVMVF9MT09LVVBfVFRMID0gMTAwMCAqIDYwICogNjAgKiAyNCAvLyAxIGRheVxuXG4vLyBDb3VudGVyIGZvciBnZW5lcmF0aW5nIHVuaXF1ZSBzdG9yZSBpbnN0YW5jZSBuYW1lc1xubGV0IHN0b3JlSW5zdGFuY2VDb3VudGVyID0gMFxuXG4vKipcbiAqIFN0b3JlIGNsYXNzIC0gd3JhcHMgc3RhdGUoKSB3aXRoIHBlcnNpc3RlbmNlIGZ1bmN0aW9uYWxpdHlcbiAqIFByb3ZpZGVzIGxvYWQvc2F2ZS9ibHVlcHJpbnQgbWV0aG9kcyBmb3IgbG9jYWxTdG9yYWdlL3Nlc3Npb25TdG9yYWdlIHBlcnNpc3RlbmNlXG4gKiBcbiAqIFN0YXRlIHR5cGVzOlxuICogLSBzYXZlZDogbG9jYWxTdG9yYWdlIChzdXJ2aXZlcyBicm93c2VyIHJlc3RhcnRzKVxuICogLSB0ZW1wb3Jhcnk6IG5vdCBwZXJzaXN0ZWQgKHJlc2V0cyBvbiByZWxvYWQpXG4gKiAtIHRhYjogc2Vzc2lvblN0b3JhZ2UgKHN1cnZpdmVzIHBhZ2UgcmVsb2FkcywgY2xlYXJzIHdoZW4gdGFiIGNsb3NlcylcbiAqIC0gc2Vzc2lvbjogc2VydmVyLXNpZGUgc2Vzc2lvbiBzdG9yYWdlIChvcHRpb25hbCwgb2ZmIGJ5IGRlZmF1bHQ7IHJlcXVpcmVzIGJhY2tlbmQsIGh5ZHJhdGVkIHZpYSBTU1IpXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yZTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IFJlY29yZDxzdHJpbmcsIGFueT4+IHtcblx0cHJpdmF0ZSBzdGF0ZUluc3RhbmNlOiBTdGF0ZTxUPlxuXHRwcml2YXRlIHRlbXBsYXRlcyA9IHtcblx0XHRzYXZlZDoge30gYXMgUGFydGlhbDxUPixcblx0XHR0ZW1wb3Jhcnk6IHt9IGFzIFBhcnRpYWw8VD4sXG5cdFx0dGFiOiB7fSBhcyBQYXJ0aWFsPFQ+LFxuXHRcdHNlc3Npb246IHt9IGFzIFBhcnRpYWw8VD4sXG5cdH1cblx0cHJpdmF0ZSBsb29rdXBfdmVyaWZ5X2ludGVydmFsOiBudW1iZXIgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGxvb2t1cF90dGw6IG51bWJlclxuXHRwcml2YXRlIGNvbXB1dGVkUHJvcGVydGllc1NldHVwPzogKCkgPT4gdm9pZFxuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtsb29rdXBfdHRsPzogbnVtYmVyfSA9IHtsb29rdXBfdHRsOiBERUZBVUxUX0xPT0tVUF9UVEx9KSB7XG5cdFx0dGhpcy5sb29rdXBfdHRsID0gb3B0aW9ucy5sb29rdXBfdHRsIHx8IERFRkFVTFRfTE9PS1VQX1RUTFxuXHRcdC8vIEluaXRpYWxpemUgd2l0aCBlbXB0eSBzdGF0ZSwgd2lsbCBiZSBsb2FkZWQgbGF0ZXIgKEFEUi0wMDEzOiBkZWZlciBjb21wdXRlZHMgdW50aWwgcmVhZHkoKSBpcyBjYWxsZWQpXG5cdFx0Y29uc3QgaW5zdGFuY2VOYW1lID0gYHN0b3JlLmluc3RhbmNlLiR7c3RvcmVJbnN0YW5jZUNvdW50ZXIrK31gXG5cdFx0dGhpcy5zdGF0ZUluc3RhbmNlID0gc3RhdGUoe30gYXMgVCwgaW5zdGFuY2VOYW1lLCB7IGRlZmVyQ29tcHV0ZWQ6IHRydWUgfSlcblx0XHRcblx0XHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMubG9va3VwX3ZlcmlmeV9pbnRlcnZhbCkge1xuXHRcdFx0Ly8gQ2hlY2sgZXZlcnkgMTAgc2Vjb25kcyBmb3Igb3V0ZGF0ZWQgbG9va3VwIHBhdGhzLiBUaGlzIGlzXG5cdFx0XHQvLyB0byBrZWVwIHRoZSBsb29rdXAgc3RvcmUgY2xlYW4uXG5cdFx0XHR0aGlzLmxvb2t1cF92ZXJpZnlfaW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmNsZWFuX2xvb2t1cCgpXG5cdFx0XHR9LCBERUZBVUxUX0xPT0tVUF9WRVJJRllfSU5URVJWQUwpXG5cdFx0fVxuXHR9XG5cblx0Z2V0IHN0YXRlKCk6IFN0YXRlPFQ+IHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZUluc3RhbmNlXG5cdH1cblxuXHQvKipcblx0ICogQWxsb3cgZXZhbHVhdGlvbiBvZiBjb21wdXRlZCBwcm9wZXJ0aWVzIChBRFItMDAxMykuIENhbGwgYWZ0ZXIgbG9hZCgpIGFuZCBhcHAgc2V0dXBcblx0ICogKGUuZy4gYWZ0ZXIgJHMsIGNvbnRleHQsIG9yIHJvdXRlIGFyZSByZWFkeSkgc28gY29tcHV0ZWRzIHRoYXQgZGVwZW5kIG9uIHRoZW0gY2FuIHJ1bi5cblx0ICovXG5cdHJlYWR5KCk6IHZvaWQge1xuXHRcdDsodGhpcy5zdGF0ZUluc3RhbmNlIGFzIGFueSkuYWxsb3dDb21wdXRlZD8uKClcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXJnZSBkZWVwIG9uIG9iamVjdCBgc3RhdGVgLCBidXQgb25seSB0aGUga2V5L3ZhbHVlcyBpbiBgYmx1ZXByaW50YC5cblx0ICovXG5cdGJsdWVwcmludChzdGF0ZTogVCwgYmx1ZXByaW50OiBQYXJ0aWFsPFQ+KTogUGFydGlhbDxUPiB7XG5cdFx0aWYgKHN0YXRlID09IG51bGwgfHwgdHlwZW9mIHN0YXRlICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIHt9IGFzIFBhcnRpYWw8VD5cblx0XHR9XG5cdFx0Y29uc3QgcmVzdWx0OiBhbnkgPSB7fVxuXHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGJsdWVwcmludCkpIHtcblx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RhdGUsIGtleSkpIHtcblx0XHRcdFx0Y29uc3QgYmx1ZXByaW50VmFsdWUgPSAoYmx1ZXByaW50IGFzIGFueSlba2V5XVxuXHRcdFx0XHRjb25zdCBzdGF0ZVZhbHVlID0gKHN0YXRlIGFzIGFueSlba2V5XVxuXHRcdFx0XHRpZiAoKCFBcnJheS5pc0FycmF5KGJsdWVwcmludFZhbHVlKSAmJiBibHVlcHJpbnRWYWx1ZSAhPT0gbnVsbCkgJiYgaXNfb2JqZWN0KGJsdWVwcmludFZhbHVlKSkge1xuXHRcdFx0XHRcdC8vICghKSBDb252ZW50aW9uOiBUaGUgY29udGVudHMgb2YgYSBzdGF0ZSBrZXkgd2l0aCB0aGUgbmFtZSAnbG9va3VwJyBpc1xuXHRcdFx0XHRcdC8vIGFsd2F5cyBvbmUtb25lIGNvcGllZCBmcm9tIHRoZSBzdGF0ZSwgaW5zdGVhZCBvZiBiZWluZ1xuXHRcdFx0XHRcdC8vIGJsdWVwcmludGVkIHBlci1rZXkuIFRoaXMgaXMgdG8gYWNjb21vZGF0ZSBrZXkvdmFsdWVcblx0XHRcdFx0XHQvLyBsb29rdXBzLCB3aXRob3V0IGhhdmluZyB0byBkZWZpbmUgZWFjaCBrZXkgaW4gdGhlXG5cdFx0XHRcdFx0Ly8gc3RhdGUncyBwZXJzaXN0ZW50IHNlY3Rpb24uXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gJ2xvb2t1cCcpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtrZXldID0gY29weV9vYmplY3Qoc3RhdGVWYWx1ZSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVzdWx0W2tleV0gPSB0aGlzLmJsdWVwcmludChzdGF0ZVZhbHVlLCBibHVlcHJpbnRWYWx1ZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBzdGF0ZVZhbHVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdCBhcyBQYXJ0aWFsPFQ+XG5cdH1cblxuXHRjbGVhbl9sb29rdXAoKSB7XG5cdFx0Ly8gU2tpcCBkdXJpbmcgU1NSIChzZXJ2ZXItc2lkZSByZW5kZXJpbmcgaW4gQnVuKVxuXHRcdC8vIENoZWNrIGJvdGggd2luZG93IGV4aXN0ZW5jZSBhbmQgX19TU1JfTU9ERV9fIGZsYWcgZm9yIHNhZmV0eVxuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCBnbG9iYWxUaGlzLl9fU1NSX01PREVfXykge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdFxuXHRcdGxldCBzdG9yZV9tb2RpZmllZCA9IGZhbHNlXG5cdFx0Y29uc3QgbG9va3VwID0gKHRoaXMuc3RhdGVJbnN0YW5jZSBhcyBhbnkpLmxvb2t1cFxuXHRcdGlmICghbG9va3VwKSByZXR1cm5cblx0XHRcblx0XHQvLyBCdWlsZCBhIG5ldyBsb29rdXAgb2JqZWN0IHdpdGggb25seSB2YWxpZCBlbnRyaWVzXG5cdFx0Y29uc3QgbmV3TG9va3VwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblx0XHQvLyBHZXQga2V5cyBmaXJzdCB0byBhdm9pZCBpdGVyYXRpb24gaXNzdWVzIHdoZW4gZGVsZXRpbmdcblx0XHQvLyBGaWx0ZXIgb3V0ICQgcHJlZml4IGtleXMgYWRkZWQgYnkgcmVhY3RpdmUgcHJveHlcblx0XHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobG9va3VwKS5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKCckJykgJiYgayAhPT0gJ19faXNTdGF0ZScgJiYgayAhPT0gJ19fc2lnbmFsTWFwJylcblx0XHRmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGxvb2t1cFtrZXldXG5cdFx0XHQvLyBQcmV2aW91c2x5IHN0b3JlZCB2YWx1ZXMgbWF5IG5vdCBoYXZlIGEgbW9kaWZpZWQgdGltZXN0YW1wLlxuXHRcdFx0Ly8gU2V0IGl0IG5vdywgYW5kIGxldCBpdCBiZSBjbGVhbmVkIHVwIGFmdGVyIHRoZSBpbnRlcnZhbC5cblx0XHRcdGlmICghdmFsdWUgfHwgIWlzX29iamVjdCh2YWx1ZSkpIHtcblx0XHRcdFx0Ly8gU2tpcCBpbnZhbGlkIGVudHJpZXNcblx0XHRcdFx0c3RvcmVfbW9kaWZpZWQgPSB0cnVlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoISh2YWx1ZSBhcyBhbnkpLm1vZGlmaWVkKSB7XG5cdFx0XHRcdFx0KHZhbHVlIGFzIGFueSkubW9kaWZpZWQgPSBEYXRlLm5vdygpXG5cdFx0XHRcdFx0c3RvcmVfbW9kaWZpZWQgPSB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCh2YWx1ZSBhcyBhbnkpLm1vZGlmaWVkID49IChEYXRlLm5vdygpIC0gdGhpcy5sb29rdXBfdHRsKSkge1xuXHRcdFx0XHRcdC8vIEtlZXAgZW50cmllcyB0aGF0IGFyZSBub3QgZXhwaXJlZFxuXHRcdFx0XHRcdG5ld0xvb2t1cFtrZXldID0gdmFsdWVcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmluZm8oYFtzdG9yZV0gcmVtb3Zpbmcgb3V0ZGF0ZWQgbG9va3VwIHBhdGg6ICR7a2V5fWApXG5cdFx0XHRcdFx0c3RvcmVfbW9kaWZpZWQgPSB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHN0b3JlX21vZGlmaWVkKSB7XG5cdFx0XHQvLyBSZXBsYWNlIGxvb2t1cCB3aXRoIGNsZWFuZWQgdmVyc2lvblxuXHRcdFx0KHRoaXMuc3RhdGVJbnN0YW5jZSBhcyBhbnkpLmxvb2t1cCA9IG5ld0xvb2t1cFxuXHRcdFx0dGhpcy5zYXZlKClcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGtleSBmcm9tIGxvY2FsIHN0b3JhZ2UuIElmIHRoZSBpdGVtIGRvZXMgbm90IGV4aXN0IG9yXG5cdCAqIGNhbm5vdCBiZSByZXRyaWV2ZWQsIHRoZSBkZWZhdWx0IFwie31cIiBpcyByZXR1cm5lZC5cblx0ICovXG5cdGdldChrZXk6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJ3t9J1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkgfHwgJ3t9J1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuICd7fSdcblx0XHR9XG5cdH1cblxuXHRnZXRfdGFiX3N0b3JhZ2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuICd7fSdcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSkgfHwgJ3t9J1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuICd7fSdcblx0XHR9XG5cdH1cblxuXHRsb2FkKHNhdmVkOiBQYXJ0aWFsPFQ+LCB0ZW1wb3Jhcnk6IFBhcnRpYWw8VD4sIHRhYjogUGFydGlhbDxUPiA9IHt9IGFzIFBhcnRpYWw8VD4sIHNlc3Npb246IFBhcnRpYWw8VD4gPSB7fSBhcyBQYXJ0aWFsPFQ+KSB7XG5cdFx0Y29uc3QgcmVzdG9yZWRfc3RhdGUgPSB7XG5cdFx0XHR0YWI6IHRoaXMuZ2V0X3RhYl9zdG9yYWdlKCdzdG9yZScpLFxuXHRcdFx0c3RvcmU6IHRoaXMuZ2V0KCdzdG9yZScpLFxuXHRcdH1cblxuXHRcdHRoaXMudGVtcGxhdGVzID0ge1xuXHRcdFx0c2F2ZWQsXG5cdFx0XHR0ZW1wb3JhcnksXG5cdFx0XHR0YWIsXG5cdFx0XHRzZXNzaW9uLFxuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRyZXN0b3JlZF9zdGF0ZS5zdG9yZSA9IEpTT04ucGFyc2UocmVzdG9yZWRfc3RhdGUuc3RvcmUpXG5cdFx0XHRyZXN0b3JlZF9zdGF0ZS50YWIgPSBKU09OLnBhcnNlKHJlc3RvcmVkX3N0YXRlLnRhYilcblx0XHR9IGNhdGNoKGVycikge1xuXHRcdFx0Y29uc29sZS5sb2coYFtzdG9yZV0gZmFpbGVkIHRvIHBhcnNlIHN0b3JlL3RhYjogJHtlcnJ9YClcblx0XHR9XG5cblx0XHRjb25zdCBzdG9yZV9zdGF0ZSA9IG1lcmdlX2RlZXAoY29weV9vYmplY3QodGhpcy50ZW1wbGF0ZXMuc2F2ZWQpLCBjb3B5X29iamVjdChyZXN0b3JlZF9zdGF0ZS5zdG9yZSA/PyB7fSkpXG5cdFx0Ly8gb3ZlcnJpZGUgd2l0aCBwcmV2aW91cyBpZGVudGl0eSBmb3IgYSBiZXR0ZXIgdmVyc2lvbiBidW1wIGV4cGVyaWVuY2UuXG5cdFx0aWYgKHJlc3RvcmVkX3N0YXRlLnN0b3JlICYmIHR5cGVvZiByZXN0b3JlZF9zdGF0ZS5zdG9yZSA9PT0gJ29iamVjdCcgJiYgJ2lkZW50aXR5JyBpbiAocmVzdG9yZWRfc3RhdGUuc3RvcmUgYXMgb2JqZWN0KSkge1xuXHRcdFx0c3RvcmVfc3RhdGUuaWRlbnRpdHkgPSAocmVzdG9yZWRfc3RhdGUuc3RvcmUgYXMgYW55KS5pZGVudGl0eVxuXHRcdH1cblx0XHRsZXQgdGFiX3N0YXRlXG5cblx0XHRpZiAoIXJlc3RvcmVkX3N0YXRlLnRhYikge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tzdG9yZV0gbG9hZGluZyB0YWIgc3RhdGUgZnJvbSBsb2NhbCBzdG9yZScpXG5cdFx0XHR0YWJfc3RhdGUgPSBtZXJnZV9kZWVwKGNvcHlfb2JqZWN0KHRoaXMudGVtcGxhdGVzLnRhYiksIHN0b3JlX3N0YXRlLnRhYilcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tzdG9yZV0gcmVzdG9yaW5nIGV4aXN0aW5nIHRhYiBzdGF0ZScpXG5cdFx0XHR0YWJfc3RhdGUgPSBtZXJnZV9kZWVwKGNvcHlfb2JqZWN0KHRoaXMudGVtcGxhdGVzLnRhYiksIGNvcHlfb2JqZWN0KHJlc3RvcmVkX3N0YXRlLnRhYikpXG5cdFx0fVxuXHRcdFxuXHRcdC8vIEFsd2F5cyBtZXJnZSB0YWJfc3RhdGUgaW50byBzdG9yZV9zdGF0ZSB0byBlbnN1cmUgaXQncyBpbmNsdWRlZCBpbiBmaW5hbF9zdGF0ZVxuXHRcdG1lcmdlX2RlZXAoc3RvcmVfc3RhdGUsIHt0YWI6IHRhYl9zdGF0ZX0pXG5cblx0XHQvLyBNZXJnZSB0ZW1wb3JhcnkgaW50byBzdG9yZV9zdGF0ZVxuXHRcdC8vIE5vdGU6IGNvcHlfb2JqZWN0IHJlbW92ZXMgZnVuY3Rpb25zLCBidXQgdGVtcG9yYXJ5IGRhdGEgc2hvdWxkbid0IGhhdmUgZnVuY3Rpb25zIGFueXdheVxuXHRcdC8vIChjb21wdXRlZCBwcm9wZXJ0aWVzIGFyZSBoYW5kbGVkIHNlcGFyYXRlbHkgdmlhIG1lcmdlZEluaXRpYWwpXG5cdFx0Y29uc3QgdGVtcF9zdGF0ZSA9IG1lcmdlX2RlZXAoc3RvcmVfc3RhdGUsIGNvcHlfb2JqZWN0KHRlbXBvcmFyeSkpXG5cdFx0XG5cdFx0Ly8gTWVyZ2Ugc2Vzc2lvbiBpbnRvIHRlbXBfc3RhdGUgdG8gY3JlYXRlIGZpbmFsX3N0YXRlXG5cdFx0Ly8gU2Vzc2lvbiBzdGF0ZSBjb21lcyBmcm9tIHNlcnZlciAoU1NSKSwgbm90IGxvY2FsU3RvcmFnZVxuXHRcdGNvbnN0IGZpbmFsX3N0YXRlID0gbWVyZ2VfZGVlcCh0ZW1wX3N0YXRlLCBjb3B5X29iamVjdChzZXNzaW9uKSlcblx0XHRcblx0XHQvLyBNZXJnZSB0ZW1wbGF0ZXMgKGluY2x1ZGluZyBjb21wdXRlZCBwcm9wZXJ0aWVzKSBpbnRvIFwibWVyZ2VkIGluaXRpYWwgc3RhdGVcIlxuXHRcdC8vIFRoaXMgd2lsbCBiZSBzdG9yZWQgaW4gcmVnaXN0cnkgc28gY29tcHV0ZWQgcHJvcGVydGllcyBjYW4gYmUgYXV0b21hdGljYWxseSByZXN0b3JlZFxuXHRcdC8vIFVzZSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMgdG8gZGVlcCBjb3B5IHdoaWxlIHByZXNlcnZpbmcgZnVuY3Rpb25zXG5cdFx0Ly8gTm90ZTogdGFiIHRlbXBsYXRlIHN0cnVjdHVyZSBuZWVkcyB0byBtYXRjaCBmaW5hbF9zdGF0ZSBzdHJ1Y3R1cmUgKG5lc3RlZCB1bmRlciAndGFiJylcblx0XHRjb25zdCBtZXJnZWRJbml0aWFsU2F2ZWQgPSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMoc2F2ZWQpXG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbFRlbXBvcmFyeSA9IGNvcHlfb2JqZWN0X3ByZXNlcnZlX2Z1bmN0aW9ucyh0ZW1wb3JhcnkpXG5cdFx0Ly8gVGFiIHRlbXBsYXRlIGlzIG1lcmdlZCBpbnRvIHN0b3JlX3N0YXRlLnRhYiwgc28gd3JhcCBpdCBpbiB7dGFiOiAuLi59XG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbFRhYiA9IHRhYiAmJiBPYmplY3Qua2V5cyh0YWIpLmxlbmd0aCA+IDAgPyB7dGFiOiBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnModGFiKX0gOiB7fVxuXHRcdC8vIFNlc3Npb24gdGVtcGxhdGUgaXMgbWVyZ2VkIGRpcmVjdGx5IChubyBuZXN0aW5nIG5lZWRlZCwgc3RydWN0dXJlIG1hdGNoZXMgZmluYWxfc3RhdGUpXG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbFNlc3Npb24gPSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMoc2Vzc2lvbilcblx0XHRjb25zdCBtZXJnZWRJbml0aWFsID0gbWVyZ2VfZGVlcChcblx0XHRcdG1lcmdlZEluaXRpYWxTYXZlZCxcblx0XHRcdG1lcmdlZEluaXRpYWxUZW1wb3JhcnksXG5cdFx0XHRtZXJnZWRJbml0aWFsVGFiLFxuXHRcdFx0bWVyZ2VkSW5pdGlhbFNlc3Npb25cblx0XHQpXG5cdFx0XG5cdFx0Ly8gVXBkYXRlIHJlZ2lzdHJ5IGVudHJ5IHRvIHN0b3JlIG1lcmdlZCB0ZW1wbGF0ZXMgYXMgXCJpbml0aWFsXCIgc3RhdGVcblx0XHQvLyBUaGlzIGFsbG93cyBkZXNlcmlhbGl6ZUFsbFN0YXRlcygpIHRvIGF1dG9tYXRpY2FsbHkgcmVzdG9yZSBjb21wdXRlZCBwcm9wZXJ0aWVzXG5cdFx0dXBkYXRlU3RhdGVSZWdpc3RyeSh0aGlzLnN0YXRlSW5zdGFuY2UsIG1lcmdlZEluaXRpYWwpXG5cdFx0XG5cdFx0Ly8gVXNlIGRlc2VyaWFsaXplU3RvcmUoKSBpbnN0ZWFkIG9mIGN1c3RvbSB1cGRhdGVTdGF0ZSgpXG5cdFx0Ly8gVGhpcyBlbnN1cmVzIGNvbnNpc3RlbmN5IHdpdGggU1NSIGRlc2VyaWFsaXphdGlvbiBtZWNoYW5pc21cblx0XHRkZXNlcmlhbGl6ZVN0b3JlKHRoaXMuc3RhdGVJbnN0YW5jZSwgZmluYWxfc3RhdGUpXG5cdFx0XG5cdFx0Ly8gUmVzdG9yZSBjb21wdXRlZCBwcm9wZXJ0aWVzIGZyb20gbWVyZ2VkIHRlbXBsYXRlc1xuXHRcdC8vIFRoaXMgZW5zdXJlcyBjb21wdXRlZCBwcm9wZXJ0aWVzIGFyZSBhdmFpbGFibGUgaW1tZWRpYXRlbHkgYWZ0ZXIgbG9hZCgpXG5cdFx0Ly8gTm90ZTogbWVyZ2VkSW5pdGlhbCBjb250YWlucyBhbGwgdGVtcGxhdGVzIChzYXZlZCwgdGVtcG9yYXJ5LCB0YWIsIHNlc3Npb24pIHdpdGggY29tcHV0ZWQgcHJvcGVydGllc1xuXHRcdHJlc3RvcmVDb21wdXRlZFByb3BlcnRpZXModGhpcy5zdGF0ZUluc3RhbmNlLCBtZXJnZWRJbml0aWFsKVxuXHRcdFxuXHRcdC8vIE5vdGU6IHNldHVwQ29tcHV0ZWRQcm9wZXJ0aWVzKCkgY2FsbGJhY2sgaXMgbm8gbG9uZ2VyIG5lZWRlZCwgYnV0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcblx0XHRpZiAodGhpcy5jb21wdXRlZFByb3BlcnRpZXNTZXR1cCkge1xuXHRcdFx0dGhpcy5jb21wdXRlZFByb3BlcnRpZXNTZXR1cCgpXG5cdFx0fVxuXHRcdC8vIEFEUi0wMDEzOiBvcGVuIGRlZmVycmVkLWNvbXB1dGVkIGdhdGUgc28gY29tcHV0ZWRzIGNhbiBydW4gYWZ0ZXIgbG9hZFxuXHRcdHRoaXMucmVhZHkoKVxuXHR9XG5cdFxuXHQvKipcblx0ICogUmVnaXN0ZXIgYSBmdW5jdGlvbiB0byBzZXQgdXAgY29tcHV0ZWQgcHJvcGVydGllcyBhZnRlciBlYWNoIGxvYWQoKVxuXHQgKiBUaGlzIGVuc3VyZXMgY29tcHV0ZWQgcHJvcGVydGllcyBhcmUgYWx3YXlzIGF2YWlsYWJsZSwgZXZlbiBhZnRlciByZWxvYWRpbmcgZnJvbSBzdG9yYWdlXG5cdCAqL1xuXHRzZXR1cENvbXB1dGVkUHJvcGVydGllcyhzZXR1cEZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG5cdFx0dGhpcy5jb21wdXRlZFByb3BlcnRpZXNTZXR1cCA9IHNldHVwRm5cblx0XHQvLyBDYWxsIGltbWVkaWF0ZWx5IHRvIHNldCB1cCBjb21wdXRlZCBwcm9wZXJ0aWVzIGZvciBjdXJyZW50IHN0YXRlXG5cdFx0c2V0dXBGbigpXG5cdH1cblxuXHQvKipcblx0ICogUGVyc2lzdCBzdGF0ZSB0byBzdG9yYWdlLiBXaGVuIG5vIG9wdGlvbnMgYXJlIHBhc3NlZCwgc2F2ZXMgdG8gbG9jYWxTdG9yYWdlIChzYXZlZCkgYW5kXG5cdCAqIHNlc3Npb25TdG9yYWdlICh0YWIpLiBTZXNzaW9uIChzZXJ2ZXItc2lkZSkgaXMgb2ZmIGJ5IGRlZmF1bHQ7IHBhc3MgeyBzZXNzaW9uOiB0cnVlIH0gdG8gcGVyc2lzdCBpdC5cblx0ICovXG5cdGFzeW5jIHNhdmUob3B0aW9ucz86IHtzYXZlZD86IGJvb2xlYW4sIHRhYj86IGJvb2xlYW4sIHNlc3Npb24/OiBib29sZWFufSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIFNraXAgc2F2aW5nIGR1cmluZyBTU1IgKHNlcnZlci1zaWRlIHJlbmRlcmluZyBpbiBCdW4pXG5cdFx0Ly8gT24gdGhlIHNlcnZlciwgdGhlcmUncyBubyBsb2NhbFN0b3JhZ2Uvc2Vzc2lvblN0b3JhZ2UgYW5kIG5vIG5lZWQgdG8gcGVyc2lzdCBzdGF0ZVxuXHRcdGlmIChnbG9iYWxUaGlzLl9fU1NSX01PREVfXykge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdFxuXHRcdC8vIERlZmF1bHQgdG8gc2F2aW5nIHNhdmVkL3RhYiB3aGVuIG5vIG9wdGlvbnM7IHNlc3Npb24gaXMgb3B0LWluIChvZmYgYnkgZGVmYXVsdClcblx0XHRjb25zdCBzYXZlU2F2ZWQgPSBvcHRpb25zPy5zYXZlZCA/PyAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKVxuXHRcdGNvbnN0IHNhdmVUYWIgPSBvcHRpb25zPy50YWIgPz8gKG9wdGlvbnMgPT09IHVuZGVmaW5lZClcblx0XHRjb25zdCBzYXZlU2Vzc2lvbiA9IG9wdGlvbnM/LnNlc3Npb24gPT09IHRydWVcblx0XHRcblx0XHQvLyBVc2UgU1NSIHNlcmlhbGl6YXRpb24gd2hpY2ggcHJvcGVybHkgaGFuZGxlcyBTdGF0ZSBvYmplY3RzIGFuZCBza2lwcyBDb21wdXRlZFNpZ25hbCBwcm9wZXJ0aWVzXG5cdFx0Ly8gVGhpcyBpcyB0aGUgc2FtZSBtZWNoYW5pc20gdXNlZCBmb3IgU1NSLCBlbnN1cmluZyBjb25zaXN0ZW5jeVxuXHRcdGNvbnN0IHN0YXRlUGxhaW4gPSBzZXJpYWxpemVTdG9yZSh0aGlzLnN0YXRlSW5zdGFuY2UpXG5cdFx0XG5cdFx0Ly8gU2F2ZSB0byBsb2NhbFN0b3JhZ2UgKHNhdmVkIHN0YXRlKVxuXHRcdGlmIChzYXZlU2F2ZWQgJiYgdGhpcy50ZW1wbGF0ZXMuc2F2ZWQpIHtcblx0XHRcdHRoaXMuc2V0KCdzdG9yZScsIHRoaXMuYmx1ZXByaW50KHN0YXRlUGxhaW4sIGNvcHlfb2JqZWN0KHRoaXMudGVtcGxhdGVzLnNhdmVkKSkpXG5cdFx0fVxuXHRcdFxuXHRcdC8vIFNhdmUgdG8gc2Vzc2lvblN0b3JhZ2UgKHRhYiBzdGF0ZSlcblx0XHRpZiAoc2F2ZVRhYiAmJiB0aGlzLnRlbXBsYXRlcy50YWIpIHtcblx0XHRcdGNvbnN0IHRhYlN0YXRlID0gKHRoaXMuc3RhdGVJbnN0YW5jZSBhcyBhbnkpLnRhYlxuXHRcdFx0aWYgKHRhYlN0YXRlKSB7XG5cdFx0XHRcdC8vIEdldCB0aGUgdGFiIHRlbXBsYXRlIC0gdW53cmFwIGlmIGl0J3MgbmVzdGVkIHVuZGVyIGEgJ3RhYicga2V5XG5cdFx0XHRcdC8vIFRoZSB0ZW1wbGF0ZSBtaWdodCBiZTogeyB0YWI6IHsgc2Vzc2lvbklkLCAuLi4gfSB9IG9yIHsgc2Vzc2lvbklkLCAuLi4gfVxuXHRcdFx0XHQvLyBUaGUgc3RhdGUgaXMgYWx3YXlzOiB7IHNlc3Npb25JZCwgLi4uIH1cblx0XHRcdFx0Y29uc3QgdGFiVGVtcGxhdGUgPSAodGhpcy50ZW1wbGF0ZXMudGFiIGFzIGFueSkudGFiIHx8IHRoaXMudGVtcGxhdGVzLnRhYlxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGFiIGlzIGEgU3RhdGUgb2JqZWN0XG5cdFx0XHRcdGlmIChpc1N0YXRlKHRhYlN0YXRlKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRhYlBsYWluID0gc2VyaWFsaXplU3RvcmUodGFiU3RhdGUpXG5cdFx0XHRcdFx0Ly8gYmx1ZXByaW50IGV4cGVjdHMgYm90aCBhcmd1bWVudHMgdG8gaGF2ZSB0aGUgc2FtZSBzdHJ1Y3R1cmVcblx0XHRcdFx0XHR0aGlzLnNldF90YWIoJ3N0b3JlJywgdGhpcy5ibHVlcHJpbnQodGFiUGxhaW4sIGNvcHlfb2JqZWN0KHRhYlRlbXBsYXRlKSkpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gUGxhaW4gb2JqZWN0IHRhYlxuXHRcdFx0XHRcdHRoaXMuc2V0X3RhYignc3RvcmUnLCB0aGlzLmJsdWVwcmludCh0YWJTdGF0ZSwgY29weV9vYmplY3QodGFiVGVtcGxhdGUpKSlcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gdGFiIHN0YXRlIC0gc2F2ZSBlbXB0eSB0YWIgYmFzZWQgb24gdGVtcGxhdGUgc3RydWN0dXJlXG5cdFx0XHRcdGNvbnN0IHRhYlRlbXBsYXRlID0gKHRoaXMudGVtcGxhdGVzLnRhYiBhcyBhbnkpLnRhYiB8fCB0aGlzLnRlbXBsYXRlcy50YWJcblx0XHRcdFx0aWYgKHRhYlRlbXBsYXRlICYmIE9iamVjdC5rZXlzKHRhYlRlbXBsYXRlKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRfdGFiKCdzdG9yZScsIHRoaXMuYmx1ZXByaW50KHt9IGFzIGFueSwgY29weV9vYmplY3QodGFiVGVtcGxhdGUpKSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnNldF90YWIoJ3N0b3JlJywge30pXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gU2F2ZSB0byBzZXNzaW9uIEFQSSAoc2Vzc2lvbiBzdGF0ZSkgLSBhc3luYyBieSBuYXR1cmVcblx0XHQvLyBPbmx5IHNhdmUgc2Vzc2lvbiBvbiBjbGllbnQgc2lkZSAobm90IGR1cmluZyBTU1IpXG5cdFx0aWYgKHNhdmVTZXNzaW9uICYmIHRoaXMudGVtcGxhdGVzLnNlc3Npb24gJiYgT2JqZWN0LmtleXModGhpcy50ZW1wbGF0ZXMuc2Vzc2lvbikubGVuZ3RoID4gMCAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Y29uc3Qgc2Vzc2lvbkRhdGEgPSB0aGlzLmJsdWVwcmludChzdGF0ZVBsYWluLCBjb3B5X29iamVjdCh0aGlzLnRlbXBsYXRlcy5zZXNzaW9uKSlcblx0XHRcdFxuXHRcdFx0Ly8gQ2FsbCBBUEkgZW5kcG9pbnQgd2l0aCBiYXRjaGVkIHNlc3Npb24gdXBkYXRlc1xuXHRcdFx0Y29uc3QgZW5kcG9pbnQgPSAnL2FwaS9zZXNzaW9uJ1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xuXHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0aGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG5cdFx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KHNlc3Npb25EYXRhKVxuXHRcdFx0fSlcblxuXHRcdFx0XG5cdFx0XHRpZiAoIXJlc3BvbnNlLm9rKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNhdmUgc2Vzc2lvbiBzdGF0ZTogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2V0KGtleTogc3RyaW5nLCBpdGVtOiBvYmplY3QpOiB2b2lkIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkoaXRlbSkpXG5cdFx0fSBjYXRjaChlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCB1c2UgTG9jYWwgU3RvcmFnZTsgY29udGludWUgd2l0aG91dC4nLCBlcnIpXG5cdFx0fVxuXHR9XG5cblx0c2V0X3RhYihrZXk6IHN0cmluZywgaXRlbTogb2JqZWN0KTogdm9pZCB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm5cblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkoaXRlbSkpXG5cdFx0fSBjYXRjaChlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCB1c2UgU2Vzc2lvbiBTdG9yYWdlOyBjb250aW51ZSB3aXRob3V0LicsIGVycilcblx0XHR9XG5cdH1cbn1cbiIsCiAgICAiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vanN4LmQudHNcIiAvPlxuaW1wb3J0IGh5cGVyc2NyaXB0IGZyb20gJy4vcmVuZGVyL2h5cGVyc2NyaXB0J1xuaW1wb3J0IG1vdW50UmVkcmF3RmFjdG9yeSBmcm9tICcuL2FwaS9tb3VudC1yZWRyYXcnXG5pbXBvcnQgcm91dGVyRmFjdG9yeSBmcm9tICcuL2FwaS9yb3V0ZXInXG5pbXBvcnQgcmVuZGVyRmFjdG9yeSBmcm9tICcuL3JlbmRlci9yZW5kZXInXG5pbXBvcnQgcGFyc2VRdWVyeVN0cmluZyBmcm9tICcuL3F1ZXJ5c3RyaW5nL3BhcnNlJ1xuaW1wb3J0IGJ1aWxkUXVlcnlTdHJpbmcgZnJvbSAnLi9xdWVyeXN0cmluZy9idWlsZCdcbmltcG9ydCBwYXJzZVBhdGhuYW1lIGZyb20gJy4vcGF0aG5hbWUvcGFyc2UnXG5pbXBvcnQgYnVpbGRQYXRobmFtZSBmcm9tICcuL3BhdGhuYW1lL2J1aWxkJ1xuaW1wb3J0IFZub2RlRmFjdG9yeSwge01pdGhyaWxDb21wb25lbnR9IGZyb20gJy4vcmVuZGVyL3Zub2RlJ1xuaW1wb3J0IGNlbnNvciBmcm9tICcuL3V0aWwvY2Vuc29yJ1xuaW1wb3J0IG5leHRfdGljayBmcm9tICcuL3V0aWwvbmV4dF90aWNrJ1xuaW1wb3J0IGRvbUZvciBmcm9tICcuL3JlbmRlci9kb21Gb3InXG5pbXBvcnQge3NpZ25hbCwgY29tcHV0ZWQsIGVmZmVjdCwgU2lnbmFsLCBDb21wdXRlZFNpZ25hbCwgc2V0U2lnbmFsUmVkcmF3Q2FsbGJhY2ssIGdldFNpZ25hbENvbXBvbmVudHN9IGZyb20gJy4vc2lnbmFsJ1xuaW1wb3J0IHtzdGF0ZSwgd2F0Y2gsIHJlZ2lzdGVyU3RhdGUsIGdldFJlZ2lzdGVyZWRTdGF0ZXMsIGNvcHlHbG9iYWxTdGF0ZXNUb0NvbnRleHR9IGZyb20gJy4vc3RhdGUnXG5cbmltcG9ydCB0eXBlIHtWbm9kZSwgQ2hpbGRyZW4sIENvbXBvbmVudFR5cGV9IGZyb20gJy4vcmVuZGVyL3Zub2RlJ1xuaW1wb3J0IHR5cGUge0h5cGVyc2NyaXB0fSBmcm9tICcuL3JlbmRlci9oeXBlcnNjcmlwdCdcbmltcG9ydCB0eXBlIHtSb3V0ZSwgUm91dGVSZXNvbHZlciwgUmVkaXJlY3RPYmplY3R9IGZyb20gJy4vYXBpL3JvdXRlcidcbmltcG9ydCB0eXBlIHtSZW5kZXIsIFJlZHJhdywgTW91bnR9IGZyb20gJy4vYXBpL21vdW50LXJlZHJhdydcblxuZXhwb3J0IGludGVyZmFjZSBNaXRocmlsU3RhdGljIHtcblx0bTogSHlwZXJzY3JpcHRcblx0dHJ1c3Q6IChodG1sOiBzdHJpbmcpID0+IFZub2RlXG5cdGZyYWdtZW50OiAoYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCAuLi5jaGlsZHJlbjogQ2hpbGRyZW5bXSkgPT4gVm5vZGVcblx0RnJhZ21lbnQ6IHN0cmluZ1xuXHRtb3VudDogTW91bnRcblx0cm91dGU6IFJvdXRlICYgKChyb290OiBFbGVtZW50LCBkZWZhdWx0Um91dGU6IHN0cmluZywgcm91dGVzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlcj4pID0+IHZvaWQpICYge3JlZGlyZWN0OiAocGF0aDogc3RyaW5nKSA9PiBSZWRpcmVjdE9iamVjdH1cblx0cmVuZGVyOiBSZW5kZXJcblx0cmVkcmF3OiBSZWRyYXdcblx0cGFyc2VRdWVyeVN0cmluZzogKHF1ZXJ5U3RyaW5nOiBzdHJpbmcpID0+IFJlY29yZDxzdHJpbmcsIGFueT5cblx0YnVpbGRRdWVyeVN0cmluZzogKHZhbHVlczogUmVjb3JkPHN0cmluZywgYW55PikgPT4gc3RyaW5nXG5cdHBhcnNlUGF0aG5hbWU6IChwYXRobmFtZTogc3RyaW5nKSA9PiB7cGF0aDogc3RyaW5nOyBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT59XG5cdGJ1aWxkUGF0aG5hbWU6ICh0ZW1wbGF0ZTogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT4pID0+IHN0cmluZ1xuXHR2bm9kZTogdHlwZW9mIFZub2RlRmFjdG9yeVxuXHRjZW5zb3I6IChhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiwgZXh0cmFzPzogc3RyaW5nW10pID0+IFJlY29yZDxzdHJpbmcsIGFueT5cblx0bmV4dF90aWNrOiAoKSA9PiBQcm9taXNlPHZvaWQ+XG5cdGRvbUZvcjogKHZub2RlOiBWbm9kZSkgPT4gR2VuZXJhdG9yPE5vZGUsIHZvaWQsIHVua25vd24+XG59XG5cbmNvbnN0IG1vdW50UmVkcmF3SW5zdGFuY2UgPSBtb3VudFJlZHJhd0ZhY3RvcnkoXG5cdHJlbmRlckZhY3RvcnkoKSxcblx0dHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCcgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpIDogc2V0VGltZW91dCxcblx0Y29uc29sZSxcbilcblxuY29uc3Qgcm91dGVyID0gcm91dGVyRmFjdG9yeShcblx0dHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBudWxsLFxuXHRtb3VudFJlZHJhd0luc3RhbmNlLFxuKVxuXG5jb25zdCBtOiBNaXRocmlsU3RhdGljICYgSHlwZXJzY3JpcHQgPSBmdW5jdGlvbiBtKHRoaXM6IGFueSkge1xuXHRyZXR1cm4gaHlwZXJzY3JpcHQuYXBwbHkodGhpcywgYXJndW1lbnRzIGFzIGFueSlcbn0gYXMgdW5rbm93biBhcyBNaXRocmlsU3RhdGljICYgSHlwZXJzY3JpcHRcblxubS5tID0gaHlwZXJzY3JpcHQgYXMgSHlwZXJzY3JpcHRcbm0udHJ1c3QgPSBoeXBlcnNjcmlwdC50cnVzdFxubS5mcmFnbWVudCA9IGh5cGVyc2NyaXB0LmZyYWdtZW50XG5tLkZyYWdtZW50ID0gJ1snXG5tLm1vdW50ID0gbW91bnRSZWRyYXdJbnN0YW5jZS5tb3VudFxubS5yb3V0ZSA9IHJvdXRlciBhcyBSb3V0ZSAmIHR5cGVvZiByb3V0ZXIgJiB7cmVkaXJlY3Q6IChwYXRoOiBzdHJpbmcpID0+IFJlZGlyZWN0T2JqZWN0fVxubS5yZW5kZXIgPSByZW5kZXJGYWN0b3J5KClcbm0ucmVkcmF3ID0gbW91bnRSZWRyYXdJbnN0YW5jZS5yZWRyYXdcbm0ucGFyc2VRdWVyeVN0cmluZyA9IHBhcnNlUXVlcnlTdHJpbmdcbm0uYnVpbGRRdWVyeVN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmdcbm0ucGFyc2VQYXRobmFtZSA9IHBhcnNlUGF0aG5hbWVcbm0uYnVpbGRQYXRobmFtZSA9IGJ1aWxkUGF0aG5hbWVcbm0udm5vZGUgPSBWbm9kZUZhY3Rvcnlcbm0uY2Vuc29yID0gY2Vuc29yXG5tLm5leHRfdGljayA9IG5leHRfdGlja1xubS5kb21Gb3IgPSBkb21Gb3JcblxuLy8gU2V0IHVwIHNpZ25hbC10by1jb21wb25lbnQgcmVkcmF3IGludGVncmF0aW9uXG5zZXRTaWduYWxSZWRyYXdDYWxsYmFjaygoc2lnOiBTaWduYWw8YW55PikgPT4ge1xuXHRjb25zdCBjb21wb25lbnRzID0gZ2V0U2lnbmFsQ29tcG9uZW50cyhzaWcpXG5cdGlmIChjb21wb25lbnRzKSB7XG5cdFx0Y29tcG9uZW50cy5mb3JFYWNoKGNvbXBvbmVudCA9PiB7XG5cdFx0XHQvLyBVc2UgdGhlIGNvbXBvbmVudC1sZXZlbCByZWRyYXdcblx0XHRcdG0ucmVkcmF3KGNvbXBvbmVudCBhcyBhbnkpXG5cdFx0fSlcblx0fVxufSlcblxuLy8gRXhwb3J0IHNpZ25hbHMgQVBJXG5leHBvcnQge3NpZ25hbCwgY29tcHV0ZWQsIGVmZmVjdCwgU2lnbmFsLCBDb21wdXRlZFNpZ25hbCwgc3RhdGUsIHdhdGNoLCByZWdpc3RlclN0YXRlLCBnZXRSZWdpc3RlcmVkU3RhdGVzfVxuZXhwb3J0IHR5cGUge1N0YXRlLCBTdGF0ZU9wdGlvbnN9IGZyb20gJy4vc3RhdGUnXG5cbi8vIEV4cG9ydCBTdG9yZSBjbGFzc1xuZXhwb3J0IHtTdG9yZX0gZnJvbSAnLi9zdG9yZSdcblxuLy8gRXhwb3J0IFNTUiB1dGlsaXRpZXNcbmV4cG9ydCB7c2VyaWFsaXplU3RvcmUsIGRlc2VyaWFsaXplU3RvcmUsIHNlcmlhbGl6ZUFsbFN0YXRlcywgZGVzZXJpYWxpemVBbGxTdGF0ZXN9IGZyb20gJy4vcmVuZGVyL3NzclN0YXRlJ1xuXG4vLyBFeHBvcnQgU1NSIHJlcXVlc3QgY29udGV4dCAoZm9yIHBlci1yZXF1ZXN0IHN0b3JlIGFuZCBzdGF0ZSByZWdpc3RyeSlcbmV4cG9ydCB7Z2V0U1NSQ29udGV4dCwgcnVuV2l0aENvbnRleHQsIHJ1bldpdGhDb250ZXh0QXN5bmMsIGNsZWFudXBXYXRjaGVyc30gZnJvbSAnLi9zc3JDb250ZXh0J1xuZXhwb3J0IHR5cGUge1NTUkFjY2Vzc0NvbnRleHR9IGZyb20gJy4vc3NyQ29udGV4dCdcblxuLy8gRXhwb3J0IGlzb21vcnBoaWMgbG9nZ2VyXG5leHBvcnQge2xvZ2dlciwgTG9nZ2VyfSBmcm9tICcuL3NlcnZlci9sb2dnZXInXG5leHBvcnQgdHlwZSB7TG9nQ29udGV4dH0gZnJvbSAnLi9zZXJ2ZXIvbG9nZ2VyJ1xuXG4vLyBFeHBvcnQgbmV4dF90aWNrIHV0aWxpdHlcbmV4cG9ydCB7bmV4dF90aWNrfSBmcm9tICcuL3V0aWwvbmV4dF90aWNrJ1xuXG4vLyBFeHBvcnQgVVJJIHV0aWxpdGllc1xuZXhwb3J0IHtnZXRDdXJyZW50VXJsLCBnZXRQYXRobmFtZSwgZ2V0U2VhcmNoLCBnZXRIYXNoLCBnZXRMb2NhdGlvbn0gZnJvbSAnLi91dGlsL3VyaSdcbmV4cG9ydCB0eXBlIHtJc29tb3JwaGljTG9jYXRpb259IGZyb20gJy4vdXRpbC91cmknXG5cbi8vIEV4cG9ydCBjb21wb25lbnQgYW5kIHZub2RlIHR5cGVzXG5leHBvcnQgdHlwZSB7Vm5vZGUsIENvbXBvbmVudFZub2RlLCBDaGlsZHJlbiwgQ2hpbGQsIFZub2RlRE9NLCBDb21wb25lbnQsIENvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFR5cGUsIFZub2RlT2Z9IGZyb20gJy4vcmVuZGVyL3Zub2RlJ1xuZXhwb3J0IHtNaXRocmlsQ29tcG9uZW50fVxuZXhwb3J0IHR5cGUge0h5cGVyc2NyaXB0fSBmcm9tICcuL3JlbmRlci9oeXBlcnNjcmlwdCdcbmV4cG9ydCB0eXBlIHtSb3V0ZSwgUm91dGVSZXNvbHZlciwgUmVkaXJlY3RPYmplY3R9IGZyb20gJy4vYXBpL3JvdXRlcidcbmV4cG9ydCB0eXBlIHtSZW5kZXIsIFJlZHJhdywgTW91bnR9IGZyb20gJy4vYXBpL21vdW50LXJlZHJhdydcblxuLy8gTmFtZXNwYWNlIG1lcmdlOiBlbmFibGVzIG0uVm5vZGU8QXR0cnM+IGFuZCBtLkNoaWxkcmVuIHdoZW4gdXNpbmcgaW1wb3J0IG0gZnJvbSAnQGJpdHN0aWxsZXJ5L21pdGhyaWwnXG4vLyBtLlZub2RlIHVzZXMgQ29tcG9uZW50Vm5vZGUgc28gdm5vZGUuYXR0cnMgaXMgYWx3YXlzIGRlZmluZWQgaW4gY29tcG9uZW50IGxpZmVjeWNsZSBtZXRob2RzXG5kZWNsYXJlIG5hbWVzcGFjZSBtIHtcblx0dHlwZSBWbm9kZTxBdHRycyA9IFJlY29yZDxzdHJpbmcsIGFueT4sIFN0YXRlID0gYW55PiA9IGltcG9ydCgnLi9yZW5kZXIvdm5vZGUnKS5Db21wb25lbnRWbm9kZTxBdHRycywgU3RhdGU+XG5cdHR5cGUgVm5vZGVET008QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4gPSBpbXBvcnQoJy4vcmVuZGVyL3Zub2RlJykuVm5vZGVET008QXR0cnMsIFN0YXRlPlxuXHR0eXBlIENoaWxkcmVuID0gaW1wb3J0KCcuL3JlbmRlci92bm9kZScpLkNoaWxkcmVuXG5cdHR5cGUgQ2hpbGRBcnJheSA9IGltcG9ydCgnLi9yZW5kZXIvdm5vZGUnKS5DaGlsZFtdXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1cbiIsCiAgICAiaW1wb3J0IHtzdGF0ZX0gZnJvbSAnLi4vLi4vaW5kZXgnXG5pbXBvcnQgdHlwZSB7RG9jUGFnZX0gZnJvbSAnLi9tYXJrZG93bidcblxuZXhwb3J0IGludGVyZmFjZSBOYXZTZWN0aW9uIHtcblx0dGl0bGU6IHN0cmluZ1xuXHRsaW5rczogQXJyYXk8e3RleHQ6IHN0cmluZzsgaHJlZjogc3RyaW5nOyBleHRlcm5hbD86IGJvb2xlYW59PlxufVxuXG5leHBvcnQgY29uc3QgJGRvY3MgPSBzdGF0ZShcblx0e1xuXHRcdHBhZ2U6IG51bGwgYXMgRG9jUGFnZSB8IG51bGwsXG5cdFx0bmF2R3VpZGVzOiBbXSBhcyBOYXZTZWN0aW9uW10sXG5cdFx0bmF2TWV0aG9kczogW10gYXMgTmF2U2VjdGlvbltdLFxuXHRcdGxvYWRpbmc6IHRydWUsXG5cdFx0ZXJyb3I6IG51bGwgYXMgc3RyaW5nIHwgbnVsbCxcblx0XHRyb3V0ZVBhdGg6ICcvJyxcblx0fSxcblx0J2RvY3MnLFxuKVxuIiwKICAgICJpbXBvcnQge01pdGhyaWxDb21wb25lbnQsIFZub2RlfSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCBtIGZyb20gJy4uLy4uLy4uL2luZGV4J1xuXG5pbXBvcnQgdHlwZSB7TmF2U2VjdGlvbn0gZnJvbSAnLi4vc3RvcmUnXG5cbmludGVyZmFjZSBOYXZTZWN0aW9uc0F0dHJzIHtcblx0c2VjdGlvbnM6IE5hdlNlY3Rpb25bXVxufVxuXG5mdW5jdGlvbiBuYXZMaW5rKGxpbms6IHt0ZXh0OiBzdHJpbmc7IGhyZWY6IHN0cmluZzsgZXh0ZXJuYWw/OiBib29sZWFufSkge1xuXHRjb25zdCBwYXRoID0gbGluay5ocmVmLnN0YXJ0c1dpdGgoJy8nKSA/IGxpbmsuaHJlZiA6IGAvJHtsaW5rLmhyZWZ9YFxuXHRyZXR1cm4gbGluay5leHRlcm5hbFxuXHRcdD8gbSgnYScsIHtocmVmOiBsaW5rLmhyZWYsIHRhcmdldDogJ19ibGFuaycsIHJlbDogJ25vcmVmZXJyZXIgbm9vcGVuZXInfSwgbGluay50ZXh0KVxuXHRcdDogbShtLnJvdXRlLkxpbmssIHtocmVmOiBwYXRofSwgbGluay50ZXh0KVxufVxuXG5leHBvcnQgY2xhc3MgTmF2U2VjdGlvbnMgZXh0ZW5kcyBNaXRocmlsQ29tcG9uZW50PE5hdlNlY3Rpb25zQXR0cnM+IHtcblx0dmlldyh2bm9kZTogVm5vZGU8TmF2U2VjdGlvbnNBdHRycz4pIHtcblx0XHRjb25zdCB7c2VjdGlvbnMgPSBbXX0gPSB2bm9kZS5hdHRycyA/PyB7fVxuXHRcdGlmICghc2VjdGlvbnM/Lmxlbmd0aCkgcmV0dXJuIG51bGxcblx0XHRyZXR1cm4gbShcblx0XHRcdCd1bCcsXG5cdFx0XHRzZWN0aW9ucy5tYXAoKHNlY3Rpb246IE5hdlNlY3Rpb24pID0+IHtcblx0XHRcdFx0aWYgKHNlY3Rpb24ubGlua3MubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0oJ2xpJywgc2VjdGlvbi50aXRsZSlcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc2VjdGlvbi5saW5rcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gbSgnbGknLCBuYXZMaW5rKHNlY3Rpb24ubGlua3NbMF0pKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBtKCdsaScsIFtcblx0XHRcdFx0XHRzZWN0aW9uLnRpdGxlLFxuXHRcdFx0XHRcdG0oJ3VsJywgc2VjdGlvbi5saW5rcy5tYXAoKGxpbmspID0+IG0oJ2xpJywgbmF2TGluayhsaW5rKSkpKSxcblx0XHRcdFx0XSlcblx0XHRcdH0pLFxuXHRcdClcblx0fVxufVxuIiwKICAgICJpbXBvcnQge01pdGhyaWxDb21wb25lbnQsIFZub2RlfSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCBtIGZyb20gJy4uLy4uLy4uL2luZGV4J1xuaW1wb3J0IHtEb2NQYWdlfSBmcm9tICcuLi9tYXJrZG93bidcblxuaW1wb3J0IHtOYXZTZWN0aW9uc30gZnJvbSAnLi9uYXYtc2VjdGlvbnMnXG5cbmltcG9ydCB0eXBlIHtOYXZTZWN0aW9ufSBmcm9tICcuLi9zdG9yZSdcblxuaW50ZXJmYWNlIExheW91dEF0dHJzIHtcblx0cGFnZTogRG9jUGFnZVxuXHRyb3V0ZVBhdGg/OiBzdHJpbmdcblx0bmF2R3VpZGVzPzogTmF2U2VjdGlvbltdXG5cdG5hdk1ldGhvZHM/OiBOYXZTZWN0aW9uW11cblx0dmVyc2lvbj86IHN0cmluZ1xufVxuXG5jb25zdCBhcGlQYWdlUGF0dGVybnMgPSBbJ2h5cGVyc2NyaXB0JywgJ3JlbmRlcicsICdtb3VudCcsICdyb3V0ZScsICdyZXF1ZXN0JywgJ3BhcnNlUXVlcnlTdHJpbmcnLCAnYnVpbGRRdWVyeVN0cmluZycsICdidWlsZFBhdGhuYW1lJywgJ3BhcnNlUGF0aG5hbWUnLCAndHJ1c3QnLCAnZnJhZ21lbnQnLCAncmVkcmF3JywgJ2NlbnNvcicsICdzdHJlYW0nXVxuXG5leHBvcnQgY2xhc3MgTGF5b3V0IGV4dGVuZHMgTWl0aHJpbENvbXBvbmVudDxMYXlvdXRBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxMYXlvdXRBdHRycz4pIHtcblx0XHRjb25zdCBhdHRycyA9IHZub2RlLmF0dHJzID8/IHt9XG5cdFx0Y29uc3Qge3BhZ2UsIG5hdkd1aWRlcyA9IFtdLCBuYXZNZXRob2RzID0gW10sIHZlcnNpb24gPSAnMi4zLjgnfSA9IGF0dHJzXG5cblx0XHRpZiAoIXBhZ2UgfHwgIXBhZ2UuY29udGVudCkge1xuXHRcdFx0cmV0dXJuIG0oJ2RpdicsICdMb2FkaW5nLi4uJylcblx0XHR9XG5cblx0XHRsZXQgY3VycmVudFBhdGggPSBhdHRycy5yb3V0ZVBhdGggfHwgJy8nXG5cdFx0aWYgKGN1cnJlbnRQYXRoID09PSAnLycgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgbS5yb3V0ZT8uZ2V0KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjdXJyZW50UGF0aCA9IG0ucm91dGUuZ2V0KCkgfHwgY3VycmVudFBhdGhcblx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHQvKiB1c2UgZGVmYXVsdCAqL1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IGlzQXBpUGFnZSA9IGN1cnJlbnRQYXRoLnN0YXJ0c1dpdGgoJy9hcGknKSB8fCBhcGlQYWdlUGF0dGVybnMuc29tZSgocCkgPT4gY3VycmVudFBhdGguaW5jbHVkZXMocCkpXG5cdFx0Y29uc3QgbmF2U2VjdGlvbnMgPSBpc0FwaVBhZ2UgPyBuYXZNZXRob2RzIDogbmF2R3VpZGVzXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PD5cblx0XHRcdFx0PGhlYWRlcj5cblx0XHRcdFx0XHQ8c2VjdGlvbj5cblx0XHRcdFx0XHRcdDxhIGNsYXNzPVwiaGFtYnVyZ2VyXCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPuKJoTwvYT5cblx0XHRcdFx0XHRcdDxoMT5cblx0XHRcdFx0XHRcdFx0PGltZyBzcmM9XCIvbG9nby5zdmdcIiBhbHQ9XCJNaXRocmlsXCIgLz5cblx0XHRcdFx0XHRcdFx0TWl0aHJpbCA8c3BhbiBjbGFzcz1cInZlcnNpb25cIj52e3ZlcnNpb259PC9zcGFuPlxuXHRcdFx0XHRcdFx0PC9oMT5cblx0XHRcdFx0XHRcdDxuYXY+XG5cdFx0XHRcdFx0XHRcdHttKG0ucm91dGUuTGluaywge2hyZWY6ICcvJ30sICdHdWlkZScpfVxuXHRcdFx0XHRcdFx0XHR7bShtLnJvdXRlLkxpbmssIHtocmVmOiAnL2FwaS5odG1sJ30sICdBUEknKX1cblx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cImh0dHBzOi8vbWl0aHJpbC56dWxpcGNoYXQuY29tL1wiPkNoYXQ8L2E+XG5cdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vTWl0aHJpbEpTL21pdGhyaWwuanNcIj5HaXRIdWI8L2E+XG5cdFx0XHRcdFx0XHQ8L25hdj5cblx0XHRcdFx0XHRcdHtuYXZTZWN0aW9ucz8ubGVuZ3RoID8gbShOYXZTZWN0aW9ucyBhcyBhbnksIHtzZWN0aW9uczogbmF2U2VjdGlvbnN9KSA6IG51bGx9XG5cdFx0XHRcdFx0PC9zZWN0aW9uPlxuXHRcdFx0XHQ8L2hlYWRlcj5cblx0XHRcdFx0PG1haW4+XG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImJvZHlcIj5cblx0XHRcdFx0XHRcdHttLnRydXN0KHBhZ2UuY29udGVudCl9XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9vdGVyXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXY+TGljZW5zZTogTUlULiDCqSBNaXRocmlsIENvbnRyaWJ1dG9ycy48L2Rpdj5cblx0XHRcdFx0XHRcdFx0PGRpdj48YSBocmVmPXtgaHR0cHM6Ly9naXRodWIuY29tL01pdGhyaWxKUy9kb2NzL2VkaXQvbWFpbi9kb2NzLyR7Y3VycmVudFBhdGgucmVwbGFjZSgnLmh0bWwnLCAnLm1kJykucmVwbGFjZSgvXlxcLy8sICcnKX1gfT5FZGl0PC9hPjwvZGl2PlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvbWFpbj5cblx0XHRcdDwvPlxuXHRcdClcblx0fVxuXHRcblx0b25jcmVhdGUoX3Zub2RlOiBWbm9kZTxMYXlvdXRBdHRycz4pIHtcblx0XHQvLyBTZXR1cCBoYW1idXJnZXIgbWVudVxuXHRcdGNvbnN0IGhhbWJ1cmdlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oYW1idXJnZXInKVxuXHRcdGlmIChoYW1idXJnZXIpIHtcblx0XHRcdGhhbWJ1cmdlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9PT0gJ25hdmlnYXRpbmcnID8gJycgOiAnbmF2aWdhdGluZydcblx0XHRcdH0pXG5cdFx0fVxuXHRcdFxuXHRcdC8vIFNldHVwIG5hdiBtZW51IGNsb3NlIG9uIGNsaWNrXG5cdFx0Y29uc3QgbmF2TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gxICsgdWwnKVxuXHRcdGlmIChuYXZMaXN0KSB7XG5cdFx0XHRuYXZMaXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICcnXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxufVxuIiwKICAgICJpbXBvcnQge01pdGhyaWxDb21wb25lbnQsIFZub2RlfSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCBtIGZyb20gJy4uLy4uLy4uL2luZGV4J1xuaW1wb3J0IHtMYXlvdXR9IGZyb20gJy4vbGF5b3V0J1xuaW1wb3J0IHtEb2NQYWdlfSBmcm9tICcuLi9tYXJrZG93bidcblxuaW50ZXJmYWNlIERvY1BhZ2VBdHRycyB7XG5cdHBhZ2U6IERvY1BhZ2Vcblx0cm91dGVQYXRoPzogc3RyaW5nXG5cdG5hdkd1aWRlcz86IHN0cmluZ1xuXHRuYXZNZXRob2RzPzogc3RyaW5nXG5cdHZlcnNpb24/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIERvY1BhZ2VDb21wb25lbnQgZXh0ZW5kcyBNaXRocmlsQ29tcG9uZW50PERvY1BhZ2VBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxEb2NQYWdlQXR0cnM+KSB7XG5cdFx0aWYgKCF2bm9kZS5hdHRycy5wYWdlKSB7XG5cdFx0XHRyZXR1cm4gbSgnZGl2JywgJ05vIHBhZ2UgZGF0YScpXG5cdFx0fVxuXHRcdHJldHVybiBtKExheW91dCBhcyBhbnksIHtcblx0XHRcdHBhZ2U6IHZub2RlLmF0dHJzLnBhZ2UsXG5cdFx0XHRyb3V0ZVBhdGg6IHZub2RlLmF0dHJzLnJvdXRlUGF0aCxcblx0XHRcdG5hdkd1aWRlczogdm5vZGUuYXR0cnMubmF2R3VpZGVzLFxuXHRcdFx0bmF2TWV0aG9kczogdm5vZGUuYXR0cnMubmF2TWV0aG9kcyxcblx0XHRcdHZlcnNpb246IHZub2RlLmF0dHJzLnZlcnNpb24sXG5cdFx0fSlcblx0fVxufVxuIiwKICAgICJpbXBvcnQge01pdGhyaWxDb21wb25lbnQsIFZub2RlfSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCBtIGZyb20gJy4uLy4uLy4uL2luZGV4J1xuaW1wb3J0IHskZG9jc30gZnJvbSAnLi4vc3RvcmUnXG5pbXBvcnQge0RvY1BhZ2VDb21wb25lbnR9IGZyb20gJy4vZG9jLXBhZ2UnXG5cbmludGVyZmFjZSBEb2NMb2FkZXJBdHRycyB7XG5cdGRvY05hbWU6IHN0cmluZ1xuXHRyb3V0ZVBhdGg6IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgRG9jTG9hZGVyIGV4dGVuZHMgTWl0aHJpbENvbXBvbmVudDxEb2NMb2FkZXJBdHRycz4ge1xuXHRhc3luYyBvbmluaXQodm5vZGU6IFZub2RlPERvY0xvYWRlckF0dHJzPikge1xuXHRcdGNvbnN0IGF0dHJzID0gdm5vZGUuYXR0cnMhXG5cdFx0Y29uc3QgaXNTZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xuXG5cdFx0aWYgKGlzU2VydmVyKSB7XG5cdFx0XHQvLyBEeW5hbWljIGltcG9ydDogbWFya2Rvd24gYW5kIG5hdiB1c2UgZnMvcHJvbWlzZXMgLSBub3QgYXZhaWxhYmxlIGluIGJyb3dzZXIgYnVuZGxlXG5cdFx0XHRjb25zdCB7bG9hZE1hcmtkb3duRnJvbURvY3N9ID0gYXdhaXQgaW1wb3J0KCcuLi9tYXJrZG93bicpXG5cdFx0XHRjb25zdCB7XG5cdFx0XHRcdGdldE5hdkd1aWRlcyxcblx0XHRcdFx0Z2V0TmF2TWV0aG9kcyxcblx0XHRcdFx0Z2V0TmF2R3VpZGVzU3RydWN0dXJlLFxuXHRcdFx0XHRnZXROYXZNZXRob2RzU3RydWN0dXJlLFxuXHRcdFx0fSA9IGF3YWl0IGltcG9ydCgnLi4vbmF2Jylcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IFtwYWdlLCAsICwgbmF2R3VpZGVzU3RydWN0dXJlLCBuYXZNZXRob2RzU3RydWN0dXJlXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0XHRsb2FkTWFya2Rvd25Gcm9tRG9jcyhhdHRycy5kb2NOYW1lKSxcblx0XHRcdFx0XHRnZXROYXZHdWlkZXMoKSxcblx0XHRcdFx0XHRnZXROYXZNZXRob2RzKCksXG5cdFx0XHRcdFx0Z2V0TmF2R3VpZGVzU3RydWN0dXJlKCksXG5cdFx0XHRcdFx0Z2V0TmF2TWV0aG9kc1N0cnVjdHVyZSgpLFxuXHRcdFx0XHRdKVxuXHRcdFx0XHRpZiAoIXBhZ2UpIHtcblx0XHRcdFx0XHQkZG9jcy5lcnJvciA9IGBQYWdlIFwiJHthdHRycy5yb3V0ZVBhdGh9XCIgbm90IGZvdW5kYFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRkb2NzLnBhZ2UgPSBwYWdlXG5cdFx0XHRcdFx0OygkZG9jcyBhcyBhbnkpLm5hdkd1aWRlcyA9IG5hdkd1aWRlc1N0cnVjdHVyZVxuXHRcdFx0XHRcdDsoJGRvY3MgYXMgYW55KS5uYXZNZXRob2RzID0gbmF2TWV0aG9kc1N0cnVjdHVyZVxuXHRcdFx0XHRcdCRkb2NzLnJvdXRlUGF0aCA9IGF0dHJzLnJvdXRlUGF0aFxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0JGRvY3MuZXJyb3IgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHQkZG9jcy5sb2FkaW5nID0gZmFsc2Vcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gU2tpcCBmZXRjaCBpZiB3ZSBhbHJlYWR5IGhhdmUgU1NSIGRhdGEgZm9yIHRoaXMgcm91dGUgKGh5ZHJhdGlvbilcblx0XHRcdGlmICgkZG9jcy5yb3V0ZVBhdGggPT09IGF0dHJzLnJvdXRlUGF0aCAmJiAkZG9jcy5wYWdlICYmICEkZG9jcy5sb2FkaW5nKSB7XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0JGRvY3MubG9hZGluZyA9IHRydWVcblx0XHRcdCRkb2NzLmVycm9yID0gbnVsbFxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYC9hcGkvZG9jcy8ke2F0dHJzLmRvY05hbWV9YClcblx0XHRcdFx0aWYgKCFyZXMub2spIHtcblx0XHRcdFx0XHQkZG9jcy5lcnJvciA9IGBQYWdlIFwiJHthdHRycy5yb3V0ZVBhdGh9XCIgbm90IGZvdW5kYFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHtwYWdlLCBuYXZHdWlkZXNTdHJ1Y3R1cmUsIG5hdk1ldGhvZHNTdHJ1Y3R1cmV9ID0gYXdhaXQgcmVzLmpzb24oKVxuXHRcdFx0XHRcdCRkb2NzLnBhZ2UgPSBwYWdlXG5cdFx0XHRcdFx0OygkZG9jcyBhcyBhbnkpLm5hdkd1aWRlcyA9IG5hdkd1aWRlc1N0cnVjdHVyZSA/PyBbXVxuXHRcdFx0XHRcdDsoJGRvY3MgYXMgYW55KS5uYXZNZXRob2RzID0gbmF2TWV0aG9kc1N0cnVjdHVyZSA/PyBbXVxuXHRcdFx0XHRcdCRkb2NzLnJvdXRlUGF0aCA9IGF0dHJzLnJvdXRlUGF0aFxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0JGRvY3MuZXJyb3IgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHQkZG9jcy5sb2FkaW5nID0gZmFsc2Vcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2aWV3KCkge1xuXHRcdGlmICgkZG9jcy5sb2FkaW5nKSB7XG5cdFx0XHRyZXR1cm4gbSgnZGl2JywgJ0xvYWRpbmcuLi4nKVxuXHRcdH1cblx0XHRpZiAoJGRvY3MuZXJyb3IgfHwgISRkb2NzLnBhZ2UpIHtcblx0XHRcdHJldHVybiBtKCdkaXYnLCBbXG5cdFx0XHRcdG0oJ2gxJywgJzQwNCAtIFBhZ2UgTm90IEZvdW5kJyksXG5cdFx0XHRcdG0oJ3AnLCAkZG9jcy5lcnJvciB8fCBgVGhlIHBhZ2UgXCIkeyRkb2NzLnJvdXRlUGF0aH1cIiBjb3VsZCBub3QgYmUgZm91bmQuYCksXG5cdFx0XHRdKVxuXHRcdH1cblx0XHRyZXR1cm4gbShEb2NQYWdlQ29tcG9uZW50IGFzIGFueSwge1xuXHRcdFx0cGFnZTogJGRvY3MucGFnZSxcblx0XHRcdHJvdXRlUGF0aDogJGRvY3Mucm91dGVQYXRoLFxuXHRcdFx0bmF2R3VpZGVzOiAkZG9jcy5uYXZHdWlkZXMsXG5cdFx0XHRuYXZNZXRob2RzOiAkZG9jcy5uYXZNZXRob2RzLFxuXHRcdH0pXG5cdH1cbn1cbiIsCiAgICAiaW1wb3J0IG0gZnJvbSAnLi4vLi4vaW5kZXgnXG5pbXBvcnQge0RvY0xvYWRlcn0gZnJvbSAnLi9jb21wb25lbnRzL2RvYy1sb2FkZXInXG5pbXBvcnQgdHlwZSB7Q29tcG9uZW50VHlwZSwgVm5vZGV9IGZyb20gJy4uLy4uL2luZGV4J1xuaW1wb3J0IHR5cGUge1JvdXRlUmVzb2x2ZXJ9IGZyb20gJy4uLy4uL2FwaS9yb3V0ZXInXG5cbi8vIE1hcCBvZiByb3V0ZSBwYXRocyB0byBtYXJrZG93biBmaWxlIG5hbWVzXG5jb25zdCByb3V0ZU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcblx0Jy8nOiAnaW5kZXgnLFxuXHQnL2luc3RhbGxhdGlvbi5odG1sJzogJ2luc3RhbGxhdGlvbicsXG5cdCcvc2ltcGxlLWFwcGxpY2F0aW9uLmh0bWwnOiAnc2ltcGxlLWFwcGxpY2F0aW9uJyxcblx0Jy9sZWFybmluZy1taXRocmlsLmh0bWwnOiAnbGVhcm5pbmctbWl0aHJpbCcsXG5cdCcvc3VwcG9ydC5odG1sJzogJ3N1cHBvcnQnLFxuXHQnL2pzeC5odG1sJzogJ2pzeCcsXG5cdCcvZXM2Lmh0bWwnOiAnZXM2Jyxcblx0Jy9hbmltYXRpb24uaHRtbCc6ICdhbmltYXRpb24nLFxuXHQnL3Rlc3RpbmcuaHRtbCc6ICd0ZXN0aW5nJyxcblx0Jy9leGFtcGxlcy5odG1sJzogJ2V4YW1wbGVzJyxcblx0Jy9pbnRlZ3JhdGluZy1saWJzLmh0bWwnOiAnaW50ZWdyYXRpbmctbGlicycsXG5cdCcvcGF0aHMuaHRtbCc6ICdwYXRocycsXG5cdCcvdm5vZGVzLmh0bWwnOiAndm5vZGVzJyxcblx0Jy9jb21wb25lbnRzLmh0bWwnOiAnY29tcG9uZW50cycsXG5cdCcvbGlmZWN5Y2xlLW1ldGhvZHMuaHRtbCc6ICdsaWZlY3ljbGUtbWV0aG9kcycsXG5cdCcva2V5cy5odG1sJzogJ2tleXMnLFxuXHQnL2F1dG9yZWRyYXcuaHRtbCc6ICdhdXRvcmVkcmF3Jyxcblx0Jy9jb250cmlidXRpbmcuaHRtbCc6ICdjb250cmlidXRpbmcnLFxuXHQnL2NyZWRpdHMuaHRtbCc6ICdjcmVkaXRzJyxcblx0Jy9jb2RlLW9mLWNvbmR1Y3QuaHRtbCc6ICdjb2RlLW9mLWNvbmR1Y3QnLFxuXHQnL2ZyYW1ld29yay1jb21wYXJpc29uLmh0bWwnOiAnZnJhbWV3b3JrLWNvbXBhcmlzb24nLFxuXHQnL2FyY2hpdmVzLmh0bWwnOiAnYXJjaGl2ZXMnLFxuXHQnL2FwaS5odG1sJzogJ2FwaScsXG5cdCcvaHlwZXJzY3JpcHQuaHRtbCc6ICdoeXBlcnNjcmlwdCcsXG5cdCcvcmVuZGVyLmh0bWwnOiAncmVuZGVyJyxcblx0Jy9tb3VudC5odG1sJzogJ21vdW50Jyxcblx0Jy9yb3V0ZS5odG1sJzogJ3JvdXRlJyxcblx0Jy9yZXF1ZXN0Lmh0bWwnOiAncmVxdWVzdCcsXG5cdCcvcGFyc2VRdWVyeVN0cmluZy5odG1sJzogJ3BhcnNlUXVlcnlTdHJpbmcnLFxuXHQnL2J1aWxkUXVlcnlTdHJpbmcuaHRtbCc6ICdidWlsZFF1ZXJ5U3RyaW5nJyxcblx0Jy9idWlsZFBhdGhuYW1lLmh0bWwnOiAnYnVpbGRQYXRobmFtZScsXG5cdCcvcGFyc2VQYXRobmFtZS5odG1sJzogJ3BhcnNlUGF0aG5hbWUnLFxuXHQnL3RydXN0Lmh0bWwnOiAndHJ1c3QnLFxuXHQnL2ZyYWdtZW50Lmh0bWwnOiAnZnJhZ21lbnQnLFxuXHQnL3JlZHJhdy5odG1sJzogJ3JlZHJhdycsXG5cdCcvY2Vuc29yLmh0bWwnOiAnY2Vuc29yJyxcblx0Jy9zdHJlYW0uaHRtbCc6ICdzdHJlYW0nLFxufVxuXG5mdW5jdGlvbiBjcmVhdGVSb3V0ZShyb3V0ZVBhdGg6IHN0cmluZywgZG9jTmFtZTogc3RyaW5nKTogUm91dGVSZXNvbHZlciB7XG5cdHJldHVybiB7XG5cdFx0cmVuZGVyOiAodm5vZGU6IFZub2RlKSA9PiB7XG5cdFx0XHRjb25zdCBhY3R1YWxSb3V0ZVBhdGggPSB2bm9kZS5hdHRycz8ucm91dGVQYXRoIHx8IHJvdXRlUGF0aFxuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbShEb2NMb2FkZXIgYXMgdW5rbm93biBhcyBhbnksIHtcblx0XHRcdFx0a2V5OiBhY3R1YWxSb3V0ZVBhdGgsXG5cdFx0XHRcdHJvdXRlUGF0aDogYWN0dWFsUm91dGVQYXRoLFxuXHRcdFx0XHRkb2NOYW1lLFxuXHRcdFx0fSlcblx0XHRcdGlmICghcmVzdWx0IHx8ICFyZXN1bHQudGFnKSB7XG5cdFx0XHRcdHJldHVybiBtKCdkaXYnLCBgRXJyb3IgbG9hZGluZyByb3V0ZTogJHtyb3V0ZVBhdGh9YClcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHRcblx0XHR9LFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3V0ZXMoKTogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXI+IHtcblx0Y29uc3Qgcm91dGVzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlcj4gPSB7fVxuXHRcblx0Zm9yIChjb25zdCBbcGF0aCwgZG9jTmFtZV0gb2YgT2JqZWN0LmVudHJpZXMocm91dGVNYXApKSB7XG5cdFx0cm91dGVzW3BhdGhdID0gY3JlYXRlUm91dGUocGF0aCwgZG9jTmFtZSlcblx0XHQvLyBBbHNvIHN1cHBvcnQgLm1kIFVSTHMgc28gL3Rlc3RpbmcubWQgd29ya3MgKGF2b2lkcyBCdW4ncyBidWlsdC1pbiBtYXJrZG93biB2aWV3ZXIpXG5cdFx0aWYgKHBhdGggIT09ICcvJyAmJiBwYXRoLmVuZHNXaXRoKCcuaHRtbCcpKSB7XG5cdFx0XHRyb3V0ZXNbcGF0aC5yZXBsYWNlKC9cXC5odG1sJC8sICcubWQnKV0gPSBjcmVhdGVSb3V0ZShwYXRoLCBkb2NOYW1lKVxuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIHJvdXRlc1xufVxuIiwKICAgICJpbXBvcnQgbSBmcm9tICcuLi8uLi9pbmRleCdcbmltcG9ydCB7ZGVzZXJpYWxpemVBbGxTdGF0ZXN9IGZyb20gJy4uLy4uL3JlbmRlci9zc3JTdGF0ZSdcbmltcG9ydCB7Z2V0Um91dGVzfSBmcm9tICcuL3JvdXRlcydcblxuLy8gSW1wb3J0IHN0b3JlIHNvICRkb2NzIGlzIHJlZ2lzdGVyZWQgYmVmb3JlIGRlc2VyaWFsaXphdGlvblxuaW1wb3J0ICcuL3N0b3JlJ1xuXG5jb25zdCBhcHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJylcbmlmICghYXBwKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgI2FwcCBlbGVtZW50JylcblxuLy8gUmVzdG9yZSBTU1Igc3RhdGUgYmVmb3JlIG1vdW50aW5nIHNvIGh5ZHJhdGlvbiBtYXRjaGVzXG5jb25zdCBzc3JTdGF0ZVNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdfX1NTUl9TVEFURV9fJylcbmlmIChzc3JTdGF0ZVNjcmlwdD8udGV4dENvbnRlbnQpIHtcblx0dHJ5IHtcblx0XHRkZXNlcmlhbGl6ZUFsbFN0YXRlcyhKU09OLnBhcnNlKHNzclN0YXRlU2NyaXB0LnRleHRDb250ZW50KSlcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Y29uc29sZS53YXJuKCdGYWlsZWQgdG8gZGVzZXJpYWxpemUgU1NSIHN0YXRlOicsIGVycilcblx0fVxufVxuXG5jb25zdCByb3V0ZXMgPSBnZXRSb3V0ZXMoKVxuXG5tLnJvdXRlLnByZWZpeCA9ICcnXG5cbnRyeSB7XG5cdG0ucm91dGUoYXBwLCAnLycsIHJvdXRlcylcbn0gY2F0Y2ggKGVycikge1xuXHRhcHAuaW5uZXJIVE1MID0gYDxkaXYgc3R5bGU9XCJwYWRkaW5nOjIwcHg7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZlwiPlxuXHRcdDxoMT5FcnJvciBsb2FkaW5nIGRvY3M8L2gxPlxuXHRcdDxwcmUgc3R5bGU9XCJiYWNrZ3JvdW5kOiNmNWY1ZjU7cGFkZGluZzoxMHB4O292ZXJmbG93OmF1dG9cIj4ke1N0cmluZyhlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogZXJyKX08L3ByZT5cblx0PC9kaXY+YFxuXHR0aHJvdyBlcnJcbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY0EsU0FBUyxZQUFZLEdBQUc7QUFBQSxFQUNwQixPQUFPO0FBQUEsSUFDSCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsSUFDTCxPQUFPO0FBQUEsSUFDUCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsRUFDaEI7QUFBQTtBQUdKLFNBQVMsY0FBYyxDQUFDLGFBQWE7QUFBQSxFQUNqQyxZQUFZO0FBQUE7QUFrQmhCLFNBQVMsUUFBUSxDQUFDLE1BQU0sUUFBUTtBQUFBLEVBQzVCLElBQUksUUFBUTtBQUFBLElBQ1IsSUFBSSxXQUFXLEtBQUssSUFBSSxHQUFHO0FBQUEsTUFDdkIsT0FBTyxLQUFLLFFBQVEsZUFBZSxvQkFBb0I7QUFBQSxJQUMzRDtBQUFBLEVBQ0osRUFDSztBQUFBLElBQ0QsSUFBSSxtQkFBbUIsS0FBSyxJQUFJLEdBQUc7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U0FBRyxhQUFhLFNBQU87QUFBQSxJQUFFLE9BQU87QUFBQSxFQUFrQjtBQUFBLFdBQU07QUFBQTtBQUFJLFNBQVMsVUFBUyxDQUFDLE1BQUs7QUFBQSxFQUFDLElBQUcsV0FBVyxJQUFJLEdBQUUsS0FBSyxXQUFTO0FBQUEsSUFBRSxPQUFNO0FBQUEsRUFBSSxJQUFJLGFBQVcsS0FBSyxXQUFXLENBQUMsTUFBSSxJQUFHLG9CQUFrQixLQUFLLFdBQVcsS0FBSyxTQUFPLENBQUMsTUFBSTtBQUFBLEVBQUcsSUFBRyxPQUFLLHFCQUFxQixNQUFLLENBQUMsVUFBVSxHQUFFLEtBQUssV0FBUyxLQUFHLENBQUM7QUFBQSxJQUFXLE9BQUs7QUFBQSxFQUFJLElBQUcsS0FBSyxTQUFPLEtBQUc7QUFBQSxJQUFrQixRQUFNO0FBQUEsRUFBSSxJQUFHO0FBQUEsSUFBVyxPQUFNLE1BQUk7QUFBQSxFQUFLLE9BQU87QUFBQTtBQUFLLFNBQVMsVUFBVSxDQUFDLE1BQUs7QUFBQSxFQUFDLE9BQU8sV0FBVyxJQUFJLEdBQUUsS0FBSyxTQUFPLEtBQUcsS0FBSyxXQUFXLENBQUMsTUFBSTtBQUFBO0FBQUcsU0FBUyxJQUFJLEdBQUU7QUFBQSxFQUFDLElBQUcsVUFBVSxXQUFTO0FBQUEsSUFBRSxPQUFNO0FBQUEsRUFBSSxJQUFJO0FBQUEsRUFBTyxTQUFRLElBQUUsRUFBRSxJQUFFLFVBQVUsUUFBTyxFQUFFLEdBQUU7QUFBQSxJQUFDLElBQUksTUFBSSxVQUFVO0FBQUEsSUFBRyxJQUFHLFdBQVcsR0FBRyxHQUFFLElBQUksU0FBTztBQUFBLE1BQUUsSUFBRyxXQUFjO0FBQUEsUUFBRSxTQUFPO0FBQUEsTUFBUztBQUFBLGtCQUFRLE1BQUk7QUFBQSxFQUFHO0FBQUEsRUFBQyxJQUFHLFdBQWM7QUFBQSxJQUFFLE9BQU07QUFBQSxFQUFJLE9BQU8sV0FBVSxNQUFNO0FBQUE7QUFBRSxTQUFTLFFBQVEsQ0FBQyxNQUFLLElBQUc7QUFBQSxFQUFDLElBQUcsV0FBVyxJQUFJLEdBQUUsV0FBVyxFQUFFLEdBQUUsU0FBTztBQUFBLElBQUcsT0FBTTtBQUFBLEVBQUcsSUFBRyxPQUFLLFFBQVEsSUFBSSxHQUFFLEtBQUcsUUFBUSxFQUFFLEdBQUUsU0FBTztBQUFBLElBQUcsT0FBTTtBQUFBLEVBQUcsSUFBSSxZQUFVO0FBQUEsRUFBRSxNQUFLLFlBQVUsS0FBSyxRQUFPLEVBQUU7QUFBQSxJQUFVLElBQUcsS0FBSyxXQUFXLFNBQVMsTUFBSTtBQUFBLE1BQUc7QUFBQSxFQUFNLElBQUksVUFBUSxLQUFLLFFBQU8sVUFBUSxVQUFRLFdBQVUsVUFBUTtBQUFBLEVBQUUsTUFBSyxVQUFRLEdBQUcsUUFBTyxFQUFFO0FBQUEsSUFBUSxJQUFHLEdBQUcsV0FBVyxPQUFPLE1BQUk7QUFBQSxNQUFHO0FBQUEsRUFBTSxJQUFJLFFBQU0sR0FBRyxRQUFPLFFBQU0sUUFBTSxTQUFRLFNBQU8sVUFBUSxRQUFNLFVBQVEsT0FBTSxnQkFBYyxJQUFHLElBQUU7QUFBQSxFQUFFLE1BQUssS0FBRyxRQUFPLEVBQUUsR0FBRTtBQUFBLElBQUMsSUFBRyxNQUFJLFFBQU87QUFBQSxNQUFDLElBQUcsUUFBTSxRQUFPO0FBQUEsUUFBQyxJQUFHLEdBQUcsV0FBVyxVQUFRLENBQUMsTUFBSTtBQUFBLFVBQUcsT0FBTyxHQUFHLE1BQU0sVUFBUSxJQUFFLENBQUM7QUFBQSxRQUFPLFNBQUcsTUFBSTtBQUFBLFVBQUUsT0FBTyxHQUFHLE1BQU0sVUFBUSxDQUFDO0FBQUEsTUFBQyxFQUFNLFNBQUcsVUFBUSxRQUFPO0FBQUEsUUFBQyxJQUFHLEtBQUssV0FBVyxZQUFVLENBQUMsTUFBSTtBQUFBLFVBQUcsZ0JBQWM7QUFBQSxRQUFPLFNBQUcsTUFBSTtBQUFBLFVBQUUsZ0JBQWM7QUFBQSxNQUFDO0FBQUEsTUFBQztBQUFBLElBQUs7QUFBQSxJQUFDLElBQUksV0FBUyxLQUFLLFdBQVcsWUFBVSxDQUFDLEdBQUUsU0FBTyxHQUFHLFdBQVcsVUFBUSxDQUFDO0FBQUEsSUFBRSxJQUFHLGFBQVc7QUFBQSxNQUFPO0FBQUEsSUFBVyxTQUFHLGFBQVc7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QUFDLE1BQUksSUFBRztBQUFBLFFBQUMsSUFBRyxDQUFDLGNBQWE7QUFBQSxVQUFDLFFBQU0sSUFBRTtBQUFBLFVBQUU7QUFBQSxRQUFLO0FBQUEsTUFBQyxFQUFNLFNBQUcsUUFBTTtBQUFBLFFBQUcsZUFBYSxPQUFHLE1BQUksSUFBRTtBQUFBLElBQUUsSUFBRyxRQUFNO0FBQUEsTUFBRyxPQUFNO0FBQUEsSUFBRyxPQUFPLEtBQUssTUFBTSxPQUFNLEdBQUc7QUFBQTtBQUFBO0FBQUcsU0FBUyxPQUFPLENBQUMsTUFBSztBQUFBLEVBQUMsV0FBVyxJQUFJO0FBQUEsRUFBRSxJQUFJLFdBQVMsSUFBRyxZQUFVLEdBQUUsTUFBSSxJQUFHLGVBQWEsTUFBRyxjQUFZO0FBQUEsRUFBRSxTQUFRLElBQUUsS0FBSyxTQUFPLEVBQUUsS0FBRyxHQUFFLEVBQUUsR0FBRTtBQUFBLElBQUMsSUFBSSxPQUFLLEtBQUssV0FBVyxDQUFDO0FBQUEsSUFBRSxJQUFHLFNBQU8sSUFBRztBQUFBLE1BQUMsSUFBRyxDQUFDLGNBQWE7QUFBQSxRQUFDLFlBQVUsSUFBRTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsTUFBQztBQUFBLElBQVE7QUFBQSxJQUFDLElBQUcsUUFBTTtBQUFBLE1BQUcsZUFBYSxPQUFHLE1BQUksSUFBRTtBQUFBLElBQUUsSUFBRyxTQUFPLElBQUc7QUFBQSxNQUFDLElBQUcsYUFBVztBQUFBLFFBQUcsV0FBUztBQUFBLE1BQU8sU0FBRyxnQkFBYztBQUFBLFFBQUUsY0FBWTtBQUFBLElBQUMsRUFBTSxTQUFHLGFBQVc7QUFBQSxNQUFHLGNBQVk7QUFBQSxFQUFFO0FBQUEsRUFBQyxJQUFHLGFBQVcsTUFBSSxRQUFNLE1BQUksZ0JBQWMsS0FBRyxnQkFBYyxLQUFHLGFBQVcsTUFBSSxLQUFHLGFBQVcsWUFBVTtBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUcsT0FBTyxLQUFLLE1BQU0sVUFBUyxHQUFHO0FBQUE7QUFBRSxTQUFTLE1BQU0sQ0FBQyxZQUFXO0FBQUEsRUFBQyxJQUFHLGVBQWEsUUFB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QU8sUUFBUSxRQUFRLEdBQUc7QUFBQSxJQUN2RCxPQUFPLFFBQVEsWUFBWSxNQUFNLE9BQU87QUFBQSxJQUV4QyxJQUFJLFNBQVMsT0FBTyxLQUFLLFNBQVMsT0FBTyxHQUFHO0FBQUEsTUFDM0MsT0FBTyxLQUFLLFFBQVEsV0FBVyxLQUFLLEtBQUssWUFBWSxNQUFNLE9BQU87QUFBQSxJQUNuRTtBQUFBLEVBQ0Q7QUFBQSxFQUVBLE9BQU87QUFBQTs7O0FDbkVSLElBQU0sTUFBTSxTQUFTLGVBQWUsS0FBSztBQUN6QyxJQUFJLENBQUM7QUFBQSxFQUFLLE1BQU0sSUFBSSxNQUFNLHNCQUFzQjtBQUdoRCxJQUFNLGlCQUFpQixTQUFTLGVBQWUsZUFBZTtBQUM5RCxJQUFJLGdCQUFnQixhQUFhO0FBQUEsRUFDaEMsSUFBSTtBQUFBLElBQ0gscUJBQXFCLEtBQUssTUFBTSxlQUFlLFdBQVcsQ0FBQztBQUFBLElBQzFELE9BQU8sS0FBSztBQUFBLElBQ2IsUUFBUSxLQUFLLG9DQUFvQyxHQUFHO0FBQUE7QUFFdEQ7QUFFQSxJQUFNLFNBQVMsVUFBVTtBQUV6QixnQkFBRSxNQUFNLFNBQVM7QUFFakIsSUFBSTtBQUFBLEVBQ0gsZ0JBQUUsTUFBTSxLQUFLLEtBQUssTUFBTTtBQUFBLEVBQ3ZCLE9BQU8sS0FBSztBQUFBLEVBQ2IsSUFBSSxZQUFZO0FBQUE7QUFBQSwrREFFOEMsT0FBTyxlQUFlLFFBQVEsSUFBSSxVQUFVLEdBQUc7QUFBQTtBQUFBLEVBRTdHLE1BQU07QUFBQTsiLAogICJkZWJ1Z0lkIjogIjg2MkYwQzFFRTcyNDkyNTA2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
