# LIQUIDO Development Guide

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A code editor (VS Code recommended)
- Node.js (optional, for development server)
- Git (for version control)

### Initial Setup

1. **Clone the repository** (if using Git):
   ```bash
   git clone <repository-url>
   cd LIQUIDOv1
   ```

2. **Install dependencies** (optional):
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Or use any static file server:
   ```bash
   # Python
   python -m http.server 3000
   
   # PHP
   php -S localhost:3000
   
   # Node.js (npx)
   npx http-server -p 3000
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

## Project Structure

### Directory Organization

```
src/
├── components/     # Reusable HTML components
├── js/            # JavaScript modules
├── styles/        # CSS files
└── config/        # Configuration files
```

### File Naming Conventions

- **HTML**: `kebab-case.html` (e.g., `product-detail.html`)
- **CSS**: `kebab-case.css` (e.g., `button-styles.css`)
- **JavaScript**: `camelCase.js` or `kebab-case.js` (e.g., `componentLoader.js` or `component-loader.js`)
- **Components**: `kebab-case.html` (e.g., `product-card.html`)

## Development Workflow

### 1. Creating a New Page

1. Create HTML file in `public/` or `admin/`:
   ```html
   <!DOCTYPE html>
   <html class="dark" lang="en">
   <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Page Title | LIQUIDO</title>
       
       <!-- Tailwind CSS -->
       <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
       
       <!-- Fonts -->
       <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
       <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
       
       <!-- Styles -->
       <link rel="stylesheet" href="../shared/styles/global.css" />
       <link rel="stylesheet" href="../src/styles/main.css" />
       <script src="../shared/config/tailwind-config.js"></script>
   </head>
   <body class="bg-background-dark text-white">
       <!-- Header -->
       <div id="header-container"></div>
       
       <!-- Main Content -->
       <main class="pt-20">
           <!-- Your content here -->
       </main>
       
       <!-- Footer -->
       <div id="footer-container"></div>
       
       <!-- Scripts -->
       <script src="../src/js/core/component-loader.js"></script>
       <script src="../src/js/utils/active-nav.js"></script>
       <script>
           loadComponent('header-container', '../src/components/common/header.html');
           loadComponent('footer-container', '../src/components/common/footer.html');
       </script>
   </body>
   </html>
   ```

### 2. Creating a New Component

1. Create component file in `src/components/common/` or `src/components/admin/`:
   ```html
   <!-- src/components/common/my-component.html -->
   <div class="my-component">
       <h2>Component Title</h2>
       <p>Component content</p>
   </div>
   ```

2. Load component in your page:
   ```javascript
   loadComponent('container-id', '../src/components/common/my-component.html');
   ```

### 3. Adding New Styles

1. Create CSS file in appropriate directory:
   ```css
   /* src/styles/components/my-component.css */
   .my-component {
       /* Component styles */
   }
   ```

2. Import in `src/styles/main.css`:
   ```css
   @import './components/my-component.css';
   ```

### 4. Adding JavaScript Functionality

1. Create module in `src/js/modules/`:
   ```javascript
   // src/js/modules/my-module.js
   const MyModule = {
       init() {
           // Initialization code
       },
       
       doSomething() {
           // Module functionality
       }
   };
   
   // Export if using modules
   if (typeof module !== 'undefined' && module.exports) {
       module.exports = MyModule;
   }
   ```

2. Include in your page:
   ```html
   <script src="../src/js/modules/my-module.js"></script>
   <script>
       MyModule.init();
   </script>
   ```

## Best Practices

### HTML

1. **Use semantic HTML**:
   ```html
   <!-- Good -->
   <article class="product-card">
       <header><h2>Product Name</h2></header>
       <section>Product details</section>
   </article>
   
   <!-- Avoid -->
   <div class="product-card">
       <div><div>Product Name</div></div>
       <div>Product details</div>
   </div>
   ```

2. **Add ARIA labels** where needed:
   ```html
   <button aria-label="Close dialog">×</button>
   ```

3. **Use data attributes** for JavaScript hooks:
   ```html
   <button data-action="add-to-cart" data-product-id="123">
       Add to Cart
   </button>
   ```

### CSS

1. **Use CSS custom properties**:
   ```css
   .button {
       background-color: var(--color-primary);
       padding: var(--spacing-md);
   }
   ```

2. **Follow BEM naming** for custom classes:
   ```css
   .product-card { }
   .product-card__title { }
   .product-card__title--highlighted { }
   ```

3. **Mobile-first approach**:
   ```css
   /* Mobile styles first */
   .element {
       font-size: 14px;
   }
   
   /* Then larger screens */
   @media (min-width: 768px) {
       .element {
           font-size: 16px;
       }
   }
   ```

### JavaScript

1. **Use utility functions**:
   ```javascript
   // Good
   const price = Utils.formatPrice(29.99);
   
   // Avoid
   const price = '$' + parseFloat(29.99).toFixed(2);
   ```

2. **Validate forms**:
   ```javascript
   const rules = {
       email: { required: true, email: true },
       password: { required: true, minLength: 8 }
   };
   
   const result = Validator.validateForm(form, rules);
   if (!result.valid) {
       Validator.displayFormErrors(form, result.errors);
   }
   ```

3. **Handle errors gracefully**:
   ```javascript
   try {
       await loadComponent('id', 'path.html');
   } catch (error) {
       console.error('Failed to load component:', error);
       // Show fallback content
   }
   ```

## Common Tasks

### Adding a New Product Card

```html
<div class="product-card">
    <div class="product-card-image">
        <img src="product.jpg" alt="Product Name" />
        <div class="product-card-badge">New</div>
    </div>
    <div class="product-card-content">
        <h3 class="product-card-title">Product Name</h3>
        <p class="product-card-description">Description</p>
        <div class="product-card-footer">
            <span class="product-card-price">$29.99</span>
            <button class="btn btn-primary btn-sm">View</button>
        </div>
    </div>
</div>
```

### Creating a Form with Validation

```html
<form id="contact-form">
    <div>
        <label for="email">Email</label>
        <input type="email" id="email" name="email" />
    </div>
    <div>
        <label for="message">Message</label>
        <textarea id="message" name="message"></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const rules = {
        email: { required: true, email: true },
        message: { required: true, minLength: 10 }
    };
    
    const result = Validator.validateForm(e.target, rules);
    
    if (result.valid) {
        // Submit form
        console.log('Form is valid!');
    } else {
        Validator.displayFormErrors(e.target, result.errors);
    }
});
</script>
```

### Using Local Storage

```javascript
// Save data
Utils.storage.set('cart', { items: [], total: 0 });

// Get data
const cart = Utils.storage.get('cart', { items: [], total: 0 });

// Remove data
Utils.storage.remove('cart');
```

## Debugging

### Browser DevTools

1. **Console**: Check for JavaScript errors
2. **Network**: Verify component loading
3. **Elements**: Inspect DOM and styles
4. **Application**: Check local storage

### Common Issues

**Components not loading:**
- Check file paths (relative to HTML file)
- Verify component file exists
- Check browser console for errors

**Styles not applying:**
- Verify CSS file is imported in `main.css`
- Check for CSS specificity issues
- Clear browser cache

**JavaScript errors:**
- Check for typos in function names
- Verify scripts are loaded in correct order
- Use `console.log()` for debugging

## Testing

### Manual Testing Checklist

- [ ] All pages load without errors
- [ ] Components load correctly
- [ ] Navigation works
- [ ] Forms validate properly
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] Images load correctly

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Git Workflow

### Branching Strategy

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# After review, merge to main
```

### Commit Messages

Follow conventional commits:

```
feat: Add product filtering
fix: Correct header alignment
docs: Update README
style: Format CSS files
refactor: Reorganize component structure
```

## Performance Optimization

1. **Minimize HTTP requests**: Use component caching
2. **Optimize images**: Compress and use appropriate formats
3. **Lazy load**: Load components on demand
4. **Minify**: Minify CSS and JS for production
5. **CDN**: Use CDN for external libraries

## Deployment

### Production Build

1. Test thoroughly
2. Minify CSS and JS (optional)
3. Optimize images
4. Update paths if needed
5. Deploy to hosting

### Deployment Platforms

- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free static hosting
- **Traditional hosting**: FTP upload

## Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

## Getting Help

1. Check documentation in `docs/`
2. Review code comments
3. Search for similar issues
4. Ask team members
5. Consult online resources
