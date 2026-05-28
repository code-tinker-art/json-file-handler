# json-file-handler

A robust Node.js utility to handle JSON files effortlessly with automatic file watching, atomic writes, and intuitive dot-notation data access.

## Features

- 🔄 **Automatic File Watching**: Real-time synchronization when JSON files are modified externally
- ⚛️ **Atomic Writes**: Safe file writing with temporary files to prevent corruption
- 🔑 **Dot-Notation Access**: Simple path-based get/set operations (e.g., `user.profile.name`)
- 🛡️ **Error Handling**: Graceful handling of invalid JSON and file access errors
- ⏱️ **Async Queue**: Serialized write operations to prevent race conditions
- 📦 **ES Module**: Built with modern JavaScript (ES6+)

## Usage

### Basic Setup

```javascript
import { JSON_FileHandler } from './main.js';

// Initialize the handler
const handler = new JSON_FileHandler('config.json');
await handler.init();
```

### Constructor Options

```javascript
new JSON_FileHandler(fileName, createTemp = true, _watch = true)
```

- `fileName` (string): Path to the JSON file
- `createTemp` (boolean): Enable atomic writes using temporary files (default: `true`)
- `_watch` (boolean): Enable automatic file watching (default: `true`)

### API Methods

#### `init()`
Initializes the handler by checking file access and loading the JSON data.

```javascript
await handler.init();
```

#### `get(path)`
Retrieve a value using dot notation.

```javascript
const userName = handler.get('user.profile.name');
const config = handler.get('settings');
```

#### `set(path, value)`
Set a value using dot notation. Automatically saves changes to the file.

```javascript
await handler.set('user.profile.name', 'John Doe');
await handler.set('settings.theme', 'dark');
```

#### `delete(path)`
Delete a property from the JSON object. Returns `true` if successful.

```javascript
const deleted = await handler.delete('user.tempData');
```

#### `exists(path)`
Check if a path exists in the JSON object.

```javascript
if (handler.exists('user.profile.email')) {
    console.log('Email exists');
}
```

#### `load()`
Manually reload the JSON from file (useful when not using auto-watch).

```javascript
await handler.load();
```

#### `save()`
Manually save changes to file.

```javascript
await handler.save();
```

#### `startWatcher()`
Enable automatic file watching.

```javascript
handler.startWatcher();
```

## Example

```javascript
import { JSON_FileHandler } from './main.js';

// Create handler
const config = new JSON_FileHandler('config.json');
await config.init();

// Get value
const theme = config.get('appearance.theme');
console.log('Current theme:', theme);

// Set value
await config.set('appearance.theme', 'dark');
await config.set('user.lastLogin', new Date().toISOString());

// Check existence
if (config.exists('user.preferences')) {
    console.log('User preferences found');
}

// Delete value
await config.delete('user.tempData');
```

## Properties

- `isReady` (boolean): Indicates if the handler is initialized and ready
- `name` (string): The file path
- `json` (string): The raw JSON string
- `obj` (object): The parsed JSON object
- `atomicWriting` (boolean): Whether atomic writes are enabled
- `isSaving` (boolean): Whether a save operation is in progress
- `watcher` (FSWatcher): The file watcher instance (if enabled)

## Error Handling

The handler logs errors to the console for:
- Missing or inaccessible files
- Invalid JSON syntax
- File write errors
- File system watcher errors

## License

ISC

## Author

S.S.Magizhnun
