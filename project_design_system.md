# Hybrid MDB Filtering Tool - Design System Guide

This document serves as a comprehensive design system for the Hybrid MDB Filtering Tool project. It defines the visual language, UI components, and layout patterns used to ensure consistency across the application.

---

## 1. Core Visual Identity

### 1.1 Color Palette
The project uses a clean, high-contrast monochrome base with semantic colors for status and actions.

| Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Background (Main)** | `#f8f9fa` | Page body background |
| **Card/Surface** | `#ffffff` | Primary container and card backgrounds |
| **Text (Primary)** | `#343a40` | Default body and descriptive text |
| **Accent (Black)** | `#000000` | Headings, primary buttons, and focus states |
| **Muted Text** | `#6c757d` | Secondary info, captions, and placeholders |
| **Border Color** | `#dee2e6` | Standard borders for inputs and cards |
| **Success** | `#28a745` | Positive status, active states |
| **Danger** | `#dc3545` | Errors, blocked status, delete actions |

### 1.2 Typography
The system prioritizes readability and a modern, technical feel.

- **Primary Font Family:** `'Inter', system-ui, -apple-system, sans-serif`
- **Headings (H1):** `24px`, Weight: `700` (Bold), Color: `#000000`
- **Body Text:** `16px`, Weight: `400` (Regular), Color: `#343a40`
- **Small Labels/Info:** `14px`, Weight: `600` (Semi-bold) for labels, `400` for info
- **Badges/Micro-text:** `12px` (Caps), Weight: `700`

---

## 2. Layout & Spacing

### 2.1 Grid & Containers
- **Main Body:** Uses `display: flex; justify-content: center; align-items: center; min-height: 100vh;` for auth pages.
- **Auth Container:** `max-width: 450px`, Padding: `40px`, Border-radius: `12px`.
- **Dashboard Container:** `max-width: 1000px`, Width: `100%`.
- **Standard Card:** Padding: `24px`, Border-radius: `12px`, Border: `1px solid #dee2e6`.

### 2.2 Shadow & Elevation
- **Low Elevation:** `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);` (Used for containers).
- **Button Hover:** `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);` with `transform: translateY(-2px);`.

---

## 3. UI Components

### 3.1 Buttons
All buttons feature a `0.2s` transition on interaction.

| Type | Style | CSS Classes |
| :--- | :--- | :--- |
| **Primary** | Solid Black, White Text | `button` |
| **Logout/Secondary** | Transparent, Gray Border | `.btn-logout` |
| **Action (Small)** | `11px` text, Bold, Upper Case | `.btn-action` |
| **Danger/Delete** | Neutral Gray background, Red text | `.btn-delete` |
| **Block** | Light Red bg, Dark Red text | `.btn-block` |
| **Unblock** | Light Green bg, Dark Green text | `.btn-unblock` |
| **Apply/Info** | Light Blue bg, Dark Blue text | `.btn-apply` |

### 3.2 Form Elements
- **Inputs & Selects:**
    - Padding: `12px`
    - Border: `1px solid #dee2e6`
    - Radius: `6px`
    - Focus State: `border-color: #000000`, `outline: none`
- **Labels:** `display: block`, `margin-bottom: 8px`, `font-size: 14px`, `font-weight: 600`.

### 3.3 Data Tables
- **Header:** Background: `#f8f9fa`, Font-size: `14px`, Font-weight: `600`.
- **Rows:** `border-bottom: 1px solid #dee2e6`, Padding: `12px`.
- **Interactivity:** Actions are grouped in the final column using `inline-flex`.

### 3.4 Alerts & Notifications
- **General:** Padding: `12px`, Radius: `6px`, Margin-bottom: `20px`.
- **Error/Danger:** Background: `#f8d7da`, Text: `#721c24`, Border: `#f5c6cb`.
- **Success:** Background: `#d4edda`, Text: `#155724`, Border: `#c3e6cb`.

---

## 4. Design Logic & Utility

### 4.1 Status Indicators
- **Active:** `.status-active` (`#28a745`, Bold).
- **Blocked:** `.status-blocked` (`#dc3545`, Bold).
- **Role Badge:** Black background, white text, `12px` font, uppercase.

### 4.2 Interaction Feedback
- **Hovers:** All interactive elements (links, buttons, inputs) must have a visual change (color shift, opacity shift, or translation).
- **Transitions:** `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);` for complex components.

### 4.3 Responsive Strategy
- Containers are fluid (`width: 100%`) with `max-width` constraints.
- Flexbox is used for the header (`justify-content: space-between`) and forms to handle wrapping on smaller screens.
