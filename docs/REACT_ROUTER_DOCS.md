# React Router 7 Documentation

## Core Components

### Router Setup
```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/users/:id" element={<User />} />
      </Routes>
    </Router>
  );
}
```

## Navigation Components

### Link Component
- **Purpose**: Client-side navigation without page reloads
- **Use when**: Simple navigation without active styling needed

```javascript
import { Link } from "react-router";

export function LoggedOutMessage() {
  return (
    <p>
      You've been logged out.{" "}
      <Link to="/login">Login again</Link>
    </p>
  );
}
```

### NavLink Component
- **Purpose**: Navigation links with active state styling
- **Advantage**: Automatically applies active class/styling

```javascript
import { NavLink } from "react-router";

export function MyAppNav() {
  return (
    <nav>
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/trending" end>Trending Concerts</NavLink>
      <NavLink to="/concerts">All Concerts</NavLink>
      <NavLink to="/account">Account</NavLink>
    </nav>
  );
}
```

### Navigate Component
- **Purpose**: Declarative navigation (redirects)
- **Recommendation**: Prefer useNavigate hook over this component
- **Primary use**: Class components where hooks aren't available

```javascript
<Navigate to="/tasks" />

// With additional props
<Navigate 
  to="/login" 
  replace={true} 
  state={{ from: location }} 
/>
```

## Navigation Hooks

### useNavigate Hook
- **Recommended approach** for imperative navigation
- **Use case**: Navigation after form submission, conditional navigation

```javascript
import { useNavigate } from "react-router";

function LoginForm() {
  const navigate = useNavigate();
  
  const handleSubmit = async (formData) => {
    await login(formData);
    navigate('/dashboard');
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Component Routes (Nested)

### Inline Route Definitions
- **Use case**: UI-driven routing within components
- **Limitation**: No data loading or route module features

```javascript
import { Routes, Route } from "react-router";

function Wizard() {
  return (
    <div>
      <h1>Some Wizard with Steps</h1>
      <Routes>
        <Route index element={<StepOne />} />
        <Route path="step-2" element={<StepTwo />} />
        <Route path="step-3" element={<StepThree />} />
      </Routes>
    </div>
  );
}
```

## Forms and Data

### Form Component
- **Purpose**: Handle form submission with navigation
- **Method**: GET submits as URLSearchParams, POST as FormData

```javascript
import { Form } from "react-router";

// Search form (GET request)
<Form action="/search">
  <input type="text" name="q" />
  <button type="submit">Search</button>
</Form>

// Data form (POST request) 
<Form method="post" action="/contacts">
  <input type="text" name="name" />
  <input type="email" name="email" />
  <button type="submit">Create Contact</button>
</Form>
```

## Route Configuration

### File-based Routing
```typescript
import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("contact", "routes/contact.tsx"),
  route("users/:id", "routes/user.tsx"),
] satisfies RouteConfig;
```

## Advanced Components

### Outlet Component
- **Purpose**: Renders matched child route elements
- **Use case**: Layout components with nested routes

```javascript
import { Outlet } from "react-router";

function Layout() {
  return (
    <div>
      <nav>...</nav>
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

### Component API Overview

| Component | Framework | Data Loading | Declarative | Description |
|-----------|-----------|-------------|-------------|-------------|
| Form | ✅ | ✅ | ✅ | HTML form with navigation/data submission |
| Link | ✅ | ✅ | ✅ | Anchor tag with navigation |
| NavLink | ✅ | ✅ | ✅ | Link with active state styling |
| Navigate | ✅ | ✅ | ✅ | Declarative navigation component |
| Outlet | ✅ | ✅ | ✅ | Renders child route elements |
| Route | ✅ | ✅ | ✅ | Route definition |
| Routes | ✅ | ✅ | ✅ | Route container |

## Data Loading

### Route Loaders
- **Timing**: Called before route component renders
- **Purpose**: Pre-load data for route components

```javascript
// In route module
export async function loader({ params }) {
  const user = await getUser(params.id);
  return { user };
}

// In component
export default function User() {
  const { user } = useLoaderData();
  return <div>Hello {user.name}</div>;
}
```

## Navigation Patterns

### Programmatic Navigation
```javascript
const navigate = useNavigate();

// Simple navigation
navigate('/dashboard');

// With state
navigate('/dashboard', { 
  state: { from: location },
  replace: true 
});

// Relative navigation
navigate('../settings');
navigate(-1); // Go back
```

### Conditional Navigation
```javascript
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  return children;
}
```

## Best Practices

### Navigation Recommendations
1. **Use Link/NavLink** for declarative navigation
2. **Use useNavigate** for imperative navigation after actions
3. **Avoid Navigate component** except in class components
4. **Use relative paths** when possible for maintainability

### Performance Considerations
1. **Prefetch routes** with `<Link prefetch>`
2. **Code splitting** at route boundaries
3. **Lazy loading** for large route components

### State Management
- **Route state**: Use location.state for navigation-specific data
- **URL params**: For shareable, bookmarkable data
- **Search params**: For filters and temporary UI state