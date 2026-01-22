# LIQUIDO Vape Store Website

> **Version 2.0** - Professional Edition

Bienvenue sur le site web LIQUIDO - Une boutique de vape premium avec une interface moderne, élégante et une architecture professionnelle.

## 🚀 Quick Start

### Development Server

```bash
# Using npm (recommended)
npm run dev

# Or using Python
python -m http.server 3000

# Or using PHP
php -S localhost:3000

# Or using npx
npx http-server -p 3000
```

Then open `http://localhost:3000` in your browser.

## 📁 Project Structure

```
LIQUIDOv1/
├── public/                 # Public pages
│   ├── index.html         # Homepage
│   ├── brands.html        # Brands catalog
│   ├── products.html      # Products catalog
│   ├── product-detail.html
│   ├── about.html
│   └── contact.html
├── admin/                  # Admin section
│   ├── index.html         # Login
│   ├── dashboard.html
│   ├── products/          # Product management
│   ├── brands/            # Brand management
│   ├── inbox/             # Messages
│   └── settings.html
├── src/                   # Source code
│   ├── components/        # Reusable components
│   ├── js/               # JavaScript modules
│   ├── styles/           # CSS architecture
│   └── config/           # Configuration
├── assets/               # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── COMPONENTS.md
│   └── DEVELOPMENT.md
├── package.json          # NPM configuration
└── README.md            # This file
```

## 🎨 Features

### Design
- ✅ Modern, premium dark theme
- ✅ Smooth animations and transitions
- ✅ Interactive hover effects
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Professional component-based architecture

### Technical
- ✅ Modular CSS architecture
- ✅ Reusable HTML components
- ✅ Component caching system
- ✅ Form validation utilities
- ✅ Helper functions library
- ✅ CSS custom properties (design tokens)

### Pages
- ✅ Homepage with hero section
- ✅ Brand catalog with filters
- ✅ Product catalog with search
- ✅ Product detail pages
- ✅ About page
- ✅ Contact form
- ✅ Admin dashboard
- ✅ Product/Brand management
- ✅ Message inbox

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern CSS with custom properties
- **Tailwind CSS** - Utility-first framework (CDN)
- **Vanilla JavaScript** - No framework dependencies
- **Component System** - Dynamic component loading

## 🎯 Architecture Highlights

### Component-Based Design
```javascript
// Load reusable components
loadComponent('header-container', '../src/components/common/header.html');
loadComponent('footer-container', '../src/components/common/footer.html');
```

### Modular CSS
```
src/styles/
├── base/           # Reset, variables, typography
├── components/     # Button, card, form styles
├── layouts/        # Page layouts
└── main.css        # Central import
```

### Utility Functions
```javascript
// Format prices
Utils.formatPrice(29.99); // "$29.99"

// Validate forms
Validator.validateForm(form, rules);

// Local storage
Utils.storage.set('cart', data);
```

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Development Guide](docs/DEVELOPMENT.md)** - How to develop and extend the project
- **[Components Guide](docs/COMPONENTS.md)** - Component documentation and usage

## 🎨 Design System

### Colors
- **Primary (Giallo)**: #F8ED70 (Yellow)
- **Background Dark (Bianco)**: #000000
- **Charcoal (Nero)**: #333333
- **White**: #FFFFFF

### Typography
- **Font**: Plus Jakarta Sans
- **Weights**: 400, 500, 600, 700, 800

### Spacing Scale
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px, 4xl: 96px

## 🔧 Development

### Prerequisites
- Modern web browser
- Code editor (VS Code recommended)
- Node.js (optional, for dev server)

### Setup
```bash
# Clone repository
git clone <repository-url>
cd LIQUIDOv1

# Install dependencies (optional)
npm install

# Start development server
npm run dev
```

### Creating New Pages
1. Create HTML file in `public/` or `admin/`
2. Include necessary styles and scripts
3. Load header/footer components
4. Add page-specific content

### Adding Components
1. Create component in `src/components/`
2. Load using `loadComponent()`
3. Style in `src/styles/components/`

See [Development Guide](docs/DEVELOPMENT.md) for detailed instructions.

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

## 🚀 Deployment

### Static Hosting
- **Netlify**: Drag and drop the project folder
- **Vercel**: Connect Git repository
- **GitHub Pages**: Push to gh-pages branch
- **Firebase Hosting**: `firebase deploy`

### Traditional Hosting
Upload files via FTP to any web server (Apache, Nginx, etc.)

No build step required for basic deployment!

## 🔐 Admin Section

Access admin at `/admin/index.html`

Features:
- Dashboard with statistics
- Product management (CRUD)
- Brand management (CRUD)
- Message inbox
- Settings

## 📝 NPM Scripts

```bash
npm run dev      # Start development server
npm run serve    # Alternative server
npm run lint:*   # Linting (to be configured)
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Contact

**INDIRIZZO**  
via Adige 43C, 00015 - Monterotondo (Rm)

**MAIL**  
info.vaporoom@gmail.com

**WHATSAPP**  
+39 379 134 5367

**INSTAGRAM**  
https://www.instagram.com/liquido.vapeshop/

**FACEBOOK**  
https://www.facebook.com/liquido.vapeshop/

---

**LIQUIDO** - Premium Vaping Experience Since 2018  
*21+ Only • Enjoy Responsibly*

## 🔄 Changelog

### Version 2.0.0 (2026-01-20)
- ✨ Complete project restructuring
- ✨ Professional directory organization
- ✨ Modular CSS architecture
- ✨ Component-based system
- ✨ Utility functions library
- ✨ Form validation system
- ✨ Comprehensive documentation
- ✨ NPM integration
- ✨ Improved maintainability

### Version 1.0.0
- Initial release
- Basic HTML/CSS structure
- Tailwind CSS integration

Recharger la page admin/init-firebase.html