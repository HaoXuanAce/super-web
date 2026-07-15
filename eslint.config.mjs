// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu(
	{
		stylistic: {
			indent: 'tab',
			semi: false,
		},
		vue: true,
		ignores: ['vite.config.ts', 'docker-compose.yml', 'docker/**', 'dist/**', 'node_modules/**'],
	},
	{
		rules: {
			// 允许使用 == 和 !=
			'eqeqeq': 'off',
			// 允许未使用的局部变量和参数
			'unused-imports/no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'no-unused-vars': 'off',

			// 允许 const fn = () => {} 顶层箭头函数
			'antfu/top-level-function': 'off',
			// if/else 必须使用大括号
			'curly': ['error', 'all'],
			// 禁止大括号内容写在同一行，强制展开为多行
			'@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
			// 允许在定义前使用（如函数调用在定义之前）
			'no-use-before-define': 'off',
			'@typescript-eslint/no-use-before-define': 'off',
			'no-console': 'off',
			'no-debugger': 'error',
			// 允许 /^@/ 这类强调起始位置的正则写法
			'regexp/no-useless-assertions': 'off',
			// 允许正则中保留未使用捕获组
			'regexp/no-unused-capturing-group': 'off',
			// 允许在回调中直接写简单正则
			'e18e/prefer-static-regex': 'off',
			// 允许使用 type 定义对象
			'ts/consistent-type-definitions': 'off',
		},
	},
	{
		// Vue 专属规则只对 .vue 文件生效
		files: ['**/*.vue'],
		rules: {
			// Vue 文件块顺序：template -> script -> style
			'vue/block-order': ['error', {
				order: ['template', 'script', 'style'],
			}],

			// 控制多行 HTML/Vue 标签的右尖括号(>)不换行，而是紧跟在最后一个属性后面
			'vue/html-closing-bracket-newline': ['error', {
				singleline: 'never',
				multiline: 'never',
			}],
			// ✅ 允许 kebab-case 事件名（如 update:nine-grid）
			'vue/custom-event-name-casing': 'off',
		},
	},
)
