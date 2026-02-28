---
title: "Estandar Frontend Profesional - Accessibility (A11Y)"
status: activo
last_updated: "2026-02-28"
parent: "ESTANDAR-FRONTEND-PROFESIONAL.md"
section: "5"
---

# Accessibility (A11Y)

> Seccion 5 de [Estandar Frontend Profesional](../ESTANDAR-FRONTEND-PROFESIONAL.md)

---

## 5. Accessibility (A11Y)

### 5.1 Semantic HTML

```tsx
// Preferir elementos semanticos nativos
function ArticlePage({ article }: { article: Article }) {
  return (
    <article>
      <header>
        <h1>{article.title}</h1>
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </header>

      <main>
        <section aria-labelledby="content-heading">
          <h2 id="content-heading">Content</h2>
          {article.content}
        </section>
      </main>

      <footer>
        <nav aria-label="Article navigation">
          <a href={article.prevUrl}>Previous</a>
          <a href={article.nextUrl}>Next</a>
        </nav>
      </footer>
    </article>
  );
}
```

### 5.2 ARIA Labels

```tsx
// Usar ARIA solo cuando HTML semantico no es suficiente
function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [term, setTerm] = useState('');

  return (
    <div role="search">
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>
      <input
        id="search-input"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-describedby="search-hint"
        placeholder="Search..."
      />
      <span id="search-hint" className="sr-only">
        Type at least 3 characters to search
      </span>
      <button
        type="button"
        onClick={() => onSearch(term)}
        aria-label="Submit search"
      >
        <SearchIcon aria-hidden="true" />
      </button>
    </div>
  );
}
```

### 5.3 Focus Management

```tsx
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Mover foco al modal cuando se abre
      closeButtonRef.current?.focus();

      // Trap focus dentro del modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
```

### 5.4 Keyboard Navigation

```tsx
function Menu({ items }: { items: MenuItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  };

  useEffect(() => {
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li key={item.id} role="none">
          <button
            ref={(el) => (itemRefs.current[index] = el)}
            role="menuitem"
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
```
