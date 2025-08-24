# UI Agent - Automated Frontend Improvement System

An intelligent system that uses Playwright to agentically iterate on frontend UI through automated testing, error detection, accessibility auditing, and visual analysis.

## 🚀 Features

### **Automated Error Detection & Fixing**
- **Real-time console error monitoring** across all pages
- **Auto-fix generation** for common error patterns (imports, types, network issues)
- **Code patching** directly applied to source files
- **Fix verification** through re-testing

### **Comprehensive Accessibility Auditing**
- **WCAG 2.1 compliance testing** (A, AA, AAA levels)
- **Color contrast analysis** with exact ratios
- **Screen reader compatibility** verification  
- **Keyboard navigation** testing
- **Automatic accessibility fixes** applied to code

### **Visual Reference Analysis**
- **Design inspiration scraping** from top sites (Dribbble, Awwwards)
- **Competitor analysis** with automated screenshots
- **Color palette extraction** and comparison
- **Typography analysis** and recommendations
- **Modern design pattern detection**

### **Intelligent Navigation Testing**
- **Comprehensive user flow testing** 
- **Form validation** with test data injection
- **Link verification** across all pages
- **Bug discovery** through edge case testing
- **Error state reproduction** with detailed context

## 📋 Quick Start

### Installation
The UI Agent is already installed with the project dependencies. Just ensure the development server is running:

```bash
pnpm dev  # Start on http://localhost:3001
```

### Basic Usage

**Simple UI Test** (recommended for first run):
```bash
pnpm run ui-agent:simple
```

**Quick Analysis** (5-minute comprehensive check):
```bash
pnpm run ui-agent:quick
```

**Full Analysis** (complete audit with all features):
```bash
pnpm run ui-agent:full
```

**Error Detection Only**:
```bash
pnpm run ui-agent:errors
```

**Accessibility Audit Only**:
```bash
pnpm run ui-agent:accessibility
```

## 🔧 System Architecture

### Core Components

#### **1. Error Fixer** (`error-fixer.ts`)
- Monitors console errors in real-time
- Categorizes errors by type (import, undefined, type, network, React)
- Generates intelligent fixes based on error patterns
- Applies fixes directly to source code

#### **2. Visual Renderer** (`visual-renderer.ts`)
- Scrapes design references from curated URLs
- Extracts color palettes, typography, and layout patterns
- Analyzes competitor designs
- Generates improvement suggestions based on trends

#### **3. Accessibility Auditor** (`accessibility-auditor.ts`)
- Comprehensive WCAG 2.1 testing
- Color contrast ratio calculations
- Keyboard navigation verification
- Screen reader compatibility checks
- Automatic fix generation for common issues

#### **4. Navigator** (`navigator.ts`)
- Intelligent application exploration
- Form testing with realistic data
- Link verification and navigation testing
- Bug discovery through systematic testing

#### **5. UI Analyzer** (`analyzer.ts`)
- Visual hierarchy analysis
- Component consistency checking
- Responsive design validation
- Performance optimization suggestions

## 📊 Output & Reports

All results are saved to `./ui-agent/output/`:

```
ui-agent/output/
├── screenshots/          # Page screenshots at different viewports
├── references/           # Reference design screenshots
├── reports/             # Comprehensive analysis reports
├── analysis/            # Detailed analysis data
└── simple-report.json   # Quick test results
```

### Report Types

**1. Master Report** - Complete analysis with all findings
**2. Accessibility Report** - WCAG compliance details
**3. Error Report** - Console errors and applied fixes
**4. Navigation Report** - User flow testing results
**5. Reference Analysis** - Design comparison and suggestions

## 🎯 Configuration

The system uses sensible defaults but can be customized in `config.ts`:

```typescript
export const defaultConfig: UIAgentConfig = {
  baseUrl: 'http://localhost:3001',
  routes: [
    { name: 'home', path: '/' },
    { name: 'create', path: '/create' },
    { name: 'dashboard', path: '/dashboard' }
  ],
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ],
  analysisOptions: {
    checkAccessibility: true,
    checkPerformance: true,
    checkResponsiveness: true,
    checkColorContrast: true,
    checkVisualHierarchy: true,
    checkConsistency: true
  }
};
```

## 🔍 Key Capabilities

### **Automatic Fixes Applied**
- ✅ Missing imports → Auto-install and import
- ✅ Undefined variables → Add declarations  
- ✅ Type errors → Fix type annotations
- ✅ Missing alt text → Add alt attributes
- ✅ Form labels → Create label elements
- ✅ Focus indicators → Add CSS focus styles
- ✅ Color contrast → Suggest color improvements
- ✅ ARIA issues → Fix role and label problems

### **Analysis Features**
- 🔍 **Visual Regression Detection** - Compare UI changes over time
- 🎨 **Design Pattern Recognition** - Identify modern UI trends
- ♿ **Accessibility Scoring** - WCAG compliance ratings
- 📱 **Responsive Testing** - Multi-viewport validation
- ⚡ **Performance Analysis** - Image optimization, CSS efficiency
- 🔗 **Link Validation** - Verify all navigation paths

### **Reference Analysis**
- 📚 **Design Inspiration** - Dribbble, Behance, Awwwards
- 🎯 **Competitor Tracking** - Automated competitor screenshots
- 🎨 **Color Trend Analysis** - Extract popular color schemes
- 📝 **Typography Patterns** - Analyze font usage trends
- 🏗️ **Layout Systems** - Identify grid and spacing patterns

## 🚀 Advanced Usage

### Custom Reference URLs
Add your own design references by modifying the `referenceUrls` array in `visual-renderer.ts`.

### Error Pattern Extension
Add custom error patterns in `error-fixer.ts` to handle project-specific issues.

### Accessibility Rules
Extend accessibility checks by adding custom validators in `accessibility-auditor.ts`.

## 📈 Performance Impact

- **Memory Usage**: ~200MB during analysis
- **Network**: Only outbound requests to reference URLs
- **Storage**: ~50MB for complete analysis outputs
- **Time**: 
  - Simple test: 30 seconds
  - Quick analysis: 5 minutes
  - Full analysis: 15-20 minutes

## 🛠️ Troubleshooting

**Port Issues**: The system auto-detects the app running on port 3001. Ensure your dev server is running.

**Browser Not Found**: Run `npx playwright install` if you get browser installation errors.

**Memory Issues**: Use `ui-agent:quick` instead of `ui-agent:full` for lower memory usage.

**Network Timeouts**: Reference scraping may timeout on slow connections. This won't affect local analysis.

## 🎯 Best Practices

1. **Run `ui-agent:simple` first** to verify basic functionality
2. **Use `ui-agent:quick` for regular development** iterations
3. **Run `ui-agent:full` before major releases** for comprehensive audits
4. **Check `./ui-agent/output/reports/`** for detailed findings
5. **Apply auto-fixes incrementally** and test after each batch

## 📝 Example Workflow

```bash
# 1. Start development server
pnpm dev

# 2. Run simple test to verify setup
pnpm run ui-agent:simple

# 3. Run quick analysis during development
pnpm run ui-agent:quick

# 4. Check results
open ui-agent/output/reports/

# 5. Apply fixes and re-test
# ... make improvements ...
pnpm run ui-agent:quick

# 6. Full audit before deployment
pnpm run ui-agent:full
```

The UI Agent system provides a complete automated solution for maintaining and improving frontend code quality, accessibility, and user experience through intelligent analysis and automatic fixes.