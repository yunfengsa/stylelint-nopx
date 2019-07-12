## rules
* 样式禁止使用px

.stylintrc

```
{
  "plugins": [
    "@dxy-mom/stylelint-tinyapp"
  ],
  "rules": {
    "dxymom/no-px": [true, { "ignore": ["border"] }],
  }
}

```