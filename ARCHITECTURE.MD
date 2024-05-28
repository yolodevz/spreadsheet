# Spreadsheet App Architecture

## Overview
The app is using NextJS App router and shadcn-UI with its basic tailwindCSS setup. 
Shadcn-UI shouldn't be considered to be a part of the task, but I like having access to its design tokens.

Apart from Shadcn, I'm also using [tanstack-query](#https://tanstack.com/query/latest/docs/framework/react/overview) (to aid with server state management)
and [wretch](#https://github.com/elbywan/wretch) (fetch wrapper) for its simple API and a way to handle errors in a nice way. 

---

### Component Diagram
- Spreadsheet Component
    - Uses Cell Components

---

## Detailed Design
#### API
##### get-status[id]
- route.ts

This endpoint cannot throw any errors, so status of `200` is the only one handled.
Accepts an `id` query parameter.

```typescript
'http://localhost:8082/get-status'
```

##### save
- route.ts

Can throw errors, so statuses `200` and `500` are handled.

```typescript
'http://localhost:8082/save'
```

#### Hooks
- use-spreadsheet.hook.ts

I consider this hook to be not specific enough. I should have split it into smaller and more specialized hooks.

It is calling the save mutation, runs effect update to keep track of the current mutation/query state.
It doesn't do polling, as that is handled in the `save.mutation.ts` file onSuccess callback.

Cell updates also happen here, including onBlur and onFocus events.

The main concern is that it's currently doing too much and that can lead to difficulties in maintaining or testing the code.
It also relies on the same state and that will definitely lead to leaks the moment we render multiple instances of the spreadsheet.

These problems would be the first I'd address if I were to continue working on this app.

### Lib
- evaluate-expression.ts

The main algorithm responsible for expression evaluation. It doesn't need a base case. 
As it's important to understand what it's doing in details, please refer to the comments in the file.

### Mutations
- save.mutation.ts

Saving can return a `DONE` status in which case we can consider the save to be successful.

However, the status can also become `IN_PROGRESS`. 
In this case, we're updating the status query while polling `get-status` endpoint until it returns `DONE`.

Until the status is `DONE`, we're not updating the spreadsheet and we're showing the loading spinner.

### Queries
- get-status.query.ts

### Types
- spreadsheet.types.ts

## UI Components
### Button
- button.tsx

can be skipped, nothing special here, just a button component from shadcn-UI

### Cell
- cell.tsx

## Common Components
### Spreadsheet
- spreadsheet.tsx

### Status
- status.tsx

A visual representation of the status of the save mutation and get-status query.
