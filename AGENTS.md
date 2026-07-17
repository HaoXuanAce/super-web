
# CSS 规范

## 1. 优先使用 Tailwind 预设类名

使用 Tailwind 提供的预设类名来编写样式，不要用自定义的 CSS 类名。

**正确示例：**

```html
<div class="bg-blue-500 p-4 rounded-lg shadow-md">
  内容
</div>
```

**错误示例：**

```html
<div class="custom-bg p-4">
  内容
</div>

<style>
.custom-bg { background-color: #3b82f6; }
</style>
```

## 2. Shadow 阴影类使用 Tailwind 预设

**正确示例：**

```html
<div class="shadow-sm">小阴影</div>
<div class="shadow-md">中等阴影</div>
<div class="shadow-lg">大阴影</div>
<div class="shadow-xl">特大阴影</div>
```

**错误示例：**

```html
<div class="my-shadow">自定义阴影</div>

<style>
.my-shadow { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
</style>
```

## 3. 复杂 CSS 使用传统 CSS

颜色渐变、动画等复杂样式使用传统 CSS 编写。

**正确示例：**

```html
<div class="gradient-bg animate-pulse">
  内容
</div>

<style>
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>
```

**错误示例：**

```html
<!-- 不要试图用 Tailwind 实现复杂的渐变或动画 -->
<div class="bg-gradient-to-r from-purple-400 to-pink-500">
  <!-- Tailwind 对简单渐变 OK，但复杂的还是用 CSS -->
</div>
```

## 4. 清理无用的样式

不要堆叠无用的 CSS 属性，发现无用的 CSS 类名要及时清理。

**正确示例：**

```html
<div class="p-4">
  <button class="btn-primary">按钮</button>
</div>

<style>
.btn-primary {
  padding: 8px 16px; /* 只保留必要的属性 */
  background: blue;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
```

**错误示例：**

```html
<div class="unused-class p-4">
  内容
</div>

<style>
.unused-class {
  padding: 16px;
  margin: 10px;
  position: relative;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0; /* 无用的属性堆叠 */
}
</style>
```

---

# Vue 前端规范

## 5. 相同的样式封装成组件

重复出现的 UI 样式应该封装为 Vue 组件。

## 6. 相同的逻辑抽离成 Hook

重复的业务逻辑应该抽离为 composable/hook。

**正确示例：**

```typescript
<!-- hooks/useCounter.ts -->
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  return { count, increment, decrement }
}

<!-- 组件中使用 -->
<script setup>
const { count, increment } = useCounter()
</script>
```

**错误示例：**

```vue
<script setup>
const count = ref(0)  // 在多个组件中重复定义
const increment = () => count.value++
</script>
```

---

# 开发流程规范

## 7. 修改代码后不需要运行 lint 检验

代码修改完成后不需要手动执行 lint 检查，AI 会确保代码质量。

## 8. Vite 项目运行完成后不需要执行 npm run build

Vite 开发服务器运行完成后，不需要执行构建命令，直接进入下一个任务。


# 9. 删除代码的时候 记得把相关的无用代码也删掉 不要残留相关的代码


# 10. vue文件

template 在前 script 在后

# tailwindcss  
text-[12px] 字体大小 不要用[]写死 用 tailwindcss 预设 text-xs text-sm text-lg text-xl 这种


# defineProps  defineEmits 

~~~ts
// Bad
const props = defineProps<{
	data: ImageNodeData
}>()
const emit = defineEmits<{
	'update:data': [data: Partial<ImageNodeData>]
}>()

// Good
interface Props {
  data:any
}
interface Emits {
    (e: 'close'): void
}
const props = defineProps<Props>()
const emits = defineEmits<Emits>()
~~~
