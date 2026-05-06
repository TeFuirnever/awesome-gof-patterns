// SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors
// SPDX-License-Identifier: MIT

/**
 * generate-ground-truth.mjs
 *
 * Generates the v1 eval ground truth dataset (50 cases) into evals/cases/.
 * Each case is a directory with a case.json file.
 *
 * Usage: node scripts/generate-ground-truth.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const casesDir = resolve(__dirname, '..', 'cases');

function writeCase(id, data) {
  const dir = resolve(casesDir, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'case.json'), JSON.stringify(data, null, 2) + '\n');
}

// ── Strategy fit cases (10) ──────────────────────────────────────────

writeCase('strategy-fit-001', {
  id: 'strategy-fit-001',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `class PriceCalculator {
  calculate(order: { customerType: string; amount: number }): number {
    if (order.customerType === 'regular') {
      return order.amount;
    } else if (order.customerType === 'premium') {
      return order.amount * 0.9;
    } else if (order.customerType === 'vip') {
      return order.amount * 0.8;
    } else if (order.customerType === 'employee') {
      return order.amount * 0.7;
    } else if (order.customerType === 'wholesale') {
      return order.amount * 0.6;
    }
    throw new Error('Unknown customer type');
  }
}`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['long-conditional-on-type']
});

writeCase('strategy-fit-002', {
  id: 'strategy-fit-002',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'low',
  language: 'Python',
  source_code: `class PaymentProcessor:
    def process(self, method, amount):
        if method == 'credit_card':
            fee = amount * 0.03
            print(f"Charging credit card: {amount + fee}")
        elif method == 'paypal':
            fee = amount * 0.05
            print(f"Charging PayPal: {amount + fee}")
        elif method == 'bank_transfer':
            fee = amount * 0.01
            print(f"Charging bank transfer: {amount + fee}")
        elif method == 'crypto':
            fee = amount * 0.02
            print(f"Charging crypto: {amount + fee}")
        elif method == 'apple_pay':
            fee = amount * 0.025
            print(f"Charging Apple Pay: {amount + fee}")`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['long-conditional-on-type']
});

writeCase('strategy-fit-003', {
  id: 'strategy-fit-003',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'medium',
  language: 'Go',
  source_code: `func sortData(data []int, algorithm string) []int {
    switch algorithm {
    case "bubble":
        for i := 0; i < len(data); i++ {
            for j := 0; j < len(data)-1; j++ {
                if data[j] > data[j+1] {
                    data[j], data[j+1] = data[j+1], data[j]
                }
            }
        }
        return data
    case "quick":
        return quickSort(data)
    case "merge":
        return mergeSort(data)
    case "heap":
        return heapSort(data)
    case "insertion":
        return insertionSort(data)
    default:
        return data
    }
}`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['long-conditional-on-type']
});

writeCase('strategy-fit-004', {
  id: 'strategy-fit-004',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `class FastCompressor extends BaseCompressor {
  compress(data: Buffer): Buffer {
    // fast but low ratio
    return data;
  }
  decompress(data: Buffer): Buffer {
    return data;
  }
  getName(): string { return 'fast'; }
}

class BalancedCompressor extends BaseCompressor {
  compress(data: Buffer): Buffer {
    // balanced speed and ratio
    return data;
  }
  decompress(data: Buffer): Buffer {
    return data;
  }
  getName(): string { return 'balanced'; }
}

class MaxCompressor extends BaseCompressor {
  compress(data: Buffer): Buffer {
    // max ratio, slow
    return data;
  }
  decompress(data: Buffer): Buffer {
    return data;
  }
  getName(): string { return 'max'; }
}`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['parallel-subclass-only-differs-in-one-method']
});

writeCase('strategy-fit-005', {
  id: 'strategy-fit-005',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'medium',
  language: 'Python',
  source_code: `class RoutePlanner:
    def find_route(self, start, end, mode):
        if mode == 'driving':
            return self._driving_route(start, end)
        elif mode == 'walking':
            return self._walking_route(start, end)
        elif mode == 'cycling':
            return self._cycling_route(start, end)
        elif mode == 'transit':
            return self._transit_route(start, end)
        elif mode == 'ride_share':
            return self._rideshare_route(start, end)

    def _driving_route(self, s, e):
        return f"Driving from {s} to {e} via highway"

    def _walking_route(self, s, e):
        return f"Walking from {s} to {e} via footpaths"

    def _cycling_route(self, s, e):
        return f"Cycling from {s} to {e} via bike lanes"

    def _transit_route(self, s, e):
        return f"Transit from {s} to {e} via bus/train"

    def _rideshare_route(self, s, e):
        return f"Rideshare pickup at {s}, drop at {e}"`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['long-conditional-on-type']
});

writeCase('strategy-fit-006', {
  id: 'strategy-fit-006',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'high',
  language: 'TypeScript',
  source_code: `type ValidationFn = (input: string) => boolean;

const validators: Record<string, ValidationFn> = {};
let nextId = 0;

function registerValidator(name: string, fn: ValidationFn) {
  validators[name] = fn;
  nextId++;
}

function validate(input: string, type: string): boolean {
  const fn = validators[type];
  if (!fn) throw new Error(\`No validator for \${type}\`);
  return fn(input);
}

// Registration scattered across files
registerValidator('email', (s) => /.*@.*/.test(s));
registerValidator('phone', (s) => /^\\d{10}$/.test(s));
registerValidator('zip', (s) => /^\\d{5}$/.test(s));
registerValidator('ssn', (s) => /^\\d{3}-\\d{2}-\\d{4}$/.test(s));
registerValidator('credit', (s) => /^\\d{16}$/.test(s));

// Adding a new validator requires modifying dispatch logic
// and there's no shared interface for validator behavior
class ValidationService {
  validateAll(input: string, types: string[]): Record<string, boolean> {
    const results: Record<string, boolean> = {};
    for (const type of types) {
      if (validators[type]) {
        results[type] = validators[type](input);
      }
    }
    return results;
  }
}`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-callback-table']
});

writeCase('strategy-fit-007', {
  id: 'strategy-fit-007',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'low',
  language: 'Go',
  source_code: `func exportData(data []Record, format string) ([]byte, error) {
    switch format {
    case "csv":
        var buf bytes.Buffer
        for _, r := range data {
            buf.WriteString(fmt.Sprintf("%s,%s,%d\\n", r.Name, r.Email, r.Age))
        }
        return buf.Bytes(), nil
    case "json":
        return json.Marshal(data)
    case "xml":
        return xml.Marshal(data)
    case "yaml":
        return yaml.Marshal(data)
    default:
        return nil, fmt.Errorf("unsupported format: %s", format)
    }
}`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['long-conditional-on-type']
});

writeCase('strategy-fit-008', {
  id: 'strategy-fit-008',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'low',
  language: 'Python',
  source_code: `class BlurFilter extends BaseFilter:
    def apply(self, image):
        return self._convolve(image, self.blur_kernel)

class SharpenFilter extends BaseFilter:
    def apply(self, image):
        return self._convolve(image, self.sharpen_kernel)

class EdgeFilter extends BaseFilter:
    def apply(self, image):
        return self._convolve(image, self.edge_kernel)

class EmbossFilter extends BaseFilter:
    def apply(self, image):
        return self._convolve(image, self.emboss_kernel)`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['parallel-subclass-only-differs-in-one-method']
});

writeCase('strategy-fit-009', {
  id: 'strategy-fit-009',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `class NotificationService {
  send(channel: string, message: string): void {
    if (channel === 'email') {
      const smtp = this.connectSMTP();
      smtp.send({ to: this.recipient, body: message });
    } else if (channel === 'sms') {
      const twilio = this.initTwilio();
      twilio.messages.create({ to: this.phone, body: message });
    } else if (channel === 'push') {
      const fcm = this.getFCMToken();
      this.pushToFCM(fcm, { title: 'Notification', body: message });
    } else if (channel === 'slack') {
      const webhook = this.getSlackWebhook();
      fetch(webhook, { method: 'POST', body: JSON.stringify({ text: message }) });
    } else if (channel === 'webhook') {
      this.httpPost(this.webhookUrl, { event: this.eventType, message });
    } else {
      throw new Error(\`Unsupported channel: \${channel}\`);
    }
  }
}`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['long-conditional-on-type']
});

writeCase('strategy-fit-010', {
  id: 'strategy-fit-010',
  pattern: 'Strategy',
  category: 'fit',
  complexity: 'high',
  language: 'Go',
  source_code: `var serializerMap = map[string]func(interface{}) ([]byte, error){}

func RegisterSerializer(name string, fn func(interface{}) ([]byte, error)) {
    serializerMap[name] = fn
}

func Serialize(data interface{}, format string) ([]byte, error) {
    fn, ok := serializerMap[format]
    if !ok {
        return nil, fmt.Errorf("no serializer for %s", format)
    }
    return fn(data)
}

func init() {
    RegisterSerializer("json", func(v interface{}) ([]byte, error) {
        return json.Marshal(v)
    })
    RegisterSerializer("xml", func(v interface{}) ([]byte, error) {
        return xml.Marshal(v)
    })
    RegisterSerializer("protobuf", func(v interface{}) ([]byte, error) {
        // complex protobuf logic
        return nil, nil
    })
    RegisterSerializer("avro", func(v interface{}) ([]byte, error) {
        // avro schema + encode
        return nil, nil
    })
    // Adding new formats requires modifying init() or calling Register
}`,
  ground_truth: {
    pattern: 'Strategy',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-callback-table']
});

// ── Strategy anti cases (3) ──────────────────────────────────────────

writeCase('strategy-anti-001', {
  id: 'strategy-anti-001',
  pattern: 'Strategy',
  category: 'anti',
  complexity: 'low',
  language: 'Python',
  source_code: `class Greeter:
    def greet(self, formality, name):
        if formality == 'formal':
            return f"Good day, {name}."
        else:
            return f"Hey, {name}!"`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['only-one-variant', 'stateless-trivial-algorithm'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Only 2 branches with trivial logic. A simple function parameter suffices.'
});

writeCase('strategy-anti-002', {
  id: 'strategy-anti-002',
  pattern: 'Strategy',
  category: 'anti',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `abstract class Shape {
  abstract draw(renderer: Canvas): void;
  abstract area(): number;
  abstract perimeter(): number;
}

class Circle extends Shape {
  constructor(private radius: number) { super(); }
  draw(r: Canvas) { r.circle(0, 0, this.radius); }
  area() { return Math.PI * this.radius ** 2; }
  perimeter() { return 2 * Math.PI * this.radius; }
}

class Rectangle extends Shape {
  constructor(private w: number, private h: number) { super(); }
  draw(r: Canvas) { r.rect(0, 0, this.w, this.h); }
  area() { return this.w * this.h; }
  perimeter() { return 2 * (this.w + this.h); }
}`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['replace-simple-polymorphism'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Already has reasonable polymorphism via Shape abstract class. Strategy would just move methods to a parallel interface with no added value.'
});

writeCase('strategy-anti-003', {
  id: 'strategy-anti-003',
  pattern: 'Strategy',
  category: 'anti',
  complexity: 'low',
  language: 'Go',
  source_code: `func processOrder(order Order) {
    total := calculateTotal(order.Items)
    total = applyDiscount(total, order.DiscountPercent)
    tax := calculateTax(total, order.Region)
    final := total + tax
    chargeCustomer(order.CustomerID, final)
}`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['stateless-trivial-algorithm'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Sequential pure function calls with no branching on type. No Strategy needed - each function is already a standalone operation.'
});

// ── Observer fit cases (10) ──────────────────────────────────────────

writeCase('observer-fit-001', {
  id: 'observer-fit-001',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `class StockTicker {
  private listeners: Array<(price: number) => void> = [];

  addListener(fn: (price: number) => void) {
    this.listeners.push(fn);
  }

  onPriceUpdate(symbol: string, price: number) {
    for (const fn of this.listeners) {
      fn(price);
    }
  }
}

// Usage: multiple systems need the price update
ticker.addListener(price => chart.redraw(price));
ticker.addListener(price => alertSystem.checkThreshold(price));
ticker.addListener(price => auditLog.record(symbol, price));
ticker.addListener(price => portfolio.recalculate(symbol, price));`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-listener-list']
});

writeCase('observer-fit-002', {
  id: 'observer-fit-002',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'medium',
  language: 'Python',
  source_code: `import time

class SensorReader:
    def __init__(self):
        self.last_temp = None
        self.last_humidity = None

    def read_loop(self):
        while True:
            temp = self._read_temperature()
            humidity = self._read_humidity()
            time.sleep(1)

    def _read_temperature(self):
        # read from hardware
        return 23.5

    def _read_humidity(self):
        # read from hardware
        return 45.0

# Consumer: polling instead of being notified
class DisplayPanel:
    def __init__(self, sensor: SensorReader):
        self.sensor = sensor

    def update_loop(self):
        last = None
        while True:
            if self.sensor.last_temp != last:
                self.render(self.sensor.last_temp)
                last = self.sensor.last_temp
            time.sleep(0.5)

class DataLogger:
    def __init__(self, sensor: SensorReader):
        self.sensor = sensor

    def poll_loop(self):
        last_temp = None
        while True:
            if self.sensor.last_temp != last_temp:
                self.log(self.sensor.last_temp)
                last_temp = self.sensor.last_temp
            time.sleep(0.5)`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['polling-for-state-change']
});

writeCase('observer-fit-003', {
  id: 'observer-fit-003',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'low',
  language: 'Go',
  source_code: `type EventBus struct {
    handlers []func(string, interface{})
}

func (eb *EventBus) Subscribe(fn func(string, interface{})) {
    eb.handlers = append(eb.handlers, fn)
}

func (eb *EventBus) Emit(event string, data interface{}) {
    for _, handler := range eb.handlers {
        handler(event, data)
    }
}

// Direct usage scattered across the codebase
bus := &EventBus{}
bus.Subscribe(func(evt string, data interface{}) {
    fmt.Printf("[LOG] %s: %v\\n", evt, data)
})
bus.Subscribe(func(evt string, data interface{}) {
    metrics.Increment(evt)
})
bus.Subscribe(func(evt string, data interface{}) {
    cache.Invalidate(evt)
})
bus.Subscribe(func(evt string, data interface{}) {
    webhook.Notify(evt, data)
})`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-listener-list']
});

writeCase('observer-fit-004', {
  id: 'observer-fit-004',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `class OrderService {
  private logger = new Logger();
  private notifier = new EmailNotifier();
  private analytics = new AnalyticsTracker();
  private inventory = new InventoryManager();

  placeOrder(order: Order): void {
    // ... business logic ...
    this.saveToDb(order);

    // Direct calls to specific consumers - tight coupling
    this.logger.logOrder(order);
    this.notifier.sendConfirmation(order.customerEmail, order.id);
    this.analytics.trackPurchase(order.total, order.items);
    this.inventory.reserveStock(order.items);
  }
}

// Adding a new consumer (e.g., SMS notifier, fraud checker)
// requires modifying OrderService.placeOrder() directly.`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['tight-coupling-on-notification']
});

writeCase('observer-fit-005', {
  id: 'observer-fit-005',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'high',
  language: 'Python',
  source_code: `class GameState:
    def __init__(self):
        self._health = 100
        self._score = 0
        self._listeners = []

    def add_listener(self, fn):
        self._listeners.append(fn)

    @property
    def health(self):
        return self._health

    @health.setter
    def health(self, value):
        self._health = value
        for fn in self._listeners:
            fn('health', value)

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        self._score = value
        for fn in self._listeners:
            fn('score', value)

# Multiple UI elements and systems react to state changes
state = GameState()
state.add_listener(lambda prop, val: hud.update_health(val) if prop == 'health' else None)
state.add_listener(lambda prop, val: scoreboard.show(val) if prop == 'score' else None)
state.add_listener(lambda prop, val: achievement.check(val) if prop == 'score' else None)
state.add_listener(lambda prop, val: sound.play_hurt() if prop == 'health' and val < 30 else None)
state.add_listener(lambda prop, val: network.sync(prop, val))`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-listener-list']
});

writeCase('observer-fit-006', {
  id: 'observer-fit-006',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'medium',
  language: 'Go',
  source_code: `type ConfigManager struct {
    current Config
    watchers []func(Config)
}

func (cm *ConfigManager) Update(newCfg Config) {
    cm.current = newCfg
    for _, w := range cm.watchers {
        w(newCfg)
    }
}

func (cm *ConfigManager) Watch(fn func(Config)) {
    cm.watchers = append(cm.watchers, fn)
}

// Each service polls config or registers a watcher
cm.Watch(func(cfg Config) {
    dbPool.SetMaxConnections(cfg.MaxDBConn)
})
cm.Watch(func(cfg Config) {
    cache.SetTTL(cfg.CacheTTL)
})
cm.Watch(func(cfg Config) {
    logger.SetLevel(cfg.LogLevel)
})
cm.Watch(func(cfg Config) {
    rateLimit.SetLimit(cfg.RateLimit)
})`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-listener-list']
});

writeCase('observer-fit-007', {
  id: 'observer-fit-007',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'high',
  language: 'TypeScript',
  source_code: `class TaskRunner {
  private running = true;

  async run(task: Task): Promise<void> {
    this.saveStatus(task.id, 'running');

    while (this.running) {
      const progress = await this.executeStep(task);
      this.saveProgress(task.id, progress);

      // UI has to poll the DB to see progress
      await sleep(1000);
    }

    this.saveStatus(task.id, 'completed');
    this.notifyCompletion(task); // only one direct notification
  }
}

// Frontend polls every 2 seconds to check progress
class TaskDashboard {
  startPolling(taskId: string) {
    setInterval(async () => {
      const progress = await fetch(\`/api/tasks/\${taskId}/progress\`);
      this.updateBar(await progress.json());
    }, 2000);
  }
}

class TaskAlerts {
  startPolling(taskId: string) {
    setInterval(async () => {
      const status = await fetch(\`/api/tasks/\${taskId}/status\`);
      if ((await status.json()).status === 'completed') {
        this.showNotification('Task done!');
      }
    }, 2000);
  }
}`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['polling-for-state-change']
});

writeCase('observer-fit-008', {
  id: 'observer-fit-008',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'low',
  language: 'Python',
  source_code: `class TemperatureSensor:
    def __init__(self):
        self._observers = []

    def add_observer(self, callback):
        self._observers.append(callback)

    def temperature_changed(self, new_temp):
        for obs in self._observers:
            obs(new_temp)

# Multiple consumers need to react
sensor = TemperatureSensor()
sensor.add_observer(lambda t: display.update(t))
sensor.add_observer(lambda t: database.insert(t))
sensor.add_observer(lambda t: alarm.check(t))`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-listener-list']
});

writeCase('observer-fit-009', {
  id: 'observer-fit-009',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'medium',
  language: 'Go',
  source_code: `type FileWatcher struct {
    callbacks []func(fsnotify.Event)
}

func (fw *FileWatcher) OnChange(fn func(fsnotify.Event)) {
    fw.callbacks = append(fw.callbacks, fn)
}

func (fw *FileWatcher) handleEvent(event fsnotify.Event) {
    for _, cb := range fw.callbacks {
        cb(event)
    }
}

watcher := &FileWatcher{}
watcher.OnChange(func(e fsnotify.Event) {
    compiler.Rebuild(e.Name)
})
watcher.OnChange(func(e fsnotify.Event) {
    linter.Check(e.Name)
})
watcher.OnChange(func(e fsnotify.Event) {
    testRunner.RunAffected(e.Name)
})`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['manual-listener-list']
});

writeCase('observer-fit-010', {
  id: 'observer-fit-010',
  pattern: 'Observer',
  category: 'fit',
  complexity: 'high',
  language: 'TypeScript',
  source_code: `class UserService {
  constructor(
    private emailService: EmailService,
    private analytics: AnalyticsService,
    private auditLog: AuditLogService,
    private cache: CacheService,
    private search: SearchIndexer,
  ) {}

  async createUser(data: UserData): Promise<User> {
    const user = await this.db.insert(data);

    // Tightly coupled to each service
    await this.emailService.sendWelcome(user.email, user.name);
    this.analytics.track('user_created', { id: user.id });
    this.auditLog.record('user.create', user.id, data);
    this.cache.invalidate('users');
    this.search.index('users', user);

    return user;
  }

  async deactivateUser(id: string): Promise<void> {
    await this.db.update(id, { active: false });

    // Must remember to notify all the same services
    await this.emailService.sendGoodbye(/*...*/);
    this.analytics.track('user_deactivated', { id });
    this.auditLog.record('user.deactivate', id);
    this.cache.invalidate('users');
    this.search.remove('users', id);
  }
}`,
  ground_truth: {
    pattern: 'Observer',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['tight-coupling-on-notification']
});

// ── Observer anti cases (3) ──────────────────────────────────────────

writeCase('observer-anti-001', {
  id: 'observer-anti-001',
  pattern: 'Observer',
  category: 'anti',
  complexity: 'low',
  language: 'Python',
  source_code: `class PaymentGateway:
    def charge(self, amount):
        result = self.stripe.charge(amount)
        self.db.save_transaction(result)
        return result

# Only one thing happens after charging: save to DB
# No need for observer/listener pattern`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['only-one-listener'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Only one consumer (DB save). Observer adds unnecessary complexity for a single direct call.'
});

writeCase('observer-anti-002', {
  id: 'observer-anti-002',
  pattern: 'Observer',
  category: 'anti',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `import { EventEmitter } from 'events';

class DataPipeline extends EventEmitter {}

const pipeline = new DataPipeline();

pipeline.on('data', (chunk) => transform(chunk));
pipeline.on('data', (chunk) => validate(chunk));
pipeline.on('data', (chunk) => store(chunk));

// B must run after A completes, but EventEmitter gives no ordering guarantee
// If validation fails, transform should not have run yet
// Need Mediator or sequential pipeline, not Observer`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['event-order-dependency'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Processing steps have causal ordering dependencies. Observer does not guarantee notification order. A pipeline/mediator pattern is more appropriate.'
});

writeCase('observer-anti-003', {
  id: 'observer-anti-003',
  pattern: 'Observer',
  category: 'anti',
  complexity: 'low',
  language: 'Go',
  source_code: `func main() {
    cfg := config.Load("config.yaml")
    db := database.Connect(cfg.DB)
    server := api.New(cfg, db)
    server.Run()
}

// Application startup with deterministic init order
// Each step depends on the previous one completing
// No dynamic listeners needed - fixed init sequence`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['only-one-listener', 'replace-existing-event-system'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Deterministic startup sequence with fixed dependencies. No dynamic listeners needed, and Go channels could handle any future async needs.'
});

// ── Factory Method fit cases (10) ────────────────────────────────────

writeCase('factory-method-fit-001', {
  id: 'factory-method-fit-001',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `class DocumentProcessor {
  createParser(format: string): IParser {
    if (format === 'json') {
      return new JsonParser();
    } else if (format === 'xml') {
      return new XmlParser();
    } else if (format === 'yaml') {
      return new YamlParser();
    } else if (format === 'csv') {
      return new CsvParser();
    } else if (format === 'toml') {
      return new TomlParser();
    }
    throw new Error(\`Unsupported format: \${format}\`);
  }

  process(content: string, format: string): Document {
    const parser = this.createParser(format);
    return parser.parse(content);
  }
}`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['conditional-construction']
});

writeCase('factory-method-fit-002', {
  id: 'factory-method-fit-002',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'medium',
  language: 'Python',
  source_code: `class DatabaseService:
    def __init__(self, config):
        self.config = config
        # Directly creates concrete type based on config
        if config.db_type == 'postgres':
            self.connection = PostgresConnection(config.host, config.port)
        elif config.db_type == 'mysql':
            self.connection = MySqlConnection(config.host, config.port)
        elif config.db_type == 'sqlite':
            self.connection = SqliteConnection(config.path)
        elif config.db_type == 'mongodb':
            self.connection = MongoConnection(config.uri)

        # Also directly creates logger - too many responsibilities
        self.logger = FileLogger(config.log_path)
        self.metrics = PrometheusMetrics(config.metrics_url)

    def query(self, sql):
        result = self.connection.execute(sql)
        self.logger.log(sql)
        self.metrics.record('query')
        return result`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['conditional-construction', 'constructor-knows-too-much']
});

writeCase('factory-method-fit-003', {
  id: 'factory-method-fit-003',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'medium',
  language: 'Go',
  source_code: `func NewExporter(format string, config Config) (Exporter, error) {
    switch format {
    case "pdf":
        return NewPdfExporter(config.TemplatePath, config.FontDir, config.Logo), nil
    case "xlsx":
        return NewXlsxExporter(config.StyleSheet), nil
    case "csv":
        return NewCsvExporter(config.Delimiter), nil
    case "docx":
        return NewDocxExporter(config.TemplatePath), nil
    default:
        return nil, fmt.Errorf("unsupported export format: %s", format)
    }
}`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['conditional-construction']
});

writeCase('factory-method-fit-004', {
  id: 'factory-method-fit-004',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `abstract class NotificationSender {
  abstract send(recipient: string, message: string): void;

  // High-level code directly instantiates concrete dependencies
  createTransport(): Transport {
    if (this.config.useQueue) {
      return new RabbitMqTransport(this.config.queueUrl);
    } else {
      return new SmtpTransport(this.config.smtpHost, this.config.smtpPort);
    }
  }
}`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['new-concrete-in-interface']
});

writeCase('factory-method-fit-005', {
  id: 'factory-method-fit-005',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'high',
  language: 'Python',
  source_code: `class PluginManager:
    def __init__(self, plugin_dir):
        self.plugins = {}
        self.logger = FileLogger("plugins.log")  # hardcoded concrete
        self.loader = YamlLoader(plugin_dir)       # hardcoded concrete
        self.validator = SchemaValidator()          # hardcoded concrete

        for name in self.loader.discover():
            plugin = self._create_plugin(name)
            if self.validator.validate(plugin):
                self.plugins[name] = plugin
                self.logger.info(f"Loaded plugin: {name}")

    def _create_plugin(self, name):
        if name.endswith('.py'):
            return PythonPlugin(name)
        elif name.endswith('.js'):
            return JavaScriptPlugin(name)
        elif name.endswith('.wasm'):
            return WasmPlugin(name)
        else:
            return NativePlugin(name)

    def execute(self, name, *args):
        return self.plugins[name].run(*args)`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['new-concrete-in-interface', 'conditional-construction', 'constructor-knows-too-much']
});

writeCase('factory-method-fit-006', {
  id: 'factory-method-fit-006',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'medium',
  language: 'Go',
  source_code: `type AuthService struct {
    provider Provider
    logger   *zap.Logger
    cache    Cache
}

func NewAuthService(cfg Config) *AuthService {
    var provider Provider
    switch cfg.Provider {
    case "google":
        provider = NewGoogleProvider(cfg.ClientID, cfg.ClientSecret)
    case "github":
        provider = NewGithubProvider(cfg.ClientID, cfg.ClientSecret)
    case "microsoft":
        provider = NewMicrosoftProvider(cfg.TenantID, cfg.ClientID)
    default:
        provider = NewLocalProvider(cfg.UserStore)
    }

    return &AuthService{
        provider: provider,
        logger:   zap.NewProduction(),    // hardcoded concrete
        cache:    NewRedisCache(cfg.Redis), // hardcoded concrete
    }
}`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['conditional-construction', 'new-concrete-in-interface']
});

writeCase('factory-method-fit-007', {
  id: 'factory-method-fit-007',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'low',
  language: 'Python',
  source_code: `class LoggerFactory:
    _loggers = {}

    @staticmethod
    def create_logger(name, level="INFO"):
        if name in LoggerFactory._loggers:
            return LoggerFactory._loggers[name]

        if name == "app":
            logger = FileLogger("app.log", level)
        elif name == "access":
            logger = FileLogger("access.log", level)
        elif name == "error":
            logger = RemoteLogger("errors.example.com", level)
        elif name == "audit":
            logger = DatabaseLogger(level)
        else:
            logger = ConsoleLogger(level)

        LoggerFactory._loggers[name] = logger
        return logger`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['conditional-construction']
});

writeCase('factory-method-fit-008', {
  id: 'factory-method-fit-008',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `class ConnectionPool {
  private pool: Map<string, Connection> = new Map();

  constructor(private config: PoolConfig) {}

  getConnection(dbType: string): Connection {
    if (this.pool.has(dbType)) {
      return this.pool.get(dbType)!;
    }

    let conn: Connection;
    switch (dbType) {
      case 'read-replica':
        conn = new PostgresConnection(this.config.readReplicaUrl);
        break;
      case 'write-primary':
        conn = new PostgresConnection(this.config.writePrimaryUrl);
        break;
      case 'analytics':
        conn = new ClickhouseConnection(this.config.analyticsUrl);
        break;
      case 'cache':
        conn = new RedisConnection(this.config.cacheUrl);
        break;
    }

    this.pool.set(dbType, conn);
    return conn;
  }
}`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['conditional-construction']
});

writeCase('factory-method-fit-009', {
  id: 'factory-method-fit-009',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'high',
  language: 'Go',
  source_code: `type HandlerFactory struct {
    middleware []Middleware
    logger    *zap.Logger
}

func (hf *HandlerFactory) CreateHandler(route string) http.Handler {
    var handler http.Handler

    switch route {
    case "/api/users":
        db := postgres.New(hf.dbURL)     // creates concrete in factory
        repo := users.NewRepository(db)
        service := users.NewService(repo)
        handler = users.NewHandler(service)
    case "/api/orders":
        db := mysql.New(hf.dbURL)        // different concrete
        repo := orders.NewRepository(db)
        service := orders.NewService(repo)
        handler = orders.NewHandler(service)
    case "/api/products":
        cache := redis.New(hf.cacheURL)  // creates concrete in factory
        repo := products.NewCachedRepo(cache)
        service := products.NewService(repo)
        handler = products.NewHandler(service)
    }

    for i := len(hf.middleware) - 1; i >= 0; i-- {
        handler = hf.middleware[i](handler)
    }
    return handler
}`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['new-concrete-in-interface', 'conditional-construction']
});

writeCase('factory-method-fit-010', {
  id: 'factory-method-fit-010',
  pattern: 'FactoryMethod',
  category: 'fit',
  complexity: 'low',
  language: 'Python',
  source_code: `class ReportGenerator:
    def generate(self, data, output_format):
        if output_format == 'html':
            renderer = HtmlRenderer()
            template = HtmlTemplate("report.html")
        elif output_format == 'pdf':
            renderer = PdfRenderer()
            template = PdfTemplate("report.pdf")
        elif output_format == 'markdown':
            renderer = MarkdownRenderer()
            template = MdTemplate("report.md")

        styled = renderer.apply_style(data, template)
        return renderer.render(styled)`,
  ground_truth: {
    pattern: 'FactoryMethod',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['conditional-construction']
});

// ── Factory Method anti cases (2) ────────────────────────────────────

writeCase('factory-method-anti-001', {
  id: 'factory-method-anti-001',
  pattern: 'FactoryMethod',
  category: 'anti',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `class AppConfig {
  private static instance: AppConfig;

  private constructor() {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }
}

// Singleton - not a factory method scenario
// Only one concrete type (AppConfig itself), no product family`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['only-one-product-variant', 'creation-logic-is-trivial'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Only one product type (AppConfig) with trivial construction. Factory Method is overkill.'
});

writeCase('factory-method-anti-002', {
  id: 'factory-method-anti-002',
  pattern: 'FactoryMethod',
  category: 'anti',
  complexity: 'medium',
  language: 'Go',
  source_code: `func NewUser(name, email string) *User {
    return &User{
        ID:    uuid.New().String(),
        Name:  name,
        Email: email,
    }
}

// Simple constructor function - no need for factory method pattern
// One product type, no inheritance, no decision logic`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['only-one-product-variant', 'creation-logic-is-trivial'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Simple constructor function for a single type. No conditional creation, no product hierarchy. Static factory function suffices.'
});

// ── Adapter fit cases (10) ───────────────────────────────────────────

writeCase('adapter-fit-001', {
  id: 'adapter-fit-001',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `// Your system expects this interface
interface IUserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

// Third-party SDK you can't modify
class ThirdPartyUserSDK {
  getUser(userId: string): Promise<{ user_id: string; full_name: string; mail: string }> {
    // API call to third-party service
  }
  updateUser(payload: { user_id: string; full_name: string; mail: string }): Promise<void> {
    // API call
  }
}

// Current approach: inline translation at every call site
class UserService {
  constructor(private sdk: ThirdPartyUserSDK) {}

  async getUser(id: string): Promise<User> {
    const raw = await this.sdk.getUser(id);
    return { id: raw.user_id, name: raw.full_name, email: raw.mail };
  }

  async save(user: User): Promise<void> {
    await this.sdk.updateUser({
      user_id: user.id,
      full_name: user.name,
      mail: user.email
    });
  }
}`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['incompatible-interface-shape']
});

writeCase('adapter-fit-002', {
  id: 'adapter-fit-002',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'medium',
  language: 'Python',
  source_code: `# Legacy system uses callbacks
class LegacyPaymentGateway:
    def charge(self, amount, on_success, on_failure):
        try:
            result = self._call_api(amount)
            on_success(result)
        except Exception as e:
            on_failure(str(e))

# New system expects async/await with Result type
class PaymentResult:
    def __init__(self, success, transaction_id=None, error=None):
        self.success = success
        self.transaction_id = transaction_id
        self.error = error

# Current code: glue scattered everywhere
class CheckoutService:
    def process_payment(self, amount):
        result_holder = {'value': None}

        def on_success(tx_id):
            result_holder['value'] = PaymentResult(True, tx_id)

        def on_failure(err):
            result_holder['value'] = PaymentResult(False, error=err)

        self.gateway.charge(amount, on_success, on_failure)
        return result_holder['value']

    def refund(self, amount):
        result_holder = {'value': None}

        def on_success(tx_id):
            result_holder['value'] = PaymentResult(True, tx_id)

        def on_failure(err):
            result_holder['value'] = PaymentResult(False, error=err)

        self.gateway.charge(-amount, on_success, on_failure)
        return result_holder['value']`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['glue-code-accumulation']
});

writeCase('adapter-fit-003', {
  id: 'adapter-fit-003',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'low',
  language: 'Go',
  source_code: `// Your logger interface
type Logger interface {
    Info(msg string, fields ...Field)
    Error(msg string, fields ...Field)
}

// Third-party library you can't modify
type ZapLogger struct {
    inner *zap.SugaredLogger
}

func (z *ZapLogger) Infof(template string, args ...interface{}) {
    z.inner.Infof(template, args...)
}

func (z *ZapLogger) Warnf(template string, args ...interface{}) {
    z.inner.Warnf(template, args...)
}

// Every call site does this translation
func (s *Service) DoWork() {
    fields := []Field{{Key: "request_id", Value: s.reqID}}
    // Can't pass ZapLogger where Logger is expected
    // Must manually adapt at each usage
    s.zapLogger.Infof("request_id=%s operation=do_work", s.reqID)
}`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['incompatible-interface-shape']
});

writeCase('adapter-fit-004', {
  id: 'adapter-fit-004',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `// Third-party weather API you can't modify
class OpenWeatherClient {
  async getCurrentWeather(city: string): Promise<{
    weather: Array<{ main: string; description: string }>;
    main: { temp: number; humidity: number; pressure: number };
    wind: { speed: number; deg: number };
    dt: number;
  }> { /* ... */ }
}

// Your system expects this shape
interface WeatherReport {
  temperature: number;
  conditions: string;
  windSpeed: number;
  timestamp: Date;
}

// Translation code scattered across 3 services
class WeatherDashboard {
  constructor(private client: OpenWeatherClient) {}

  async getReport(city: string): Promise<WeatherReport> {
    const raw = await this.client.getCurrentWeather(city);
    return {
      temperature: raw.main.temp,
      conditions: raw.weather[0]?.main ?? 'unknown',
      windSpeed: raw.wind.speed,
      timestamp: new Date(raw.dt * 1000),
    };
  }
}

class WeatherAlerts {
  constructor(private client: OpenWeatherClient) {}

  async checkAlerts(city: string) {
    const raw = await this.client.getCurrentWeather(city);
    const temp = raw.main.temp;
    const wind = raw.wind.speed;
    // duplicated field mapping
    if (temp > 40) this.alert('Heat warning');
    if (wind > 20) this.alert('Wind warning');
  }
}`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['glue-code-accumulation', 'defensive-wrapper-at-boundary']
});

writeCase('adapter-fit-005', {
  id: 'adapter-fit-005',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'high',
  language: 'Python',
  source_code: `# External REST API returns XML (you can't change it)
class LegacyCRMClient:
    def get_customer(self, customer_id):
        xml = self._http_get(f"/customers/{customer_id}")
        root = ET.fromstring(xml)
        return {
            'id': root.find('CustomerID').text,
            'name': root.find('FullName').text,
            'email': root.find('EmailAddress').text,
            'phone': root.find('PhoneNumber').text,
        }

    def update_customer(self, data):
        xml = f'''<Customer>
            <CustomerID>{data['id']}</CustomerID>
            <FullName>{data['name']}</FullName>
            <EmailAddress>{data['email']}</EmailAddress>
            <PhoneNumber>{data['phone']}</PhoneNumber>
        </Customer>'''
        self._http_put(f"/customers/{data['id']}", xml)

# Your system uses Customer objects with snake_case attributes
# Translation between dict<->xml scattered in every service that touches CRM
class CustomerService:
    def sync_from_crm(self, customer_id):
        raw = self.crm.get_customer(customer_id)
        customer = Customer(
            external_id=raw['id'],
            display_name=raw['name'],
            contact_email=raw['email'],
            phone_number=raw['phone'],
        )
        self.db.save(customer)

    def push_to_crm(self, customer):
        self.crm.update_customer({
            'id': customer.external_id,
            'name': customer.display_name,
            'email': customer.contact_email,
            'phone': customer.phone_number,
        })`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['incompatible-interface-shape', 'glue-code-accumulation', 'defensive-wrapper-at-boundary']
});

writeCase('adapter-fit-006', {
  id: 'adapter-fit-006',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'medium',
  language: 'Go',
  source_code: `// Your cache interface
type Cache interface {
    Get(ctx context.Context, key string) (string, error)
    Set(ctx context.Context, key string, value string, ttl time.Duration) error
}

// Third-party Redis client (can't modify)
type RedisClient struct { /* ... */ }

func (r *RedisClient) Do(ctx context.Context, cmd string, args ...interface{}) (interface{}, error) {
    // raw Redis command
}

// Every caller writes this wrapper differently
type UserService struct {
    redis *RedisClient
}

func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    val, err := s.redis.Do(ctx, "GET", "user:"+id)
    if err != nil {
        return nil, err
    }
    if val == nil {
        return nil, ErrNotFound
    }
    var user User
    json.Unmarshal(val.([]byte), &user)
    return &user, nil
}`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['defensive-wrapper-at-boundary', 'incompatible-interface-shape']
});

writeCase('adapter-fit-007', {
  id: 'adapter-fit-007',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `// New API returns Promises
class ModernSearchAPI {
  async search(query: string): Promise<{ hits: SearchResult[]; total: number }> {
    // returns Promise-based results
  }
}

// Old code expects callbacks
type SearchCallback = (results: SearchResult[], err?: Error) => void;

// Bridge code at every call site
class SearchFeature {
  constructor(private api: ModernSearchAPI) {}

  legacySearch(query: string, callback: SearchCallback) {
    this.api.search(query)
      .then(res => callback(res.hits))
      .catch(err => callback([], err));
  }

  anotherSearch(query: string, callback: SearchCallback) {
    this.api.search(query)
      .then(res => callback(res.hits))
      .catch(err => callback([], err));
  }
}`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['glue-code-accumulation']
});

writeCase('adapter-fit-008', {
  id: 'adapter-fit-008',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'high',
  language: 'Python',
  source_code: `# Third-party analytics SDK (can't modify)
class ThirdPartyAnalytics:
    def track_event(self, event_name, properties=None, user_id=None, timestamp=None):
        """Sends event via HTTP POST, returns raw response dict"""
        pass

    def identify(self, user_id, traits=None):
        """Identifies user with traits dict"""
        pass

    def page_view(self, page_name, url=None, referrer=None):
        """Tracks page view"""
        pass

# Your system uses typed event objects
@dataclass
class AnalyticsEvent:
    name: str
    properties: dict
    user_id: str
    occurred_at: datetime

@dataclass
class PageViewEvent:
    page: str
    url: str
    referrer: str
    user_id: str

# Every service writes its own translation
class CheckoutAnalytics:
    def track_purchase(self, order):
        self.analytics.track_event(
            event_name='purchase_completed',
            properties={'order_id': order.id, 'total': order.total},
            user_id=order.customer_id,
            timestamp=order.completed_at.isoformat()
        )

class UserAnalytics:
    def track_signup(self, user):
        self.analytics.track_event(
            event_name='user_registered',
            properties={'plan': user.plan, 'source': user.referral_source},
            user_id=user.id,
            timestamp=datetime.now().isoformat()
        )

    def track_page(self, user, page, url):
        self.analytics.page_view(
            page_name=page,
            url=url,
            referrer=user.last_referrer
        )`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['defensive-wrapper-at-boundary', 'glue-code-accumulation']
});

writeCase('adapter-fit-009', {
  id: 'adapter-fit-009',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'medium',
  language: 'Go',
  source_code: `// Your system's message interface
type MessageQueue interface {
    Publish(topic string, payload []byte) error
    Subscribe(topic string, handler func([]byte)) error
}

// AWS SQS client (can't modify interface)
type SQSClient struct { /* ... */ }

func (s *SQSClient) SendMessage(queueURL string, body string) (*SendMessageOutput, error) {
    return nil, nil
}

func (s *SQSClient) ReceiveMessage(queueURL string) (*ReceiveMessageOutput, error) {
    return nil, nil
}

// Adapter needed: topic->queueURL, []byte->string, Publish->SendMessage
// Currently inlined at each usage
type OrderProcessor struct {
    sqs *SQSClient
}

func (op *OrderProcessor) PublishOrder(order Order) error {
    data, _ := json.Marshal(order)
    _, err := op.sqs.SendMessage("https://sqs.us-east-1.amazonaws.com/123/orders", string(data))
    return err
}

func (op *OrderProcessor) ProcessOrders() {
    out, _ := op.sqs.ReceiveMessage("https://sqs.us-east-1.amazonaws.com/123/orders")
    for _, msg := range out.Messages {
        var order Order
        json.Unmarshal([]byte(msg.Body), &order)
        op.Handle(order)
    }
}`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['incompatible-interface-shape', 'defensive-wrapper-at-boundary']
});

writeCase('adapter-fit-010', {
  id: 'adapter-fit-010',
  pattern: 'Adapter',
  category: 'fit',
  complexity: 'low',
  language: 'TypeScript',
  source_code: `// Your system's date utility expects ISO 8601 strings
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString();
}

// Third-party API returns dates in epoch milliseconds
interface ThirdPartyEvent {
  event_name: string;
  event_time_ms: number;  // epoch millis
  metadata: Record<string, unknown>;
}

// Translation at call site
class EventDisplay {
  showEvent(event: ThirdPartyEvent): string {
    const isoDate = new Date(event.event_time_ms).toISOString();
    return \`\${event.event_name} at \${formatDate(isoDate)}\`;
  }
}`,
  ground_truth: {
    pattern: 'Adapter',
    anti_patterns: [],
    refactoring_steps_valid: true
  },
  expected_smells: ['incompatible-interface-shape']
});

// ── Adapter anti cases (2) ───────────────────────────────────────────

writeCase('adapter-anti-001', {
  id: 'adapter-anti-001',
  pattern: 'Adapter',
  category: 'anti',
  complexity: 'low',
  language: 'Python',
  source_code: `class UserAdapter:
    def to_dict(self, user):
        return {
            'name': user.name,
            'email': user.email,
        }

# Both sides are our own code. Just use the User object directly
# or define a consistent to_dict() method on User itself.`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['both-sides-are-yours', 'trivial-field-mapping'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'Both interfaces belong to the same codebase. Direct method or consistent naming is simpler than an adapter layer.'
});

writeCase('adapter-anti-002', {
  id: 'adapter-anti-002',
  pattern: 'Adapter',
  category: 'anti',
  complexity: 'medium',
  language: 'TypeScript',
  source_code: `class SubsystemA {
  operation1() { return 'A1'; }
  operation2() { return 'A2'; }
  operation3() { return 'A3'; }
  operation4() { return 'A4'; }
  operation5() { return 'A5'; }
}

class SubsystemB {
  method1() { return 'B1'; }
  method2() { return 'B2'; }
  method3() { return 'B3'; }
}

class SubsystemC {
  doThing() { return 'C1'; }
  doOther() { return 'C2'; }
}

// Client struggles with too many interfaces - wants one simple API
class Client {
  constructor(
    private a: SubsystemA,
    private b: SubsystemB,
    private c: SubsystemC
  ) {}

  doWork() {
    this.a.operation1();
    this.b.method2();
    this.c.doThing();
  }
}`,
  ground_truth: {
    pattern: 'none',
    anti_patterns: ['facade-would-be-better'],
    refactoring_steps_valid: false
  },
  expected_smells: [],
  anti_reason: 'The problem is too many interfaces to manage (complexity), not incompatible interface shapes. Facade is the right pattern here.'
});

// ── Summary ──────────────────────────────────────────────────────────

const summary = {
  total: 50,
  patterns: {
    Strategy: { fit: 10, anti: 3 },
    Observer: { fit: 10, anti: 3 },
    FactoryMethod: { fit: 10, anti: 2 },
    Adapter: { fit: 10, anti: 2 },
  },
  languages: { TypeScript: 0, Python: 0, Go: 0 },
  complexity: { low: 0, medium: 0, high: 0 },
  generated_at: new Date().toISOString(),
};

writeFileSync(resolve(casesDir, 'manifest.json'), JSON.stringify(summary, null, 2) + '\n');

console.log('Generated 50 ground truth cases in evals/cases/');
console.log(`  Strategy: 10 fit + 3 anti = 13`);
console.log(`  Observer: 10 fit + 3 anti = 13`);
console.log(`  Factory Method: 10 fit + 2 anti = 12`);
console.log(`  Adapter: 10 fit + 2 anti = 12`);
console.log(`Total: 50 cases`);
