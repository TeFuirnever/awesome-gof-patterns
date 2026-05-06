<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
---
name: Factory Method
intent: 让子类决定实例化哪个具体类，将"创建什么"的决策从客户端推迟到工厂方法
category: creational
modern_relevance: |
  在支持高阶函数和泛型的语言里，很多 Factory Method 用法可以用"函数返回接口实例"
  替代，无需类继承层级。Go 的 interface + 返回函数、TypeScript 的泛型工厂函数、
  Python 的 callable class / 闭包工厂都让子类化变得不必要。Factory Method 作为
  类层级仍然合理的场景：框架的扩展点（用户通过继承来注入自定义创建逻辑）、
  需要注册发现机制的插件体系、或团队强制 OO 风格。诊断报告应当先问
  "是否真的需要子类来决定创建，还是传一个工厂函数就够了"。
smells:
  - id: new-concrete-in-interface
    pattern: |
      高层模块或接口代码里直接出现 new ConcreteType() 或 ConcreteType()，
      把具体类型硬编码到本应只依赖抽象的地方。
    indicator_examples:
      - 'return new PostgresDB(config); // inside IDatabase.connect()'
      - 'return PdfExporter()  # inside a function that should be format-agnostic'
  - id: conditional-construction
    pattern: |
      用 if/switch 根据某个标志选择实例化哪个具体类，每增加一种就要改这个分支。
      和 Strategy 的区别：这里分支的结果是"创建并返回对象"，不是"执行算法"。
    indicator_examples:
      - 'if (type === "json") return new JsonParser(); else return new XmlParser();'
      - 'switch fmt: case "csv": return CsvWriter(); case "xlsx": return XlsxWriter()'
  - id: constructor-knows-too-much
    pattern: |
      一个类或构造函数承担了"创建依赖"和"使用依赖"两个职责，
      违反单一职责，也让替换依赖进行测试变得困难。
anti_patterns:
  - id: only-one-product-variant
    rule: 当前只创建一种具体产品且没有第二种变体的计划时，Factory Method 是过度抽象
    why: |
      Factory Method 的成本是 Creator 抽象 + 至少两个 ConcreteCreator + Product 抽象。
      只有一种产品时，直接构造 + 依赖注入更简单。
  - id: simple-static-factory-suffices
    rule: 如果不需要子类来决定创建逻辑，静态工厂函数就够了
    why: |
      Factory Method 的关键特征是"通过继承延迟决策"。如果创建逻辑可以用参数化函数
      解决（如 makeParser(format: string)），那不是 Factory Method，是静态工厂，
      而且往往更简单。
  - id: creation-logic-is-trivial
    rule: 构造过程只是一行 new/make 时，引入工厂层是空抽象
    why: |
      如果创建不涉及配置组装、依赖解析、缓存池化或条件选择，直接构造更透明。
      每多一层间接层都要有具体回报。
  - id: abstraction-factory-overkill
    rule: 当 Abstract Factory 更合适时不要用 Factory Method
    why: |
      如果需要创建的是一族相互关联的产品（如 UI 主题的 Button + TextField + Dialog），
      应该用 Abstract Factory 而不是多个独立的 Factory Method。
steps:
  - 识别变化点：找出代码中哪里在根据条件创建不同的具体对象
  - 定义 Product 接口：所有具体产品实现的公共接口
  - 定义 Creator 抽象：包含 factory method 签名，返回 Product 接口类型
  - 实现具体 Creator：每个子类/变体在 factory method 中返回对应的具体产品
  - 改造客户端：将直接构造替换为调用 factory method
  - 跑测试确认：行为不变；新增产品类型只需新增 Creator 子类，不改客户端
sources:
  - https://en.wikipedia.org/wiki/Factory_method_pattern
  - https://martinfowler.com/articles/dependencyInjection.html  # DI as alternative
  - 作者本人多年面向对象设计实战
attribution_chain:
  upstream_license: CC-BY-SA-4.0
  see: NOTICE
---

# Factory Method（叙事正文）

## 这个模式在解决什么问题

代码里经常需要根据某种条件创建不同的对象：日志格式决定用 JsonFormatter 还是
TextFormatter、数据库类型决定用 PostgresConnection 还是 MySqlConnection。
如果客户端直接写 `new JsonFormatter()`，它就和具体类绑死了——换格式就要改客户端。

Factory Method 把"创建什么"这个决策从客户端推迟到一个可覆盖的方法里：
- Creator 声明一个工厂方法，返回 Product 接口
- ConcreteCreator 覆盖工厂方法，返回具体的产品实例
- 客户端只持有 Creator 引用，调用工厂方法拿到 Product，不知道具体类型

## 经典适用信号

- 客户端需要创建对象但**不应知道具体类型**
- 创建逻辑会**随子类或配置变化**，且变化的频率高于使用逻辑
- 框架设计的扩展点：**用户通过继承来注入自己的创建逻辑**
- 需要**在测试中替换真实对象**为 mock/stub

## 现代语言里的退化

在支持高阶函数和依赖注入的语言里，很多场景不需要类层级的 Factory Method：

- **TypeScript**：`() => Parser` 作为参数比 `new ConcreteCreator().create()` 更直接
- **Python**：` Callable[[], Connection]` 或直接传 class 给 DI 容器
- **Go**：`type ParserFactory func(input io.Reader) Parser` 接口+函数即可

Factory Method 作为类层级仍然合理的场景：
- 框架的 Template Method 扩展点中，工厂方法是钩子之一
- 插件注册体系需要反射式发现
- 团队架构规范强制 Creator/Product 分层

如果只是"根据参数选择创建什么"，静态工厂函数往往足够。

## 与其它模式的关系

- **Abstract Factory**：创建一族相关产品的工厂接口。Factory Method 创建一个产品。
  Abstract Factory 内部通常用多个 Factory Method 实现。
- **Strategy**：Strategy 替换算法，Factory Method 替换创建逻辑。
  工厂方法本身可以参数化为策略。
- **Template Method**：Template Method 定义算法骨架，Factory Method 经常作为其中的一个钩子步骤。
- **Builder**：Builder 分步构建复杂对象。Factory Method 是一步创建。
  对象构建需要多步配置时用 Builder。

## 何时不要用

见 frontmatter `anti_patterns` 字段。简言之：

- 只有一种产品变体
- 不需要子类化来决定创建逻辑（静态工厂函数够了）
- 构造过程极简，不需要配置或组装
- 需要创建的是一族产品而非单一产品

## 验证清单

重构后必须通过：
- 客户端代码不再引用具体产品类
- 新增产品类型只需新增 Creator 子类 + 产品实现
- 测试中可以替换 Creator 来注入 mock 产品
- 行为与直接构造一致

## 参考

- Wikipedia: Factory method pattern (CC BY SA 4.0)
- Martin Fowler: Dependency Injection article

本卡内容由 awesome-gof-patterns contributors 独立撰写后与上述来源核对事实，
不直接复制原始章节。文本相似度由 `scripts/similarity-check.mjs` 监控。
