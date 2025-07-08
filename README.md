# 📦 babel-plugin-prop-flow

> A lightweight Babel plugin that analyzes your React JSX and generates a **component-prop hierarchy** as a Markdown report.

---

## ✨ What it does

- 🧠 Parses your React JSX and extracts all top-level components
- 🔁 Recursively traverses children inside:
  - JSX elements
  - Expression containers
  - Conditional renders (`&&`, ternary)
  - Render props (arrow functions)
- 📝 Generates a clean, human-readable `prop-flow.md` to visualize the **prop flow and hierarchy**

---

## 📦 Installation

```bash
npm install --save-dev babel-plugin-prop-flow

## 📦 Installation
이것을 쓰기 위해서는 프리셋에 이것을 추가해주어야한다는 것이네.

{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-syntax-jsx"]
}
```
