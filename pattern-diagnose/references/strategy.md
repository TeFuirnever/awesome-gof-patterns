<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
---
name: Strategy
intent: 在运行时在一组可互换的算法之间做选择
category: behavioral
modern_relevance: |
  在支持高阶函数和闭包的语言里，许多 Strategy 用法可以退化为传函数 / lambda 而无需类层级。
  当算法本身需要持有状态、配置、依赖注入、跨语言互操作或需要枚举发现时，类形式的
  Strategy 仍然合理。诊断报告应当先问"是否真的需要 Strategy 类，而不是一个函数参数"。
smells:
  - id: long-conditional-on-type
    pattern: |
      用一个类型字段（enum / string / class flag）做长链 if/elif/switch，
      每个分支调用不同算法或对同一概念应用不同计算。
    indicator_examples:
      - 'if (kind === "fast") {...} else if (kind === "secure") {...}'
      - 'switch self.mode: case "a": ... case "b": ...'
  - id: parallel-subclass-only-differs-in-one-method
    pattern: |
      多个子类继承同一基类，唯一差异是某个 algorithmic method 的实现，
      其他成员行为完全相同。
  - id: manual-callback-table
    pattern: |
      手工维护一个"算法名 → 函数"映射表，每次新增需要改 dispatch 代码，
      违反开闭原则的客户端代码。
anti_patterns:
  - id: only-one-variant
    rule: 当前只有一个具体实现且没有第二个变体的明确路线时，引入 Strategy 是过度设计
    why: |
      Strategy 的成本是接口 + 至少两个具体类 + 注入路径。
      只有一个变体时，直接的简单实现更易读，未来真有变体再重构。
  - id: stateless-trivial-algorithm
    rule: 算法只是简单的纯函数（无状态、无配置、单语言），用高阶函数代替 Strategy 类
    why: |
      高阶函数版本更轻量，类层级仅在算法需要状态或被装配时才赚回成本。
  - id: replace-simple-polymorphism
    rule: 已有合理的多态分发时，再外包一层 Strategy 通常只是搬移而不是改善
    why: |
      多态本身就是 Strategy 的一种实现。把方法搬到一个并行接口里只是换个名字。
  - id: explosion-of-strategies
    rule: 拆出过多细粒度 Strategy（每个微小变体一个类）会把复杂度从分支搬到类图
    why: |
      Strategy 优势在"少量正交策略 + 清晰边界"。如果策略数量爆炸，
      考虑组合（Composite Strategy）或重新看是否该用 Template Method。
steps:
  - 识别变化部分：把每个分支的算法体提取成独立函数或方法，命名表达意图
  - 定义 Strategy 接口：包含且仅包含变化部分需要的最小方法集合
  - 实现具体策略类：每个原分支搬入对应的具体类（或保留为函数，依语言习惯）
  - 改造客户端：用注入（构造函数参数 / setter / DI 容器）替换原条件分支
  - 移除条件分支：删除原 if/switch；客户端只调用 strategy 接口方法
  - 跑测试确认行为一致：原有测试不应需要修改即可通过；新增针对每个具体策略的单元测试
sources:
  - https://en.wikipedia.org/wiki/Strategy_pattern
  - https://martinfowler.com/eaaCatalog/  # 适用条目
  - 作者本人多年面向对象设计实战
attribution_chain:
  upstream_license: CC-BY-SA-4.0
  see: NOTICE
---

# Strategy（叙事正文）

## 这个模式在解决什么问题

很多代码会在运行时根据某个"种类"标志选不同算法跑：用户类型决定计费规则、
设备类型决定渲染管线、订单状态决定校验链。直接写法是一长串 if/elif 或
switch，每加一种就动客户端代码。这破坏开闭原则，也让单元测试变成"测整个
分支表"而不是"测每个算法"。

Strategy 把"选哪个算法"和"算法本身"解耦：
- 抽象 Strategy 接口声明算法签名
- 每个具体 Strategy 是一个类（或函数）实现
- 客户端持有一个 Strategy 引用，调用时不再关心具体实现

## 经典适用信号

- 你想替换的是**算法**，不是单一行为
- 算法之间是**真正可互换**的（同样的输入契约、同样的输出契约）
- 选择**在运行时**发生，而不是编译时
- 业务上**有 ≥ 2 个真实存在的变体**，不是为未来"可能"的变体设计

## 现代语言里的退化

在 Python / TypeScript / Kotlin / Swift 这种支持一等函数的语言里，
"算法是一个签名一致的函数"通常不需要类外壳。Strategy 类形式的合理理由：
- 算法需要持有状态或配置（构造时注入）
- 算法需要在语言互操作场景被发现/列举（如插件注册）
- 团队已有强 OO 风格、加一个接口比加一个 callable 更一致
- 算法签名比"单个函数"复杂，多个钩子方法（template-style）

如果都不沾，传一个函数就够。

## 与其它模式的关系

- **State**：结构相似（接口 + 多个实现），但 State 强调状态机迁移，
  Strategy 强调可互换算法。有时同一份代码两种解释都合理；以"是否有状态迁移"分。
- **Template Method**：把骨架放在父类、把变化放在 hook 方法。
  Strategy 把变化放在独立对象。喜欢组合优于继承时选 Strategy。
- **Bridge**：抽象与实现分离的更宽泛形式。Strategy 关注算法替换，
  Bridge 关注抽象/实现两个维度都可独立变化。
- **Command**：把请求封装成对象。Strategy 封装的是"如何做"，
  Command 封装的是"做什么 + 上下文"。

## 何时不要用

见 frontmatter `anti_patterns` 字段。简言之：

- 只有一种变体且没有清晰的第二种到来路径
- 算法是简单纯函数且语言支持一等函数
- 已有合理多态分发
- 策略数量将爆炸到难以维护

## 验证清单

重构后必须通过：
- 原有行为测试无需修改即通过（或修改是机械替换 import / 注入路径）
- 每个具体策略有针对性单元测试
- 客户端测试只验证"调用了 strategy.method"，不再验证分支选择
- 新增策略时不需要改客户端代码（开闭原则可观察）

## 参考

- Wikipedia: Strategy pattern (CC BY-SA 4.0)
- Martin Fowler: relevant catalog entries on policy/strategy

本卡内容由 awesome-gof-patterns contributors 独立撰写后与上述来源核对事实，
不直接复制原始章节。文本相似度由 `scripts/similarity-check.mjs` 监控。
