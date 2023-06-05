# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.7.2 - 2023-06-05

### Added

-   Confirm dialog aborting profiling
-   Confirm dialog before app closes while profiling
-   Confirm dialog before app closes while data is processing
-   Tooltips for more UI Components

### Fixed

-   UI no longer allows processing on incomplete profiles

## 0.7.1 - 2023-06-02

### Added

-   Data processing with nrfutil npm for Windows and Linux
-   Profiles Tab

### Changed

-   Profiling wizard UI improvement

## 0.7.0 - 2023-06-01

### Added

-   PMIC1300 FP2 Support FW Version 0.7.0+0

## 0.0.22 - 2023-05-31

### Added

-   PMIC1300 FP2 Support FW Version 0.0.0+19

### Changed

-   Recording events button text
-   Improved Charger Card UI

## 0.0.21 - 2023-05-30

### Added

-   Polling for buck enable status when on/off control is set to GPIOx
-   PMIC1300 FP2 Support FW Version 0.0.0+18

### Changed

-   Disable enable buck toggle control of bucks when on/off control is set to
    GPIOx
-   Add index to text such as Vset, Vout, Voutldo etc...

### Fixed

-   Charger Mode documentation tooltip

## 0.0.20 - 2023-05-23

### Added

-   Changing LDO Vout automatically changed the mode to LDO
-   Buck read enable support
-   Dialog when changing to LDO mode prompting user to confirm adding jumper on
    EK

## 0.0.19 - 2023-05-16

### Fixed

-   Offline mode missing buck, charger, and ldo cards

## 0.0.18 - 2023-05-16

### Added

-   Charger recharge support
-   LDO VOut support
-   LDO Mode Support
-   Support batter models with space in the name
-   PMIC1300 FP2 Support FW Version 0.0.0+17

### Changed

-   ADC Sampling rate is now set automatically to 500ms when charging and 1000ms
    when not charging
-   Default/Active battery profile are now merged into one item
-   Profiling folder structure
-   Stop recording between profiles

### Fixed

-   Not able to click continue if battery is to low to be detected
-   When profiling, charging was wrongly set to 2X battery capacity

## 0.0.17 - 2023-05-09

### Added

-   Stop PC from sleeping when connected to device
-   Clean up old results if profile is restarted
-   File dialogs are now modal

### Fixed

-   UI Improvements
-   Profiling sampling rate
-   Estimated time when profiling

## 0.0.16 - 2023-05-08

### Added

-   Tooltips
-   PMIC1300 FP2 Support FW Version 0.0.0+16

### Fixed

-   Download Profile no longer fails with specific profiles

## 0.0.15 - 2023-05-03

### Added

-   PMIC1300 FP2 Support FW Version 0.0.0+15

### Changed

-   Distinguish between an invalid firmware and when app is still to read it
-   Auto continue when fully charged and USB PMIC is disconnected

### Fixed

-   mAh Calculated at twice the rate
-   POF Error when not profiling
-   UI Improvements
-   Update active battery profile after download

## 0.0.14 - 2023-04-28

### Fixed

-   Fix second rest cycle count
-   Fixed reboot device when PIMC become available

## 0.0.13 - 2023-04-28

### Changed

-   Removed terminal tab, Serial Terminal app should now be used
-   Improved Battery Profiling (Alpha)

### Fixed

-   UI Improvements
-   Battery Profiling cycle count
-   Command timeout throws error
-   Improved parsing for case when shell column length is reached

## 0.0.12 - 2023-04-27

### Added

-   Battery Profiling (Alpha)
-   Buck GPIO Retention control support
-   Buck GPIO On/Off control support
-   Buck GPIO Buck Mode Control control support
-   Buck Retention voltage

### Changed

-   Moved warning dialogs of bucks and I2C to buck 2

### Fixed

-   UI Improvements

## 0.0.11 - 2023-04-26

### Added

-   PMIC1300 FP2 Support FW Version 0.0.0+14
-   Upload Profile
-   Charger iTerm support
-   Charger V Trickle Fast support

### Changed

-   UI Improvements

## 0.0.10 - 2023-03-02

### Added

-   PMIC1300 Support FW Version 0.0.0+10

### Changed

-   Graph time scale no longer shows milliseconds

### Fixed

-   Time to Full/Empty wrong value if time is > 24hrs

## 0.0.9 - 2023-02-28

### Added

-   PMIC1300 Support FW Version 0.0.0+9

### Changed

-   Time to full/empty format show hours and minutes

### Fixed

-   Store default battery with clean devices

## 0.0.8 - 2023-02-28

### Added

-   PMIC1300 Support FW Version 0.0.0+8

### Changed

-   Current can now be a negative value
-   SOC at 1 decimal place

## 0.0.7 - 2023-02-24

### Added

-   PMIC1300 Support FW Version 0.0.0+7

### Changed

-   On Disconnect we reset all the UI component to the initial state.
-   Set Default profile is not a dropdown.

### Fixed

-   Dashboard card ordering

## 0.0.6 - 2023-02-21

### Changed

-   Minor UI Improvements

## 0.0.5 - 2023-02-20

### Added

-   PMIC1300 Support FW Version 0.0.0+6

## 0.0.4 - 2023-02-10

### Added

-   Warning Dialogs on `Buck 1`
-   Export and Import Buttons
-   Updated Default States for Bucks
-   Recording of events to `csv`
-   PMIC1300 App Version 0.0.0+4
-   Masonry Layout
-   Battery Profile controls

## 0.0.3 - 2023-01-24

-   First implementation for PMIC1300 Support FW Version 0.0.0+1
