# Backend

The back end is built with Node.js... *introduction coming soon*

## Testing

Tests for the back end are written using the Mocha testing framework. They are placed in the `tests/` subdirectory within each component (app and user-server). For instance, some of the user-server tests are shown below:

```
- user-server/
  - tests/
    - api.js
    - aps.js
```

To keep the organization simple, we use a simple convention that all tests for a file (e.g. `routes/api.js`) are written in a file with the same name under `tests/` (e.g. `tests/api.js`).

You can run all tests with our shortcut `test.sh` scripts (one in each component, app and user-server).
