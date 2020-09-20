# node-graphql
基于 `Graphql` 实现 node 中间层

## GraphQL 核心原理

1. 定义 `scheme` 数据模型，即为输入数据和输出数据定义数据类型
2. 为 `scheme` 中的每个数据字段定义解析函数，即每个字段最终返回的数据

## GraphQL.js 两大类型

### 输入类型 `GraphQLInputType` 

> 输入类型主要用于定义接口查询参数类型

```typescript
type GraphQLInputType =
  | GraphQLScalarType
  | GraphQLEnumType
  | GraphQLInputObjectType
  | GraphQLList<any>
  | GraphQLNonNull<
      | GraphQLScalarType
      | GraphQLEnumType
      | GraphQLInputObjectType
      | GraphQLList<any>
    >
```

### 输出类型 `GraphQLOutputType` 

> 输出类型主要用于定义接口返回数据类型

```typescript
type GraphQLOutputType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLList<any>
  | GraphQLNonNull<
      | GraphQLScalarType
      | GraphQLObjectType
      | GraphQLInterfaceType
      | GraphQLUnionType
      | GraphQLEnumType
      | GraphQLList<any>
    >
```

## 相关文档地址

[GraphQL基本用法](https://graphql.cn/learn/)

[GraphQL.js——基于nodejs的GraphQL](https://graphql.cn/graphql-js/)



