# ts-rain canvas 模拟下雨

## 由于 resize 事件可以以较高的速率处罚，因此时间处理程序不应该执行计算开销很大的操作

### 方法 1 requestAnimationFrame + customEvent

```javascript
;(function() {
  const throttle = function(type, name, obj = window) {
    let running = false
    const func = function() {
      if (running) {
        return
      }
      running = true
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name))
        running = false
      })
    }
    obj.addEventListener(type, func)
  }

  // init
  throttle('resize', 'optimizedResize')
})()

window.addEventListener('optimizedResize', function() {
  console.log('Resource conscious resize callback')
})
```

### 方法 2 requestAnimationFrame

```javascript
const optimizedResize = (function() {
  const callbacks = []
  let running = false

  function resize() {
    if (!running) {
      running = true

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks)
      } else {
        setTimeout(runCallbacks, 66)
      }
    }
  }

  function runCallbacks() {
    callbacks.forEach(function(callback) {
      callback()
    })

    running = false
  }

  function addCallback(callback) {
    if (callback) {
      callbacks.push(callback)
    }
  }

  return {
    add: function(callback) {
      if (!callbacks.length) {
        window.addEventListener('resize', resize)
      }
      addCallback(callback)
    }
  }
})()

optimizedResize.add(function() {
  console.log('Resource conscious resize callback!')
})
```
