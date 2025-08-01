## 2.2.2 - 2025-08-04

### Changed

-   nPM1300:
    -   Battery current limits (IBATLIM) have been lowered. High is now set at
        1000 mA (previously 1370 mA) and low is now set at 200 mA (previously
        270 mA).
    -   Maximum battery capacity allowed has been increased to 3000 mAh
        (previously 800 mAh).

### Fixed

-   Issue where the charging current limit (ICHG) would only allow even numbers
    when profiling a battery on the nPM1304 EK. This has been fixed to allow all
    values in the range from 4 to 100 mA.
-   Issue where the option for adding or editing a battery profile would only
    accept battery capacity values between 32 and 3000 mAh for the nPM1304 EK.
    This has been fixed to allow all values in the range from 4 mAh to 3000 mAh.

## 2.2.1 - 2025-07-09

### Added

-   Bundled battery model LP181917 for nPM1304.

### Changed

-   Default battery model in the firmware for nPM1304 to LP18917.

### Fixed

-   Issue in the firmware for nPM1304 where battery measurements would stop
    while the battery was charging.
-   Issue with the battery status showing `iBat` resolution incorrectly. It is
    now using one decimal point for nPM1304 as intended.

## 2.2.0 - 2025-07-04

### Added

-   Support for `Ichg` to support 0.5-mA increments on the nPM1304 EK.
-   The on-board load feature (active load) for the nPM1304 EK with hardware
    revision newer than 0.1.0.
-   Experimental battery profiling for the nPM1304 EK with hardware revision
    newer than 0.1.0.

## 2.1.1 - 2025-06-02

### Fixed

-   Issues with phrasing of some tooltips.

## 2.1.0 - 2025-06-02

### Added

-   Added experimental support for nPM1304.

### Fixed

-   Loading of JSON configuration files for nPM2100.
-   All devices: Loading of JSON configuration for the Fuel Gauge enable or
    disable state (or both).
-   Issue with applying user setting changes on the Timer card in the System
    Features tab.

## 2.0.1 - 2025-05-22

### Fixed

-   Issue with the Break-to-wake dialog not closing on cancel.
-   Issue with displaying units for nPM 1300 soft start current in mA.

## 2.0.0 - 2025-03-28

### Added

-   Error message for incorrect names when validating the battery name.
-   Support for the nPM2100 Evaluation Kit.
-   Offline support with the virtual device feature.

### Changed

-   The default view at the application start is now a welcome screen without
    any device-specific tabs, which are now added and removed based on the
    selected device.

## 1.3.1 - 2024-11-11

### Changed

-   Updated firmware to v1.2.4.
-   USB is now detected when VBUSIN power is applied without CC lines present.

## 1.3.0 - 2024-06-10

### Added

-   Added IBat Lim high and low configuration options.
-   Profiling now supports additional VTerm values: 3.50 V, 3.55 V, 3.60 V, and
    3.65 V.

### Changed

-   Updated firmware to v1.2.3+0.

## 1.2.2 - 2024-03-10

### Changed

-   Updated firmware to v1.2.0+0.
-   iBat current < 15 mA will it not rendered on the graph or the Battery status
    card.
-   During profiling, when a battery is considered disconnected (vBat < 1 V), a
    warning is now issued instead of a terminating error.
-   Moved feedback tab to a dialog which can be opened by going to the about tab
    and click **Give Feedback**.

### Removed

-   Removed the separate toggle for the two-button reset. This functionality has
    been incorporated into the long-press configuration instead.

### Fixed

-   JEITA V_TERMR slider is disabled when not usable.

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

-   Soft Start Current range is now at 10mA 20mA 35mA 50mA.
-   Tooltip text has been improved.
-   `Export configuration` file save dialog now has default filename.

### Fixed

-   Removed `regulator-init-microvolt` from NCS overlay if `VSETn` is selected.

### Removed

-   LDO Soft Start Enabled toggle.

## 1.0.1 - 2023-11-02

### Fixed

-   Wrong conversion of value in overlay for charger current-microamp.
-   Removed overlay properties for thermistor-cold-millidegrees,
    thermistor-cool-millidegrees, thermistor-warm-millidegrees,
    thermistor-hot-millidegrees as conversion from millidegrees to register
    values is incorrect, resulting in charging being disabled incorrectly.

## 1.0.0 - 2023-10-25

### Added

-   Support for NTC thermistor `ntc_z` option.
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
    2.65v.
-   Improved Battery profiling load profile.
-   nPM PowerUP now uses nrfutil device for all device operations.

### Fixed

-   Buck 2 vOut warning is triggered at 1.6V.
-   App crashed if an invalid `Profile Project` project json is loaded.

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
