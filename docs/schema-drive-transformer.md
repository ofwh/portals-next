# Schema 驱动的对象数据转换器实现方案

## 1. 方案概述

实现一个基于 Schema（数据结构模板）的通用对象转换器，用于将扁平化对象（Flatten Object）转换为指定层级结构的目标对象。

通过声明式 Schema 定义目标对象的字段、层级、映射关系及条件规则，由转换器递归解析 Schema，从源对象中提取对应数据，完成目标对象构建。

### 1.1 设计目标

- **结构模板化**：通过 Schema 定义目标对象的数据结构。
- **字段映射**：支持源字段与目标字段使用不同名称。
- **递归构建**：支持任意层级的嵌套对象。
- **条件提取**：支持根据字段值或其他源字段状态决定是否提取。
- **数据转换**：支持自定义字段转换函数及类型处理。
- **缺失过滤**：自动忽略不存在、不支持或未通过条件判断的字段。
- **默认值**：支持源字段缺失时设置默认值。
- **数组保留**：Flatten 源对象中的数组默认作为完整字段值处理，不自动递归解析。
- **可扩展性**：支持显式数组转换、复杂数据类型及自定义转换规则。

### 1.2 核心设计原则

1. Schema 只描述数据结构和转换规则，不包含具体业务数据。
2. 转换器负责统一解析 Schema，不针对具体业务编写专用转换逻辑。
3. 未在 Schema 中声明的源字段不参与转换。
4. 不满足条件或不存在的字段不生成目标属性。
5. 转换过程不修改源对象和 Schema。
6. 数组默认作为普通数据值整体提取和保留。
7. 数组元素转换必须通过 Schema 显式声明，不进行隐式递归处理。

---

## 2. 数据结构设计

### 2.1 输入数据

输入为扁平化对象，字段数量、字段类型及字段内容不固定。

```ts
const source = {
  id: 1001,
  username: 'Tom',
  age: 18,
  email: 'tom@example.com',
  enabled: true,
  status: 1,
  tags: ['admin', 'user'],
  permissions: [
    { code: 'read', enabled: true },
    { code: 'write', enabled: false },
  ],
};
```

其中：

- 基础类型作为普通字段值处理。
- 数组作为完整字段值处理。
- 数组内部的对象不自动识别为目标对象层级。
- 对象嵌套结构由 Schema 明确定义。

### 2.2 目标数据结构

目标对象由 Schema 定义，可以包含：

- 基础字段。
- 不同名称的字段映射。
- 多层嵌套对象。
- 数组整体映射。
- 条件控制字段。
- 自定义转换后的字段。

例如：

```ts
{
  id: 1001,
  name: 'Tom',
  profile: {
    age: 18,
    email: 'tom@example.com',
  },
  status: 1,
  tags: ['admin', 'user'],
}
```

### 2.3 Schema 设计

Schema 采用声明式结构，支持字符串简写和显式规则两种形式。

```ts
const schema = {
  id: 'id',

  name: {
    kind: 'field',
    source: 'username',
  },

  profile: {
    kind: 'object',
    fields: {
      age: 'age',
      email: 'email',
    },
  },

  status: {
    kind: 'field',
    source: 'status',
    when: (_, source) => source.enabled === true,
  },

  tags: 'tags',
};
```

字段规则说明：

| 配置            | 类型       | 说明                       |
| --------------- | ---------- | -------------------------- |
| `kind: field`   | 普通字段   | 字段映射                   |
| `kind: object`  | 嵌套对象   | 创建目标对象               |
| `kind: array`   | 数组转换   | 显式处理数组元素           |
| `source`        | `string`   | 指定源字段                 |
| `fields`        | `Schema`   | 定义嵌套对象结构           |
| `when`          | `Function` | 字段或对象的提取条件       |
| `default`       | `unknown`  | 字段缺失时使用的默认值     |
| `transform`     | `Function` | 自定义字段转换函数         |
| `items`         | `Schema`   | 定义数组对象元素的结构模板 |
| `transformItem` | `Function` | 自定义数组元素转换         |

**数组处理约定：**

- 字符串简写和普通字段映射均将数组作为完整值处理。
- 不自动遍历数组。
- 不自动转换数组中的对象。
- 不因数组元素包含对象而改变数组的字段属性。
- 只有显式使用 `kind: 'array'` 时，才允许执行数组元素级转换。

---

## 3. TypeScript 类型定义

```ts
type Source = Record<string, unknown>;

type FieldRule = {
  kind: 'field';
  source: string;

  /** 源字段缺失或值为 undefined 时使用 */
  default?: unknown;

  /** 字段提取条件 */
  when?: (value: unknown, source: Source) => boolean;

  /** 字段值转换 */
  transform?: (value: unknown, source: Source) => unknown;
};

type ObjectRule = {
  kind: 'object';
  fields: Schema;

  /** 嵌套对象生成条件 */
  when?: (source: Source) => boolean;
};

type ArrayRule = {
  kind: 'array';
  source: string;

  /** 数组元素结构模板 */
  items?: Schema;

  /** 数组提取条件 */
  when?: (value: unknown[], source: Source) => boolean;

  /** 自定义数组元素转换 */
  transformItem?: (item: unknown, index: number, source: Source) => unknown;
};

type SchemaRule = string | FieldRule | ObjectRule | ArrayRule;

type Schema = Record<string, SchemaRule>;
```

---

## 4. 转换器实现

### 4.1 基础实现

```ts
/**
 * 判断是否为普通对象。
 */
function isRecord(value: unknown): value is Source {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 安全设置对象属性。
 */
function setProperty(target: Source, key: string, value: unknown): void {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

/**
 * 执行对象转换。
 */
function transform(source: Source, schema: Schema): Source {
  const result: Source = {};

  for (const [key, rule] of Object.entries(schema)) {
    // 字符串简写：直接映射源字段，数组作为完整值保留。
    if (typeof rule === 'string') {
      if (Object.hasOwn(source, rule) && source[rule] !== undefined) {
        setProperty(result, key, source[rule]);
      }

      continue;
    }

    // 普通字段映射。
    if (rule.kind === 'field') {
      const exists = Object.hasOwn(source, rule.source);

      let value = exists ? source[rule.source] : undefined;

      // 仅在字段缺失或值为 undefined 时使用默认值。
      if (value === undefined && 'default' in rule) {
        value = rule.default;
      }

      if (value === undefined) continue;

      // 条件判断。
      if (rule.when && !rule.when(value, source)) {
        continue;
      }

      // 自定义转换。
      if (rule.transform) {
        value = rule.transform(value, source);
      }

      if (value !== undefined) {
        setProperty(result, key, value);
      }

      continue;
    }

    // 嵌套对象。
    if (rule.kind === 'object') {
      if (rule.when && !rule.when(source)) {
        continue;
      }

      const nested = transform(source, rule.fields);

      // 不生成空嵌套对象。
      if (Object.keys(nested).length > 0) {
        setProperty(result, key, nested);
      }

      continue;
    }

    // 显式数组转换。
    if (rule.kind === 'array') {
      if (!Object.hasOwn(source, rule.source)) {
        continue;
      }

      const value = source[rule.source];

      if (!Array.isArray(value)) {
        continue;
      }

      if (rule.when && !rule.when(value, source)) {
        continue;
      }

      const items = value
        .map((item, index) => {
          if (rule.transformItem) {
            return rule.transformItem(item, index, source);
          }

          if (rule.items && isRecord(item)) {
            return transform(item, rule.items);
          }

          return item;
        })
        .filter((item) => item !== undefined);

      setProperty(result, key, items);
    }
  }

  return result;
}
```

### 4.2 调用示例

```ts
const source = {
  id: 1001,
  username: 'Tom',
  age: 18,
  email: 'tom@example.com',
  enabled: true,
  status: 1,
  tags: ['admin', 'user'],
  permissions: [
    { code: 'read', enabled: true },
    { code: 'write', enabled: false },
  ],
};

const schema: Schema = {
  id: 'id',

  name: {
    kind: 'field',
    source: 'username',
    when: (value) => typeof value === 'string' && value.length > 0,
  },

  profile: {
    kind: 'object',
    fields: {
      age: {
        kind: 'field',
        source: 'age',
        when: (value) => typeof value === 'number' && value >= 18,
      },
      email: 'email',
    },
  },

  status: {
    kind: 'field',
    source: 'status',
    when: (_, source) => source.enabled === true,
  },

  // 数组作为完整字段值，不进行元素级转换。
  tags: 'tags',
  permissions: 'permissions',
};

const result = transform(source, schema);
```

输出：

```ts
{
  id: 1001,
  name: 'Tom',
  profile: {
    age: 18,
    email: 'tom@example.com',
  },
  status: 1,
  tags: ['admin', 'user'],
  permissions: [
    { code: 'read', enabled: true },
    { code: 'write', enabled: false },
  ],
}
```

---

## 5. 字段映射与条件判断规范

### 5.1 字段映射

使用字符串简写或显式 `source` 指定源字段。

```ts
const schema: Schema = {
  id: 'user_id',

  username: {
    kind: 'field',
    source: 'account_name',
  },
};
```

要求：

- 目标字段名称由 Schema 的属性名称决定。
- 源字段名称由 `source` 决定。
- 未声明的源字段不参与转换。
- 不存在的源字段不生成目标属性。
- 源字段为数组时，作为完整值赋值，不自动递归解析。

### 5.2 条件判断

`when` 用于控制字段是否提取，支持当前字段值及完整源对象参与判断。

```ts
const schema: Schema = {
  // 当前字段值判断。
  name: {
    kind: 'field',
    source: 'username',
    when: (value) => typeof value === 'string' && value.length > 0,
  },

  // 依赖其他源字段判断。
  status: {
    kind: 'field',
    source: 'status',
    when: (_, source) => source.enabled === true,
  },

  // 多字段组合判断。
  permission: {
    kind: 'field',
    source: 'permission',
    when: (_, source) => source.enabled === true && source.role === 'admin',
  },

  // 嵌套对象整体判断。
  profile: {
    kind: 'object',
    when: (source) => source.hasProfile === true,
    fields: {
      age: 'age',
      email: 'email',
    },
  },
};
```

条件判断规范：

1. 条件返回 `true` 时执行字段提取。
2. 条件返回 `false` 时忽略当前字段。
3. 条件函数接收原始源对象，不使用已转换的目标对象。
4. 字段条件判断在默认值处理之后、字段转换之前执行。
5. 嵌套对象条件不满足时，整个嵌套对象不生成。
6. 不满足条件的字段不生成 `undefined` 占位属性。
7. 数组字段的条件判断针对整个数组执行，不默认对数组元素逐个判断。

### 5.3 默认值

默认值只在源字段缺失或值为 `undefined` 时生效。

```ts
const schema: Schema = {
  name: {
    kind: 'field',
    source: 'username',
    default: 'Anonymous',
  },
};
```

以下值不应触发默认值：

- `null`
- `0`
- `false`
- `''`
- `[]`

如果需要过滤上述值，应通过 `when` 明确声明条件。

### 5.4 自定义字段转换

使用 `transform` 实现类型转换、格式处理及其他自定义逻辑。

```ts
const schema: Schema = {
  id: {
    kind: 'field',
    source: 'id',
    transform: (value) => Number(value),
  },

  enabled: {
    kind: 'field',
    source: 'enabled',
    transform: (value) => Boolean(value),
  },

  username: {
    kind: 'field',
    source: 'username',
    transform: (value) => String(value).trim(),
  },
};
```

要求：

- 转换函数接收字段值及原始源对象。
- 转换结果为 `undefined` 时忽略该字段。
- 其他结果按照转换函数返回值保留。
- 数组默认作为整体传入转换函数，不自动处理数组元素。
- 类型转换失败时的处理策略由具体转换函数决定。

---

## 6. 嵌套对象与数组转换规范

### 6.1 嵌套对象

使用 `kind: 'object'` 和 `fields` 定义目标对象结构。

```ts
const schema: Schema = {
  user: {
    kind: 'object',
    fields: {
      id: 'id',
      profile: {
        kind: 'object',
        fields: {
          name: 'username',
          age: 'age',
        },
      },
    },
  },
};
```

要求：

- 支持任意层级递归。
- 每层对象独立执行字段映射及条件判断。
- 空嵌套对象默认忽略。
- 所有层级均遵循统一字段过滤规范。
- 嵌套对象由 Schema 显式定义，不根据源数据中的对象或数组自动推断。

### 6.2 数组整体映射

数组默认使用普通字段映射。

```ts
const schema: Schema = {
  tags: 'tags',
  permissions: 'permissions',
};
```

无论数组元素是基础类型、普通对象还是其他合法数据结构，均作为一个完整数组值处理。

要求：

- 不自动遍历数组。
- 不自动转换数组中的对象。
- 不自动过滤数组元素。
- 不自动修改数组元素。
- 不改变数组的原始顺序和内容。
- 默认保留空数组。
- 数组作为整体参与字段条件判断和自定义转换。

### 6.3 显式数组转换

只有业务明确需要处理数组元素时，才使用 `kind: 'array'`。

转换对象数组：

```ts
const schema: Schema = {
  users: {
    kind: 'array',
    source: 'users',
    items: {
      id: 'id',
      name: 'username',
    },
  },
};
```

自定义数组元素转换：

```ts
const schema: Schema = {
  tags: {
    kind: 'array',
    source: 'tags',
    transformItem: (item) => String(item).toLowerCase(),
  },
};
```

要求：

- 源字段必须为数组，否则忽略该字段。
- 支持数组元素结构映射。
- 支持自定义数组元素转换。
- 数组元素转换结果为 `undefined` 时过滤该元素。
- 默认保留合法的空数组。
- 数组对象元素转换时，使用对应元素作为源对象。
- 显式数组转换与默认数组整体映射应具有明确的规则边界。

---

## 7. 数据过滤与处理规则

统一采用以下处理规范：

| 源数据情况             | 处理规则             |
| ---------------------- | -------------------- |
| 字段不存在             | 忽略                 |
| 字段值为 `undefined`   | 忽略或使用默认值     |
| 字段值为 `null`        | 默认保留             |
| 字段值为 `0`           | 保留                 |
| 字段值为 `false`       | 保留                 |
| 字段值为空字符串       | 默认保留             |
| 字段值为空数组         | 保留                 |
| 字段值为非空数组       | 作为完整值保留       |
| 数组元素为对象         | 不自动递归转换       |
| 字段未通过 `when`      | 忽略                 |
| 字段未在 Schema 中声明 | 忽略                 |
| 转换结果为 `undefined` | 忽略                 |
| 嵌套对象为空           | 忽略                 |
| 源数组类型不正确       | 忽略显式数组转换字段 |

特别要求：

- 不得使用简单的真值判断（如 `if (value)`）代替字段存在性判断。
- 使用 `Object.hasOwn` 判断源对象是否具有对应属性。
- 不得将 `null`、`0`、`false`、空字符串和空数组统一视为缺失值。
- 不得修改输入源对象。
- 不得输出未定义的 Schema 字段。
- 默认数组映射必须保留数组整体内容，不执行隐式元素转换。
- Schema 应作为可信配置使用，避免执行未经信任的数据转换函数。

---

## 8. 扩展设计要求

转换器应保持核心解析逻辑稳定，通过扩展规则支持新增能力。

建议后续按实际需求增加：

| 扩展能力   | 设计要求                                        |
| ---------- | ----------------------------------------------- |
| 字段别名   | 支持多个候选源字段                              |
| 嵌套源路径 | 支持 `user.profile.name` 等路径提取             |
| 条件组合   | 支持 AND、OR、NOT 等条件配置                    |
| 类型校验   | 支持 string、number、boolean、object 等类型约束 |
| 枚举映射   | 支持源值与目标值之间的枚举转换                  |
| 数组过滤   | 支持显式数组规则下的元素级条件判断              |
| 数组转换   | 支持显式声明的数组元素转换                      |
| 自定义校验 | 支持字段转换前后的数据校验                      |
| 错误处理   | 支持严格模式及错误收集                          |
| 异步转换   | 按需支持异步转换函数                            |

扩展要求：

1. 不应为新增规则破坏已有 Schema 的兼容性。
2. 不应将业务特定的转换逻辑耦合到转换器核心。
3. 自定义函数应明确输入参数及返回值语义。
4. 异步转换应独立提供异步入口，避免同步接口隐式返回 Promise。
5. 严格模式与默认过滤模式应具有明确的行为边界。
6. 不得改变数组默认作为完整字段值处理的约定。

---

## 9. 测试规范

至少覆盖以下测试场景：

| 测试场景                 | 预期结果                          |
| ------------------------ | --------------------------------- |
| 普通字段映射             | 正确提取源字段                    |
| 字段名称映射             | 正确生成目标字段名称              |
| 多层嵌套对象             | 正确生成目标层级                  |
| 源字段缺失               | 不生成对应属性                    |
| 条件返回 false           | 不生成对应属性                    |
| 条件依赖其他字段         | 正确执行组合判断                  |
| 默认值                   | 仅在字段缺失或为 undefined 时生效 |
| null、0、false、空字符串 | 按规范保留                        |
| 数组整体映射             | 完整保留数组内容                  |
| 空数组                   | 保留空数组                        |
| 数组对象元素             | 不自动递归转换                    |
| 数组元素顺序             | 保持原始顺序                      |
| 数组字段条件判断         | 针对整个数组执行                  |
| 显式数组转换             | 按 Schema 规则处理元素            |
| 非法数组类型             | 忽略对应字段                      |
| 自定义转换               | 正确使用转换后的值                |
| 转换结果为 undefined     | 忽略对应属性                      |
| 空嵌套对象               | 不生成空对象                      |
| 未声明字段               | 不输出                            |
| 源对象不可变性           | 转换前后源对象保持一致            |
| 不同 Schema 复用         | 相互独立，不产生状态污染          |

---

## 10. 最终实现规范

转换器统一采用以下架构：

**输入数据 + Schema 模板 → Schema 解析器 → 条件判断 → 字段提取 → 数据转换 → 结果过滤 → 目标对象**

核心实现要求：

1. 使用 TypeScript 定义完整的 Schema 类型体系。
2. 使用递归解析方式构建嵌套对象。
3. 使用统一字段规则处理字段映射、条件判断、默认值及自定义转换。
4. 通过 `kind` 区分普通字段、嵌套对象和数组规则。
5. 通过 `when` 控制字段及对象的提取条件。
6. 通过 `transform` 和 `transformItem` 扩展数据转换能力。
7. 默认将 Flatten 源对象中的数组作为完整字段值处理，不自动递归解析数组元素。
8. 只有显式声明数组转换规则时，才执行数组元素级处理。
9. 统一处理缺失字段、无效字段及空嵌套对象。
10. 保持输入数据不可变及转换结果独立。
11. 转换器核心不包含具体业务字段和业务判断。
12. 所有扩展规则均应具有明确的类型定义、执行顺序及异常处理规范。

最终实现应形成一个独立、可复用、可扩展的通用对象转换模块，业务侧只需要提供源对象和 Schema，即可完成不同数据结构之间的映射与转换。
