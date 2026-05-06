<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
---
name: Adapter
intent: 让不兼容的接口能够协同工作，通过包装把一个接口转换成客户端期望的接口
category: structural
modern_relevance: |
  Adapter 是所有 GoF 模式中在现代语言里退化最少的模式之一——接口不兼容的问题不会
  因为语言特性而消失。TypeScript 的 declaration merging、Python 的 duck typing
  和 Protocol、Go 的 implicit interface satisfaction 都能在一定程度上减少手写
  Adapter 类的需求，但当你无法修改第三方库的接口时，Adapter 仍然是标准解法。
  现代 Adapter 更常见的形态是"wrapper function"而非"wrapper class"——
  一个接受 A 类型并返回 B 类型的函数。诊断报告应当先问
  "是否能通过 duck typing / structural typing 直接让两方兼容，而不需要显式包装"。
smells:
  - id: incompatible-interface-shape
    pattern: |
      两个模块各自有功能匹配的接口，但方法名、参数顺序、返回格式或错误处理方式
      不兼容，导致调用方需要写大量胶水代码做格式转换。
    indicator_examples:
      - 'thirdPartyLib.getUser(id).then(u => ({ name: u.full_name, age: u.years }))'
      - 'legacy_system.fetch_data()["items"] → new_api.list()'
  - id: glue-code-accumulation
    pattern: |
      某个调用点堆积了大量"翻译"代码：从一种数据格式转另一种、从一个异常体系转另一个、
      从回调风格转 Promise/async 风格。这些翻译逻辑没有内聚到一个专门的适配层。
  - id: defensive-wrapper-at-boundary
    pattern: |
      在系统边界（第三方 API、遗留模块、外部服务）反复出现相似的包装代码，
      每个调用点都独立处理接口差异。
anti_patterns:
  - id: both-sides-are-yours
    rule: 如果两个接口都是你自己的代码，Adapter 通常不如直接统一接口
    why: |
      Adapter 的核心场景是"你无法修改的一端"。如果两端都能改，统一接口命名/签名
      比加一层间接更简单。Adapter 的成本是额外的包装类 + 调用链深度。
  - id: trivial-field-mapping
    rule: 如果适配只是 1-2 个字段重命名或类型转换，内联转换比包装类更清晰
    why: |
      `{ name: data.full_name }` 比 `new UserAdapter(thirdPartyObj).toUser()`
      在简单场景下更直接。Adapter 在转换逻辑复杂、有状态、或需要复用时才赚回成本。
  - id: adapter-chain-too-deep
    rule: Adapter 套 Adapter 形成深层嵌套时，问题不在适配而在架构
    why: |
      A → B → C → D 的适配链意味着接口设计有根本性问题。应该重新审视统一的
      内部接口是什么，而不是在每层都做翻译。
  - id: facade-would-be-better
    rule: 如果不兼容是因为子系统接口太多太碎而不是形状不匹配，Facade 更合适
    why: |
      Facade 简化访问（多 → 一），Adapter 转换接口（A 形 → B 形）。
      如果问题是"API 太复杂"而非"API 不兼容"，方向不同。
steps:
  - 识别不兼容边界：找出两个需要协作但接口不匹配的模块/类/API
  - 确认不可修改端：至少一端是你无法或不应修改的（第三方库、遗留代码、跨团队接口）
  - 定义目标接口：客户端期望的接口形状
  - 创建 Adapter：实现目标接口，内部持有被适配对象的引用
  - 实现转换逻辑：在 Adapter 的每个方法中，将目标接口的调用翻译为被适配对象的调用
  - 替换客户端：将直接使用被适配对象的代码改为通过 Adapter 使用
  - 跑测试确认：行为不变；Adapter 可以被替换为 mock 进行测试
sources:
  - https://en.wikipedia.org/wiki/Adapter_pattern
  - https://refactoring.guru/design-patterns/adapter  # structural reference
  - 作者本人多年面向对象设计实战
attribution_chain:
  upstream_license: CC-BY-SA-4.0
  see: NOTICE
---

# Adapter（叙事正文）

## 这个模式在解决什么问题

系统集成时经常遇到"功能完全对得上，但接口对不上"的情况：
- 第三方日志库用 `log(msg, level)` 而你的系统用 `logger.error(msg)`
- 旧版支付 API 用回调风格，新版要求 Promise
- 外部数据源返回 XML 而你的系统只处理 JSON

直接在业务代码里写转换逻辑会把"业务意图"淹没在"格式翻译"里。
Adapter 把翻译逻辑封装在一个独立的包装层中：
- Adapter 实现客户端期望的接口
- 内部持有被适配对象的引用
- 每个方法将"客户端的请求"翻译为"被适配对象能理解的形式"

## 经典适用信号

- **至少一端无法修改**（第三方库、遗留代码、跨团队契约）
- 接口**功能匹配但形状不兼容**（方法名、参数、返回格式、错误模式）
- 需要在**不修改既有代码**的情况下让两个系统协作
- 转换逻辑**需要在多个调用点复用**

## 现代语言里的退化

Adapter 是退化最少的 GoF 模式之一——接口不兼容不会因语言特性消失。
但某些语言特性减少了手写 Adapter 类的需求：

- **Go 的隐式接口满足**：只要第三方类型的方法签名匹配，无需显式包装
- **Python 的 duck typing + Protocol**：只要运行时行为一致，不要求类型声明匹配
- **TypeScript 的 structural typing**：形状匹配即可赋值，不需要显式 implements

仍然需要显式 Adapter 的场景：
- 方法名不同（需要映射）
- 参数/返回类型需要转换（如 XML → JSON、回调 → Promise）
- 错误处理体系不兼容（如异常 → Result type）
- 需要在适配层添加缓存、重试、日志等横切关注点

## 与其它模式的关系

- **Facade**：Facade 简化接口（复杂 → 简单），Adapter 转换接口（A → B）。
  Facade 创建新接口，Adapter 让已有接口互相兼容。
- **Decorator**：Decorator 增强同接口的行为，Adapter 改变接口的形状。
  两者都是包装模式，但目的不同。
- **Bridge**：Bridge 在设计时分离抽象和实现，Adapter 在事后连接已有接口。
  Bridge 是前瞻性的，Adapter 是补救性的。
- **Proxy**：Proxy 保持相同接口增加间接层（懒加载、权限检查），
  Adapter 改变接口形状。

## 何时不要用

见 frontmatter `anti_patterns` 字段。简言之：

- 两端都是你自己的代码——直接统一接口
- 转换只是简单的字段映射——内联更清晰
- 适配链过深——问题在架构不在适配
- 问题是复杂度而非不兼容——用 Facade

## 验证清单

重构后必须通过：
- 客户端代码只依赖目标接口，不直接引用被适配对象
- Adapter 可以被替换为其他实现（包括 mock）
- 行为与直接使用被适配对象一致
- 转换逻辑集中在一个地方而非散布在多个调用点

## 参考

- Wikipedia: Adapter pattern (CC BY SA 4.0)
- Refactoring.Guru: Adapter structural reference

本卡内容由 awesome-gof-patterns contributors 独立撰写后与上述来源核对事实，
不直接复制原始章节。文本相似度由 `scripts/similarity-check.mjs` 监控。
