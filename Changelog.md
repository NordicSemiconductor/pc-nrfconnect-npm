## 1.2.1 - 2024-03-13

### Added

-   Support for nRF Connect for Desktop 4.4.1.

## 1.2.0 - 2024-03-12

### Added

-   Add Support to generate battery models on Mac (Intel and ARM64).
-   Warning about closing the app while updating the firmware, which may lead to
    unwanted consequences.
-   Pre-bundled list of the Renata battery models that can be uploaded to the
    nPM 1300 EK. These models can be found in the side panel under **Add new
    active battery model**.

### Removed

-   SHPHLD pin polarity configuration.

### Changed

-   Updated Firmware to use NPMX 1.0.0.
-   The Lipol battery models are no longer part of the firmware, and will now
    need to be uploaded to the nPM 1300 EK. These models can be found in the
    side panel under **Add new active battery model**.

### Fixed

-   Profiling a battery with no NTC will now save the user temperature to file
    instead of saving the fallback value of 25°C.
-   Tooltip for the **NTC thermistor** when configuring a profile. The tooltip
    is now visible.

## 1.1.1 - 2024-01-08

### Added

-   Persist state of `show log` panel.

### Fixed

-   Duplication of the events sent by analytics.

## 1.1.0 - 2023-12-07

### Added

-   Added `regular-init-microvolt` and `regulator-boot-enable` to NCS overlay.

### Changed

-   nPM PowerUp now uses nrfutil device v2.0.3
-   Soft Start Current range is now at 10mA 20mA 35mA 50mA.
-   Tooltip text has been improved.
-   `Export configuration` file save dialog now has default filename.

### Fixed

-   Removed `regulator-init-microvolt` from NCS overlay if `VSETn` is selected.

### Removed

-   LDO Soft Start Enabled toggle

## 1.0.1 - 2023-11-02

### Fixed

-   Wrong conversion of value in overlay for charger current-microamp
-   Removed overlay properties for thermistor-cold-millidegrees,
    thermistor-cool-millidegrees, thermistor-warm-millidegrees,
    thermistor-hot-millidegrees as conversion from millidegrees to register
    values is incorrect, resulting in charging being disabled incorrectly

## 1.0.0 - 2023-10-25

### Added

-   Support for NTC thermistor `ntc_z` option
-   Support for Chip Thermal Regulation
    -   Read and Write Tchgresume
    -   Read and Write Tchgstop
    -   Read Thermal Regulation state
-   Support JEITA
    -   Read and Write vTermR
    -   Read and Write tCold, tCool, tWarm, tHot
    -   Read and Write NTC Beta
-   LDO
    -   Soft Starter enable
    -   Soft Starter current
    -   Active Discharge
-   Bucks Active Output Capacitor Discharge
-   POF
    -   Enable POF
    -   VSYSpof
    -   POF Polarity
-   Timer Config
    -   Mode
    -   Prescaler
    -   Period
    -   tShipTimeToActive
-   VBus
    -   Input current detection
-   Enter Ship Mode
-   Enter Hibernate Mode
-   Configure Long Press Reset
-   Configure Two Button Reset
-   Export app configuration to:
    -   JSON (to reused in nPM powerUP)
    -   overlay for NCS development

### Changed

-   Battery profiling can now support a minimum Discharge cut-off voltage of
    2.65v
-   Improved Battery profiling load profile
-   nPM PowerUP now uses nrfutil device for all device operations.

### Fixed

-   Buck 2 vOut warning is triggered at 1.6V
-   App crashed if an invalid `Profile Project` project json is loaded

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
