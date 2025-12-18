# AvatarUpload Component - Quick Reference

## Import

```tsx
import { AvatarUpload } from '@shared/components';
```

## Basic Usage

```tsx
<AvatarUpload
  userId={user.id}
  displayName={user.displayName || 'User'}
  currentAvatarUrl={user.avatarUrl}
  onUploadComplete={(url) => console.log('New avatar:', url)}
/>
```

## All Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | `string` | ✅ Yes | - | User ID for upload |
| `displayName` | `string` | ✅ Yes | - | Name for initials fallback |
| `currentAvatarUrl` | `string` | No | `undefined` | Current avatar URL |
| `onUploadComplete` | `(url: string) => void` | No | `undefined` | Success callback |
| `onUploadError` | `(error: Error) => void` | No | `undefined` | Error callback |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | No | `'lg'` | Avatar size |
| `className` | `string` | No | `''` | Custom CSS classes |
| `maxSizeMB` | `number` | No | `5` | Max file size in MB |
| `disabled` | `boolean` | No | `false` | Disable upload |
| `showInstructions` | `boolean` | No | `true` | Show instructions |

## Size Variants

```tsx
<AvatarUpload size="sm" {...props} />  {/* 64x64px */}
<AvatarUpload size="md" {...props} />  {/* 80x80px */}
<AvatarUpload size="lg" {...props} />  {/* 96x96px - default */}
<AvatarUpload size="xl" {...props} />  {/* 128x128px */}
```

## Validations

- ✅ **File Type:** Only images (JPG, PNG, GIF, WebP)
- ✅ **File Size:** Max 5MB (configurable)
- ✅ **Immediate Feedback:** Toast notifications

## Features

- ✅ Real upload to backend
- ✅ Local preview before upload
- ✅ Animated progress bar
- ✅ Error handling with messages
- ✅ Loading states
- ✅ Accessibility (ARIA labels)
- ✅ Responsive design
- ✅ TypeScript support

## API Endpoint

```
POST /users/:userId/avatar
Content-Type: multipart/form-data
Body: { avatar: File }

Response:
{
  "avatar_url": "https://storage.example.com/avatars/123.jpg",
  "updated_at": "2025-12-05T10:30:00Z"
}
```

## Files

- **Component:** `AvatarUpload.tsx`
- **Examples:** `AvatarUpload.example.tsx`
- **Tests:** `__tests__/AvatarUpload.test.tsx`
- **Docs:** `AvatarUpload.README.md`

## Status

✅ **Production Ready** - Fully tested and documented
