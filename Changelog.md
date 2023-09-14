# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.9.2 - UNRELEASED

### Fixed

-   Buck 2 vOut warning is triggered at 1.6V
-   App crashed if a invalid `Profile Project` project json is loaded

## 0.9.1 - 2023-07-17

### Added

-   Introduced support for the PCA63563 Fuel Gauge board.
-   Implemented an export option for the battery model INC file format.

### Fixed

-   Corrected an issue where the 'Restart application with verbose logging'
    button failed to restart the application.
-   Rectified a problem where the 'Abort' command during profiling would not
    close the dialog if the device was disconnected.
-   Resolved an issue causing the application to crash if a profiling project
    was deleted while the application was running.
-   Fixed a glitch that resulted in an empty directory being created when the
    profiling folder was deleted and the application was subsequently reopened.
-   Addressed a syncing issue where the application did not synchronize log
    statuses with the device when the uptime was equal to or exceeded 100 hours.

## 0.9.0 - 2023-06-27

-   Initial public release.
