# Download Manager Frontend

A React-based frontend component for managing downloads in Clarion. This package provides a comprehensive user interface for interacting with torrent servers and managing downloads.

## Overview

The Download Manager Frontend is a Clarion app component that provides:
- **Torrent Server Management**: Add, configure, and manage multiple torrent servers
- **Torrent Download Management**: Create, monitor, and control torrent downloads
- **Real-time Data Synchronization**: Powered by Redux Toolkit Query for efficient data fetching
- **Responsive UI**: Built with Bulma CSS framework for modern, mobile-friendly interfaces
- **Seamless Integration**: Designed to work within the Clarion app ecosystem

## Features

- **Server Management Interface**: Visual management of torrent servers with support for different client types
- **Torrent Dashboard**: Comprehensive view of all torrents with filtering and search capabilities
- **Real-time Status Updates**: Automatic refresh and status tracking of downloads
- **Form Validation**: Client-side validation for all user inputs
- **Error Handling**: Graceful error handling with user-friendly messages
- **Multi-Client Support**: Interface adapts to different torrent client types
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Architecture

### Core Components

#### API Layer (`downloadManagerApi.ts`)
- **Redux Toolkit Query**: Centralized API state management
- **Automatic Caching**: Efficient data caching and invalidation
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Error Handling**: Centralized error management across all endpoints

#### React Components

##### TorrentServers Component
- **Server Listing**: Display all configured torrent servers
- **Add Server Form**: Interface for adding new torrent servers
- **Server Management**: Edit and delete existing servers
- **Client Type Detection**: Automatic detection of supported client types

##### Torrents Component
- **Torrent Dashboard**: Overview of all active torrents
- **Add Torrent Form**: Interface for adding new torrents via magnet URI
- **Search & Filter**: Real-time filtering of torrents by name
- **Status Display**: Visual indicators for download progress and completion

##### Individual Item Components
- **TorrentServer**: Individual server card with management actions
- **Torrent**: Individual torrent card with status and controls

### Type System (`types.ts`)

#### TorrentServer Interface
```typescript
interface TorrentServer {
    local_node: string;    // Node identifier for distributed tracking
    address: string;       // Server connection address (IP:Port)
    type: string;         // Client type (e.g., "Transmission")
    // Inherits LaravelModelType (id, created_at, updated_at, etc.)
}
```

#### Torrent Interface
```typescript
interface Torrent {
    local_node: string;      // Node identifier
    server_id: string;       // Reference to torrent server
    user_id?: string;        // Associated user ID
    magnetURI: string;       // Magnet link
    hash_string?: string;    // Torrent hash identifier
    completed_at?: string;   // Completion timestamp
    name?: string;           // Display name
    // Inherits LaravelModelType
}
```

## API Integration

### Available Hooks

#### Torrent Server Hooks
- `useGetTorrentServersQuery()` - Fetch all servers
- `useGetTorrentServerQuery(id)` - Fetch specific server
- `useCreateTorrentServerMutation()` - Create new server
- `useUpdateTorrentServerMutation()` - Update existing server
- `useDeleteTorrentServerMutation()` - Delete server
- `useGetTorrentClientTypesQuery()` - Get supported client types

#### Torrent Hooks
- `useGetTorrentsQuery()` - Fetch all torrents
- `useGetTorrentQuery(id)` - Fetch specific torrent
- `useCreateTorrentMutation()` - Add new torrent
- `useUpdateTorrentMutation()` - Update torrent
- `useDeleteTorrentMutation()` - Remove torrent
- `useMarkTorrentIncompleteMutation()` - Reset completion status

### Authentication & Configuration

The frontend automatically handles:
- **Bearer Token Authentication**: Automatically includes auth tokens in requests
- **Backend URL Configuration**: Dynamic backend endpoint configuration
- **User Context**: Maintains user information across components

```typescript
// Configuration is handled automatically by the Clarion framework
export const updateFrontend = (config: BackendType) => {
    backend.url = config.url;
    backend.token = config.token;
    backend.user = config.user;
};
```

## Usage Examples

### Adding a Torrent Server
1. Navigate to "Torrent Servers" in the Download Manager menu
2. Click "Add New Server"
3. Enter server address (e.g., `192.168.1.100:9091`)
4. Select client type from dropdown
5. Click "Create Server"

### Adding a Torrent
1. Navigate to "Torrents" in the Download Manager menu
2. Click "Add New Torrent"
3. Select a torrent server from the dropdown
4. Paste the magnet URI
5. Optionally specify a custom name
6. Click "Create Torrent"

### Monitoring Downloads
- The Torrents page automatically refreshes to show current status
- Completed torrents are visually distinguished
- Use the search bar to filter torrents by name
- Click individual torrents to view detailed information

### Routes
- `/clarion-app/download-manager/torrent-servers` - Server management interface
- `/clarion-app/download-manager/torrents` - Torrent management interface

### API Registration
The package exposes `downloadManagerApi` for use by other Clarion components:
```typescript
import { downloadManagerApi } from '@clarion-app/download-manager-frontend';
// Use API hooks in other components
```

## Dependencies

### Core Dependencies
- **React 18.2+**: Modern React with hooks and concurrent features
- **Redux Toolkit Query**: State management and API caching
- **React Router DOM**: Client-side routing
- **TypeScript**: Type safety and enhanced development experience

### Clarion Dependencies
- **@clarion-app/types**: Shared type definitions for the Clarion ecosystem

### UI Framework
- **Bulma CSS**: Modern CSS framework (classes used in components)
- **Font Awesome**: Icons (referenced in components)

## Development

### Building the Package
```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Type Checking
The package uses strict TypeScript configuration:
- Strict mode enabled
- Full type checking for all React components
- Integration with Clarion type system

## Component API

### TorrentServers Component
```typescript
// No props required - fully self-contained
<TorrentServers />
```

### Torrents Component  
```typescript
// No props required - fully self-contained
<Torrents />
```

### Individual Components
```typescript
// TorrentServer component
<TorrentServer 
  server={serverData} 
  onDeleted={handleDeleted}
/>

// Torrent component
<Torrent 
  torrent={torrentData}
  onDeleted={handleDeleted} 
/>
```

## Error Handling

The frontend provides comprehensive error handling:
- **Network Errors**: Graceful handling of connection issues
- **Validation Errors**: Client-side form validation
- **Server Errors**: User-friendly error messages
- **Loading States**: Visual feedback during operations

## Responsive Design

All components are built with mobile-first responsive design:
- **Mobile Optimized**: Touch-friendly interfaces
- **Tablet Support**: Optimized layouts for medium screens  
- **Desktop Enhanced**: Full-featured desktop experience
- **Accessibility**: Proper semantic HTML and ARIA labels

## Integration with Backend

The frontend seamlessly integrates with the Download Manager Backend:
- **Automatic Data Sync**: Real-time updates via Redux Toolkit Query
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Automatic retry and error handling
- **Caching Strategy**: Efficient data caching to minimize API calls
