<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
---
name: Observer
intent: 在一个对象状态变化时自动通知所有依赖方，而不让被观察者知道依赖方是谁
category: behavioral
modern_relevance: |
  在现代语言和框架中，Observer 的核心思想已被 event system / pub-sub / reactive stream
  原生吸收。RxJS、Vue 的 watch、Svelte stores、Go channel、Python asyncio.Event 都是
  观察者机制的变体。手写 Observer 接口仅在"框架之外需要精确控制通知协议"时才合理——
  例如嵌入式系统、无依赖的库、或需要同步通知顺序保证的场景。诊断报告应当先问
  "是否已有 event / reactive 基础设施可用，而非手写 listener 列表"。
smells:
  - id: manual-listener-list
    pattern: |
      被观察类手动维护一个 listener/callback 数组，自己写 for 循环逐一调用，
      缺乏统一的注册/注销/错误隔离机制。
    indicator_examples:
      - 'this.listeners.push(cb); ... for (const cb of this.listeners) { cb(data); }'
      - 'self._observers.append(handler); ... for h in self._observers: h.update()'
  - id: polling-for-state-change
    pattern: |
      消费方通过定时器或循环反复查询"状态变了吗"，而不是被推送通知。
      浪费资源，增加延迟。
  - id: tight-coupling-on-notification
    pattern: |
      生产方直接调用某个具体类的方法来通知变化（如 this.logger.onData(d)），
      而非通过抽象接口广播，导致无法在不改生产方代码的情况下增加新的消费方。
anti_patterns:
  - id: only-one-listener
    rule: 当前只有一个消费方且没有明确的第二个消费方路线图时，手写 Observer 是过度设计
    why: |
      Observer 的成本是 subject + observer 接口 + 注册/注销逻辑 + 通知分发。
      单消费方时直接调用更简单，等真有第二消费方再重构不迟。
  - id: event-order-dependency
    rule: 通知顺序影响业务正确性时，Observer 可能不是正确选择
    why: |
      Observer 语义通常不保证通知顺序。如果消费方之间存在因果依赖（B 必须在 A 之后处理），
      应该用 Mediator 或 Chain of Responsibility 显式编排。
  - id: synchrony-in-hot-path
    rule: 高频事件 + 同步阻塞通知 = 性能灾难
    why: |
      默认 Observer 是同步逐个通知。如果事件频率高（>1000/s）或 listener 处理慢，
      阻塞会级联。应改用 event queue / reactive stream / channel-based 异步分发。
  - id: replace-existing-event-system
    rule: 项目已使用框架的事件系统（如 EventEmitter、RxJS、Vue watch）时，再手写 Observer 层是重复
    why: |
      这些框架本身就是 Observer 模式的标准化实现。在其之上再建一层 listener list
      只是增加抽象而没有增加表达力。
steps:
  - 识别变化源：找出哪个对象的状态变化需要被多方感知
  - 定义 Observer 接口：一个 update/notify 方法，参数是变化描述（不是整个 subject 引用，避免拉模型耦合）
  - 让消费方实现 Observer 接口：每个消费方独立处理通知，互不知晓
  - 在 Subject 中维护 observer 列表：提供 register/unregister 方法
  - 替换直接调用为通知分发：subject 状态变化时遍历 observer 列表调用 update
  - 加错误隔离：单个 observer 抛异常不应阻断其余 observer 的通知；用 try/catch 包裹每个调用
  - 跑测试确认：原有行为不变；新增 observer 不需要改 subject 代码
sources:
  - https://en.wikipedia.org/wiki/Observer_pattern
  - https://reactivex.io/  # reactive extensions — modern observer variant
  - 作者本人多年面向对象设计实战
attribution_chain:
  upstream_license: CC-BY-SA-4.0
  see: NOTICE
---

# Observer（叙事正文）

## 这个模式在解决什么问题

很多系统中存在"一对多"的依赖：一个对象的状态变了，多个其他对象需要做出反应。
股票价格更新 → 图表重绘、告警检查、日志记录；传感器数据到达 → 显示面板、持久化、
阈值监控。如果让变化源直接调用每个消费方，每增减一个消费方就得改变化源的代码，
耦合度爆炸。

Observer 把"谁需要知道"这件事从变化源中剥离：
- Subject 只维护一个 observer 列表，状态变化时逐一通知
- Observer 只关心"收到通知后做什么"，不知道还有谁在监听
- 注册和注销是运行时动态的，不需要改 Subject 代码

## 经典适用信号

- 一个对象的**状态变化需要触发多个独立行为**
- 消费方**数量和身份在运行时可能变化**
- 变化源**不应知道消费方的具体类型**（解耦需求）
- 通知是**"推"模式**（事件发生即通知），而不是"拉"模式（轮询）

## 现代语言里的退化

Observer 是被现代语言生态吸收得最彻底的 GoF 模式之一：

- **EventEmitter / EventEmitter3**（Node.js）：标准化的发布-订阅
- **RxJS / ReactiveX**：Observable + Observer + Operator 的函数式组合
- **Vue watch / Svelte stores**：框架级响应式
- **Go channels**：goroutine 间的自然通知机制
- **Python asyncio.Event / blinker**：异步信号/事件

手写 Observer 接口的合理场景：
- 无框架依赖的库或嵌入式系统
- 需要精确控制通知协议（如同步顺序保证、优先级）
- 需要类型安全的通知签名（泛型 Observer<T>）
- 教学目的或需要与遗留代码对齐

如果项目已用上述任何框架，先检查能否直接复用。

## 与其它模式的关系

- **Mediator**：同样解耦多方通信，但 Mediator 是"中心化编排"，Observer 是"去中心化广播"。
  如果消费方之间需要协调逻辑，用 Mediator；如果各干各的，用 Observer。
- **Strategy**：Strategy 替换算法，Observer 替换通知目标。结构上都用接口+多实现。
- **Chain of Responsibility**：沿链传递请求，直到某个处理者消费它。Observer 是并行通知全部。
- **Singleton**：Subject 经常是 Singleton 或由 DI 容器管理生命周期。但 Observer 本身不要求 Singleton。

## 何时不要用

见 frontmatter `anti_patterns` 字段。简言之：

- 只有一个消费方且没有第二个的路线图
- 通知顺序影响业务正确性
- 高频 + 同步 = 性能陷阱
- 框架已有事件系统可复用

## 验证清单

重构后必须通过：
- 原有行为测试无需修改即通过
- 新增 observer 只需实现接口并注册，不改 subject 代码
- 单个 observer 异常不阻断其他 observer 的通知
- 注销后不再收到通知（无内存泄漏）

## 参考

- Wikipedia: Observer pattern (CC BY SA 4.0)
- ReactiveX documentation

本卡内容由 awesome-gof-patterns contributors 独立撰写后与上述来源核对事实，
不直接复制原始章节。文本相似度由 `scripts/similarity-check.mjs` 监控。
