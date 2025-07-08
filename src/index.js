const fs = require("fs");
const path = require("path");

function getHeading(depth, title) {
  const hashes = "-".repeat(depth + 1);
  return `${hashes} ${title}`;
}

function formatNode(node, depth = 0) {
  const lines = [];

  lines.push(getHeading(depth, node.component));

  const props = Object.keys(node.props || {});
  lines.push(
    `- **Props**: ${props.length ? "`" + props.join("`, `") + "`" : "*(none)*"}`
  );
  lines.push(
    `- **Location**: \`${path.basename(node.location.file)}:${
      node.location.line
    }:${node.location.column}\``
  );
  lines.push("");

  for (const child of node.children || []) {
    lines.push(formatNode(child, depth + 1));
  }

  return lines.join("\n");
}

function extractComponentTree(node, state, t) {
  if (!t.isJSXElement(node)) return null;

  const componentName = node.openingElement.name.name || "anonymous";

  const props = {};
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      const key = attr.name.name;
      if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isIdentifier(expr)) {
          props[key] = expr.name;
        } else if (t.isLiteral(expr)) {
          props[key] = expr.value;
        } else {
          props[key] = "expression";
        }
      } else if (t.isStringLiteral(attr.value)) {
        props[key] = attr.value.value;
      } else {
        props[key] = "unknown";
      }
    }
  }

  const children = [];

  for (const child of node.children || []) {
    if (t.isJSXElement(child)) {
      const extracted = extractComponentTree(child, state, t);
      if (extracted) children.push(extracted);
    }

    if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression;
      if (t.isJSXElement(expr)) {
        const extracted = extractComponentTree(expr, state, t);
        if (extracted) children.push(extracted);
      }

      if (t.isLogicalExpression(expr) || t.isConditionalExpression(expr)) {
        const nested = [
          expr.consequent || expr.right,
          expr.alternate || expr.left,
        ];
        for (const e of nested) {
          if (t.isJSXElement(e)) {
            const extracted = extractComponentTree(e, state, t);
            if (extracted) children.push(extracted);
          }
        }
      }

      if (
        t.isArrowFunctionExpression(expr) &&
        t.isBlockStatement(expr.body) === false
      ) {
        if (t.isJSXElement(expr.body)) {
          const extracted = extractComponentTree(expr.body, state, t);
          if (extracted) children.push(extracted);
        }
      }
    }
  }

  const loc = node.loc?.start || {};
  const file = state.file.opts.filename;

  return {
    component: componentName,
    props,
    location: {
      file,
      line: loc.line,
      column: loc.column,
    },
    children,
  };
}

module.exports = function ({ types: t }) {
  return {
    name: "babel-plugin-prop-flow",
    inherits: require("@babel/plugin-syntax-jsx").default,
    visitor: {
      Program(path, state) {
        state.collected = [];
      },
      JSXElement(path, state) {
        if (path.parentPath.isJSXElement()) return;

        const tree = extractComponentTree(path.node, state, t);
        if (tree) collected.push(tree);
      },
    },
    post(state) {
      const collected = state.collected || [];
      if (collected.length === 0) return;

      const mdContent = [`Prop Flow Report\n`, formatNode(collected[0])].join(
        "\n"
      );
      const fileName =
        path.basename(state.opts.filename || "prop-flow") + ".md";
      const mdPath = path.resolve(process.cwd(), fileName);
      fs.writeFileSync(mdPath, mdContent);
    },
  };
};
