# Shadcn UI and Tweakcn Theme Integration Guide

## What's Been Set Up

### 1. Shadcn UI Components
Your project now has shadcn/ui fully configured with:
- ✅ `components.json` configuration file
- ✅ Path aliases configured (`@/*` -> `./src/*`)
- ✅ Tailwind CSS with CSS variables for theming
- ✅ Theme Provider for light/dark mode
- ✅ Theme Toggle component

### 2. Dependencies Installed
```json
{
  "dependencies": {
    "@radix-ui/react-icons": "^latest",
    "next-themes": "^latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "shadcn-ui": "^latest",
    "@radix-ui/react-slot": "^latest",
    "tailwindcss-animate": "^latest"
  }
}
```

## Using Shadcn Components

### Adding New Components
To add any shadcn component to your project:

```bash
cd frontend
npx shadcn-ui@latest add [component-name]
```

**Popular components:**
```bash
# Add individual components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add label
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
```

### Using Components in Your Code
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

## Tweakcn Theme Integration

### What is Tweakcn?
Tweakcn is a visual theme editor for shadcn/ui that lets you customize your design system through a web interface.

### How to Use Tweakcn

1. **Visit the Tweakcn Website:**
   Go to [https://tweakcn.com](https://tweakcn.com) or similar shadcn theme editor

2. **Customize Your Theme:**
   - Choose base colors
   - Adjust border radius
   - Configure color scales
   - Preview light and dark modes
   - Export CSS variables

3. **Apply to Your Project:**
   Copy the generated CSS variables and paste them into your `src/index.css` file, replacing the existing `:root` and `.dark` values.

### Current Theme Configuration
Your `index.css` contains:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 142 76% 36%;  /* Green theme for UrbanRoots */
    --primary-foreground: 355.7 100% 97.3%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

### Customizing Your Theme

#### Option 1: Using Tweakcn (Recommended)
1. Visit a theme customizer like [ui.shadcn.com/themes](https://ui.shadcn.com/themes)
2. Adjust colors, radius, and other properties
3. Copy the generated CSS
4. Replace the variables in `frontend/src/index.css`

#### Option 2: Manual Customization
Edit the CSS variables directly in `frontend/src/index.css`:

```css
:root {
  --primary: 142 76% 36%;     /* Change hue, saturation, lightness */
  --radius: 0.5rem;           /* Change border radius globally */
}
```

## Theme Features

### Dark Mode
The theme provider is already configured. Use the `ThemeToggle` component:

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

function Navbar() {
  return (
    <nav>
      {/* Your nav items */}
      <ThemeToggle />
    </nav>
  )
}
```

### Accessing Theme in Components
```tsx
import { useTheme } from "@/components/theme-provider"

function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("system")}>System</button>
    </div>
  )
}
```

## File Structure
```
frontend/
├── components.json              # Shadcn configuration
├── tailwind.config.js           # Tailwind with shadcn setup
├── src/
│   ├── index.css                # Theme CSS variables
│   ├── components/
│   │   ├── theme-provider.tsx   # Theme context provider
│   │   ├── theme-toggle.tsx     # Theme switcher component
│   │   └── ui/                  # Shadcn components go here
│   │       ├── button.tsx
│   │       └── card.tsx
│   └── lib/
│       └── utils.ts             # cn() utility function
```

## Next Steps

1. **Add more components:**
   ```bash
   cd frontend
   npx shadcn-ui@latest add dialog input select form
   ```

2. **Customize your theme:**
   - Visit [ui.shadcn.com/themes](https://ui.shadcn.com/themes)
   - Experiment with colors and styling
   - Copy CSS to `src/index.css`

3. **Use components in your pages:**
   Replace existing components with shadcn components for consistency

4. **Add theme toggle to navigation:**
   Import and use `<ThemeToggle />` in your header/navbar

## Examples

### Creating a Product Card
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>${product.price}</p>
      </CardContent>
      <CardFooter>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}
```

### Form with Shadcn Components
```bash
# First add form components
npx shadcn-ui@latest add form input label
```

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function CheckoutForm() {
  return (
    <form>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="John Doe" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="john@example.com" />
        </div>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}
```

## Resources
- [Shadcn UI Docs](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/examples)
- [Theme Customization](https://ui.shadcn.com/themes)
- [Radix UI (underlying primitives)](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

## Troubleshooting

### Component not found error
Make sure you've added the component:
```bash
npx shadcn-ui@latest add [component-name]
```

### Path alias not working
Check that `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Theme not applying
Ensure `App.tsx` is wrapped with `<ThemeProvider>`:
```tsx
import { ThemeProvider } from './components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      {/* Your app */}
    </ThemeProvider>
  )
}
```
