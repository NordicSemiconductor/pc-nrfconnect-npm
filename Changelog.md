# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.9.1 - 2023-07-17

### Added

-   Support for PCA63563 Fuel Gauge board.
-   Battery model `inc` file format export option.

### Fixed

-   `Restart application with verbose logging` button did not restart app
-   Clicking `Abort` when profiling would not closed dialog if the device is
    disconnected.
-   App no longer crashes when a profiling project is deleted while app is
    running.
-   Empty directory is created if profiling folder is deleted and app is
    reopened.
-   Application does not sync log statues with device when uptime is greater or
    equal to 100hrs

## 0.9.0 - 2023-06-27

-   Initial public release.
