/**
 * Deprecated database module.
 *
 * The application originally used better-sqlite3 to store tasks, but this
 * required native compilation that failed on some systems.  The codebase
 * has been refactored to use electron-store for persistence instead.  This
 * module remains as a placeholder so that imports do not break if
 * referenced elsewhere, but it no longer provides any functionality.
 */
export {};
