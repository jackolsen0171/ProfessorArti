# React 19 Documentation

## Core Hooks and State Management

### useState Hook
- **Primary purpose**: Add state variables to functional components
- **Usage**: Must be called at the top level of components or custom hooks
- **Returns**: Array containing current state value and setter function

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1); // ✅ Use setter function, not direct mutation
  }

  return (
    <button onClick={handleClick}>
      You pressed me {count} times
    </button>
  );
}
```

### useReducer Hook
- **Purpose**: Manage complex state logic using reducer function
- **Alternative**: to useState for more complex state scenarios

```javascript
import { useReducer } from 'react';

function reducer(state, action) {
  // reducer logic
}

function MyComponent() {
  const [state, dispatch] = useReducer(reducer, { age: 42 });
  // ...
}
```

### Custom Hooks
- **Independent state**: Each call to custom hook creates separate state
- **Pattern**: Extract repetitive logic into reusable hooks

```javascript
function StatusBar() {
  const isOnline = useOnlineStatus(); // Independent state
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus(); // Independent state
  // ...
}
```

## Component Patterns

### State Lifting
- Move state to common parent when components need to coordinate
- Pass state and setters down as props

```javascript
function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <>
      <Panel isActive={activeIndex === 0} onShow={() => setActiveIndex(0)} />
      <Panel isActive={activeIndex === 1} onShow={() => setActiveIndex(1)} />
    </>
  );
}
```

### Context for Deep State Sharing
- Combine Context with useState for dynamic updates

```javascript
function MyPage() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext value={theme}>
      <Form />
      <Button onClick={() => setTheme('light')}>
        Switch to light theme
      </Button>
    </ThemeContext>
  );
}
```

## Rules of Hooks
1. **Only call hooks at the top level** - Not in loops, conditions, or nested functions
2. **Only call hooks from React functions** - Components or custom hooks, not regular JS functions

```javascript
function Counter() {
  const [count, setCount] = useState(0); // ✅ Top-level in component
  // ...
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth); // ✅ Top-level in custom hook
  // ...
}
```

## Form Handling

### Multiple Form Inputs
```javascript
import { useState } from 'react';

export default function Form() {
  const [firstName, setFirstName] = useState('Mary');
  const [lastName, setLastName] = useState('Poppins');

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
  }

  function handleLastNameChange(e) {
    setLastName(e.target.value);
  }

  return (
    <>
      <label>
        First name:
        <input value={firstName} onChange={handleFirstNameChange} />
      </label>
      <label>
        Last name:
        <input value={lastName} onChange={handleLastNameChange} />
      </label>
      <p><b>Good morning, {firstName} {lastName}.</b></p>
    </>
  );
}
```

## Advanced State Management

### useReducer with Context
- Scale up state management for complex applications
- Combine reducer pattern with Context API

```javascript
const tasks = useTasks();
const dispatch = useTasksDispatch();
```

## Component Purity
- Components must be pure functions
- Don't mutate state directly - always use setter functions
- Side effects go in useEffect, not render

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    // count = count + 1; // 🔴 Never mutate directly
    setCount(count + 1); // ✅ Use setter function
  }

  return (
    <button onClick={handleClick}>
      You pressed me {count} times
    </button>
  );
}
```