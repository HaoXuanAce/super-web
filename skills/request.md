# API 请求开发规范

本规范适用于 `src/api`、`src/api/interface` 以及所有业务代码中的接口调用。

## 1. 请求工具

所有接口请求都使用项目已封装的请求实例：

- 请求封装文件：`src/utils/request.ts`
- 使用方式：`request.get<T>()`、`request.post<T>()`、`request.delete<T>()`

不要在页面、组件、hook、store 中直接使用 `axios` 发业务请求。  

## 2. API 文件组织

接口函数统一放在 `src/api/[模块名].ts` 中。

相同业务模块的接口应该放在同一个文件里，避免同一模块分散在多个 api 文件中。

## 3. API 函数命名

函数名使用「请求方法 + 业务含义 + Api」格式。

常用规则：

- `get` 请求：`getXXXXApi`
- `post` 请求：`postXXXXApi`
- `delete` 请求：`delXXXXApi`
- `put` 请求：`putXXXXApi`

函数名要简洁，优先使用常见业务词：

- `list`
- `detail`
- `upload`
- `status`
- `create`
- `update`
- `delete`

示例：

```ts
export const getUserListApi = (query: IUserListQuery) => {
	return request.get<IUserListRes>('/user/list', query)
}

export const getUserDetailApi = (query: IUserDetailQuery) => {
	return request.get<IUserDetailRes>('/user/detail', query)
}

export const postUpdateUserApi = (data: IUpdateUserParams) => {
	return request.post<IUpdateUserRes>('/user/update', data)
}

export const delUserApi = (query: IDelUserQuery) => {
	return request.delete<IDelUserRes>('/user/delete', query)
}
```

避免函数名过长。函数名应该表达“做什么”，不需要把完整后端路径翻译进函数名。

## 4. 类型文件组织

接口请求参数和响应类型统一放在：

```txt
src/api/interface/[模块名].ts
```

API 文件与 interface 文件尽量一一对应：

```txt
src/api/user.ts
src/api/interface/user.ts

src/api/video.ts
src/api/interface/video.ts

src/api/tool.ts
src/api/interface/tool.ts
```

API 文件中只引入类型，不在业务组件里临时定义接口请求类型。

## 5. TypeScript 类型命名

类型定义优先使用 `interface`，只有在联合类型、字面量类型、工具类型组合等场景下再使用 `type`。

命名统一以大写 `I` 开头：

- GET 请求参数：`I[业务名]Query`
- POST/PUT 请求参数：`I[业务名]Params`
- 响应数据：`I[业务名]Res`
- 列表项：`I[业务名]Item`

示例：

```ts
export interface IUserListQuery {
	page: number
	limit: number
	keyword?: string
}

export interface IUserItem {
	id: number
	name: string
	avatar?: string
}

export interface IUserListRes {
	list: IUserItem[]
	total: number
}

export interface IUpdateUserParams {
	id: number
	name: string
}
```

如果暂时不清楚字段，也要先建好类型名并引入使用，后续再补字段。

可以先写宽泛类型，但要留下明确收口位置：

```ts
export interface ICreateTaskParams {
	[key: string]: unknown
}

export interface ICreateTaskRes {
	[key: string]: unknown
}
```

优先使用 `unknown` 或明确的索引类型，不要随手写 `any`。  
只有旧接口、第三方返回、暂时无法确认结构时，才短期使用 `any`。

## 6. API 泛型约束

所有有响应数据的请求都要写泛型：

```ts
return request.get<IUserListRes>('/user/list', query)
return request.post<IUpdateUserRes>('/user/update', data)
```

有参数的接口必须给参数加类型：

```ts
export const getTaskRecordApi = (query: ITaskRecordQuery) => {
	return request.get<ITaskRecordRes>('/dramaflow/getTask', query)
}
```

不要这样写：

```ts
export const getTaskRecordApi = (query: any) => {
	return request.get('/dramaflow/getTask', query)
}
```



## 7. 灵活使用 TS 内置类型

当接口类型之间存在明显复用关系时，可以使用 TS 内置类型减少重复。

常用选择：

- `Pick<T, K>`：只取部分字段
- `Omit<T, K>`：排除部分字段
- `Partial<T>`：编辑表单、可选更新参数
- `Record<K, V>`：动态键值对象
- `Array<T>` / `T[]`：列表数据
- 联合类型：限制固定枚举值

示例：

```ts
export interface IUserBase {
	id: number
	name: string
	avatar: string
	phone: string
}

export type IUpdateUserParams = Partial<Pick<IUserBase, 'name' | 'avatar'>>

export interface IModelParams {
	modelId: number
	params: Record<string, string>
}
```

使用内置类型的前提是能提升可读性；如果类型组合过深、难理解，应拆成清晰的 `interface`。

## 8. 页面调用规则

页面、组件、store、hook 中只调用 `src/api` 暴露的方法，不直接拼 URL，不直接调用 `request` 或 `axios`。

推荐：

```ts
const { data } = await getUserListApi(query)
```

不推荐：

```ts
const { data } = await request.get('/user/list', query)
```

更不推荐：

```ts
axios.post('/user/list', query)
```

## 10. 新增接口检查清单

新增接口时按这个顺序检查：

1. 是否使用了 `src/utils/request.ts`
2. 是否放在正确的 `src/api/[模块名].ts`
3. 是否在 `src/api/interface/[模块名].ts` 中定义参数和响应类型
4. GET 参数是否命名为 `IXXXQuery`
5. POST/PUT 参数是否命名为 `IXXXParams`
6. 响应是否命名为 `IXXXRes`
7. API 函数是否写了响应泛型
8. API 参数是否有明确类型
9. 函数名是否简洁，是否符合 `get/post/del/put + 业务名 + Api`
