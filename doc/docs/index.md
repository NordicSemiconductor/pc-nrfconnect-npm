# nPM PowerUP app

The nPM PowerUP app is a desktop application intended to work with the Power Management Integrated Circuit (PMIC) devices from Nordic Semiconductor to allow customers to quickly and efficiently evaluate the PMIC for their projects.

Once connected to an Evaluation Kit (EK), the app gives full control over the adjustable settings of the PMIC. Using the included battery models, you can also get an estimated time-to-full and time-to-empty when charging or discharging a battery connected to the EK.

The nPM PowerUP app is installed and updated using [nRF Connect for Desktop](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/index.html).

## Supported devices

The nPM PowerUP app supports the following Power Management IC devices from Nordic Semiconductor:

| PMIC device | Documentation | Setup |
|-------------|---------------|-------|
| nPM1304 Evaluation Kit (EK) | [nPM1304 EK Hardware](https://docs.nordicsemi.com/bundle/ug_npm1304_ek/page/UG/nPM1304_EK/intro.html) | [Connect the nPM1304 EK with nPM PowerUP](https://docs.nordicsemi.com/bundle/ug_npm1304_ek/page/UG/nPM1304_EK/use_ek_power_up.html) |
| nPM2100 Evaluation Kit (EK) | [nPM2100 EK Hardware](https://docs.nordicsemi.com/bundle/ug_npm2100_ek/page/UG/nPM2100_EK/intro/intro.html) | [Connect the nPM2100 EK with nPM PowerUP](https://docs.nordicsemi.com/bundle/ug_npm2100_ek/page/UG/nPM2100_EK/connect_ek/use_ek_power_up.html) |
| nPM1300 Evaluation Kit (EK) | [nPM1300 EK Hardware](https://docs.nordicsemi.com/bundle/ug_npm1300_ek/page/UG/nPM1300_EK/intro.html) | [Connect the nPM1300 EK with nPM PowerUP](https://docs.nordicsemi.com/bundle/ug_npm1300_ek/page/UG/nPM1300_EK/use_ek_power_up.html) |
| nPM Fuel Gauge Board | [nPM Fuel Gauge Board Hardware](https://docs.nordicsemi.com/bundle/ug_npm_fuel_gauge/page/UG/nPM_fuel_gauge/intro.html) | [Connect the nPM1300 EK with the nPM Fuel Gauge Board](https://docs.nordicsemi.com/bundle/nan_045/page/APP/nan_045/battery_profiling.html) |

!!! note "Note"
      Some features of the nPM PowerUP app are only available for specific devices.
      In the documentation, such features are marked with notes that specify the supported device.
      When no note is present, the feature is available on all supported devices.

## Application source code

The code of the application is open source and [available on GitHub](https://github.com/NordicSemiconductor/pc-nrfconnect-npm).
Feel free to fork the repository and clone it for secondary development or feature contributions.
